import { FileNode, DocCategory, Lesson } from "./types";

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

export const TRANSLATIONS = {
  en: {
    home: "Home",
    project: "Project",
    docs: "Docs",
    learn: "Learn",
    run: "RUN CODE",
    pause: "Pause",
    resume: "Resume",
    step: "Step",
    stop: "Stop",
    terminal: "Terminal",
    variables: "Variables",
    welcome: "Welcome to AlgoLang",
    welcomeSub: "The educational language designed for algorithmic logic.",
    startCoding: "Start Coding",
    startLearning: "Start Learning",
    documentation: "Documentation",
    realTimeTerm: "Real-time Terminal",
    realTimeTermDesc: "Experience authentic I/O operations with a built-in interactive console.",
    stepDebugger: "Step Debugger",
    stepDebuggerDesc: "Visualize execution flow, inspect variables, and catch logic errors.",
    strictSyntax: "Strict Syntax",
    strictSyntaxDesc: "Master the fundamentals with strict type checking and clear error messages.",
    madeFor: "Made for Algerian Students & Developers",
    noFile: "Select a file to start coding",
    ready: "Ready to execute...",
    newFile: "New File",
    newFolder: "New Folder",
    delete: "Delete",
    name: "Name",
    type: "Type",
    value: "Value",
    noVars: "No variables in scope",
    previous: "Previous",
    next: "Next",
    enterName: "Name...",
    checkAnswer: "Check Answer",
    nextLesson: "Next Lesson",
    lessonComplete: "Lesson Complete!",
    lessonFailed: "Keep Trying",
    tryAgain: "Try Again",
    locked: "Locked"
  },
  ar: {
    home: "الرئيسية",
    project: "المشروع",
    docs: "التوثيق",
    learn: "تعلم",
    run: "تشغيل الكود",
    pause: "إيقاف مؤقت",
    resume: "استكمال",
    step: "خطوة",
    stop: "إيقاف",
    terminal: "المحطة الطرفية",
    variables: "المتغيرات",
    welcome: "مرحباً بكم في AlgoLang",
    welcomeSub: "اللغة التعليمية المصممة لتعلم الخوارزميات والمنطق البرمجي.",
    startCoding: "ابدأ البرمجة",
    startLearning: "ابدأ التعلم",
    documentation: "التوثيق",
    realTimeTerm: "محطة طرفية فورية",
    realTimeTermDesc: "جرب عمليات الإدخال والإخراج الحقيقية مع وحدة تحكم تفاعلية مدمجة.",
    stepDebugger: "مصحح الأخطاء (Debugger)",
    stepDebuggerDesc: "تتبع سير التنفيذ، افحص المتغيرات، واكتشف الأخطاء المنطقية خطوة بخطوة.",
    strictSyntax: "صياغة دقيقة",
    strictSyntaxDesc: "أتقن الأساسيات مع التحقق الصارم من الأنواع ورسائل الخطأ الواضحة.",
    madeFor: "صنع من أجل الطلبة والمطورين الجزائريين",
    noFile: "اختر ملفاً للبدء في البرمجة",
    ready: "جاهز للتنفيذ...",
    newFile: "ملف جديد",
    newFolder: "مجلد جديد",
    delete: "حذف",
    name: "الاسم",
    type: "النوع",
    value: "القيمة",
    noVars: "لا توجد متغيرات في النطاق",
    previous: "السابق",
    next: "التالي",
    enterName: "الاسم...",
    checkAnswer: "تحقق من الإجابة",
    nextLesson: "الدرس التالي",
    lessonComplete: "اكتمل الدرس!",
    lessonFailed: "حاول مرة أخرى",
    tryAgain: "أعد المحاولة",
    locked: "مغلق"
  }
};

