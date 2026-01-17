import { ASTNode, TokenType, ProgramNode, RuntimeValue, VarDeclNode, BlockNode, InterpreterEvent } from '../../types';

export class Interpreter {
  private variables: Map<string, RuntimeValue> = new Map();

  public *execute(ast: ProgramNode): Generator<InterpreterEvent, void, any> {
    this.variables.clear();

    try {
      this.initializeVariables(ast.variables);
      // Yield step for program start
      yield { type: 'step', line: ast.line, variables: this.getVariablesSnapshot() };
      yield* this.executeBlock(ast.body);
    } catch (e: any) {
      yield { type: 'error', value: `Runtime Error: ${e.message}` };
    }
  }

  private getVariablesSnapshot(): Map<string, RuntimeValue> {
      // Create a deep-ish copy for the snapshot
      const snapshot = new Map<string, RuntimeValue>();
      this.variables.forEach((val, key) => {
          if (val.type === 'Array' && Array.isArray(val.value)) {
              snapshot.set(key, { ...val, value: [...val.value] }); // Copy array
          } else {
              snapshot.set(key, { ...val });
          }
      });
      return snapshot;
  }

  private initializeVariables(decls: VarDeclNode[]) {
    for (const decl of decls) {
      for (const name of decl.names) {
        if (decl.isArray) {
          this.variables.set(name, {
            type: 'Array',
            value: new Array(decl.arraySize).fill(this.defaultValue(decl.varType)),
            arrayType: decl.varType
          });
        } else {
          this.variables.set(name, {
            type: this.normalizeType(decl.varType),
            value: this.defaultValue(decl.varType)
          });
        }
      }
    }
  }

  private normalizeType(typeStr: string): any {
    const t = typeStr.toLowerCase();
    if (t === 'integer' || t === 'real') return 'Real';
    if (t === 'boolean') return 'Boolean';
    if (t === 'string') return 'String';
    return 'Real';
  }

  private defaultValue(typeStr: string): any {
    const t = typeStr.toLowerCase();
    if (t === 'integer' || t === 'real') return 0;
    if (t === 'boolean') return false;
    if (t === 'string') return "";
    return 0;
  }

  private *executeBlock(block: BlockNode): Generator<InterpreterEvent, void, any> {
    for (const stmt of block.statements) {
      yield* this.executeStatement(stmt);
    }
  }

