import { Token, TokenType, ASTNode, ProgramNode, VarDeclNode, BlockNode } from '../../types';

export class Parser {
  private tokens: Token[];
  private current: number = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  private peek(): Token {
    return this.tokens[this.current];
  }

  private previous(): Token {
    return this.tokens[this.current - 1];
  }

  private isAtEnd(): boolean {
    return this.peek().type === TokenType.EOF;
  }

  private advance(): Token {
    if (!this.isAtEnd()) this.current++;
    return this.previous();
  }

  private check(type: TokenType): boolean {
    if (this.isAtEnd()) return false;
    return this.peek().type === type;
  }

  private match(...types: TokenType[]): boolean {
    for (const type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }
    return false;
  }

  private consume(type: TokenType, message: string): Token {
    if (this.check(type)) return this.advance();
    throw new Error(`Line ${this.peek().line}: ${message}`);
  }

  // --- Grammar Implementation ---

  public parse(): ProgramNode {
    const startToken = this.consume(TokenType.ALGORITHM, "Expect 'Algorithm' at start of program.");
    const name = this.consume(TokenType.IDENTIFIER, "Expect algorithm name.").value;
    
    let variables: VarDeclNode[] = [];
    if (this.match(TokenType.VAR)) {
      variables = this.parseVarDeclarations();
    }

    this.consume(TokenType.BEGIN, "Expect 'Begin' after declarations.");
    const body = this.parseBlock([TokenType.END]);
    this.consume(TokenType.END, "Expect 'End' at end of program.");

    return { kind: 'Program', name, variables, body, line: startToken.line };
  }

  private parseVarDeclarations(): VarDeclNode[] {
      const decls: VarDeclNode[] = [];
      
      while (this.check(TokenType.IDENTIFIER)) {
          const firstToken = this.peek();
          const names: string[] = [];
          names.push(this.advance().value);

          while (this.match(TokenType.COMMA)) {
              names.push(this.consume(TokenType.IDENTIFIER, "Expect variable name.").value);
          }

          this.consume(TokenType.COLON, "Expect ':' after variable names.");

          let isArray = false;
          let arraySize = 0;
          let varType = '';

          // Check if it is an array declaration
          if (this.check(TokenType.IDENTIFIER) && this.peek().value.toLowerCase() === 'array') {
              this.advance(); // consume 'array'
              isArray = true;
              this.consume(TokenType.LBRACKET, "Expect '['.");
              arraySize = parseInt(this.consume(TokenType.NUMBER_LITERAL, "Size integer.").value);
              this.consume(TokenType.RBRACKET, "Expect ']'.");
              
              const ofTok = this.consume(TokenType.IDENTIFIER, "Expect 'of'.");
              if (ofTok.value.toLowerCase() !== 'of') throw new Error(`Line ${ofTok.line}: Expect 'of'.`);
          }

          // Expect Basic Type
          if (this.match(TokenType.T_INTEGER, TokenType.T_REAL, TokenType.T_BOOLEAN, TokenType.T_STRING, TokenType.T_CHAR)) {
              varType = this.previous().value; // e.g., "Integer"
          } else {
              throw new Error(`Line ${this.peek().line}: Expect valid type (Integer, Real, etc.).`);
          }

          decls.push({ kind: 'VarDecl', names, varType, isArray, arraySize, line: firstToken.line });
      }
      return decls;
  }

  private parseBlock(endTokens: TokenType[]): BlockNode {
    const startLine = this.peek().line;
    const statements: ASTNode[] = [];
    while (!this.isAtEnd() && !endTokens.some(t => this.check(t)) && !this.check(TokenType.ELSE)) {
      statements.push(this.parseStatement());
    }
    return { kind: 'Block', statements, line: startLine };
  }

  private parseStatement(): ASTNode {
    if (this.match(TokenType.READ)) return this.parseRead();
    if (this.match(TokenType.WRITE)) return this.parseWrite();
    if (this.match(TokenType.IF)) return this.parseIf();
    if (this.match(TokenType.WHILE)) return this.parseWhile();
    if (this.match(TokenType.FOR)) return this.parseFor();

    // Assignment or specific identifier call?
    if (this.check(TokenType.IDENTIFIER)) {
      return this.parseAssignment();
    }

    throw new Error(`Line ${this.peek().line}: Unexpected token '${this.peek().value}'.`);
  }

  private parseRead(): ASTNode {
    const line = this.previous().line; // Captured from match(READ)
    this.consume(TokenType.LPAREN, "Expect '('.");
    const args: ASTNode[] = [];
    if (!this.check(TokenType.RPAREN)) {
      do {
        args.push(this.parseReference()); 
      } while (this.match(TokenType.COMMA));
    }
    this.consume(TokenType.RPAREN, "Expect ')'.");
    return { kind: 'IO', type: 'Read', args, line };
  }

  private parseWrite(): ASTNode {
    const line = this.previous().line; // Captured from match(WRITE)
    this.consume(TokenType.LPAREN, "Expect '('.");
    const args: ASTNode[] = [];
    if (!this.check(TokenType.RPAREN)) {
      do {
        args.push(this.parseExpression());
      } while (this.match(TokenType.COMMA));
    }
    this.consume(TokenType.RPAREN, "Expect ')'.");
    return { kind: 'IO', type: 'Write', args, line };
  }

  private parseAssignment(): ASTNode {
    const target = this.parseReference();
    const line = target.line; // Use line from target
    
    this.consume(TokenType.ASSIGN, "Expect '←' or '<-' for assignment.");
    const value = this.parseExpression();
    
    let targetName: string | any = target;
    if (target.kind === 'Identifier') targetName = target.name;

    return { kind: 'Assignment', target: targetName, value, line };
  }