export const LESSONS: Lesson[] = [
  {
    id: "l1",
    content: {
      en: {
        title: "Hello World",
        category: "Basics",
        description: [
          { type: 'text', value: "Welcome to your first algorithm! The first step in any language is learning how to output text to the screen." },
          { type: 'text', value: "In AlgoLang, we use the 'Write' command to display information." },
          { type: 'code', value: 'Write("Hello")' },
          { type: 'note', variant: 'tip', value: "Strings of text must always be inside double quotes." },
          { type: 'heading', level: 3, value: "Your Task" },
          { type: 'text', value: "Complete the algorithm to display exactly: Hello AlgoLang" }
        ]
      },
      ar: {
        title: "مرحباً بالعالم",
        category: "الأساسيات",
        description: [
          { type: 'text', value: "مرحباً بك في أول خوارزمية! الخطوة الأولى في تعلم أي لغة هي معرفة كيفية عرض النصوص على الشاشة." },
          { type: 'text', value: "في AlgoLang، نستخدم الأمر 'Write' لعرض المعلومات." },
          { type: 'code', value: 'Write("Hello")' },
          { type: 'note', variant: 'tip', value: "النصوص (Strings) يجب أن تكون دائماً داخل علامات اقتباس مزدوجة." },
          { type: 'heading', level: 3, value: "مهمتك" },
          { type: 'text', value: "أكمل الخوارزمية لعرض الجملة التالية تماماً: Hello AlgoLang" }
        ]
      }
    },
    initialCode: `Algorithm FirstProgram
Begin
  // Write your code here
  
End`,
    validate: (code, output) => {
      if (!code.toLowerCase().includes("write")) 
        return { success: false, message: { en: "You must use the 'Write' command.", ar: "يجب عليك استخدام الأمر 'Write'." } };
      
      const combinedOutput = output.join(" ");
      if (combinedOutput.includes("Hello AlgoLang")) 
        return { success: true };
      
      return { success: false, message: { en: "Expected output: Hello AlgoLang", ar: "المخرجات المتوقعة: Hello AlgoLang" } };
    }
  },
  {
    id: "l2",
    content: {
      en: {
        title: "Variables",
        category: "Basics",
        description: [
          { type: 'text', value: "Variables are like boxes where we store data. Before using a variable, you must declare it in the 'Var' section." },
          { type: 'code', value: `Var
  age : Integer
Begin
  age <- 25
  Write(age)
End` },
          { type: 'heading', level: 3, value: "Your Task" },
          { type: 'text', value: "1. Declare a variable named 'score' of type Integer." },
          { type: 'text', value: "2. Assign the value 100 to it." },
          { type: 'text', value: "3. Write the value of 'score' to the console." }
        ]
      },
      ar: {
        title: "المتغيرات",
        category: "الأساسيات",
        description: [
          { type: 'text', value: "المتغيرات تشبه الصناديق التي نخزن فيها البيانات. قبل استخدام المتغير، يجب التصريح عنه في قسم 'Var'." },
          { type: 'code', value: `Var
  age : Integer
Begin
  age <- 25
  Write(age)
End` },
          { type: 'heading', level: 3, value: "مهمتك" },
          { type: 'text', value: "1. صرح عن متغير باسم 'score' من نوع Integer." },
          { type: 'text', value: "2. أسند القيمة 100 إليه." },
          { type: 'text', value: "3. اعرض قيمة 'score' باستخدام الأمر Write." }
        ]
      }
    },
    initialCode: `Algorithm Variables
Var
  // Declare variable here

Begin
  // Assign and Write here

End`,
    validate: (code, output) => {
      const lowerCode = code.toLowerCase();
      if (!lowerCode.includes("score : integer") && !lowerCode.includes("score:integer") && !lowerCode.includes("score: integer")) 
        return { success: false, message: { en: "Did you declare 'score : Integer'?", ar: "هل قمت بالتصريح عن 'score : Integer'؟" } };
      if (!output.some(o => o.includes("100"))) 
        return { success: false, message: { en: "The program should output the number 100.", ar: "يجب أن يعرض البرنامج الرقم 100." } };
      return { success: true };
    }
  },
  {
    id: "l3",
    content: {
      en: {
        title: "Input (Read)",
        category: "Interaction",
        description: [
          { type: 'text', value: "To make programs interactive, we use 'Read()'. This waits for the user to type something." },
          { type: 'code', value: `Write("Enter name:")
Read(myName)` },
          { type: 'heading', level: 3, value: "Your Task" },
          { type: 'text', value: "Write a program that asks the user for a number, reads it into a variable 'x', and then displays 'You entered:' followed by the number." }
        ]
      },
      ar: {
        title: "الإدخال (Read)",
        category: "التفاعل",
        description: [
          { type: 'text', value: "لجعل البرامج تفاعلية، نستخدم 'Read()'. هذا الأمر ينتظر المستخدم ليكتب شيئاً." },
          { type: 'code', value: `Write("Enter name:")
Read(myName)` },
          { type: 'heading', level: 3, value: "مهمتك" },
          { type: 'text', value: "اكتب برنامجاً يطلب من المستخدم رقماً، يقرأه في متغير 'x'، ثم يعرض 'You entered:' متبوعاً بالرقم." }
        ]
      }
    },
    initialCode: `Algorithm InputTest
Var
  x : Integer
Begin
  Write("Enter a number:")
  
End`,
    validate: (code, output) => {
      if (!code.toLowerCase().includes("read(x)")) 
        return { success: false, message: { en: "Use Read(x) to get user input.", ar: "استخدم Read(x) للحصول على إدخال المستخدم." } };
      
      const joined = output.join(" ");
      if (joined.toLowerCase().includes("you entered")) return { success: true };
      return { success: false, message: { en: "Output should contain 'You entered:'", ar: "يجب أن تحتوي المخرجات على 'You entered:'" } };
    }
  },
  {
    id: "l4",
    content: {
      en: {
        title: "If Statements",
        category: "Control Flow",
        description: [
          { type: 'text', value: "We use 'If' to make decisions. The code inside 'Then' only runs if the condition is true." },
          { type: 'code', value: `If score >= 10 Then
  Write("Pass")
Else
  Write("Fail")
EndIf` },
          { type: 'heading', level: 3, value: "Your Task" },
          { type: 'text', value: "Create a variable 'temperature'. Assign it the value 30. Write an If statement: if temperature is greater than 25, Write 'Hot', otherwise Write 'Cold'." }
        ]
      },
      ar: {
        title: "الجمل الشرطية (If)",
        category: "التحكم",
        description: [
          { type: 'text', value: "نستخدم 'If' لاتخاذ القرارات. الكود داخل 'Then' يعمل فقط إذا كان الشرط صحيحاً." },
          { type: 'code', value: `If score >= 10 Then
  Write("Pass")
Else
  Write("Fail")
EndIf` },
          { type: 'heading', level: 3, value: "مهمتك" },
          { type: 'text', value: "أنشئ متغيراً 'temperature'. أسند له القيمة 30. اكتب جملة If: إذا كانت الحرارة أكبر من 25، اكتب 'Hot'، وإلا اكتب 'Cold'." }
        ]
      }
    },
    initialCode: `Algorithm Weather
Var
  temperature : Integer
Begin
  temperature <- 30
  
End`,
    validate: (code, output) => {
       const lower = code.toLowerCase();
       if (!lower.includes("if") || !lower.includes("then") || !lower.includes("endif")) 
          return { success: false, message: { en: "You need a complete If...Then...EndIf structure.", ar: "تحتاج إلى هيكل If...Then...EndIf كامل." } };
       if (!output.some(o => o.includes("Hot"))) 
          return { success: false, message: { en: "With temperature 30, it should output 'Hot'.", ar: "مع درجة حرارة 30، يجب أن تكون النتيجة 'Hot'." } };
       return { success: true };
    }
  },
  {
    id: "l5",
    content: {
      en: {
        title: "For Loops",
        category: "Control Flow",
        description: [
          { type: 'text', value: "A 'For' loop repeats code a specific number of times." },
          { type: 'code', value: `For i <- 1 to 5 step 1 do
  Write(i)
EndFor` },
          { type: 'heading', level: 3, value: "Your Task" },
          { type: 'text', value: "Write a loop that prints the numbers from 1 to 5." }
        ]
      },
      ar: {
        title: "حلقات التكرار (For)",
        category: "التحكم",
        description: [
          { type: 'text', value: "حلقة 'For' تكرر الكود عدداً محدداً من المرات." },
          { type: 'code', value: `For i <- 1 to 5 step 1 do
  Write(i)
EndFor` },
          { type: 'heading', level: 3, value: "مهمتك" },
          { type: 'text', value: "اكتب حلقة تقوم بطباعة الأرقام من 1 إلى 5." }
        ]
      }
    },
    initialCode: `Algorithm Counter
Var
  i : Integer
Begin
  
End`,
    validate: (code, output) => {
       if (!code.toLowerCase().includes("for") || !code.toLowerCase().includes("endfor")) 
         return { success: false, message: { en: "Use a For...EndFor loop.", ar: "استخدم حلقة For...EndFor." } };
       
       const nums = output.filter(o => /^\d+$/.test(o.trim()) || o.includes("1") || o.includes("5"));
       if (nums.length < 5) 
         return { success: false, message: { en: "Make sure to print numbers 1 through 5.", ar: "تأكد من طباعة الأرقام من 1 إلى 5." } };
       return { success: true };
    }
  },
  {
    id: "l6",
    content: {
      en: {
        title: "Arrays",
        category: "Advanced",
        description: [
          { type: 'text', value: "Arrays hold multiple values. You access them using an index, starting at 0." },
          { type: 'code', value: `Var
  nums : Array [3] of Integer
Begin
  nums[0] <- 10
  Write(nums[0])
End` },
          { type: 'heading', level: 3, value: "Your Task" },
          { type: 'text', value: "Declare an array 'A' of size 3 (Integer). Set the first element (index 0) to 5, the second (index 1) to 10. Then Write the sum of both." }
        ]
      },
      ar: {
        title: "المصفوفات (Arrays)",
        category: "متقدم",
        description: [
          { type: 'text', value: "المصفوفات تخزن قيماً متعددة. يمكنك الوصول إليها باستخدام فهرس (Index) يبدأ من 0." },
          { type: 'code', value: `Var
  nums : Array [3] of Integer
Begin
  nums[0] <- 10
  Write(nums[0])
End` },
          { type: 'heading', level: 3, value: "مهمتك" },
          { type: 'text', value: "صرح عن مصفوفة 'A' بحجم 3 (Integer). اجعل العنصر الأول (فهرس 0) يساوي 5، والثاني (فهرس 1) يساوي 10. ثم اعرض مجموع الرقمين." }
        ]
      }
    },
    initialCode: `Algorithm MyArray
Var
  // Declare array A here
  
Begin
  
End`,
    validate: (code, output) => {
       if (!code.toLowerCase().includes("array")) 
          return { success: false, message: { en: "Declare an array variable.", ar: "صرح عن متغير مصفوفة." } };
       if (!output.some(o => o.includes("15"))) 
          return { success: false, message: { en: "The sum of 5 and 10 is 15. Make sure to output it.", ar: "مجموع 5 و 10 هو 15. تأكد من عرضه." } };
       return { success: true };
    }
  }
];

