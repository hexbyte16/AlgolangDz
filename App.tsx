import React, { useState, useRef, useEffect } from 'react';
import { Play, Trash2, AlertTriangle, Terminal, Pause, StepForward, Bug, Sun, Moon, Home, FolderOpen, Book, RotateCcw } from 'lucide-react';
import { Lexer } from './services/algo/lexer';
import { Parser } from './services/algo/parser';
import { Interpreter } from './services/algo/interpreter';
import { INITIAL_FILES } from './constants';
import { CodeEditor } from './components/CodeEditor';
import { InterpreterEvent, RuntimeValue, ViewState, FileNode } from './types';
import { Landing } from './components/Landing';
import { Docs } from './components/Docs';
import { FileExplorer } from './components/FileExplorer';

const App: React.FC = () => {
  // --- GLOBAL STATE ---
  const [view, setView] = useState<ViewState>('home');
  const [isDarkMode, setIsDarkMode] = useState(false); // Default to Light Mode
  
  // --- FILE SYSTEM STATE ---
  const [files, setFiles] = useState<FileNode[]>(INITIAL_FILES);
  const [activeFileId, setActiveFileId] = useState<string>('main');
  const [code, setCode] = useState<string>(INITIAL_FILES.find(f => f.id === 'main')?.content || '');

  // --- EXECUTION STATE ---
  const [output, setOutput] = useState<string[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  // Debugging State
  const [breakpoints, setBreakpoints] = useState<Set<number>>(new Set());
  const [activeLine, setActiveLine] = useState<number | null>(null);
  const [variables, setVariables] = useState<Map<string, RuntimeValue>>(new Map());
  
  // Async Input Handling
  const [isWaitingForInput, setIsWaitingForInput] = useState(false);
  const [currentInputVar, setCurrentInputVar] = useState('');
  const [expectedType, setExpectedType] = useState('Real'); 
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const consoleBottomRef = useRef<HTMLDivElement>(null);
  const generatorRef = useRef<Generator<InterpreterEvent, void, any> | null>(null);

  // --- EFFECTS ---

  // Sync Code changes to File System
  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    setFiles(prev => prev.map(f => f.id === activeFileId ? { ...f, content: newCode } : f));
  };

  // Switch Active File
  const handleFileSelect = (id: string) => {
    const file = files.find(f => f.id === id);
    if (file && file.type === 'file') {
        setActiveFileId(id);
        setCode(file.content || '');
        // Stop execution when switching files
        stopExecution();
    }
  };

  // Auto-focus & Scroll console
  useEffect(() => {
    if (isWaitingForInput && inputRef.current) inputRef.current.focus();
    if (consoleBottomRef.current) consoleBottomRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [isWaitingForInput, output]);

  // --- FILE SYSTEM ACTIONS ---

  const createFile = (name: string, parentId: string) => {
    const newFile: FileNode = {
        id: Date.now().toString(),
        name,
        type: 'file',
        parentId,
        content: `Algorithm ${name.replace('.algo', '')}\nBegin\n\nEnd`
    };
    setFiles(prev => [...prev, newFile]);
    handleFileSelect(newFile.id);
  };

  const createFolder = (name: string, parentId: string) => {
    const newFolder: FileNode = {
        id: Date.now().toString(),
        name,
        type: 'folder',
        parentId,
        isOpen: true
    };
    setFiles(prev => [...prev, newFolder]);
  };

  const deleteItem = (id: string) => {
      // Simple delete (doesn't recursively delete children for simplicity in this demo, but hides them)
      setFiles(prev => prev.filter(f => f.id !== id && f.parentId !== id));
      if (activeFileId === id) {
          setCode('');
          setActiveFileId('');
      }
  };

  // --- INTERPRETER LOGIC ---

  const toggleBreakpoint = (line: number) => {
      setBreakpoints(prev => {
          const next = new Set(prev);
          if (next.has(line)) next.delete(line);
          else next.add(line);
          return next;
      });
  };

  const startExecution = () => {
    setIsRunning(true);
    setIsPaused(false);
    setIsWaitingForInput(false);
    setActiveLine(null);
    setOutput([]);
    setErrors([]);
    setVariables(new Map());
    
    setTimeout(() => {
        try {
            const lexer = new Lexer(code);
            const tokens = lexer.tokenize();
            const parser = new Parser(tokens);
            const ast = parser.parse();
            const interpreter = new Interpreter();
            generatorRef.current = interpreter.execute(ast);
            processGenerator();
        } catch (e: any) {
            setErrors([e.message]);
            setIsRunning(false);
        }
    }, 50);
  };

  const processGenerator = (injectedValue?: any, stepOver = false) => {
    if (!generatorRef.current) return;
    try {
        let result = generatorRef.current.next(injectedValue);
        const loop = () => {
             let steps = 0;
             while (!result.done && steps < 500) {
                const event = result.value as InterpreterEvent;
                if (event.type === 'step') {
                    setActiveLine(event.line);
                    setVariables(event.variables);
                    if (stepOver || breakpoints.has(event.line)) {
                        setIsPaused(true);
                        return;
                    }
                } else if (event.type === 'output') {
                    setOutput(prev => [...prev, event.value]);
                } else if (event.type === 'error') {
                    setErrors(prev => [...prev, event.value]);
                    stopExecution();
                    return;
                } else if (event.type === 'input') {
                    setIsWaitingForInput(true);
                    setCurrentInputVar(event.varName);
                    setExpectedType(event.varType);
                    return; 
                }
                result = generatorRef.current!.next();
                steps++;
             }
             if (result.done) stopExecution();
             else setTimeout(loop, 0);
        };
        loop();
    } catch (e: any) {
        setErrors(prev => [...prev, `System Error: ${e.message}`]);
        stopExecution();
    }
  };

  const stopExecution = () => {
      setIsRunning(false);
      setIsPaused(false);
      setIsWaitingForInput(false);
      setActiveLine(null);
      generatorRef.current = null;
  };

  const stepOver = () => {
      if (!isPaused || !isRunning) return;
      processGenerator(undefined, true);
  };

  const resumeExecution = () => {
      if (!isPaused || !isRunning) return;
      setIsPaused(false);
      processGenerator(undefined, false);
  };

  const validateInput = (val: string, type: string): boolean => {
      if (type === 'Integer') return /^-?\d+$/.test(val);
      if (type === 'Real') return /^-?\d+(\.\d+)?$/.test(val) || /^-?\d+$/.test(val);
      if (type === 'Boolean') return /^(true|false)$/i.test(val);
      return true;
  };

  const handleInputSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!isWaitingForInput) return;
      const trimmedInput = inputValue.trim();
      if (!validateInput(trimmedInput, expectedType)) {
          setOutput(prev => [...prev, `> ${inputValue}`, `Error: Expected ${expectedType}`]);
          setInputValue('');
          return;
      }
      setOutput(prev => [...prev, `> ${inputValue}`]);
      const val = inputValue;
      setInputValue('');
      setIsWaitingForInput(false);
      processGenerator(val);
  };

  const renderValue = (v: RuntimeValue) => {
      if (v.type === 'Array') return `[${(v.value as any[]).join(', ')}]`;
      return v.value.toString();
  };

  // --- RENDER HELPERS ---

  if (view === 'home') {
      return (
        <div className={`h-screen flex flex-col ${isDarkMode ? 'bg-[#0a1f13]' : 'bg-slate-50'}`}>
            <nav className={`px-6 py-4 flex justify-between items-center ${isDarkMode ? 'bg-[#0f281a]/80 backdrop-blur-md' : 'bg-white/80 backdrop-blur-md shadow-sm'} sticky top-0 z-50`}>
                <div className="flex items-center gap-2">
                    <div className="bg-emerald-600 rounded-lg p-1">
                        <Terminal className="text-white" size={20} />
                    </div>
                    <span className={`font-bold text-xl tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>AlgoLang <span className="text-emerald-500">DZ</span></span>
                </div>
                <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 rounded-full hover:bg-emerald-500/20 transition-colors">
                    {isDarkMode ? <Sun className="text-amber-400" /> : <Moon className="text-emerald-700" />}
                </button>
            </nav>
            <Landing onStart={() => setView('ide')} onDocs={() => setView('docs')} isDarkMode={isDarkMode} />
        </div>
      );
  }

  if (view === 'docs') {
      return (
        <div className={`h-screen flex flex-col ${isDarkMode ? 'bg-[#0a1f13] text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
             <Docs onBack={() => setView('home')} isDarkMode={isDarkMode} />
        </div>
      );
  }

  return (
    <div className={`flex h-screen overflow-hidden ${isDarkMode ? 'bg-[#0a1f13] text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Activity Bar */}
      <div className={`w-14 flex flex-col items-center py-4 gap-6 border-r z-20 ${isDarkMode ? 'bg-[#0f281a] border-emerald-900/30' : 'bg-white border-slate-200 shadow-sm'}`}>
        <button onClick={() => setView('home')} className={`p-2 rounded-xl transition-all ${isDarkMode ? 'hover:bg-emerald-500/20 text-emerald-500' : 'hover:bg-emerald-50 text-emerald-600'}`} title="Home">
            <Home size={22} />
        </button>
        
        <div className={`w-8 h-[1px] ${isDarkMode ? 'bg-emerald-900/50' : 'bg-slate-200'}`} />
        
        <button className={`p-2 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-500 text-white shadow-lg`} title="Project">
            <FolderOpen size={22} />
        </button>
        <button onClick={() => setView('docs')} className={`p-2 rounded-xl transition-all ${isDarkMode ? 'hover:bg-emerald-500/20 hover:text-emerald-500 text-slate-400' : 'hover:bg-emerald-50 hover:text-emerald-600 text-slate-400'}`} title="Docs">
            <Book size={22} />
        </button>
        
        <div className="flex-1" />
        
        <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 rounded-xl hover:bg-slate-700/20 transition-colors" title="Toggle Theme">
            {isDarkMode ? <Sun size={22} className="text-amber-400" /> : <Moon size={22} className="text-emerald-700" />}
        </button>
      </div>

      {/* Sidebar: File Explorer */}
      <div className={`w-64 flex flex-col border-r transition-colors ${isDarkMode ? 'bg-[#0a1f13] border-emerald-900/30' : 'bg-slate-50 border-slate-200'}`}>
         <FileExplorer 
            files={files} 
            activeFileId={activeFileId}
            onFileSelect={handleFileSelect}
            onCreateFile={createFile}
            onCreateFolder={createFolder}
            onDelete={deleteItem}
            isDarkMode={isDarkMode}
         />
      </div>

      <div className="flex-1 flex flex-col h-full min-w-0">
        
        {/* IDE Toolbar */}
        <header className={`flex justify-between items-center px-4 py-2 border-b h-14 shrink-0 ${isDarkMode ? 'bg-[#0f281a] border-emerald-900/30' : 'bg-white border-slate-200 shadow-sm'}`}>
            <div className="flex items-center gap-3">
                <span className={`text-sm font-semibold flex items-center gap-2 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>
                    <FolderOpen size={16} />
                    {files.find(f => f.id === activeFileId)?.name || 'No file selected'}
                </span>
            </div>

            <div className="flex items-center gap-3">
                {isRunning ? (
                    <>
                         {isPaused ? (
                             <>
                                <button onClick={stepOver} className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-white rounded-md font-medium text-sm transition-colors shadow-sm">
                                    <StepForward size={16} /> Step
                                </button>
                                <button onClick={resumeExecution} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md font-medium text-sm transition-colors shadow-sm">
                                    <Play size={16} fill="currentColor" /> Resume
                                </button>
                             </>
                         ) : (
                             <button onClick={() => setIsPaused(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-white rounded-md font-medium text-sm transition-colors shadow-sm">
                                <Pause size={16} fill="currentColor" /> Pause
                             </button>
                         )}
                         <button onClick={stopExecution} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-md font-medium text-sm transition-colors shadow-sm">
                            <Trash2 size={16} /> Stop
                         </button>
                    </>
                ) : (
                    <button 
                        onClick={startExecution} 
                        disabled={!activeFileId} 
                        className={`
                            flex items-center gap-2 px-6 py-1.5 rounded-full font-bold text-sm transition-all shadow-md transform active:scale-95
                            ${!activeFileId 
                                ? 'bg-slate-700 text-slate-400 cursor-not-allowed opacity-50' 
                                : 'bg-emerald-600 hover:bg-emerald-500 text-white hover:shadow-emerald-500/25'}
                        `}
                    >
                        <Play size={16} fill="currentColor" /> 
                        RUN CODE
                    </button>
                )}
            </div>
        </header>

        {/* IDE Layout: Code + Output */}
        <div className="flex-1 flex flex-col lg:flex-row min-h-0">
            
            {/* Editor */}
            <div className={`flex-[2] relative min-h-0 border-r ${isDarkMode ? 'border-emerald-900/30' : 'border-slate-200'}`}>
                {activeFileId ? (
                    <CodeEditor
                        value={code}
                        onChange={handleCodeChange}
                        breakpoints={breakpoints}
                        onToggleBreakpoint={toggleBreakpoint}
                        activeLine={activeLine}
                        isDarkMode={isDarkMode}
                    />
                ) : (
                    <div className={`flex flex-col items-center justify-center h-full ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>
                        <div className="bg-emerald-500/10 p-4 rounded-full mb-4">
                             <RotateCcw size={32} className="text-emerald-500 opacity-50" />
                        </div>
                        <p>Select a file to start coding</p>
                    </div>
                )}
            </div>

            {/* Right Panel: Terminal & Vars */}
            <div className={`flex-1 lg:max-w-md flex flex-col min-h-0 transition-colors ${isDarkMode ? 'bg-[#05110a]' : 'bg-white'}`}>
                
                {/* Console */}
                <div 
                    className={`flex-1 flex flex-col cursor-text ${isDarkMode ? 'bg-[#05110a]' : 'bg-[#1e1e1e]'} `} 
                    onClick={() => inputRef.current?.focus()}
                >
                    <div className={`px-4 py-2 border-b flex justify-between items-center shrink-0 cursor-default ${isDarkMode ? 'bg-[#0f281a] border-emerald-900/30' : 'bg-[#252526] border-slate-700'}`}>
                        <div className="flex items-center gap-2">
                            <Terminal size={14} className="text-slate-400" />
                            <span className="text-xs font-mono text-slate-400">Terminal</span>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); setOutput([]); setErrors([])}} className="text-slate-500 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                    </div>
                    
                    <div className="flex-1 p-4 font-mono text-sm overflow-y-auto space-y-1 custom-scrollbar">
                        {output.length === 0 && errors.length === 0 && !isRunning && (
                            <div className="text-slate-600 italic">Ready to execute...</div>
                        )}
                        {output.map((line, idx) => (
                            <div key={idx} className="break-words text-slate-300">
                                {line.startsWith('>') ? <span className="text-slate-500">{line}</span> : <span><span className="text-emerald-500 opacity-60 mr-2">$</span>{line}</span>}
                            </div>
                        ))}
                        {errors.map((err, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-red-400 bg-red-900/10 p-2 rounded mt-2 border border-red-900/20">
                                <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                                <span className="break-words">{err}</span>
                            </div>
                        ))}
                        {isWaitingForInput && (
                            <div className="flex items-center text-slate-200">
                                <span className="mr-2 text-emerald-500 font-bold animate-pulse">{`>`}</span>
                                <form onSubmit={handleInputSubmit} className="flex-1">
                                    <input ref={inputRef} type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} className="w-full bg-transparent border-none outline-none text-white font-mono" autoFocus autoComplete="off"/>
                                </form>
                            </div>
                        )}
                        <div ref={consoleBottomRef} />
                    </div>
                </div>

                {/* Variables */}
                <div className={`h-1/3 flex flex-col border-t ${isDarkMode ? 'bg-[#0a1f13] border-emerald-900/30' : 'bg-white border-slate-200'}`}>
                    <div className={`px-4 py-2 border-b flex items-center gap-2 shrink-0 ${isDarkMode ? 'bg-[#0f281a] border-emerald-900/30' : 'bg-slate-50 border-slate-200'}`}>
                        <Bug size={14} className="text-amber-500" />
                        <span className={`text-xs font-mono ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Variables</span>
                    </div>
                    <div className="flex-1 p-0 overflow-y-auto custom-scrollbar">
                        <table className="w-full text-left text-sm font-mono border-collapse">
                            <thead className={`text-xs sticky top-0 ${isDarkMode ? 'bg-[#0f281a]/90 text-slate-400' : 'bg-slate-50/90 text-slate-500'}`}>
                                <tr>
                                    <th className="p-2 border-b border-inherit">Name</th>
                                    <th className="p-2 border-b border-inherit">Type</th>
                                    <th className="p-2 border-b border-inherit">Value</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Array.from(variables.entries()).map(([name, val]) => (
                                    <tr key={name} className={`border-b transition-colors ${isDarkMode ? 'border-emerald-900/20 hover:bg-emerald-900/10' : 'border-slate-100 hover:bg-slate-50'}`}>
                                        <td className="p-2 text-emerald-500 font-semibold">{name}</td>
                                        <td className="p-2 text-amber-600 text-xs">{val.type}</td>
                                        <td className={`p-2 break-all ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>{renderValue(val)}</td>
                                    </tr>
                                ))}
                                {variables.size === 0 && (
                                    <tr><td colSpan={3} className="p-4 text-center text-slate-400 italic">No variables in scope</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
      </div>
    </div>
  );
};

export default App;