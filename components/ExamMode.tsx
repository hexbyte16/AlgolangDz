import React, { useState, useEffect, useMemo, useRef } from 'react';
import { TRANSLATIONS } from '../constants';
import { EXAM_LESSONS } from '../constants_exam';
import { 
    ChevronRight, ChevronLeft, CheckCircle, Lock, Play, Circle, Check, X, 
    RotateCcw, ArrowRight, ArrowLeft, Menu, Terminal as TerminalIcon, 
    BookOpen, GripVertical, GripHorizontal, ToggleLeft, ToggleRight,
    Award
} from 'lucide-react';
import { CodeEditor } from './CodeEditor';
import { DocBlock, Lesson } from '../types';

interface ExamModeProps {
  completedExamLessons: string[];
  currentExamLessonId: string;
  onSelectLesson: (id: string) => void;
  onCompleteLesson: (id: string) => void;
  code: string;
  setCode: (code: string) => void;
  output: string[];
  onRun: () => void;
  onStop: () => void;
  onConsoleLog: (lines: string[]) => void; // New prop for manual terminal writing
  onClearConsole: () => void; // New prop to clear terminal
  isRunning: boolean;
  isDarkMode: boolean;
  lang: 'en' | 'ar';
  children: React.ReactNode;
}

export const ExamMode: React.FC<ExamModeProps> = ({
  completedExamLessons,
  currentExamLessonId,
  onSelectLesson,
  onCompleteLesson,
  code,
  setCode,
  output,
  onRun,
  onStop,
  onConsoleLog,
  onClearConsole,
  isRunning,
  isDarkMode,
  lang,
  children
}) => {
  const t = TRANSLATIONS[lang];
  const lesson = EXAM_LESSONS.find(l => l.id === currentExamLessonId) || EXAM_LESSONS[0];
  const lessonContent = lesson.content[lang];
  
  // Local state for Language Mode: 'algo' | 'c'
  const [examLang, setExamLang] = useState<'algo' | 'c'>('algo');
  
  const [feedback, setFeedback] = useState<{success: boolean, message?: string} | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  // --- Resizing State ---
  const containerRef = useRef<HTMLDivElement>(null);
  const rightPaneRef = useRef<HTMLDivElement>(null);
  const [instructionsWidth, setInstructionsWidth] = useState(30); 
  const [editorHeight, setEditorHeight] = useState(65); 
  const [isResizingX, setIsResizingX] = useState(false);
  const [isResizingY, setIsResizingY] = useState(false);

  // Switch content when language toggles or lesson changes
  useEffect(() => {
     // If user switches to C, load C code if available, else Algo code
     if (examLang === 'c' && lesson.initialCodeC) {
         setCode(lesson.initialCodeC);
         onClearConsole();
     } else {
         setCode(lesson.initialCode);
         onClearConsole();
     }
     setFeedback(null);
  }, [examLang, currentExamLessonId]);

  // Handle Resize Logic
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
        if (isResizingX && containerRef.current) {
            const containerRect = containerRef.current.getBoundingClientRect();
            let newWidthPercent = ((e.clientX - containerRect.left) / containerRect.width) * 100;
            if (lang === 'ar') newWidthPercent = 100 - newWidthPercent;
            newWidthPercent = Math.max(20, Math.min(newWidthPercent, 60));
            setInstructionsWidth(newWidthPercent);
        }
        if (isResizingY && rightPaneRef.current) {
            const paneRect = rightPaneRef.current.getBoundingClientRect();
            let newHeightPercent = ((e.clientY - paneRect.top) / paneRect.height) * 100;
            newHeightPercent = Math.max(20, Math.min(newHeightPercent, 80));
            setEditorHeight(newHeightPercent);
        }
    };
    const handleMouseUp = () => { setIsResizingX(false); setIsResizingY(false); };
    if (isResizingX || isResizingY) {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    }
    return () => { window.removeEventListener('mousemove', handleMouseMove); window.removeEventListener('mouseup', handleMouseUp); };
  }, [isResizingX, isResizingY, lang]);

  const progress = Math.round((completedExamLessons.length / EXAM_LESSONS.length) * 100);

  const groupedLessons = useMemo(() => {
      const groups: Record<string, Lesson[]> = {};
      EXAM_LESSONS.forEach(l => {
          const cat = l.content[lang].category;
          if (!groups[cat]) groups[cat] = [];
          groups[cat].push(l);
      });
      return groups;
  }, [lang]);

  const handleCheck = () => {
    // If in Algo mode, we need output. If in C mode, we strictly validate code text because we can't run C.
    if (examLang === 'algo' && output.length === 0 && !code.toLowerCase().includes("read")) {
         setFeedback({ success: false, message: lang === 'ar' ? "قم بتشغيل الكود أولاً!" : "Run your code first!" });
         return;
    }
    
    const result = lesson.validate(code, output, examLang);
    const msg = result.message ? (typeof result.message === 'object' ? result.message[lang] : result.message) : undefined;
    
    setFeedback({ success: result.success, message: msg });
    
    if (result.success) {
      if (!completedExamLessons.includes(lesson.id)) {
          onCompleteLesson(lesson.id);
      }
      setShowSuccessModal(true);
    }
  };
  
  const handleRunClick = () => {
      if (examLang === 'c') {
          // Simulate C Execution
          onClearConsole();
          onConsoleLog(['$ gcc main.c -o main', '$ ./main']);
          
          setFeedback({ success: false, message: lang === 'ar' ? "جاري التحقق من الصياغة..." : "Verifying syntax..." });
          
          setTimeout(() => {
             // Simulate output based on simple heuristics since we can't compile
             const hasMain = code.includes("main");
             const hasSemi = code.includes(";");
             
             if (hasMain && hasSemi) {
                 onConsoleLog([
                     lang === 'ar' ? '[نظام] التحقق من الصياغة ناجح.' : '[System] Syntax check passed.',
                     lang === 'ar' ? '[نظام] ملاحظة: تنفيذ كود C غير مدعوم في المتصفح. تم التحقق من البنية فقط.' : '[System] Note: C execution is not supported in-browser. Structure verified only.'
                 ]);
                 setFeedback({ success: true, message: lang === 'ar' ? "الصياغة سليمة. اضغط 'تحقق من الإجابة'." : "Syntax OK. Press 'Check Answer'." });
             } else {
                 onConsoleLog([
                     lang === 'ar' ? 'خطأ: دالة main أو فواصل منقوبة مفقودة.' : 'Error: Missing main function or semicolons.'
                 ]);
                 setFeedback({ success: false, message: lang === 'ar' ? "خطأ في الصياغة." : "Syntax Error." });
             }
          }, 600);
      } else {
          onRun();
      }
  };

  const nextLessonId = EXAM_LESSONS[EXAM_LESSONS.findIndex(l => l.id === lesson.id) + 1]?.id;
  const ChevronNext = lang === 'ar' ? ChevronLeft : ChevronRight;
  const ArrowNext = lang === 'ar' ? ArrowLeft : ArrowRight;

  return (
    <div className={`flex h-full w-full overflow-hidden ${isDarkMode ? 'bg-[#0a1f13]' : 'bg-slate-50'}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* Mobile Sidebar Toggle */}
      <button onClick={() => setSidebarOpen(true)} className={`lg:hidden absolute top-4 left-4 z-30 p-2 rounded-lg shadow-lg ${isDarkMode ? 'bg-slate-800 text-white' : 'bg-white text-slate-700'}`}>
          <Menu size={20} />
      </button>

      {/* Sidebar */}
      <div className={`fixed lg:relative z-40 h-full transition-all duration-300 ${isSidebarOpen ? 'translate-x-0 w-72 shadow-2xl' : (lang === 'ar' ? 'translate-x-full lg:translate-x-0' : '-translate-x-full lg:translate-x-0')} lg:w-72 flex flex-col border-e ${isDarkMode ? 'border-emerald-900/30 bg-[#0f281a]' : 'border-slate-200 bg-white'}`}>
        <div className="p-5 border-b border-inherit sticky top-0 backdrop-blur-md z-10 flex justify-between items-center bg-inherit">
            <div>
                <h2 className={`font-bold text-lg flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                    <Award size={20} className="text-amber-500" />
                    {lang === 'ar' ? 'تحضير للامتحان' : 'Exam Prep'}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                    <div className="h-1.5 w-24 bg-slate-200 rounded-full overflow-hidden dark:bg-slate-700"><div className="h-full bg-amber-500 transition-all duration-500" style={{ width: `${progress}%` }} /></div>
                    <span className="text-xs text-slate-500 font-mono">{progress}%</span>
                </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400"><X size={20} /></button>
        </div>

        <div className="p-4 space-y-6 overflow-y-auto">
            {Object.keys(groupedLessons).map((category) => (
                <div key={category}>
                    <h3 className={`text-xs font-bold uppercase tracking-wider mb-3 px-2 ${isDarkMode ? 'text-emerald-600' : 'text-slate-400'}`}>{category}</h3>
                    <div className="space-y-1">
                        {groupedLessons[category].map((l) => {
                             const isCompleted = completedExamLessons.includes(l.id);
                             const isActive = l.id === currentExamLessonId;
                             return (
                                <button key={l.id} onClick={() => onSelectLesson(l.id)} className={`w-full text-start px-3 py-2.5 rounded-lg text-sm transition-all flex items-center justify-between group ${isActive ? (isDarkMode ? 'bg-amber-600/20 text-amber-400 border border-amber-500/30' : 'bg-amber-50 text-amber-700 border border-amber-200') : (isDarkMode ? 'text-slate-300 hover:bg-white/5' : 'text-slate-600 hover:bg-slate-100')}`}>
                                    <div className="flex items-center gap-3">
                                        {isCompleted ? <CheckCircle size={14} className="text-emerald-500" /> : <Circle size={14} />}
                                        <span className="font-medium truncate">{l.content[lang].title}</span>
                                    </div>
                                    {isActive && <ChevronNext size={14} />}
                                </button>
                             );
                        })}
                    </div>
                </div>
            ))}
        </div>
      </div>
      
      {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)}></div>}

      <div ref={containerRef} className="flex-1 flex flex-col lg:flex-row h-full overflow-hidden relative">
         <div className={`flex flex-col border-e relative z-10 lg:h-full h-[40%] border-b lg:border-b-0 ${isDarkMode ? 'border-emerald-900/30 bg-[#0a1f13]' : 'border-slate-200 bg-slate-50'}`} style={{ width: window.innerWidth >= 1024 ? `${instructionsWidth}%` : '100%' }}>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8">
                <div className="mb-6 mt-6 lg:mt-0 flex justify-between items-start">
                    <div>
                        <span className={`text-xs font-bold px-2 py-1 rounded uppercase tracking-wider ${isDarkMode ? 'bg-emerald-900/40 text-emerald-400' : 'bg-emerald-100 text-emerald-700'}`}>{lessonContent.category}</span>
                        <h1 className={`text-2xl md:text-3xl font-extrabold mt-4 mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{lessonContent.title}</h1>
                    </div>
                    {/* Language Toggle */}
                    <div className={`flex items-center gap-2 p-1 rounded-lg border ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
                         <button onClick={() => setExamLang('algo')} className={`px-2 py-1 text-xs font-bold rounded ${examLang === 'algo' ? 'bg-emerald-500 text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>Algo</button>
                         <button onClick={() => setExamLang('c')} className={`px-2 py-1 text-xs font-bold rounded ${examLang === 'c' ? 'bg-blue-500 text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>C</button>
                    </div>
                </div>
                
                <div className="space-y-6">
                    {lessonContent.description.map((block, i) => (
                        <InstructionBlock key={i} block={block} isDarkMode={isDarkMode} />
                    ))}
                    {examLang === 'c' && (
                        <div className={`p-4 rounded-xl border text-sm flex gap-3 ${isDarkMode ? 'bg-blue-900/20 border-blue-500/20 text-blue-200' : 'bg-blue-50 border-blue-200 text-blue-800'}`}>
                             <span>ℹ️</span>
                             <div className="leading-6">
                                 {lang === 'ar' 
                                 ? "أنت في وضع لغة C. لا يمكن تنفيذ الكود في المتصفح، لكن يمكنك التحقق من صحة الكتابة." 
                                 : "You are in C Mode. Browser execution is not supported, but you can verify syntax."}
                             </div>
                        </div>
                    )}
                </div>
            </div>
            
            <div className={`p-4 border-t shrink-0 z-20 ${isDarkMode ? 'bg-[#0f281a] border-emerald-900/30' : 'bg-white border-slate-200'}`}>
                {feedback && (
                    <div className={`mb-3 p-3 rounded-lg text-sm font-medium flex items-center gap-3 shadow-sm ${feedback.success ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-100'}`}>
                        <div className={`p-1 rounded-full ${feedback.success ? 'bg-green-200 text-green-700' : 'bg-red-200 text-red-700'}`}>{feedback.success ? <Check size={14} /> : <X size={14} />}</div>
                        <span className="truncate">{feedback.message}</span>
                    </div>
                )}
                
                <div className="flex gap-3">
                     <button onClick={handleRunClick} disabled={isRunning} className={`flex-1 py-2 md:py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 text-sm md:text-base ${isRunning ? 'bg-slate-700 text-slate-400' : (examLang === 'c' ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-emerald-600 hover:bg-emerald-500 text-white')}`}>
                        <Play size={16} className={lang === 'ar' ? 'rotate-180' : ''} fill="currentColor" /> {examLang === 'c' ? (lang === 'ar' ? 'تحقق الصياغة' : 'Check Syntax') : t.run}
                     </button>
                     <button onClick={handleCheck} className={`flex-1 py-2 md:py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all border-2 active:scale-95 text-sm md:text-base ${isDarkMode ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
                        {feedback?.success ? <RotateCcw size={16} /> : <CheckCircle size={16} />} 
                        {feedback?.success ? t.tryAgain : t.checkAnswer}
                     </button>
                </div>
            </div>
         </div>

         <div className={`hidden lg:flex w-1 cursor-col-resize hover:bg-amber-500 transition-colors z-20 items-center justify-center group ${isDarkMode ? 'bg-[#0f281a]' : 'bg-slate-200'}`} onMouseDown={() => setIsResizingX(true)}><GripVertical size={12} className="opacity-0 group-hover:opacity-100" /></div>

         <div ref={rightPaneRef} className="flex-1 flex flex-col min-w-0 h-[60%] lg:h-full overflow-hidden" dir="ltr">
             <div className="relative min-h-0 flex-1 lg:flex-none" style={{ height: window.innerWidth >= 1024 ? `${editorHeight}%` : '50%' }}>
                <CodeEditor value={code} onChange={setCode} breakpoints={new Set()} onToggleBreakpoint={() => {}} activeLine={null} isDarkMode={isDarkMode} />
             </div>
             <div className={`hidden lg:flex h-1 cursor-row-resize hover:bg-amber-500 transition-colors z-20 items-center justify-center group ${isDarkMode ? 'bg-[#0f281a]' : 'bg-slate-200'}`} onMouseDown={() => setIsResizingY(true)}><GripHorizontal size={12} className="opacity-0 group-hover:opacity-100" /></div>
             <div className={`flex-1 flex flex-col min-h-0 relative z-20 ${isDarkMode ? 'border-emerald-900/30 bg-[#05110a]' : 'border-slate-200 bg-[#1e1e1e]'}`}>
                 <div className={`h-8 flex items-center px-4 gap-2 text-xs font-mono select-none ${isDarkMode ? 'bg-[#0f281a] text-slate-400' : 'bg-[#252526] text-slate-400'}`}><TerminalIcon size={12} /><span>TERMINAL</span></div>
                 <div className="flex-1 min-h-0">{children}</div>
             </div>
         </div>
      </div>

      {showSuccessModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in p-4" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            <div className={`p-8 rounded-3xl shadow-2xl max-w-sm w-full text-center border ${isDarkMode ? 'bg-[#0f281a] border-emerald-500/30' : 'bg-white border-white'}`}>
                <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-600 text-white rounded-full flex items-center justify-center mx-auto mb-6"><Check size={32} strokeWidth={4} /></div>
                <h2 className={`text-3xl font-extrabold mb-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{t.lessonComplete}</h2>
                <div className="flex flex-col gap-3 mt-8">
                    {nextLessonId ? (
                        <button onClick={() => onSelectLesson(nextLessonId)} className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-3">{t.nextLesson} <ArrowNext size={20} /></button>
                    ) : <div className="text-emerald-500 font-bold py-3 bg-emerald-500/10 rounded-2xl">Complete! 🎉</div>}
                    <button onClick={() => setShowSuccessModal(false)} className="py-2 text-sm hover:underline text-slate-500">{lang === 'ar' ? 'إغلاق' : 'Close'}</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

const InstructionBlock: React.FC<{ block: DocBlock, isDarkMode: boolean }> = ({ block, isDarkMode }) => {
     switch (block.type) {
        case 'text': return <p className={`leading-7 text-[15px] ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>{block.value}</p>;
        case 'heading': return <h3 className={`font-bold mt-6 mb-3 text-lg flex items-center gap-2 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-700'}`}><span className="w-1 h-5 bg-current rounded-full" />{block.value}</h3>;
        case 'code': return <div className={`p-4 rounded-xl font-mono text-sm my-3 border shadow-sm overflow-x-auto ${isDarkMode ? 'bg-[#05110a] border-emerald-900/30 text-blue-300' : 'bg-slate-100 text-blue-700 border-slate-200'}`} dir="ltr">{block.value}</div>;
        case 'note': return <div className={`p-4 rounded-xl border text-sm my-5 flex gap-3 ${isDarkMode ? 'bg-amber-900/20 border-amber-500/20 text-amber-200' : 'bg-amber-50 border-amber-200 text-amber-800'}`}><span className="text-xl">💡</span><div className="leading-6">{block.value}</div></div>;
        default: return null;
    }
};