export const DOCS_DATA_EN: DocCategory[] = [
  {
    title: "Getting Started",
    pages: [
      {
        id: "intro",
        title: "Introduction",
        description: "Welcome to AlgoLang, the educational language designed for algorithmic logic.",
        blocks: [
          { type: 'text', value: "AlgoLang is an educational programming language designed to bridge the gap between handwritten pseudocode and executable computer programs. It uses the exact syntax taught in first-year algorithmic courses." },
          { type: 'note', variant: 'tip', value: "This environment is purely client-side. Your code runs directly in your browser!" },
          { type: 'heading', value: "The Anatomy of a Program", level: 2 },
          { type: 'text', value: "Every program follows a strict skeleton. You must name your algorithm, declare your variables (optional), and then write your instructions between 'Begin' and 'End'." },
          { type: 'code', value: `Algorithm MyFirstProgram
Var
  // Variables are declared here
  name : String
  age : Integer
Begin
  // Instructions go here
  name <- "Student"
  age <- 20
  Write("Welcome", name)
End` }
        ]
      },
      {
        id: "types",
        title: "Variables & Types",
        description: "Understanding how to store and manipulate data.",
        blocks: [
          { type: 'text', value: "Before you use a variable, you must declare it in the 'Var' section. AlgoLang is strictly typed, meaning an Integer variable cannot hold a String." },
          { type: 'heading', value: "Supported Data Types", level: 2 },
          { type: 'table', headers: ["Type", "Description", "Example"], rows: [
            ["Integer", "Whole numbers (positive or negative)", "1, 42, -5, 0"],
            ["Real", "Decimal numbers", "3.14, -0.001, 5.0"],
            ["String", "Text enclosed in quotes", "\"Hello World\""],
            ["Boolean", "True or False values", "True, False"],
            ["Character", "A single letter or symbol", "'A', 'z', '@'"]
          ]},
          { type: 'heading', value: "Declaration Syntax", level: 2 },
          { type: 'code', value: `Var
  count : Integer
  price, tax : Real
  isValid : Boolean
  message : String` }
        ]
      },
      {
        id: "assignment",
        title: "Assignment",
        description: "How to save values into variables.",
        blocks: [
          { type: 'text', value: "In algorithmic logic, we 'assign' a value to a variable. Since the traditional arrow symbol (←) is hard to type, we support three different ways to write it. They all do exactly the same thing." },
          { type: 'code', label: "All valid methods", value: `x ← 10    // The classic symbol
x <- 10   // The keyboard-friendly arrow
x := 10   // The Pascal style` },
          { type: 'note', variant: 'warning', value: "Do not use the single equals sign '=' for assignment! In AlgoLang, '=' is only used for comparison (checking if two things are equal)." }
        ]
      }
    ]
  },
  {
    title: "Core Concepts",
    pages: [
      {
        id: "io",
        title: "Input & Output",
        description: "Interacting with the user.",
        blocks: [
          { type: 'text', value: "Communication happens via two commands: Read (Input) and Write (Output)." },
          { type: 'heading', value: "Write()", level: 3 },
          { type: 'text', value: "Displays text or values to the screen. You can combine multiple items with commas." },
          { type: 'code', value: `Write("Hello World")
Write("The value of x is:", x)` },
          { type: 'heading', value: "Read()", level: 3 },
          { type: 'text', value: "Pauses the program and waits for the user to type a value. The value is then stored in the specified variable." },
          { type: 'code', value: `Write("Enter your age:")
Read(age)` }
        ]
      },
      {
        id: "control",
        title: "Control Flow",
        description: "Making decisions with If/Else and Loops.",
        blocks: [
          { type: 'heading', value: "If ... Then ... Else", level: 2 },
          { type: 'code', value: `If grade >= 10 Then
   Write("You Passed")
Else
   Write("You Failed")
EndIf` },
          { type: 'heading', value: "For Loop", level: 2 },
          { type: 'text', value: "Used when you know exactly how many times to repeat code." },
          { type: 'code', value: `For i <- 1 to 10 step 1 do
   Write("Number:", i)
EndFor` },
          { type: 'heading', value: "While Loop", level: 2 },
          { type: 'text', value: "Used when you want to repeat code as long as a condition is true." },
          { type: 'code', value: `While x > 0 Do
   x <- x - 1
   Write(x)
EndWhile` }
        ]
      },
      {
        id: "operators",
        title: "Operators",
        description: "Math and Logic symbols.",
        blocks: [
          { type: 'table', headers: ["Category", "Operator", "Description"], rows: [
            ["Arithmetic", "+, -, *, /", "Standard math"],
            ["Integer Math", "DIV, MOD", "Whole division and Remainder"],
            ["Comparison", "=, <>, <, >, <=, >=", "Equals, Not Equals, Less, Greater..."],
            ["Logic", "AND, OR, NOT", "Boolean logic"]
          ]}
        ]
      }
    ]
  },
  {
    title: "Advanced",
    pages: [
      {
        id: "arrays",
        title: "Arrays & Matrices",
        description: "Working with lists and grids of data.",
        blocks: [
          { type: 'text', value: "Arrays allow you to store multiple values of the same type under one name." },
          { type: 'heading', value: "1D Arrays (Lists)", level: 3 },
          { type: 'code', value: `Var
  grades : Array [10] of Real
Begin
  grades[0] <- 15.5
  Write(grades[0])
End` },
          { type: 'heading', value: "2D Arrays (Matrices)", level: 3 },
          { type: 'text', value: "Useful for grids, tables, or board games." },
          { type: 'code', value: `Var
  grid : Array [3][3] of Integer
Begin
  grid[0][0] <- 1
  grid[1][2] <- 9
End` }
        ]
      },
      {
        id: "functions",
        title: "Functions & Procedures",
        description: "Reusable blocks of code.",
        blocks: [
          { type: 'note', variant: 'info', value: "A Function calculates and Returns a value. A Procedure performs an action but returns nothing." },
          { type: 'heading', value: "Function Syntax", level: 3 },
          { type: 'code', value: `Function Sum(a:Integer, b:Integer) : Integer
Begin
   Return a + b
EndFunction` },
          { type: 'heading', value: "Procedure Syntax", level: 3 },
          { type: 'code', value: `Procedure SayHello(name:String)
Begin
   Write("Hello", name)
EndProcedure` },
          { type: 'text', value: "Note: Functions and Procedures must be defined BEFORE the main 'Begin' block of your algorithm." }
        ]
      }
    ]
  }
];

