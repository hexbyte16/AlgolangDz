import React from 'react';
import { ArrowRight, Code, BookOpen, Terminal, Cpu } from 'lucide-react';
import { TRANSLATIONS } from '../constants';

interface LandingProps {
  onStart: () => void;
  onDocs: () => void;
  isDarkMode: boolean;
  lang: 'en' | 'ar';
}

export const Landing: React.FC<LandingProps> = ({ onStart, onDocs, isDarkMode, lang }) => {
  const t = TRANSLATIONS[lang];

  return (
    <div className={`flex flex-col h-full overflow-y-auto ${isDarkMode ? 'bg-[#0a1f13] text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center text-center p-8 max-w-5xl mx-auto w-full">
        <div className="relative group mb-8">
            <div className={`absolute inset-0 blur-xl opacity-50 rounded-full ${isDarkMode ? 'bg-emerald-600' : 'bg-emerald-300'}`}></div>
            <div className={`relative p-6 rounded-3xl ${isDarkMode ? 'bg-slate-900 border border-emerald-900/50' : 'bg-white shadow-2xl border border-slate-100'}`}>
                <Code size={64} className="text-emerald-500" />
            </div>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight">
          {lang === 'ar' ? 'تعلم الخوارزميات' : 'Learn Algorithms'} <br/>
          <span className="bg-gradient-to-r from-emerald-500 via-emerald-400 to-white bg-clip-text text-transparent drop-shadow-sm">
             {lang === 'ar' ? 'على الطريقة الجزائرية' : 'The DZ Way'}
          </span>
        </h1>
        
        <p className={`text-xl md:text-2xl mb-12 max-w-2xl font-light leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
          {t.welcomeSub}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <button 
            onClick={onStart}
            className="group relative px-8 py-4 rounded-full font-bold text-lg text-white shadow-xl transition-all hover:scale-105 active:scale-95 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-emerald-500 group-hover:from-emerald-500 group-hover:to-emerald-400 transition-colors" />
            <div className="relative flex items-center justify-center gap-2">
                {t.startCoding} <ArrowRight size={20} className={lang === 'ar' ? 'rotate-180' : ''} />
            </div>
          </button>
          
          <button 
            onClick={onDocs}
            className={`flex items-center justify-center gap-2 px-8 py-4 rounded-full font-bold text-lg transition-all border-2 ${isDarkMode ? 'border-slate-700 hover:bg-slate-800 text-slate-300' : 'border-slate-200 hover:bg-white text-slate-700 hover:text-emerald-700'}`}
          >
            {t.documentation} <BookOpen size={20} />
          </button>
        </div>
      </div>

      {/* Features Grid */}
      <div className={`py-20 px-4 w-full ${isDarkMode ? 'bg-[#0f281a]' : 'bg-white'}`}>
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
            <FeatureCard 
                icon={<Terminal className="text-red-500" size={32} />}
                title={t.realTimeTerm}
                description={t.realTimeTermDesc}
                isDarkMode={isDarkMode}
            />
            <FeatureCard 
                icon={<Cpu className="text-emerald-500" size={32} />}
                title={t.stepDebugger}
                description={t.stepDebuggerDesc}
                isDarkMode={isDarkMode}
            />
            <FeatureCard 
                icon={<Code className="text-amber-500" size={32} />}
                title={t.strictSyntax}
                description={t.strictSyntaxDesc}
                isDarkMode={isDarkMode}
            />
        </div>
      </div>
      
      {/* Footer */}
      <div className={`py-6 text-center text-sm ${isDarkMode ? 'bg-[#0a1f13] text-slate-600' : 'bg-slate-100 text-slate-500'}`}>
        <p>{t.madeFor}</p>
      </div>
    </div>
  );
};

const FeatureCard: React.FC<{icon: React.ReactNode, title: string, description: string, isDarkMode: boolean}> = ({ icon, title, description, isDarkMode }) => (
    <div className={`p-8 rounded-2xl border transition-all hover:translate-y-[-4px] ${isDarkMode ? 'bg-slate-900/50 border-emerald-900/30' : 'bg-slate-50 border-slate-100 shadow-sm'}`}>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${isDarkMode ? 'bg-slate-800' : 'bg-white shadow-sm'}`}>
            {icon}
        </div>
        <h3 className="text-xl font-bold mb-3">{title}</h3>
        <p className={isDarkMode ? 'text-slate-400' : 'text-slate-600'}>{description}</p>
    </div>
);