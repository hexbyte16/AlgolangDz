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
  },
  {
    id: 'average',
    name: 'average.algo',
    type: 'file',
    parentId: 'src',
    content: `Algorithm Average_Note
Var
   N : array [5] of Real
   M, S : Real
   i : Integer
Begin
   For i ← 0 to 4 step 1 do
      Write("Enter grade for student", i + 1)
      Read(N[i])
   EndFor

   S ← 0

   For i ← 0 to 4 step 1 do
      S ← S + N[i]
   EndFor

   M ← S / 5
   Write("The average is:", M)
End`
  },
  {
    id: 'matrix',
    name: 'matrix.algo',
    type: 'file',
    parentId: 'src',
    content: `Algorithm MatrixTest
Var
   Grid : array [3][3] of Integer
   r, c : Integer
Begin
   For r := 0 to 2 step 1 do
     For c := 0 to 2 step 1 do
        Grid[r][c] := (r * 3) + c + 1
        Write("Grid[", r, "][", c, "] =", Grid[r][c])
     EndFor
   EndFor
End`
  },
  {
    id: 'function',
    name: 'function.algo',
    type: 'file',
    parentId: 'src',
    content: `Algorithm FuncTest
Var
  result : Integer

Function Add(a: Integer, b: Integer) : Integer
Begin
  Return a + b
EndFunction

Begin
  result <- Add(10, 20)
  Write("Result is:", result)
End`
  }
];

export const SYNTAX_GUIDE = `
# Syntax Reference

## Structure
\`\`\`algo
Algorithm MyProgram
Var
  x : Integer
Function MyFunc() : Integer
Begin
  Return 1
EndFunction
Begin
  // Main Code
End
\`\`\`

## Assignment
You can use three symbols interchangeably:
- Arrow: \`←\`
- Text Arrow: \`<-\`
- Pascal Style: \`:=\`

## Arrays & Matrices
\`\`\`algo
Var
  vec : array [10] of Integer
  mat : array [3][3] of Real
Begin
  vec[0] <- 1
  mat[1][2] := 5.5
End
\`\`\`

## Functions & Procedures
\`\`\`algo
Procedure Greet(name: String)
Begin
  Write("Hello", name)
EndProcedure

Function Square(n: Integer) : Integer
Begin
  Return n * n
EndFunction
\`\`\`

## Loops
\`\`\`algo
For i <- 0 to 10 step 1 do ... EndFor
While x < 10 Do ... EndWhile
\`\`\`
`;