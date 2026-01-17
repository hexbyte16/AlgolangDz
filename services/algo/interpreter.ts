import { ASTNode, TokenType, ProgramNode, RuntimeValue, VarDeclNode, BlockNode, InterpreterEvent, FunctionDeclNode, ProcedureDeclNode } from '../../types';

interface Scope {
  variables: Map<string, RuntimeValue>;
  returnVal?: any;
}

export class Interpreter {
  private callStack: Scope[] = [];
  private functions: Map<string, FunctionDeclNode | ProcedureDeclNode> = new Map();

  public *execute(ast: ProgramNode): Generator<InterpreterEvent, void, any> {
    this.callStack = [];
    this.functions.clear();

    // Register functions
    for (const func of ast.functions) {
        this.functions.set(func.name.toLowerCase(), func);
    }

    try {
      // Global Scope
      const globalScope = { variables: new Map<string, RuntimeValue>() };
      this.callStack.push(globalScope);
      this.initializeVariables(ast.variables, globalScope);
      
      // Yield step for program start
      yield { type: 'step', line: ast.line, variables: this.getVariablesSnapshot() };
      
      yield* this.executeBlock(ast.body);
    } catch (e: any) {
      if (e.message !== 'RETURN') {
          yield { type: 'error', value: `Runtime Error: ${e.message}` };
      }
    }
  }

  private getVariablesSnapshot(): Map<string, RuntimeValue> {
      // Snapshot current stack (simplified: just top scope for now + globals if we want, but top scope is most relevant for debugger)
      // To be more useful, we might want to merge global and local in the debugger view
      const snapshot = new Map<string, RuntimeValue>();
      
      // Merge all scopes bottom-up (Global -> ... -> Local)
      for(const scope of this.callStack) {
          scope.variables.forEach((val, key) => {
              if (val.type === 'Array' && Array.isArray(val.value)) {
                 // Deep copy isn't strictly necessary for simple visualization but good for history. 
                 // For performance, we might shallow copy.
                 snapshot.set(key, { ...val, value: JSON.parse(JSON.stringify(val.value)) });
              } else {
                 snapshot.set(key, { ...val });
              }
          });
      }
      return snapshot;
  }

  private initializeVariables(decls: VarDeclNode[], scope: Scope) {
    for (const decl of decls) {
      for (const name of decl.names) {
        if (decl.dimensions.length > 0) {
          // Initialize Matrix/Array
          const val = this.createArray(decl.dimensions, decl.varType);
          scope.variables.set(name, {
            type: 'Array',
            value: val,
            arrayType: decl.varType,
            dims: decl.dimensions
          });
        } else {
          scope.variables.set(name, {
            type: this.normalizeType(decl.varType),
            value: this.defaultValue(decl.varType)
          });
        }
      }
    }
  }

  private createArray(dims: number[], type: string): any {
      if (dims.length === 0) return this.defaultValue(type);
      const size = dims[0];
      const rest = dims.slice(1);
      const arr = new Array(size);
      for(let i=0; i<size; i++) {
          arr[i] = this.createArray(rest, type);
      }
      return arr;
  }

