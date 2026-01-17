import React, { useState, useEffect, useMemo, useRef } from 'react';
import { LESSONS, TRANSLATIONS } from '../constants';
import { 
    ChevronRight, ChevronLeft, CheckCircle, Lock, Play, Circle, Check, X, 
    RotateCcw, ArrowRight, ArrowLeft, Menu, Terminal as TerminalIcon, 
    BookOpen, GripVertical, GripHorizontal 
} from 'lucide-react';
import { CodeEditor } from './CodeEditor';
import { DocBlock, Lesson } from '../types';

interface LearningModeProps {
  completedLessons: string[];
  currentLessonId: string;
  onSelectLesson: (id: string) => void;
  onCompleteLesson: (id: string) => void;
  code: string;
  setCode: (code: string) => void;
  output: string[];
  onRun: () => void;
  onStop: () => void;
  isRunning: boolean;
  isDarkMode: boolean;
  lang: 'en' | 'ar';
  children: React.ReactNode; // For the console/terminal passed from App
}

export const LearningMode: React.FC<LearningModeProps> = ({
  completedLessons,
  currentLessonId,
  onSelectLesson,
  onCompleteLesson,
  code,
  setCode,
  output,
  onRun,
  onStop,
  isRunning,
  isDarkMode,
  lang,
  children
}) => {
  const t = TRANSLATIONS[lang];
  const lesson = LESSONS.find(l => l.id === currentLessonId) || LESSONS[0];
  const lessonContent = lesson.content[lang];
  
  const [feedback, setFeedback] = useState<{success: boolean, message?: string} | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(false); // Closed by default on mobile (controlled via media query usually, but logic below handles overlay)

  // --- Resizing State ---
  const containerRef = useRef<HTMLDivElement>(null);
  const rightPaneRef = useRef<HTMLDivElement>(null);
  
  // Width of instructions pane in %
  const [instructionsWidth, setInstructionsWidth] = useState(30); 
  // Height of editor pane in %
  const [editorHeight, setEditorHeight] = useState(65); 
  
  const [isResizingX, setIsResizingX] = useState(false);
  const [isResizingY, setIsResizingY] = useState(false);

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

    const handleMouseUp = () => {
        setIsResizingX(false);
        setIsResizingY(false);
        document.body.style.cursor = 'default';
        document.body.style.userSelect = 'auto';
    };

    if (isResizingX || isResizingY) {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        document.body.style.userSelect = 'none';
    }

    return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizingX, isResizingY, lang]);

  // Calculate Progress
  const progress = Math.round((completedLessons.length / LESSONS.length) * 100);

  // Group Lessons by Category
  const groupedLessons = useMemo(() => {
      const groups: Record<string, Lesson[]> = {};
      LESSONS.forEach(l => {
          const cat = l.content[lang].category;
          if (!groups[cat]) groups[cat] = [];
          groups[cat].push(l);
      });
      return groups;
  }, [lang]);

  // When lesson changes, reset feedback and close mobile sidebar
  useEffect(() => {
    setFeedback(null);
    setShowSuccessModal(false);
    setSidebarOpen(false);
  }, [currentLessonId]);

  const handleCheck = () => {
    if (output.length === 0 && !code.toLowerCase().includes("read")) {
         setFeedback({ success: false, message: lang === 'ar' ? "قم بتشغيل الكود أولاً!" : "Run your code first!" });
         return;
    }
    const result = lesson.validate(code, output);
    const msg = result.message ? (typeof result.message === 'object' ? result.message[lang] : result.message) : undefined;
    setFeedback({ success: result.success, message: msg });
    if (result.success) {
      if (!completedLessons.includes(lesson.id)) {
          onCompleteLesson(lesson.id);
      }
      setShowSuccessModal(true);
    }
  };

  const nextLessonId = LESSONS[LESSONS.findIndex(l => l.id === lesson.id) + 1]?.id;
  const ChevronNext = lang === 'ar' ? ChevronLeft : ChevronRight;
  const ArrowNext = lang === 'ar' ? ArrowLeft : ArrowRight;

  return (
    <div className={`flex h-full w-full overflow-hidden ${isDarkMode ? 'bg-[#0a1f13]' : 'bg-slate-50'}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* Sidebar Toggle (Mobile) */}
      <button 
          onClick={() => setSidebarOpen(true)}
          className={`lg:hidden absolute top-4 left-4 z-30 p-2 rounded-lg shadow-lg ${isDarkMode ? 'bg-slate-800 text-white' : 'bg-white text-slate-700'}`}
      >
          <Menu size={20} />
      </button>

      {/* Sidebar: Curriculum */}
      <div 
        className={`
            fixed lg:relative z-40 h-full
            transition-all duration-300 ease-in-out
            ${isSidebarOpen ? 'translate-x-0 w-72 shadow-2xl' : (lang === 'ar' ? 'translate-x-full lg:translate-x-0' : '-translate-x-full lg:translate-x-0')}
            lg:w-72 lg:block lg:shadow-none
            flex flex-col border-e overflow-y-auto
            ${isDarkMode ? 'border-emerald-900/30 bg-[#0f281a]' : 'border-slate-200 bg-white'}
        `}
      >
        <div className="p-5 border-b border-inherit sticky top-0 backdrop-blur-md z-10 flex justify-between items-center bg-inherit">
            <div>
                <h2 className={`font-bold text-lg flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                    <BookOpen size={20} className="text-emerald-500" />
                    {t.learn}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                    <div className="h-1.5 w-24 bg-slate-200 rounded-full overflow-hidden dark:bg-slate-700">
                        <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${progress}%` }} />
                    </div>
                    <span className="text-xs text-slate-500 font-mono">{progress}%</span>
                </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={20} />
            </button>
        </div>

        <div className="p-4 space-y-6">
            {Object.keys(groupedLessons).map((category) => {
                const catLessons = groupedLessons[category];
                return (
                    <div key={category}>
                        <h3 className={`text-xs font-bold uppercase tracking-wider mb-3 px-2 ${isDarkMode ? 'text-emerald-600' : 'text-slate-400'}`}>
                            {category}
                        </h3>
                        <div className="space-y-1">
                            {catLessons.map((l, idx) => {
                                const globalIdx = LESSONS.findIndex(item => item.id === l.id);
                                const isCompleted = completedLessons.includes(l.id);
                                const isLocked = globalIdx > 0 && !completedLessons.includes(LESSONS[globalIdx - 1].id);
                                const isActive = l.id === currentLessonId;
                                const lContent = l.content[lang];

                                return (
                                    <button
                                        key={l.id}
                                        disabled={isLocked}
                                        onClick={() => onSelectLesson(l.id)}
                                        className={`w-full text-start px-3 py-2.5 rounded-lg text-sm transition-all flex items-center justify-between group
                                            ${isActive 
                                                ? (isDarkMode ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30' : 'bg-emerald-50 text-emerald-700 border border-emerald-200')
                                                : (isLocked 
                                                    ? (isDarkMode ? 'opacity-40 text-slate-600' : 'opacity-40 text-slate-400') 
                                                    : (isDarkMode ? 'text-slate-300 hover:bg-white/5' : 'text-slate-600 hover:bg-slate-100'))
                                            }
                                        `}
                                    >
                                        <div className="flex items-center gap-3">
                                            {isLocked ? <Lock size={14} /> : (isCompleted ? <CheckCircle size={14} className="text-emerald-500" /> : <Circle size={14} />)}
                                            <span className="font-medium truncate">{lContent.title}</span>
                                        </div>
                                        {isActive && <ChevronNext size={14} />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
      </div>
      
      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
          <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)}></div>
      )}

      {/* Main Content (Split View) */}
      <div 
        ref={containerRef}
        className="flex-1 flex flex-col lg:flex-row h-full overflow-hidden relative"
      >
         
         {/* LEFT PANE: Instructions */}
         <div 
            className={`
                flex flex-col border-e overflow-y-auto custom-scrollbar relative z-10 
                lg:h-full
                h-[40%] border-b lg:border-b-0 
                ${isDarkMode ? 'border-emerald-900/30 bg-[#0a1f13]' : 'border-slate-200 bg-slate-50'}
            `}
            style={{ width: window.innerWidth >= 1024 ? `${instructionsWidth}%` : '100%' }}
         >
            <div className="p-8 pb-32">
                <div className="mb-6 mt-6 lg:mt-0">
                    <span className={`text-xs font-bold px-2 py-1 rounded uppercase tracking-wider ${isDarkMode ? 'bg-emerald-900/40 text-emerald-400' : 'bg-emerald-100 text-emerald-700'}`}>
                        {lessonContent.category}
                    </span>
                    <h1 className={`text-2xl md:text-3xl font-extrabold mt-4 mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{lessonContent.title}</h1>
                    <div className={`h-1 w-16 rounded-full ${isDarkMode ? 'bg-emerald-600' : 'bg-emerald-500'}`} />
                </div>
                
                <div className="space-y-6">
                    {lessonContent.description.map((block, i) => (
                        <InstructionBlock key={i} block={block} isDarkMode={isDarkMode} />
                    ))}
                </div>
            </div>
            
            {/* Sticky Action Bar */}
            <div className={`absolute bottom-0 left-0 right-0 p-4 border-t backdrop-blur-xl transition-all ${isDarkMode ? 'bg-[#0f281a]/90 border-emerald-900/30' : 'bg-white/90 border-slate-200'}`}>
                {feedback && (
                    <div className={`mb-3 p-3 rounded-lg text-sm font-medium flex items-center gap-3 shadow-sm animate-in slide-in-from-bottom-2 ${feedback.success ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-100'}`}>
                        <div className={`p-1 rounded-full ${feedback.success ? 'bg-green-200 text-green-700' : 'bg-red-200 text-red-700'}`}>
                            {feedback.success ? <Check size={14} strokeWidth={3} /> : <X size={14} strokeWidth={3} />}
                        </div>
                        <span className="truncate">{feedback.message || (feedback.success ? t.lessonComplete : t.lessonFailed)}</span>
                    </div>
                )}
                
                <div className="flex gap-3">
                     <button
                        onClick={onRun}
                        disabled={isRunning}
                        className={`flex-1 py-2 md:py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all transform active:scale-95 text-sm md:text-base
                            ${isRunning 
                                ? 'bg-slate-700 text-slate-400 cursor-wait'
                                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30'}
                        `}
                     >
                        <Play size={16} className={lang === 'ar' ? 'rotate-180' : ''} fill="currentColor" /> {t.run}
                     </button>
                     <button
                        onClick={handleCheck}
                        className={`flex-1 py-2 md:py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all border-2 transform active:scale-95 text-sm md:text-base
                             ${isDarkMode 
                                ? 'border-slate-700 text-slate-300 hover:bg-slate-800 hover:border-slate-600' 
                                : 'border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-sm'}
                             ${feedback?.success ? 'bg-green-50 !border-green-200 !text-green-700' : ''}
                        `}
                     >
                        {feedback?.success ? <RotateCcw size={16} /> : <CheckCircle size={16} />} 
                        {feedback?.success ? t.tryAgain : t.checkAnswer}
                     </button>
                </div>
            </div>
         </div>

         {/* RESIZER X (Instructions vs Right Pane) - Hidden on mobile */}
         <div 
             className={`hidden lg:flex w-1 cursor-col-resize hover:bg-emerald-500 transition-colors z-20 items-center justify-center group ${isDarkMode ? 'bg-[#0f281a] hover:bg-emerald-600' : 'bg-slate-200 hover:bg-emerald-400'}`}
             onMouseDown={() => setIsResizingX(true)}
         >
             <GripVertical size={12} className={`opacity-0 group-hover:opacity-100 ${isDarkMode ? 'text-white' : 'text-white'}`} />
         </div>

         {/* RIGHT PANE: Split View (Editor / Terminal) */}
         <div 
            ref={rightPaneRef}
            className="flex-1 flex flex-col min-w-0 h-[60%] lg:h-full overflow-hidden" 
            dir="ltr"
         >
             
             {/* TOP: Editor Area */}
             <div 
                className="relative min-h-0 flex-1 lg:flex-none"
                style={{ height: window.innerWidth >= 1024 ? `${editorHeight}%` : '50%' }}
             >
                <CodeEditor
                    value={code}
                    onChange={setCode}
                    breakpoints={new Set()}
                    onToggleBreakpoint={() => {}}
                    activeLine={null}
                    isDarkMode={isDarkMode}
                />
             </div>

             {/* RESIZER Y (Editor vs Terminal) - Hidden on mobile */}
             <div 
                 className={`hidden lg:flex h-1 cursor-row-resize hover:bg-emerald-500 transition-colors z-20 items-center justify-center group ${isDarkMode ? 'bg-[#0f281a] hover:bg-emerald-600' : 'bg-slate-200 hover:bg-emerald-400'}`}
                 onMouseDown={() => setIsResizingY(true)}
             >
                 <GripHorizontal size={12} className={`opacity-0 group-hover:opacity-100 ${isDarkMode ? 'text-white' : 'text-white'}`} />
             </div>

             {/* BOTTOM: Terminal Area */}
             <div className={`flex-1 flex flex-col min-h-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] relative z-20 ${isDarkMode ? 'border-emerald-900/30 bg-[#05110a]' : 'border-slate-200 bg-[#1e1e1e]'}`}>
                 {/* Fake Terminal Header */}
                 <div className={`h-8 flex items-center px-4 gap-2 text-xs font-mono select-none ${isDarkMode ? 'bg-[#0f281a] text-slate-400' : 'bg-[#252526] text-slate-400'}`}>
                    <TerminalIcon size={12} />
                    <span>TERMINAL</span>
                 </div>
                 <div className="flex-1 min-h-0">
                     {children}
                 </div>
             </div>
         </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300 p-4" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            <div className={`p-6 md:p-8 rounded-3xl shadow-2xl max-w-sm w-full text-center transform transition-all scale-100 border ${isDarkMode ? 'bg-[#0f281a] border-emerald-500/30' : 'bg-white border-white'}`}>
                <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-green-400 to-emerald-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-500/30">
                    <Check size={32} strokeWidth={4} />
                </div>
                <h2 className={`text-2xl md:text-3xl font-extrabold mb-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{t.lessonComplete}</h2>
                <p className={`mb-8 text-base md:text-lg font-light leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    {lang === 'ar' ? 'عمل رائع! لقد أتقنت هذا المفهوم.' : 'Great job! You\'ve mastered this concept.'}
                </p>
                
                <div className="flex flex-col gap-3">
                    {nextLessonId ? (
                        <button 
                            onClick={() => onSelectLesson(nextLessonId)}
                            className="w-full py-3 md:py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold text-lg shadow-lg shadow-emerald-600/30 transition-all hover:scale-[1.02] flex items-center justify-center gap-3"
                        >
                            {t.nextLesson} <ArrowNext size={20} />
                        </button>
                    ) : (
                        <div className="text-emerald-500 font-bold py-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                            {lang === 'ar' ? 'أنهيت جميع الدروس! 🎉' : 'All lessons completed! 🎉'}
                        </div>
                    )}
                    <button 
                        onClick={() => setShowSuccessModal(false)}
                        className={`py-2 text-sm hover:underline ${isDarkMode ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        {lang === 'ar' ? 'البقاء هنا' : 'Stay here'}
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

const InstructionBlock: React.FC<{ block: DocBlock, isDarkMode: boolean }> = ({ block, isDarkMode }) => {
     switch (block.type) {
        case 'text':
            return <p className={`leading-7 text-[15px] ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>{block.value}</p>;
        case 'heading':
            return <h3 className={`font-bold mt-6 mb-3 text-lg flex items-center gap-2 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>
                <span className="w-1 h-5 bg-current rounded-full" />
                {block.value}
            </h3>;
        case 'code':
            return (
                <div className={`p-4 rounded-xl font-mono text-sm my-3 border shadow-sm overflow-x-auto ${isDarkMode ? 'bg-[#05110a] border-emerald-900/30 text-blue-300' : 'bg-slate-100 text-blue-700 border-slate-200'}`} dir="ltr">
                    {block.value}
                </div>
            );
        case 'note':
            return (
                <div className={`p-4 rounded-xl border text-sm my-5 flex gap-3 ${isDarkMode ? 'bg-emerald-900/10 border-emerald-500/20 text-emerald-200' : 'bg-blue-50 border-blue-100 text-blue-800'}`}>
                    <span className="text-xl">💡</span>
                    <div className="leading-6">{block.value}</div>
                </div>
            );
        default: return null;
    }
};