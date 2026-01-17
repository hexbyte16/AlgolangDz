import { Token, TokenType } from '../../types';

export class Lexer {
  private source: string;
  private pos: number = 0;
  private line: number = 1;

  constructor(source: string) {
    this.source = source;
  }

  private peek(): string {
    return this.pos < this.source.length ? this.source[this.pos] : '';
  }

  private advance(): string {
    const char = this.peek();
    this.pos++;
    if (char === '\n') this.line++;
    return char;
  }

  private isDigit(char: string): boolean {
    return /[0-9]/.test(char);
  }

  private isAlpha(char: string): boolean {
    return /[a-zA-Z_]/.test(char);
  }

  private isWhitespace(char: string): boolean {
    return /\s/.test(char);
  }

  tokenize(): Token[] {
    const tokens: Token[] = [];

    while (this.pos < this.source.length) {
      const char = this.peek();

      if (this.isWhitespace(char)) {
        this.advance();
        continue;
      }

      // Comments: // or { }
      if (char === '{') {
        while (this.peek() !== '}' && this.peek() !== '') this.advance();
        this.advance(); // consume }
        continue;
      }
      if (char === '/' && this.source[this.pos + 1] === '/') {
        while (this.peek() !== '\n' && this.peek() !== '') this.advance();
        continue;
      }

      // Numbers
      if (this.isDigit(char)) {
        let numStr = '';
        while (this.isDigit(this.peek())) numStr += this.advance();
        if (this.peek() === '.') {
          numStr += this.advance();
          while (this.isDigit(this.peek())) numStr += this.advance();
        }
        tokens.push({ type: TokenType.NUMBER_LITERAL, value: numStr, line: this.line });
        continue;
      }

      // Strings
      if (char === '"' || char === "'") {
        const quote = this.advance();
        let str = '';
        while (this.peek() !== quote && this.peek() !== '') {
          str += this.advance();
        }
        this.advance(); // consume closing quote
        tokens.push({ type: TokenType.STRING_LITERAL, value: str, line: this.line });
        continue;
      }

      // Identifiers and Keywords
      if (this.isAlpha(char)) {
        let id = '';
        while (this.isAlpha(this.peek()) || this.isDigit(this.peek())) {
          id += this.advance();
        }
        const lowerId = id.toLowerCase();
        
        const keywords: Record<string, TokenType> = {
          'algorithm': TokenType.ALGORITHM,
          'begin': TokenType.BEGIN,
          'end': TokenType.END,
          'var': TokenType.VAR,
          'const': TokenType.CONST,
          'if': TokenType.IF,
          'then': TokenType.THEN,
          'else': TokenType.ELSE,
          'endif': TokenType.ENDIF,
          'for': TokenType.FOR,
          'to': TokenType.TO,
          'step': TokenType.STEP,
          'do': TokenType.DO,
          'endfor': TokenType.ENDFOR,
          'while': TokenType.WHILE,
          'endwhile': TokenType.ENDWHILE,
          'read': TokenType.READ,
          'write': TokenType.WRITE,
          'integer': TokenType.T_INTEGER,
          'real': TokenType.T_REAL,
          'boolean': TokenType.T_BOOLEAN,
          'string': TokenType.T_STRING,
          'char': TokenType.T_CHAR,
          'mod': TokenType.MOD,
          'div': TokenType.DIV,
          'and': TokenType.AND,
          'or': TokenType.OR,
          'not': TokenType.NOT,
          'function': TokenType.FUNCTION,
          'endfunction': TokenType.ENDFUNCTION,
          'procedure': TokenType.PROCEDURE,
          'endprocedure': TokenType.ENDPROCEDURE,
          'return': TokenType.RETURN
        };

        if (keywords[lowerId] !== undefined) {
          tokens.push({ type: keywords[lowerId], value: id, line: this.line });
        } else {
          tokens.push({ type: TokenType.IDENTIFIER, value: id, line: this.line });
        }
        continue;
      }

      // Operators and Punctuation
      switch (char) {
        case '+': tokens.push({ type: TokenType.PLUS, value: '+', line: this.line }); this.advance(); break;
        case '-': tokens.push({ type: TokenType.MINUS, value: '-', line: this.line }); this.advance(); break;
        case '*': tokens.push({ type: TokenType.MULTIPLY, value: '*', line: this.line }); this.advance(); break;
        case '/': tokens.push({ type: TokenType.DIVIDE, value: '/', line: this.line }); this.advance(); break;
        case '(': tokens.push({ type: TokenType.LPAREN, value: '(', line: this.line }); this.advance(); break;
        case ')': tokens.push({ type: TokenType.RPAREN, value: ')', line: this.line }); this.advance(); break;
        case '[': tokens.push({ type: TokenType.LBRACKET, value: '[', line: this.line }); this.advance(); break;
        case ']': tokens.push({ type: TokenType.RBRACKET, value: ']', line: this.line }); this.advance(); break;
        case ',': tokens.push({ type: TokenType.COMMA, value: ',', line: this.line }); this.advance(); break;
        case ':': 
          this.advance();
          if (this.peek() === '=') { // Handle := assignment
             this.advance();
             tokens.push({ type: TokenType.ASSIGN, value: ':=', line: this.line });
          } else {
             tokens.push({ type: TokenType.COLON, value: ':', line: this.line });
          }
          break;
        case '<':
          this.advance();
          if (this.peek() === '=') { tokens.push({ type: TokenType.LESS_EQUAL, value: '<=', line: this.line }); this.advance(); }
          else if (this.peek() === '>') { tokens.push({ type: TokenType.NOT_EQUAL, value: '<>', line: this.line }); this.advance(); }
          else if (this.peek() === '-') { tokens.push({ type: TokenType.ASSIGN, value: '<-', line: this.line }); this.advance(); } // Allow <-
          else tokens.push({ type: TokenType.LESS, value: '<', line: this.line });
          break;
        case '>':
          this.advance();
          if (this.peek() === '=') { tokens.push({ type: TokenType.GREATER_EQUAL, value: '>=', line: this.line }); this.advance(); }
          else tokens.push({ type: TokenType.GREATER, value: '>', line: this.line });
          break;
        case '=': tokens.push({ type: TokenType.EQUAL, value: '=', line: this.line }); this.advance(); break;
        case '←': tokens.push({ type: TokenType.ASSIGN, value: '←', line: this.line }); this.advance(); break;
        default:
          throw new Error(`Unexpected character '${char}' at line ${this.line}`);
      }
    }

    tokens.push({ type: TokenType.EOF, value: '', line: this.line });
    return tokens;
  }
}