  private getVariable(name: string): RuntimeValue {
      // Search from top of stack down
      for (let i = this.callStack.length - 1; i >= 0; i--) {
          if (this.callStack[i].variables.has(name)) {
              return this.callStack[i].variables.get(name)!;
          }
      }
      throw new Error(`Variable '${name}' not declared.`);
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
           // Read
           for(const arg of stmt.args) {
               let varName = '';
               let targetVar: RuntimeValue;
               let indexes: number[] = [];
               
               if(arg.kind === 'Identifier') {
                   varName = arg.name;
                   targetVar = this.getVariable(varName);
               } else if (arg.kind === 'ArrayAccess') {
                   varName = arg.name;
                   targetVar = this.getVariable(varName);
                   indexes = arg.indexes.map(idx => this.evaluate(idx));
               } else {
                   throw new Error("Read expects variable.");
               }
               
               const typeToMatch = (targetVar.type === 'Array') ? this.normalizeType(targetVar.arrayType!) : targetVar.type;

               const input = yield { type: 'input', varName, varType: typeToMatch };
               let val: any = input;

               if (typeToMatch === 'Real' || typeToMatch === 'Integer') {
                   val = parseFloat(input || "0");
                   if(isNaN(val)) throw new Error("Expected a number input.");
               } else if (typeToMatch === 'Boolean') {
                   val = (input?.toLowerCase() === 'true');
               }

               if(targetVar.type === 'Array') {
                   this.setArrayValue(targetVar.value, indexes, val);
               } else {
                   targetVar.value = val;
               }
           }
        }
        break;
      case 'Assignment':
        const val = this.evaluate(stmt.value);
        if (typeof stmt.target === 'string') {
          const variable = this.getVariable(stmt.target);
          variable.value = val;
        } else {
          // Array Assignment
          const arrVar = this.getVariable(stmt.target.name);
          if (arrVar.type !== 'Array') throw new Error(`'${stmt.target.name}' is not an array.`);
          const indexes = stmt.target.indexes.map(idx => this.evaluate(idx));
          this.setArrayValue(arrVar.value, indexes, val);
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
        
        const loopVar = this.getVariable(stmt.variable);
        loopVar.value = start;

        while(true) {
            const current = loopVar.value;
            if (step >= 0 && current > end) break;
            if (step < 0 && current < end) break;

            yield* this.executeBlock(stmt.body);
            
            loopVar.value += step;
        }
        break;
      case 'Call':
        // Procedure Call
        yield* this.executeCall(stmt.name, stmt.args);
        break;
      case 'Return':
        const returnVal = stmt.value ? this.evaluate(stmt.value) : null;
        this.callStack[this.callStack.length - 1].returnVal = returnVal;
        throw new Error("RETURN"); // Throw to unwind stack to call site
    }
  }

  private *executeCall(name: string, args: ASTNode[]): Generator<InterpreterEvent, any, any> {
      const funcDef = this.functions.get(name.toLowerCase());
      if (!funcDef) throw new Error(`Unknown procedure/function '${name}'.`);

      if (args.length !== funcDef.params.length) {
          throw new Error(`'${name}' expects ${funcDef.params.length} arguments, got ${args.length}.`);
      }

      const evaluatedArgs = args.map(a => this.evaluate(a));
      
      // New Scope
      const newScope: Scope = { variables: new Map() };
      
      // Bind Args
      for (let i = 0; i < funcDef.params.length; i++) {
          newScope.variables.set(funcDef.params[i].name, {
              type: this.normalizeType(funcDef.params[i].type),
              value: evaluatedArgs[i]
          });
      }
      
      // Initialize Locals
      this.initializeVariables(funcDef.variables, newScope);
      
      this.callStack.push(newScope);

      try {
          yield* this.executeBlock(funcDef.body);
      } catch (e: any) {
          if (e.message !== 'RETURN') throw e;
      }
      
      const result = this.callStack.pop()?.returnVal;
      return result;
  }

  private setArrayValue(arr: any[], indexes: number[], value: any) {
      let current = arr;
      for (let i = 0; i < indexes.length - 1; i++) {
          const idx = indexes[i];
          if (!Array.isArray(current) || idx < 0 || idx >= current.length) throw new Error(`Index ${idx} out of bounds.`);
          current = current[idx];
      }
      const lastIdx = indexes[indexes.length - 1];
      if (!Array.isArray(current) || lastIdx < 0 || lastIdx >= current.length) throw new Error(`Index ${lastIdx} out of bounds.`);
      current[lastIdx] = value;
  }

  private getArrayValue(arr: any[], indexes: number[]): any {
      let current = arr;
      for (const idx of indexes) {
          if (!Array.isArray(current) || idx < 0 || idx >= current.length) throw new Error(`Index ${idx} out of bounds.`);
          current = current[idx];
      }
      return current;
  }

  private evaluate(node: ASTNode): any {
    switch (node.kind) {
      case 'Literal': return node.value;
      case 'Identifier': 
        return this.getVariable(node.name).value;
      case 'ArrayAccess':
        const arrVar = this.getVariable(node.name);
        if (arrVar.type !== 'Array') throw new Error(`'${node.name}' is not an array.`);
        const indexes = node.indexes.map(idx => this.evaluate(idx));
        return this.getArrayValue(arrVar.value, indexes);
      case 'Call':
        // Function Call inside Expression - we can't yield here easily in this synchronous evaluate.
        // HACK: For educational purposes/simplicity, we assume evaluate is "instant" or we'd need to make evaluate a generator too.
        // But making evaluate a generator requires rewriting the whole interpreter to yield* evaluate.
        // Given constraints and complexity: I will throw an error if Function calls are used in expressions for now 
        // OR I have to assume functions are pure/don't require I/O which allows me to run them synchronously?
        // No, functions might have loops and steps. 
        // CORRECT APPROACH: evaluate() should be a generator.
        // However, that is a massive refactor. 
        // COMPROMISE: We will support Function calls in expressions but they won't show "Steps" inside them *when called from an expression*.
        // We will execute them synchronously here.
        return this.executeFunctionSync(node);
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

  // Synchronous execution for expression function calls (limitations: no I/O, no yields inside)
  private executeFunctionSync(node: ASTNode & { kind: 'Call' }): any {
     // This is a "quiet" execution without stepping UI updates
     const name = node.name;
     const funcDef = this.functions.get(name.toLowerCase());
     if (!funcDef) throw new Error(`Unknown function '${name}'.`);
     
     const evaluatedArgs = node.args.map(a => this.evaluate(a));
     const newScope: Scope = { variables: new Map() };
     for (let i = 0; i < funcDef.params.length; i++) {
        newScope.variables.set(funcDef.params[i].name, {
            type: this.normalizeType(funcDef.params[i].type),
            value: evaluatedArgs[i]
        });
     }
     this.initializeVariables(funcDef.variables, newScope);
     this.callStack.push(newScope);

     // Run block synchronously
     try {
         this.runBlockSync(funcDef.body);
     } catch (e: any) {
         if (e.message !== 'RETURN') {
             this.callStack.pop();
             throw e;
         }
     }
     
     const result = this.callStack.pop()?.returnVal;
     return result;
  }

  private runBlockSync(block: BlockNode) {
      for (const stmt of block.statements) {
          this.runStatementSync(stmt);
      }
  }

  private runStatementSync(stmt: ASTNode) {
      switch(stmt.kind) {
          case 'Return':
              const val = stmt.value ? this.evaluate(stmt.value) : null;
              this.callStack[this.callStack.length - 1].returnVal = val;
              throw new Error("RETURN");
          case 'If':
              if (this.evaluate(stmt.condition)) this.runBlockSync(stmt.thenBranch);
              else if (stmt.elseBranch) this.runBlockSync(stmt.elseBranch);
              break;
          case 'While':
              while (this.evaluate(stmt.condition)) this.runBlockSync(stmt.body);
              break;
          case 'For':
              const start = this.evaluate(stmt.start);
              const end = this.evaluate(stmt.end);
              const step = stmt.step ? this.evaluate(stmt.step) : 1;
              const loopVar = this.getVariable(stmt.variable);
              loopVar.value = start;
              while(true) {
                const current = loopVar.value;
                if (step >= 0 && current > end) break;
                if (step < 0 && current < end) break;
                this.runBlockSync(stmt.body);
                loopVar.value += step;
              }
              break;
          case 'Assignment':
              const v = this.evaluate(stmt.value);
              if (typeof stmt.target === 'string') {
                  this.getVariable(stmt.target).value = v;
              } else {
                  const arr = this.getVariable(stmt.target.name);
                  const idxs = stmt.target.indexes.map(i => this.evaluate(i));
                  this.setArrayValue(arr.value, idxs, v);
              }
              break;
          case 'Call':
              // Recursive synchronous call
              this.executeFunctionSync(stmt as any);
              break;
          // IO ignored in sync mode for functions in expressions
      }
  }
}