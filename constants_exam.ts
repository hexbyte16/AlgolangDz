import { Lesson } from "./types";

export const EXAM_LESSONS: Lesson[] = [
  {
    id: "ex_str_1",
    content: {
      en: {
        title: "Strings: Manual Copy",
        category: "Exam 1: Strings",
        description: [
          { type: 'text', value: "In exams, you are often asked to manipulate strings WITHOUT using standard loops or sometimes without standard functions like `strcpy`. However, let's learn the logic of copying a string character by character." },
          { type: 'note', variant: 'warning', value: "Exam Rule: Copy content of str1 into str2." },
          { type: 'heading', level: 3, value: "Task" },
          { type: 'text', value: "Given `str1` = 'exam'. Write a loop to copy characters from `str1` to `str2` manually." }
        ]
      },
      ar: {
        title: "السلاسل النصية: النسخ اليدوي",
        category: "الامتحان 1: السلاسل",
        description: [
          { type: 'text', value: "في الامتحانات، غالباً ما يُطلب منك معالجة النصوص بدون استخدام الدوال الجاهزة مثل `strcpy`. دعنا نتعلم منطق نسخ سلسلة حرفاً بحرف." },
          { type: 'note', variant: 'warning', value: "قاعدة الامتحان: انسخ محتوى str1 إلى str2." },
          { type: 'heading', level: 3, value: "المهمة" },
          { type: 'text', value: "لديك `str1` = 'exam'. اكتب حلقة لنسخ الحروف من `str1` إلى `str2` يدوياً." }
        ]
      }
    },
    initialCode: `Algorithm StringCopy
Var
  str1, str2 : String
  i : Integer
Begin
  str1 <- "exam"
  str2 <- ""
  
  // Write a loop here to copy str1 to str2
  // Hint: AlgoLang handles strings easily, but try to simulate the logic
  str2 <- str1 
  
  Write("Result:", str2)
End`,
    initialCodeC: `#include <stdio.h>
#include <string.h>

int main() {
    char str1[] = "exam";
    char str2[10];
    int i;

    // Write a loop to copy str1 to str2 manually
    // for(i = 0; ... )
    
    printf("Result: %s", str2);
    return 0;
}`,
    validate: (code, output, lang) => {
      if (lang === 'c') {
         if (!code.includes("str2[i] = str1[i]") && !code.includes("str2[i]=str1[i]")) 
            return { success: false, message: { en: "Try using a loop with assignment: str2[i] = str1[i]", ar: "حاول استخدام حلقة مع الإسناد: str2[i] = str1[i]" } };
         return { success: true };
      }
      // Algo validation
      if (output.join("").includes("exam")) return { success: true };
      return { success: false, message: { en: "Output should contain 'exam'", ar: "يجب أن تحتوي النتيجة على 'exam'" } };
    }
  },
  {
    id: "ex_series_1",
    content: {
      en: {
        title: "Series: Factorial Sum",
        category: "Exam 1: Loops",
        description: [
          { type: 'text', value: "Calculate S(x,n) = x + x^3/3! + x^5/5! + ... + x^n/n!" },
          { type: 'note', variant: 'tip', value: "Do not use `pow` or `factorial` functions. Calculate them inside the loop." },
          { type: 'heading', level: 3, value: "Logic" },
          { type: 'text', value: "1. Loop `i` from 1 to n (step 2 for odd numbers)." },
          { type: 'text', value: "2. Update power: `p = p * x * x`." },
          { type: 'text', value: "3. Update factorial: `f = f * (i-1) * i`." }
        ]
      },
      ar: {
        title: "المتسلسلات: مجموع العاملي",
        category: "الامتحان 1: الحلقات",
        description: [
          { type: 'text', value: "احسب S(x,n) = x + x^3/3! + x^5/5! + ... + x^n/n!" },
          { type: 'note', variant: 'tip', value: "لا تستخدم دوال الأس أو العاملي الجاهزة. احسبها داخل الحلقة." },
          { type: 'heading', level: 3, value: "المنطق" },
          { type: 'text', value: "1. حلقة `i` من 1 إلى n (بخطوة 2 للأعداد الفردية)." },
          { type: 'text', value: "2. تحديث الأس: `p = p * x * x`." },
          { type: 'text', value: "3. تحديث العاملي: `f = f * (i-1) * i`." }
        ]
      }
    },
    initialCode: `Algorithm SeriesCalc
Var
  x, n, i : Integer
  S, p, f : Real
Begin
  x <- 2
  n <- 5
  S <- 0
  p <- x
  f <- 1
  
  // Initialize S with first term if needed or loop
  
  For i <- 3 to n step 2 Do
     // Update p (power)
     // Update f (factorial)
     // Add to S
  EndFor
  
  Write("Sum is:", S)
End`,
    initialCodeC: `#include <stdio.h>

int main() {
    int x = 2, n = 5, i;
    float S = 0, p = 2, f = 1;

    // S = x (first term)
    S = x;

    for(i = 3; i <= n; i += 2) {
        // Calculate power and factorial iteratively
        // p = ...
        // f = ...
        // S = S + ...
    }

    printf("Sum is: %f", S);
    return 0;
}`,
    validate: (code, output, lang) => {
        // Validation logic checks for loop structure
        const clean = code.toLowerCase().replace(/\s/g, "");
        if (!clean.includes("step2") && !clean.includes("i+=2") && !clean.includes("i=i+2")) 
             return { success: false, message: { en: "Loop step should be 2 (odd numbers)", ar: "خطوة الحلقة يجب أن تكون 2 (للأعداد الفردية)" } };
        
        return { success: true };
    }
  },
  {
    id: "ex_freq_1",
    content: {
      en: {
        title: "Arrays: Frequency Count",
        category: "Exam 1: Arrays",
        description: [
          { type: 'text', value: "Given array A, calculate the number of occurrences of each element." },
          { type: 'text', value: "1. Create an array `Freq` initialized to 0." },
          { type: 'text', value: "2. Iterate through A. Use the value of A[i] as the index for Freq." },
          { type: 'code', value: "Freq[A[i]] = Freq[A[i]] + 1" }
        ]
      },
      ar: {
        title: "المصفوفات: حساب التكرار",
        category: "الامتحان 1: المصفوفات",
        description: [
          { type: 'text', value: "لديك مصفوفة A، احسب عدد تكرارات كل عنصر." },
          { type: 'text', value: "1. أنشئ مصفوفة `Freq` مهيأة بـ 0." },
          { type: 'text', value: "2. مر على A. استخدم قيمة A[i] كفهرس لـ Freq." },
          { type: 'code', value: "Freq[A[i]] = Freq[A[i]] + 1" }
        ]
      }
    },
    initialCode: `Algorithm Frequency
Var
  A : Array [7] of Integer
  Freq : Array [10] of Integer
  i, val : Integer
Begin
  // Init Data
  A[0]<-1; A[1]<-3; A[2]<-4; A[3]<-1; A[4]<-2; A[5]<-3; A[6]<-1
  
  // Init Freq to 0
  For i <- 0 to 9 step 1 Do
     Freq[i] <- 0
  EndFor
  
  // Calculate Frequency
  For i <- 0 to 6 step 1 Do
      // Your logic here
  EndFor
  
  Write("Frequency of 1 is:", Freq[1])
End`,
    initialCodeC: `#include <stdio.h>

int main() {
    int A[] = {1, 3, 4, 1, 2, 3, 1};
    int Freq[10] = {0}; // Init to 0
    int i;
    
    for(i = 0; i < 7; i++) {
        // Your logic here: Increment Freq at index A[i]
    }
    
    printf("Frequency of 1 is: %d", Freq[1]);
    return 0;
}`,
    validate: (code, output, lang) => {
        if(lang === 'c') {
            if(!code.includes("Freq[A[i]]++") && !code.includes("Freq[A[i]] ="))
                return { success: false, message: {en: "Use A[i] as index for Freq", ar: "استخدم A[i] كفهرس لـ Freq"} };
            return { success: true };
        }
        if(!output.some(o => o.includes("3")))
             return { success: false, message: {en: "Frequency of 1 should be 3", ar: "تكرار الرقم 1 يجب أن يكون 3"} };
        return { success: true };
    }
  },
  {
    id: "ex_mat_1",
    content: {
      en: {
        title: "Matrices: Binary to Decimal",
        category: "Exam 2: Matrices",
        description: [
          { type: 'text', value: "You have a matrix where each row represents a binary number. Convert each row to decimal." },
          { type: 'heading', level: 3, value: "Algorithm" },
          { type: 'text', value: "For each row `i`: Initialize `sum = 0`, `power = 1`. Loop `j` from right to left (or 0 to N and manage powers). " },
          { type: 'code', value: "If M[i][j] == 1 Then sum = sum + power" }
        ]
      },
      ar: {
        title: "المصفوفات: من الثنائي للعشري",
        category: "الامتحان 2: المصفوفات",
        description: [
          { type: 'text', value: "لديك مصفوفة حيث يمثل كل سطر عدداً ثنائياً. حول كل سطر إلى عشري." },
          { type: 'heading', level: 3, value: "الخوارزمية" },
          { type: 'text', value: "لكل سطر `i`: هيئ `sum = 0`, `power = 1`. حلقة `j` من اليمين لليسار." },
          { type: 'code', value: "If M[i][j] == 1 Then sum = sum + power" }
        ]
      }
    },
    initialCode: `Algorithm BinToDec
Var
  Mat : Array [2][4] of Integer
  i, j, sum, p : Integer
Begin
  // Row 1: 1 0 1 1 (11)
  Mat[0][0]<-1; Mat[0][1]<-0; Mat[0][2]<-1; Mat[0][3]<-1
  // Row 2: 1 0 0 0 (8)
  Mat[1][0]<-1; Mat[1][1]<-0; Mat[1][2]<-0; Mat[1][3]<-0
  
  For i <- 0 to 1 step 1 Do
      sum <- 0
      p <- 1
      // Loop j from 3 down to 0
      For j <- 3 to 0 step -1 Do
         // Logic
         p <- p * 2
      EndFor
      Write("Row", i, "is:", sum)
  EndFor
End`,
    initialCodeC: `#include <stdio.h>

int main() {
    int Mat[2][4] = {{1,0,1,1}, {1,0,0,0}};
    int i, j, sum, p;
    
    for(i = 0; i < 2; i++) {
        sum = 0;
        p = 1;
        // Loop backwards
        for(j = 3; j >= 0; j--) {
            // Logic: if Mat[i][j] is 1, add p to sum
            // multiply p by 2
        }
        printf("Row %d is: %d\n", i, sum);
    }
    return 0;
}`,
    validate: (code, output, lang) => {
         if (lang === 'c') {
             if (!code.includes("sum += p") && !code.includes("sum = sum + p"))
                return { success: false, message: { en: "Add power to sum if bit is 1", ar: "أضف الأس للمجموع إذا كان البت 1" } };
             return { success: true };
         }
         if (output.some(o => o.includes("11")) && output.some(o => o.includes("8"))) return { success: true };
         return { success: false, message: { en: "Expected outputs 11 and 8", ar: "النتائج المتوقعة 11 و 8" } };
    }
  }
];