  private parseReference(): ASTNode {
      const nameToken = this.consume(TokenType.IDENTIFIER, "Expect identifier.");
      
      if (this.match(TokenType.LBRACKET)) {
          const index = this.parseExpression();
          this.consume(TokenType.RBRACKET, "Expect ']'.");
          return { kind: 'ArrayAccess', name: nameToken.value, index, line: nameToken.line } as any;
      }
      
      return { kind: 'Identifier', name: nameToken.value, line: nameToken.line };
  }

  private parseIf(): ASTNode {
    const line = this.previous().line; // match(IF)
    const condition = this.parseExpression();
    this.consume(TokenType.THEN, "Expect 'Then'.");
    const thenBranch = this.parseBlock([TokenType.ELSE, TokenType.ENDIF]);
    let elseBranch = undefined;
    
    if (this.match(TokenType.ELSE)) {
      elseBranch = this.parseBlock([TokenType.ENDIF]);
    }
    
    this.consume(TokenType.ENDIF, "Expect 'EndIf'.");
    return { kind: 'If', condition, thenBranch, elseBranch, line };
  }

  private parseWhile(): ASTNode {
    const line = this.previous().line; // match(WHILE)
    const condition = this.parseExpression();
    this.consume(TokenType.DO, "Expect 'Do'.");
    const body = this.parseBlock([TokenType.ENDWHILE]);
    this.consume(TokenType.ENDWHILE, "Expect 'EndWhile'.");
    return { kind: 'While', condition, body, line };
  }

  private parseFor(): ASTNode {
    const line = this.previous().line; // match(FOR)
    const variable = this.consume(TokenType.IDENTIFIER, "Expect loop variable.").value;
    this.consume(TokenType.ASSIGN, "Expect '←' assignment.");
    const start = this.parseExpression();
    this.consume(TokenType.TO, "Expect 'to'.");
    const end = this.parseExpression();
    
    let step: ASTNode | undefined;
    if (this.match(TokenType.STEP)) {
      step = this.parseExpression();
    }
    
    this.consume(TokenType.DO, "Expect 'do'.");
    const body = this.parseBlock([TokenType.ENDFOR]);
    this.consume(TokenType.ENDFOR, "Expect 'EndFor'.");
    
    return { kind: 'For', variable, start, end, step, body, line };
  }

  // --- Expressions ---

  private parseExpression(): ASTNode {
    return this.parseLogicOr();
  }

  private parseLogicOr(): ASTNode {
    let expr = this.parseLogicAnd();
    while (this.match(TokenType.OR)) {
      const operator = this.previous().type;
      const line = this.previous().line;
      const right = this.parseLogicAnd();
      expr = { kind: 'BinaryOp', left: expr, operator, right, line };
    }
    return expr;
  }

  private parseLogicAnd(): ASTNode {
    let expr = this.parseEquality();
    while (this.match(TokenType.AND)) {
      const operator = this.previous().type;
      const line = this.previous().line;
      const right = this.parseEquality();
      expr = { kind: 'BinaryOp', left: expr, operator, right, line };
    }
    return expr;
  }

  private parseEquality(): ASTNode {
    let expr = this.parseComparison();
    while (this.match(TokenType.EQUAL, TokenType.NOT_EQUAL)) {
      const operator = this.previous().type;
      const line = this.previous().line;
      const right = this.parseComparison();
      expr = { kind: 'BinaryOp', left: expr, operator, right, line };
    }
    return expr;
  }

  private parseComparison(): ASTNode {
    let expr = this.parseTerm();
    while (this.match(TokenType.GREATER, TokenType.GREATER_EQUAL, TokenType.LESS, TokenType.LESS_EQUAL)) {
      const operator = this.previous().type;
      const line = this.previous().line;
      const right = this.parseTerm();
      expr = { kind: 'BinaryOp', left: expr, operator, right, line };
    }
    return expr;
  }

  private parseTerm(): ASTNode {
    let expr = this.parseFactor();
    while (this.match(TokenType.PLUS, TokenType.MINUS)) {
      const operator = this.previous().type;
      const line = this.previous().line;
      const right = this.parseFactor();
      expr = { kind: 'BinaryOp', left: expr, operator, right, line };
    }
    return expr;
  }

  private parseFactor(): ASTNode {
    let expr = this.parseUnary();
    while (this.match(TokenType.MULTIPLY, TokenType.DIVIDE, TokenType.MOD, TokenType.DIV)) {
      const operator = this.previous().type;
      const line = this.previous().line;
      const right = this.parseUnary();
      expr = { kind: 'BinaryOp', left: expr, operator, right, line };
    }
    return expr;
  }

  private parseUnary(): ASTNode {
    if (this.match(TokenType.NOT, TokenType.MINUS)) {
      const operator = this.previous().type;
      const line = this.previous().line;
      const operand = this.parseUnary();
      return { kind: 'UnaryOp', operator, operand, line };
    }
    return this.parsePrimary();
  }

  private parsePrimary(): ASTNode {
    if (this.match(TokenType.NUMBER_LITERAL)) {
      return { kind: 'Literal', value: parseFloat(this.previous().value), valueType: 'Real', line: this.previous().line };
    }
    if (this.match(TokenType.STRING_LITERAL)) {
      return { kind: 'Literal', value: this.previous().value, valueType: 'String', line: this.previous().line };
    }
    if (this.match(TokenType.LPAREN)) {
      const expr = this.parseExpression();
      this.consume(TokenType.RPAREN, "Expect ')' after expression.");
      return expr;
    }
    
    if (this.check(TokenType.IDENTIFIER)) {
        return this.parseReference();
    }

    throw new Error(`Line ${this.peek().line}: Expect expression.`);
  }
}