export const DOCS_DATA_AR: DocCategory[] = [
  {
    title: "البداية",
    pages: [
      {
        id: "intro",
        title: "مقدمة",
        description: "مرحباً بكم في AlgoLang، البيئة التعليمية المصممة لتعلم الخوارزميات.",
        blocks: [
          { type: 'text', value: "AlgoLang هي لغة برمجة تعليمية تهدف إلى سد الفجوة بين الخوارزميات المكتوبة على الورق والبرامج الحاسوبية القابلة للتنفيذ. تستخدم اللغة نفس الصيغة التي تدرس في الجامعات للسنة الأولى." },
          { type: 'note', variant: 'tip', value: "هذه البيئة تعمل بالكامل على متصفحك. الكود الخاص بك يتم تنفيذه محلياً!" },
          { type: 'heading', value: "هيكل البرنامج", level: 2 },
          { type: 'text', value: "يتبع كل برنامج هيكلاً صارماً. يجب عليك تسمية الخوارزمية، التصريح عن المتغيرات (اختياري)، ثم كتابة التعليمات بين 'Begin' و 'End'." },
          { type: 'code', value: `Algorithm MyFirstProgram
Var
  // يتم التصريح عن المتغيرات هنا
  name : String
  age : Integer
Begin
  // التعليمات تبدأ هنا
  name <- "Student"
  age <- 20
  Write("Welcome", name)
End` }
        ]
      },
      {
        id: "types",
        title: "المتغيرات والأنواع",
        description: "فهم كيفية تخزين ومعالجة البيانات.",
        blocks: [
          { type: 'text', value: "قبل استخدام أي متغير، يجب التصريح عنه في قسم 'Var'. AlgoLang صارمة في الأنواع، مما يعني أن متغير من نوع Integer لا يمكنه تخزين قيمة نصية." },
          { type: 'heading', value: "أنواع البيانات المدعومة", level: 2 },
          { type: 'table', headers: ["النوع", "الوصف", "مثال"], rows: [
            ["Integer", "الأعداد الصحيحة (موجبة أو سالبة)", "1, 42, -5, 0"],
            ["Real", "الأعداد الحقيقية (بالفاصلة)", "3.14, -0.001, 5.0"],
            ["String", "نصوص محاطة بعلامات تنصيص", "\"Hello World\""],
            ["Boolean", "قيم منطقية (صحيح أو خطأ)", "True, False"],
            ["Character", "حرف واحد أو رمز", "'A', 'z', '@'"]
          ]},
          { type: 'heading', value: "صيغة التصريح", level: 2 },
          { type: 'code', value: `Var
  count : Integer
  price, tax : Real
  isValid : Boolean
  message : String` }
        ]
      },
      {
        id: "assignment",
        title: "الإسناد (Assignment)",
        description: "كيفية حفظ القيم داخل المتغيرات.",
        blocks: [
          { type: 'text', value: "في الخوارزميات، نقوم بـ 'إسناد' قيمة للمتغير. نظراً لأن رمز السهم التقليدي (←) صعب الكتابة، ندعم ثلاث طرق مختلفة للكتابة." },
          { type: 'code', label: "كل الطرق التالية صحيحة", value: `x ← 10    // الرمز الكلاسيكي
x <- 10   // السهم المناسب للوحة المفاتيح
x := 10   // أسلوب باسكال` },
          { type: 'note', variant: 'warning', value: "لا تستخدم علامة التساوي المفردة '=' للإسناد! في AlgoLang، تستخدم '=' للمقارنة فقط (التحقق مما إذا كان شيئان متساويين)." }
        ]
      }
    ]
  },
  {
    title: "المفاهيم الأساسية",
    pages: [
      {
        id: "io",
        title: "الإدخال والإخراج",
        description: "التفاعل مع المستخدم.",
        blocks: [
          { type: 'text', value: "يتم التواصل عبر أمرين رئيسيين: Read (إدخال) و Write (إخراج)." },
          { type: 'heading', value: "Write()", level: 3 },
          { type: 'text', value: "تعرض نصاً أو قيماً على الشاشة. يمكنك دمج عدة عناصر باستخدام الفواصل." },
          { type: 'code', value: `Write("Hello World")
Write("The value of x is:", x)` },
          { type: 'heading', value: "Read()", level: 3 },
          { type: 'text', value: "توقف البرنامج وتنتظر من المستخدم كتابة قيمة. يتم تخزين القيمة في المتغير المحدد." },
          { type: 'code', value: `Write("Enter your age:")
Read(age)` }
        ]
      },
      {
        id: "control",
        title: "التحكم في التدفق",
        description: "اتخاذ القرارات باستخدام If/Else والحلقات.",
        blocks: [
          { type: 'heading', value: "If ... Then ... Else", level: 2 },
          { type: 'code', value: `If grade >= 10 Then
   Write("You Passed")
Else
   Write("You Failed")
EndIf` },
          { type: 'heading', value: "الحلقة For", level: 2 },
          { type: 'text', value: "تستخدم عندما تعرف بالضبط عدد المرات التي تريد تكرار الكود فيها." },
          { type: 'code', value: `For i <- 1 to 10 step 1 do
   Write("Number:", i)
EndFor` },
          { type: 'heading', value: "الحلقة While", level: 2 },
          { type: 'text', value: "تستخدم عندما تريد تكرار الكود طالما أن الشرط صحيح." },
          { type: 'code', value: `While x > 0 Do
   x <- x - 1
   Write(x)
EndWhile` }
        ]
      },
      {
        id: "operators",
        title: "المعاملات (Operators)",
        description: "الرموز الرياضية والمنطقية.",
        blocks: [
          { type: 'table', headers: ["الفئة", "المعامل", "الوصف"], rows: [
            ["حسابي", "+, -, *, /", "رياضيات قياسية"],
            ["حساب صحيح", "DIV, MOD", "القسمة الصحيحة والباقي"],
            ["مقارنة", "=, <>, <, >, <=, >=", "يساوي، لا يساوي، أصغر، أكبر..."],
            ["منطقي", "AND, OR, NOT", "منطق بوليان"]
          ]}
        ]
      }
    ]
  },
  {
    title: "متقدم",
    pages: [
      {
        id: "arrays",
        title: "المصفوفات (Arrays)",
        description: "التعامل مع قوائم وشبكات البيانات.",
        blocks: [
          { type: 'text', value: "تسمح لك المصفوفات بتخزين قيم متعددة من نفس النوع تحت اسم واحد." },
          { type: 'heading', value: "مصفوفات أحادية البعد (قوائم)", level: 3 },
          { type: 'code', value: `Var
  grades : Array [10] of Real
Begin
  grades[0] <- 15.5
  Write(grades[0])
End` },
          { type: 'heading', value: "مصفوفات ثنائية البعد (جدول)", level: 3 },
          { type: 'text', value: "مفيدة للشبكات، الجداول، أو ألعاب اللوحة." },
          { type: 'code', value: `Var
  grid : Array [3][3] of Integer
Begin
  grid[0][0] <- 1
  grid[1][2] <- 9
End` }
        ]
      },
      {
        id: "functions",
        title: "الدوال والإجراءات",
        description: "كتل الكود القابلة لإعادة الاستخدام.",
        blocks: [
          { type: 'note', variant: 'info', value: "الدالة (Function) تحسب وتُرجع قيمة. الإجراء (Procedure) ينفذ عملاً ولكنه لا يُرجع شيئاً." },
          { type: 'heading', value: "صيغة الدالة", level: 3 },
          { type: 'code', value: `Function Sum(a:Integer, b:Integer) : Integer
Begin
   Return a + b
EndFunction` },
          { type: 'heading', value: "صيغة الإجراء", level: 3 },
          { type: 'code', value: `Procedure SayHello(name:String)
Begin
   Write("Hello", name)
EndProcedure` },
          { type: 'text', value: "ملاحظة: يجب تعريف الدوال والإجراءات قبل كتلة 'Begin' الرئيسية في الخوارزمية." }
        ]
      }
    ]
  }
];