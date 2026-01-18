import React, { useRef, useMemo, useState } from 'react';

// AlgoLang Keywords for Autocomplete
const KEYWORDS = [
  'Algorithm', 'Begin', 'End', 'Var', 'Const', 
  'Integer', 'Real', 'Boolean', 'String', 'Char', 
  'Array', 'Of', 'Function', 'Procedure', 'Return', 
  'If', 'Then', 'Else', 'EndIf', 
  'For', 'To', 'Step', 'Do', 'EndFor', 
  'While', 'EndWhile', 
  'Read', 'Write', 
  'Mod', 'Div', 'And', 'Or', 'Not', 'True', 'False',
  // C Keywords (Basic)
  'int', 'float', 'char', 'void', 'return', 'include', 'stdio', 'printf', 'scanf', 'for', 'while', 'if', 'else', 'main'
];

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
  const preRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);

  // Auto-completion State
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [suggestionIndex, setSuggestionIndex] = useState(0);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [cursorPos, setCursorPos] = useState({ top: 0, left: 0 });

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (preRef.current) {
      preRef.current.scrollTop = e.currentTarget.scrollTop;
      preRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }
    if (gutterRef.current) {
        gutterRef.current.scrollTop = e.currentTarget.scrollTop;
    }
    setShowSuggestions(false); // Hide on scroll
  };

  const measureTextWidth = (text: string) => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (context) {
          context.font = '14px "Fira Code", monospace';
          return context.measureText(text).width;
      }
      return text.length * 8.4; // Fallback
  };

  const updateSuggestions = (text: string, cursorIndex: number) => {
      const textBeforeCursor = text.slice(0, cursorIndex);
      const lines = textBeforeCursor.split('\n');
      const currentLineIndex = lines.length - 1;
      const currentLineText = lines[currentLineIndex];
      
      // Find the word being typed
      const match = currentLineText.match(/([a-zA-Z0-9_]+)$/);
      
      if (match) {
          const word = match[1];
          const filtered = KEYWORDS.filter(k => 
              k.toLowerCase().startsWith(word.toLowerCase()) && 
              k.toLowerCase() !== word.toLowerCase()
          );

          if (filtered.length > 0) {
              setSuggestions(filtered);
              setSuggestionIndex(0);
              
              // Calculate Position
              const textWidth = measureTextWidth(currentLineText.slice(0, match.index));
              const top = (currentLineIndex + 1) * 24 + 6; // Line height 24px + offset
              const left = textWidth + 16 + 2; // Padding 16px
              
              setCursorPos({ top, left });
              setShowSuggestions(true);
              return;
          }
      }
      setShowSuggestions(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newVal = e.target.value;
      onChange(newVal);
      updateSuggestions(newVal, e.target.selectionStart);
  };

  const acceptSuggestion = (suggestion: string) => {
      if (!textareaRef.current) return;
      
      const cursor = textareaRef.current.selectionStart;
      const textBefore = value.slice(0, cursor);
      const lines = textBefore.split('\n');
      const currentLine = lines[lines.length - 1];
      const match = currentLine.match(/([a-zA-Z0-9_]+)$/);
      
      if (match) {
          const wordStart = cursor - match[1].length;
          const newValue = value.slice(0, wordStart) + suggestion + value.slice(cursor);
          onChange(newValue);
          setShowSuggestions(false);
          
          // Restore cursor
          setTimeout(() => {
              if (textareaRef.current) {
                  const newCursor = wordStart + suggestion.length;
                  textareaRef.current.selectionStart = textareaRef.current.selectionEnd = newCursor;
                  textareaRef.current.focus();
              }
          }, 0);
      }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showSuggestions) {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSuggestionIndex(prev => prev > 0 ? prev - 1 : suggestions.length - 1);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSuggestionIndex(prev => prev < suggestions.length - 1 ? prev + 1 : 0);
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        acceptSuggestion(suggestions[suggestionIndex]);
      } else if (e.key === 'Escape') {
        setShowSuggestions(false);
      }
      return;
    }

    if (e.key === 'Tab') {
      e.preventDefault();
      const start = textareaRef.current!.selectionStart;
      const end = textareaRef.current!.selectionEnd;
      const newValue = value.substring(0, start) + "  " + value.substring(end);
      onChange(newValue);
      setTimeout(() => {
          if(textareaRef.current) {
              textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
          }
      }, 0);
    }
  };

  // Process Lines for Rendering
  const renderedLines = useMemo(() => {
      return value.split('\n').map((line, i) => {
         // Mixed Regex for Algo and C syntax highlighting
         const tokens = line.split(/((?:\/\/.*)|(?:\/\*[\s\S]*?\*\/)|(?:#include.*)|(?:\{[\s\S]*?\})|(?:"(?:[^"\\]|\\.)*")|(?:'(?:[^'\\]|\\.)*')|\b(?:Algorithm|Begin|End|Var|Const|If|Then|Else|EndIf|For|To|Step|Do|EndFor|While|EndWhile|Read|Write|Function|Procedure|Return)\b|\b(?:int|float|char|void|double|long|return|printf|scanf|if|else|while|for)\b|\b(?:Integer|Real|Boolean|String|Character|Array|Of|Mod|Div|And|Or|Not|True|False)\b|\b\d+(?:\.\d+)?\b|[+\-*/←:\[\](),=<>{}%;&]|:=|<-)/gi);
         
         const renderedTokens = tokens.map((part, idx) => {
            if (!part) return null;
            let colorClass = isDarkMode ? "text-slate-200" : "text-slate-800"; 
            
            // Comments (Algo // and C // or #include)
            if (/^(\/\/|\{)|#include/.test(part)) colorClass = isDarkMode ? "text-emerald-600/70 italic" : "text-slate-400 italic"; 
            
            // Strings
            else if (/^["']/.test(part)) colorClass = isDarkMode ? "text-green-400" : "text-green-600"; 
            
            // Algo Keywords
            else if (/^(Algorithm|Begin|End|Var|Const|If|Then|Else|EndIf|For|To|Step|Do|EndFor|While|EndWhile|Read|Write|Function|Procedure|Return)$/i.test(part)) colorClass = isDarkMode ? "text-purple-400 font-bold" : "text-purple-700 font-bold";
            
            // C Keywords
            else if (/^(int|float|char|void|double|long|return|printf|scanf|if|else|while|for)$/.test(part)) colorClass = isDarkMode ? "text-blue-400 font-bold" : "text-blue-700 font-bold";

            // Types & Bools
            else if (/^(Integer|Real|Boolean|String|Character|Array|Of|Mod|Div|And|Or|Not|True|False)$/i.test(part)) colorClass = isDarkMode ? "text-amber-400" : "text-amber-600 font-semibold";
            
            // Numbers
            else if (/^\d/.test(part)) colorClass = isDarkMode ? "text-blue-300" : "text-blue-600";
            
            // Operators & Punctuation
            else if (/^[+\-*/←:\[\](),=<>{}%;&]|:=|<-/.test(part)) colorClass = isDarkMode ? "text-pink-400" : "text-red-500";
            
            return <span key={idx} className={colorClass}>{part}</span>;
         });

         const isActive = activeLine === i + 1;

         return (
             <div key={i} className={`px-4 h-6 w-full whitespace-pre ${isActive ? (isDarkMode ? 'bg-emerald-900/40' : 'bg-yellow-200/50') : ''}`}>
                 {renderedTokens.length > 0 ? renderedTokens : <br/>}
             </div>
         );
      });
  }, [value, activeLine, isDarkMode]);

  return (
    <div className={`relative flex w-full h-full overflow-hidden ${isDarkMode ? 'bg-[#0a1f13]' : 'bg-white'} ${className}`}>
        {/* Gutter */}
        <div 
            ref={gutterRef}
            className={`w-12 text-right font-mono text-sm leading-6 border-r select-none pt-4 pb-4 overflow-hidden shrink-0 ${isDarkMode ? 'bg-[#0f281a] border-emerald-900/30 text-emerald-800' : 'bg-slate-50 border-slate-200 text-slate-400'}`}
        >
            {renderedLines.map((_, i) => {
                const lineNum = i + 1;
                const hasBreakpoint = breakpoints.has(lineNum);
                const isActive = activeLine === lineNum;
                return (
                    <div 
                        key={lineNum} 
                        className={`px-2 cursor-pointer h-6 relative ${isDarkMode ? 'hover:bg-emerald-900/20' : 'hover:bg-slate-200'} ${isActive ? (isDarkMode ? 'text-emerald-400 font-bold' : 'text-blue-700 font-bold') : ''}`}
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

        {/* Editor Area */}
        <div className="relative flex-1 h-full overflow-hidden">
             {/* Rendered Code Layer (Background) */}
            <div
                ref={preRef}
                className="absolute inset-0 w-full h-full m-0 pt-4 pb-4 font-mono text-sm leading-6 whitespace-pre pointer-events-none overflow-hidden"
            >
                {renderedLines}
            </div>

            {/* Editable Textarea Layer (Foreground) */}
            <textarea
                ref={textareaRef}
                value={value}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                onScroll={handleScroll}
                spellCheck={false}
                autoCapitalize="none"
                autoComplete="off"
                className={`absolute inset-0 w-full h-full m-0 px-4 pt-4 pb-4 font-mono text-sm leading-6 whitespace-pre bg-transparent text-transparent caret-current resize-none outline-none overflow-auto z-10 ${isDarkMode ? 'caret-white' : 'caret-slate-900'}`}
                style={{ color: 'transparent' }} 
            />

            {/* Suggestions Popup */}
            {showSuggestions && (
                <div 
                    className={`absolute z-50 rounded-lg shadow-xl border overflow-hidden flex flex-col min-w-[150px] animate-in fade-in zoom-in-95 duration-100 ${isDarkMode ? 'bg-slate-800 border-emerald-500/30' : 'bg-white border-slate-200'}`}
                    style={{ 
                        top: cursorPos.top - (preRef.current?.scrollTop || 0), 
                        left: cursorPos.left - (preRef.current?.scrollLeft || 0) 
                    }}
                >
                    {suggestions.map((s, i) => (
                        <div 
                            key={s}
                            className={`px-3 py-1.5 cursor-pointer text-sm font-mono flex items-center gap-2 ${
                                i === suggestionIndex 
                                    ? (isDarkMode ? 'bg-emerald-600 text-white' : 'bg-blue-100 text-blue-800') 
                                    : (isDarkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-700 hover:bg-slate-50')
                            }`}
                            onMouseDown={(e) => { e.preventDefault(); acceptSuggestion(s); }}
                        >
                            <span className="opacity-50 text-xs">kw</span>
                            {s}
                        </div>
                    ))}
                </div>
            )}
        </div>
    </div>
  );
};