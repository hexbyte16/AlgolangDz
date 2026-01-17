// --- LEXER TYPES ---

export enum TokenType {
  // Keywords
  ALGORITHM, BEGIN, END, VAR, CONST,
  IF, THEN, ELSE, ENDIF,
  FOR, TO, STEP, DO, ENDFOR,
  WHILE, ENDWHILE,
  READ, WRITE,
  
  // New Keywords for Functions/Procedures
  FUNCTION, ENDFUNCTION, PROCEDURE, ENDPROCEDURE, RETURN,
  
  // Types
  T_INTEGER, T_REAL, T_BOOLEAN, T_STRING, T_CHAR,

  // Operators & Punctuation
  ASSIGN, // ←, <-, :=
  PLUS, MINUS, MULTIPLY, DIVIDE, DIV, MOD,
  LPAREN, RPAREN, LBRACKET, RBRACKET,
  COMMA, COLON,
  LESS, LESS_EQUAL, GREATER, GREATER_EQUAL, EQUAL, NOT_EQUAL,
  AND, OR, NOT,

  // Literals & Identifiers
  IDENTIFIER,
  NUMBER_LITERAL,
  STRING_LITERAL,
  EOF
}

export interface Token {
  type: TokenType;
  value: string;
  line: number;
}

// --- PARSER (AST) TYPES ---

export interface BaseNode {
  line: number;
}

export type ASTNode = 
  | ProgramNode
  | VarDeclNode
  | BlockNode
  | AssignmentNode
  | IfNode
  | WhileNode
  | ForNode
  | IoNode
  | BinaryOpNode
  | UnaryOpNode
  | LiteralNode
  | IdentifierNode
  | ArrayAccessNode
  | FunctionDeclNode
  | ProcedureDeclNode
  | CallNode
  | ReturnNode;

export interface ProgramNode extends BaseNode {
  kind: 'Program';
  name: string;
  variables: VarDeclNode[];
  functions: (FunctionDeclNode | ProcedureDeclNode)[];
  body: BlockNode;
}

export interface VarDeclNode extends BaseNode {
  kind: 'VarDecl';
  names: string[];
  varType: string;
  dimensions: number[]; // [] for scalar, [10] for 1D, [10, 10] for 2D
}

export interface BlockNode extends BaseNode {
  kind: 'Block';
  statements: ASTNode[];
}

export interface AssignmentNode extends BaseNode {
  kind: 'Assignment';
  target: string | ArrayAccessNode;
  value: ASTNode;
}

export interface IfNode extends BaseNode {
  kind: 'If';
  condition: ASTNode;
  thenBranch: BlockNode;
  elseBranch?: BlockNode;
}

export interface WhileNode extends BaseNode {
  kind: 'While';
  condition: ASTNode;
  body: BlockNode;
}

export interface ForNode extends BaseNode {
  kind: 'For';
  variable: string;
  start: ASTNode;
  end: ASTNode;
  step?: ASTNode;
  body: BlockNode;
}

export interface IoNode extends BaseNode {
  kind: 'IO';
  type: 'Read' | 'Write';
  args: ASTNode[];
}

export interface FunctionDeclNode extends BaseNode {
  kind: 'FunctionDecl';
  name: string;
  params: { name: string; type: string }[];
  returnType: string;
  variables: VarDeclNode[];
  body: BlockNode;
}

export interface ProcedureDeclNode extends BaseNode {
  kind: 'ProcedureDecl';
  name: string;
  params: { name: string; type: string }[];
  variables: VarDeclNode[];
  body: BlockNode;
}

export interface CallNode extends BaseNode {
  kind: 'Call';
  name: string;
  args: ASTNode[];
}

export interface ReturnNode extends BaseNode {
  kind: 'Return';
  value?: ASTNode;
}

export interface BinaryOpNode extends BaseNode {
  kind: 'BinaryOp';
  left: ASTNode;
  operator: TokenType;
  right: ASTNode;
}

export interface UnaryOpNode extends BaseNode {
  kind: 'UnaryOp';
  operator: TokenType;
  operand: ASTNode;
}

export interface LiteralNode extends BaseNode {
  kind: 'Literal';
  value: any;
  valueType: 'Integer' | 'Real' | 'String' | 'Boolean';
}

export interface IdentifierNode extends BaseNode {
  kind: 'Identifier';
  name: string;
}

export interface ArrayAccessNode extends BaseNode {
  kind: 'ArrayAccess';
  name: string;
  indexes: ASTNode[];
}

// --- RUNTIME TYPES ---

export interface RuntimeValue {
  value: any;
  type: 'Integer' | 'Real' | 'String' | 'Boolean' | 'Array';
  arrayType?: string;
  dims?: number[]; // Store dimensions for array bounds checking
}

export type InterpreterEvent = 
  | { type: 'output', value: string }
  | { type: 'error', value: string }
  | { type: 'input', varName: string, varType: string }
  | { type: 'step', line: number, variables: Map<string, RuntimeValue> };

export interface ExecutionResult {
  output: string[];
  errors: string[];
}

// --- IDE TYPES ---

export type ViewState = 'home' | 'ide' | 'docs' | 'learn';

export interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  parentId: string | null;
  content?: string;
  isOpen?: boolean;
}

// --- DOCS TYPES ---

export interface DocBlock {
  type: 'text' | 'code' | 'note' | 'list' | 'heading' | 'table';
  value?: string; // for text, code, heading
  items?: string[]; // for list
  headers?: string[]; // for table
  rows?: string[][]; // for table
  label?: string; // for code label
  variant?: 'info' | 'warning' | 'tip'; // for note
  level?: number; // for heading
}

export interface DocPage {
  id: string;
  title: string;
  description: string;
  blocks: DocBlock[];
}

export interface DocCategory {
  title: string;
  pages: DocPage[];
}

// --- LEARNING TYPES ---

export interface LessonContent {
  title: string;
  category: string;
  description: DocBlock[];
}

export interface Lesson {
  id: string;
  content: {
    en: LessonContent;
    ar: LessonContent;
  };
  initialCode: string;
  // Validation returns bilingual feedback
  validate: (code: string, output: string[]) => { success: boolean; message?: { en: string; ar: string } };
}