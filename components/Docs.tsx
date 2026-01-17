import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { SYNTAX_GUIDE } from '../constants';

interface DocsProps {
  onBack: () => void;
  isDarkMode: boolean;
}

export const Docs: React.FC<DocsProps> = ({ onBack, isDarkMode }) => {
  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto w-full p-6 animate-fade-in">
        <div className="mb-6 flex items-center gap-4">
            <button 
                onClick={onBack}
                className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-emerald-900/30 text-emerald-500 hover:text-emerald-400' : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'}`}
            >
                <ArrowLeft size={24} />
            </button>
            <h1 className="text-3xl font-bold">Documentation</h1>
        </div>

        <div className={`prose max-w-none rounded-xl p-8 border overflow-y-auto custom-scrollbar ${
            isDarkMode 
                ? 'prose-invert bg-[#0f281a] border-emerald-900/30' 
                : 'bg-white border-slate-200 shadow-sm prose-slate'
        }`}>
            {/* Simple Markdown Renderer simulation */}
            {SYNTAX_GUIDE.split('\n').map((line, i) => {
                if (line.startsWith('## ')) return <h2 key={i} className={`text-2xl font-bold mt-8 mb-4 border-b pb-2 ${isDarkMode ? 'border-emerald-900/30 text-emerald-400' : 'border-slate-700/50'}`}>{line.replace('## ', '')}</h2>;
                if (line.startsWith('# ')) return <h1 key={i} className="text-4xl font-bold mb-6">{line.replace('# ', '')}</h1>;
                if (line.startsWith('```algo')) return <div key={i} className="hidden" />; // Skip start block
                if (line.startsWith('```')) return <div key={i} className="hidden" />; // Skip end block
                
                // Code Blocks
                if (line.trim().startsWith('Algorithm') || line.trim().startsWith('Var') || line.trim().startsWith('For') || line.trim().startsWith('If') || line.includes('Write') || line.includes('Read')) {
                    return (
                        <div key={i} className={`font-mono text-sm p-1 ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                            {line}
                        </div>
                    );
                }

                if (line.startsWith('- **')) {
                    const parts = line.split('**');
                    return <li key={i} className="ml-4 my-2"><strong className={isDarkMode ? 'text-amber-400' : 'text-purple-700'}>{parts[1]}</strong>{parts[2]}</li>;
                }

                return <p key={i} className="my-2 leading-relaxed opacity-90">{line}</p>;
            })}
        </div>
    </div>
  );
};