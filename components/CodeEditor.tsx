import React, { useRef, useMemo } from 'react';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  breakpoints: Set<number>;
  onToggleBreakpoint: (line: number) => void;
  activeLine: number | null;
  className?: string;
  isDarkMode: boolean;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({ 
    value, 
    onChange, 
    breakpoints, 
    onToggleBreakpoint,
    activeLine,
    className = '',
    isDarkMode
}) => {
  const preRef = useRef<HTMLPreElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (preRef.current) {
      preRef.current.scrollTop = e.currentTarget.scrollTop;
      preRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }
    if (gutterRef.current) {
        gutterRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };

  const lineCount = useMemo(() => value.split('\n').length, [value]);

  const highlightedCode = useMemo(() => {
    // Tokenizer matching comments, strings, keywords, types, numbers, operators
    const tokens = /((?:\/\/.*)|(?:\{[\s\S]*?\})|(?:"(?:[^"\\]|\\.)*")|(?:'(?:[^'\\]|\\.)*')|\b(?:Algorithm|Begin|End|Var|Const|If|Then|Else|EndIf|For|To|Step|Do|EndFor|While|EndWhile|Read|Write)\b|\b(?:Integer|Real|Boolean|String|Character|Array|Of|Mod|Div|And|Or|Not|True|False)\b|\b\d+(?:\.\d+)?\b|[+\-*/←:\[\](),=<>])/gi;
    
    return value.split(tokens).map((part, i) => {
      if (!part) return null;
      
      let colorClass = isDarkMode ? "text-slate-200" : "text-slate-800"; 
      
      if (/^(\/\/|\{)/.test(part)) colorClass = isDarkMode ? "text-emerald-600/70 italic" : "text-slate-400 italic"; 
      else if (/^["']/.test(part)) colorClass = isDarkMode ? "text-green-400" : "text-green-600"; 
      else if (/^(Algorithm|Begin|End|Var|Const|If|Then|Else|EndIf|For|To|Step|Do|EndFor|While|EndWhile|Read|Write)$/i.test(part)) colorClass = isDarkMode ? "text-purple-400 font-bold" : "text-purple-700 font-bold";
      else if (/^(Integer|Real|Boolean|String|Character|Array|Of|Mod|Div|And|Or|Not|True|False)$/i.test(part)) colorClass = isDarkMode ? "text-amber-400" : "text-amber-600 font-semibold";
      else if (/^\d/.test(part)) colorClass = isDarkMode ? "text-blue-300" : "text-blue-600";
      else if (/^[+\-*/←:\[\](),=<>]/.test(part)) colorClass = isDarkMode ? "text-pink-400" : "text-red-500";
      
      return <span key={i} className={colorClass}>{part}</span>;
    });
  }, [value, isDarkMode]);

  return (
    <div className={`relative flex w-full h-full overflow-hidden ${isDarkMode ? 'bg-[#0a1f13]' : 'bg-white'} ${className}`}>
        {/* Gutter (Line Numbers) */}
        <div 
            ref={gutterRef}
            className={`w-12 text-right font-mono text-sm leading-6 border-r select-none pt-4 pb-4 overflow-hidden ${isDarkMode ? 'bg-[#0f281a] border-emerald-900/30 text-emerald-800' : 'bg-slate-50 border-slate-200 text-slate-400'}`}
        >
            {Array.from({ length: lineCount }).map((_, i) => {
                const lineNum = i + 1;
                const hasBreakpoint = breakpoints.has(lineNum);
                const isActive = activeLine === lineNum;
                
                return (
                    <div 
                        key={lineNum} 
                        className={`px-2 cursor-pointer relative ${isDarkMode ? 'hover:bg-emerald-900/20' : 'hover:bg-slate-200'} ${isActive ? (isDarkMode ? 'bg-emerald-900/50 text-emerald-400 font-bold' : 'bg-blue-100 text-blue-700 font-bold') : ''}`}
                        onClick={() => onToggleBreakpoint(lineNum)}
                    >
                        {lineNum}
                        {hasBreakpoint && (
                            <div className="absolute left-1 top-2 w-2 h-2 bg-red-500 rounded-full shadow-lg shadow-red-500/50" />
                        )}
                        {isActive && !hasBreakpoint && (
                            <div className="absolute left-1 top-2 w-0 h-0 border-t-[4px] border-t-transparent border-l-[6px] border-l-emerald-400 border-b-[4px] border-b-transparent" />
                        )}
                    </div>
                );
            })}
        </div>

        {/* Code Area Container */}
        <div className="relative flex-1 h-full overflow-hidden">
             {/* Background Layer: Highlighted Code */}
            <pre
                ref={preRef}
                aria-hidden="true"
                className="absolute inset-0 w-full h-full m-0 p-4 font-mono text-sm leading-6 whitespace-pre pointer-events-none overflow-hidden"
            >
                {highlightedCode}
                <br />
            </pre>

            {/* Foreground Layer: Editable Textarea */}
            <textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onScroll={handleScroll}
                spellCheck={false}
                className={`absolute inset-0 w-full h-full m-0 p-4 font-mono text-sm leading-6 whitespace-pre bg-transparent text-transparent caret-current resize-none outline-none overflow-auto z-10 ${isDarkMode ? 'caret-white' : 'caret-slate-900'}`}
                style={{ color: 'transparent' }} 
            />
        </div>
    </div>
  );
};