  private *executeStatement(stmt: ASTNode): Generator<InterpreterEvent, void, any> {
    // Debugger step hook: Yield before execution
    yield { type: 'step', line: stmt.line, variables: this.getVariablesSnapshot() };

    switch (stmt.kind) {
      case 'IO':
        if (stmt.type === 'Write') {
          const text = stmt.args.map(arg => {
             const val = this.evaluate(arg);
             if (typeof val === 'number' && Number.isInteger(val)) return val.toString();
             if (typeof val === 'number') return parseFloat(val.toFixed(4)).toString();
             return val;
          }).join(' ');
          yield { type: 'output', value: text };
        } else {
           for(const arg of stmt.args) {
               let varName = '';
               let isArray = false;
               let index = 0;
               
               if(arg.kind === 'Identifier') {
                   varName = arg.name;
               } else if (arg.kind === 'ArrayAccess') {
                   varName = arg.name;
                   isArray = true;
                   index = this.evaluate(arg.index);
               } else {
                   throw new Error("Read expects variable.");
               }
               
               // Resolve target variable first to determine type
               const targetVar = this.variables.get(varName);
               if(!targetVar) throw new Error(`Variable ${varName} not defined.`);
               
               const typeToMatch = isArray ? this.normalizeType(targetVar.arrayType!) : targetVar.type;

               // Yield input event with type info so frontend can validate
               const input = yield { type: 'input', varName, varType: typeToMatch };
               let val: any = input;

               if (typeToMatch === 'Real' || typeToMatch === 'Integer') {
                   val = parseFloat(input || "0");
                   // Double check safety, though frontend should have validated
                   if(isNaN(val)) throw new Error("Expected a number input.");
               } else if (typeToMatch === 'Boolean') {
                   val = (input?.toLowerCase() === 'true');
               }

               if(isArray) {
                   if(index < 0 || index >= targetVar.value.length) throw new Error(`Array index out of bounds: ${index}`);
                   targetVar.value[index] = val;
               } else {
                   targetVar.value = val;
               }
           }
        }
        break;
      case 'Assignment':
        const val = this.evaluate(stmt.value);
        if (typeof stmt.target === 'string') {
          const variable = this.variables.get(stmt.target);
          if (!variable) throw new Error(`Variable '${stmt.target}' not declared.`);
          variable.value = val;
        } else {
          const arrVar = this.variables.get(stmt.target.name);
          if (!arrVar || arrVar.type !== 'Array') throw new Error(`'${stmt.target.name}' is not an array.`);
          const idx = this.evaluate(stmt.target.index);
          if (idx < 0 || idx >= arrVar.value.length) throw new Error(`Array index ${idx} out of bounds.`);
          arrVar.value[idx] = val;
        }
        break;
      case 'If':
        const cond = this.evaluate(stmt.condition);
        if (cond) {
          yield* this.executeBlock(stmt.thenBranch);
        } else if (stmt.elseBranch) {
          yield* this.executeBlock(stmt.elseBranch);
        }
        break;
      case 'While':
        while (this.evaluate(stmt.condition)) {
          yield* this.executeBlock(stmt.body);
        }
        break;
      case 'For':
        const start = this.evaluate(stmt.start);
        const end = this.evaluate(stmt.end);
        const step = stmt.step ? this.evaluate(stmt.step) : 1;
        
        const loopVar = this.variables.get(stmt.variable);
        if(!loopVar) throw new Error(`Loop variable ${stmt.variable} not declared.`);
        loopVar.value = start;

        while(true) {
            const current = loopVar.value;
            if (step >= 0 && current > end) break;
            if (step < 0 && current < end) break;

            yield* this.executeBlock(stmt.body);
            
            loopVar.value += step;
        }
        break;
    }
  }

  private evaluate(node: ASTNode): any {
    switch (node.kind) {
      case 'Literal': return node.value;
      case 'Identifier': 
        const v = this.variables.get(node.name);
        if (!v) throw new Error(`Undefined variable '${node.name}'.`);
        return v.value;
      case 'ArrayAccess':
        const arr = this.variables.get(node.name);
        if (!arr || arr.type !== 'Array') throw new Error(`'${node.name}' is not an array.`);
        const idx = this.evaluate(node.index);
        if (idx < 0 || idx >= arr.value.length) throw new Error(`Index ${idx} out of bounds.`);
        return arr.value[idx];
      case 'BinaryOp':
        const l = this.evaluate(node.left);
        const r = this.evaluate(node.right);
        switch(node.operator) {
          case TokenType.PLUS: return l + r;
          case TokenType.MINUS: return l - r;
          case TokenType.MULTIPLY: return l * r;
          case TokenType.DIVIDE: return l / r;
          case TokenType.DIV: return Math.floor(l / r);
          case TokenType.MOD: return l % r;
          case TokenType.EQUAL: return l === r;
          case TokenType.NOT_EQUAL: return l !== r;
          case TokenType.LESS: return l < r;
          case TokenType.LESS_EQUAL: return l <= r;
          case TokenType.GREATER: return l > r;
          case TokenType.GREATER_EQUAL: return l >= r;
          case TokenType.AND: return l && r;
          case TokenType.OR: return l || r;
          default: throw new Error("Unknown operator");
        }
      case 'UnaryOp':
        const val = this.evaluate(node.operand);
        if (node.operator === TokenType.MINUS) return -val;
        if (node.operator === TokenType.NOT) return !val;
        return val;
      default: return null;
    }
  }
}