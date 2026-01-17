import { FileNode } from "./types";

export const INITIAL_FILES: FileNode[] = [
  { id: 'root', name: 'Project', type: 'folder', parentId: null, isOpen: true },
  { id: 'src', name: 'src', type: 'folder', parentId: 'root', isOpen: true },
  {
    id: 'main',
    name: 'main.algo',
    type: 'file',
    parentId: 'src',
    content: `Algorithm HelloWorld
Begin
   Write("Hello, World!")
   Write("Welcome to AlgoLang.")
End`
  }
];

export const SYNTAX_GUIDE = `
# Syntax Reference

## Structure
Every program starts with \`Algorithm\` and ends with \`End\`.

\`\`\`algo
Algorithm MyProgram
Var
  x : Integer
Begin
  // Code here
End
\`\`\`

## Variables
Declared in the \`Var\` block before \`Begin\`.
Types: \`Integer\`, \`Real\`, \`String\`, \`Boolean\`.

\`\`\`algo
Var
  count : Integer
  price : Real
  name : String
  isValid : Boolean
\`\`\`

## I/O
- **Output**: \`Write(expression)\`
- **Input**: \`Read(variable)\`

## Conditions

\`\`\`algo
If x > 10 Then
  Write("Big")
Else
  Write("Small")
EndIf
\`\`\`

## Loops

**For Loop**:
\`\`\`algo
For i ← 0 to 10 step 1 do
  Write(i)
EndFor
\`\`\`

**While Loop**:
\`\`\`algo
While x < 100 Do
  x ← x + 1
EndWhile
\`\`\`

## Arrays
\`\`\`algo
Var
  scores : array [5] of Integer
Begin
  scores[0] ← 10
End
\`\`\`
`;