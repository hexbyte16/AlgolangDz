import React, { useState } from 'react';
import { ArrowLeft, Book, ChevronRight, Hash, Info, AlertTriangle, Lightbulb } from 'lucide-react';
import { DOCS_DATA_EN, DOCS_DATA_AR, TRANSLATIONS } from '../constants';
import { DocBlock, DocPage } from '../types';

interface DocsProps {
  onBack: () => void;
  isDarkMode: boolean;
  lang: 'en' | 'ar';
}

export const Docs: React.FC<DocsProps> = ({ onBack, isDarkMode, lang }) => {
  const [activePageId, setActivePageId] = useState('intro');

  const DOCS_DATA = lang === 'ar' ? DOCS_DATA_AR : DOCS_DATA_EN;
  const t = TRANSLATIONS[lang];

  // Flatten pages for easier access
  const allPages = DOCS_DATA.flatMap(cat => cat.pages);
  const activePage = allPages.find(p => p.id === activePageId) || allPages[0];

  const ChevronNext = lang === 'ar' ? ArrowLeft : ChevronRight;
  const ArrowBack = lang === 'ar' ? ChevronRight : ArrowLeft;

  return (
    <div className={`flex h-full w-full ${isDarkMode ? 'bg-[#0a1f13] text-slate-200' : 'bg-white text-slate-800'}`}>
      
      {/* Sidebar Navigation */}
      <div className={`w-64 flex-shrink-0 flex flex-col border-e h-full overflow-y-auto custom-scrollbar ${isDarkMode ? 'border-emerald-900/30 bg-[#0f281a]' : 'border-slate-100 bg-slate-50'}`}>
        <div className="p-4 border-b border-inherit sticky top-0 backdrop-blur-sm z-10 flex items-center gap-2">
            <button onClick={onBack} className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-emerald-900/50 text-emerald-500' : 'hover:bg-white text-slate-500 hover:text-emerald-600'}`}>
                <ArrowBack size={20} className={lang === 'ar' ? 'rotate-180' : ''}/>
            </button>
            <span className="font-bold text-lg">{t.documentation}</span>
        </div>
        
        <div className="p-4 space-y-8">
            {DOCS_DATA.map((category) => (
                <div key={category.title}>
                    <h3 className={`text-xs font-bold uppercase tracking-wider mb-3 px-2 ${isDarkMode ? 'text-emerald-600' : 'text-slate-400'}`}>
                        {category.title}
                    </h3>
                    <div className="space-y-1">
                        {category.pages.map(page => (
                            <button
                                key={page.id}
                                onClick={() => setActivePageId(page.id)}
                                className={`w-full text-start px-3 py-2 rounded-md text-sm transition-all flex items-center justify-between group ${
                                    activePageId === page.id
                                    ? (isDarkMode ? 'bg-emerald-600/20 text-emerald-400 font-medium' : 'bg-white shadow-sm text-emerald-700 font-medium')
                                    : (isDarkMode ? 'text-slate-400 hover:text-slate-200 hover:bg-white/5' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100')
                                }`}
                            >
                                {page.title}
                                {activePageId === page.id && <ChevronNext size={14} />}
                            </button>
                        ))}
                    </div>
                </div>
            ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar scroll-smooth">
         <div className="max-w-4xl mx-auto px-8 py-12">
            
            {/* Page Header */}
            <div className="mb-10 pb-6 border-b border-inherit">
                <h1 className="text-4xl font-extrabold mb-4 tracking-tight">{activePage.title}</h1>
                <p className={`text-xl font-light leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    {activePage.description}
                </p>
            </div>

            {/* Content Blocks */}
            <div className="space-y-8 pb-20">
                {activePage.blocks.map((block, idx) => (
                    <BlockRenderer key={idx} block={block} isDarkMode={isDarkMode} />
                ))}
            </div>

            {/* Page Footer Navigation */}
            <div className="mt-20 pt-10 border-t border-inherit flex justify-between">
                {getPrevPage(activePageId, allPages) && (
                    <button onClick={() => setActivePageId(getPrevPage(activePageId, allPages)!.id)} className="text-start group">
                        <div className={`text-xs uppercase mb-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{t.previous}</div>
                        <div className={`text-lg font-medium flex items-center gap-2 group-hover:text-emerald-500 transition-colors`}>
                           <ArrowBack size={18} className={lang === 'ar' ? 'rotate-180' : ''} /> {getPrevPage(activePageId, allPages)!.title}
                        </div>
                    </button>
                )}
                 {getNextPage(activePageId, allPages) && (
                    <button onClick={() => setActivePageId(getNextPage(activePageId, allPages)!.id)} className="text-end group ms-auto">
                        <div className={`text-xs uppercase mb-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{t.next}</div>
                        <div className={`text-lg font-medium flex items-center gap-2 group-hover:text-emerald-500 transition-colors`}>
                            {getNextPage(activePageId, allPages)!.title} <ChevronNext size={18} />
                        </div>
                    </button>
                )}
            </div>

         </div>
      </div>
    </div>
  );
};

// --- Helper Components ---

const BlockRenderer: React.FC<{ block: DocBlock, isDarkMode: boolean }> = ({ block, isDarkMode }) => {
    switch (block.type) {
        case 'text':
            return <p className={`leading-8 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>{block.value}</p>;
        
        case 'heading':
            const Tag = block.level === 2 ? 'h2' : 'h3';
            const sizeClass = block.level === 2 ? 'text-2xl mt-10 mb-4' : 'text-xl mt-8 mb-3';
            return (
                <Tag className={`font-bold flex items-center gap-2 ${sizeClass} ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                    {block.level === 2 && <Hash size={20} className="text-emerald-500 opacity-50" />}
                    {block.value}
                </Tag>
            );

        case 'code':
            return (
                <div className="relative group my-6" dir="ltr">
                    {block.label && (
                        <div className={`absolute -top-3 left-4 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider shadow-sm z-10 ${isDarkMode ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-700'}`}>
                            {block.label}
                        </div>
                    )}
                    <pre className={`p-5 rounded-xl font-mono text-sm leading-6 overflow-x-auto shadow-sm border ${isDarkMode ? 'bg-[#05110a] border-emerald-900/30 text-blue-300' : 'bg-slate-900 text-blue-200 border-slate-800'}`}>
                        <code>{block.value}</code>
                    </pre>
                </div>
            );

        case 'note':
            const icon = block.variant === 'warning' ? <AlertTriangle size={20} /> : block.variant === 'tip' ? <Lightbulb size={20} /> : <Info size={20} />;
            const colorClass = block.variant === 'warning' 
                ? (isDarkMode ? 'bg-amber-900/20 border-amber-500/30 text-amber-200' : 'bg-amber-50 border-amber-200 text-amber-800')
                : block.variant === 'tip'
                ? (isDarkMode ? 'bg-emerald-900/20 border-emerald-500/30 text-emerald-200' : 'bg-emerald-50 border-emerald-200 text-emerald-800')
                : (isDarkMode ? 'bg-blue-900/20 border-blue-500/30 text-blue-200' : 'bg-blue-50 border-blue-200 text-blue-800');
            
            return (
                <div className={`p-4 rounded-lg border flex gap-3 my-6 ${colorClass}`}>
                    <div className="shrink-0 mt-0.5">{icon}</div>
                    <div className="text-sm leading-7 font-medium opacity-90">{block.value}</div>
                </div>
            );

        case 'list':
            return (
                <ul className="space-y-2 my-4 px-2">
                    {block.items?.map((item, i) => (
                        <li key={i} className={`flex items-start gap-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                            <div className="mt-2 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                            <span>{item}</span>
                        </li>
                    ))}
                </ul>
            );
        
        case 'table':
            return (
                <div className={`overflow-x-auto rounded-lg border my-6 ${isDarkMode ? 'border-emerald-900/30' : 'border-slate-200'}`}>
                    <table className="w-full text-start text-sm">
                        <thead className={isDarkMode ? 'bg-[#0f281a] text-slate-300' : 'bg-slate-50 text-slate-600'}>
                            <tr>
                                {block.headers?.map((h, i) => <th key={i} className="p-3 font-semibold border-b border-inherit">{h}</th>)}
                            </tr>
                        </thead>
                        <tbody className={isDarkMode ? 'divide-y divide-emerald-900/30' : 'divide-y divide-slate-100'}>
                            {block.rows?.map((row, i) => (
                                <tr key={i} className={isDarkMode ? 'hover:bg-white/5' : 'hover:bg-slate-50'}>
                                    {row.map((cell, j) => (
                                        <td key={j} className={`p-3 font-mono ${j === 0 ? (isDarkMode ? 'text-emerald-400 font-bold' : 'text-purple-600 font-bold') : (isDarkMode ? 'text-slate-300' : 'text-slate-600')}`}>
                                            {cell}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );

        default:
            return null;
    }
};

// Helpers for Navigation
const getPrevPage = (id: string, pages: DocPage[]) => {
    const idx = pages.findIndex(p => p.id === id);
    return idx > 0 ? pages[idx - 1] : null;
};
const getNextPage = (id: string, pages: DocPage[]) => {
    const idx = pages.findIndex(p => p.id === id);
    return idx < pages.length - 1 ? pages[idx + 1] : null;
};