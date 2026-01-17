
import React from 'react';
import ChatInterface from './components/ChatInterface';

const App: React.FC = () => {
  return (
    <div className="h-screen flex flex-col bg-[#0e1621] overflow-hidden">
      {/* Telegram Header */}
      <header className="h-14 bg-[#17212b] border-b border-black/20 flex items-center px-4 shrink-0 z-20 shadow-sm">
        <div className="flex items-center gap-3 w-full max-w-4xl mx-auto">
          <div className="w-10 h-10 bg-gradient-to-br from-[#64b5ef] to-[#40a7e3] rounded-full flex items-center justify-center text-white font-bold text-lg shadow-inner">
            B
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold truncate">BetPredict AI Bot</h1>
              <div className="flex items-center gap-1 bg-emerald-500/20 px-1.5 py-0.5 rounded">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-[8px] font-bold text-emerald-400 uppercase tracking-tighter">Active</span>
              </div>
            </div>
            <p className="text-[10px] text-[#64b5ef] truncate">Sports Analytics Engine</p>
          </div>
          <div className="flex items-center gap-4 text-[#708499]">
            <button className="hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </button>
            <button className="hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 w-full max-w-4xl mx-auto bg-[#0e1621] relative flex flex-col overflow-hidden">
        <ChatInterface />
      </main>
      
      {/* Bottom disclaimer */}
      <div className="bg-[#17212b] py-1 px-4 text-center border-t border-white/5 shrink-0">
        <p className="text-[9px] text-[#708499] uppercase tracking-widest font-medium">
          Statistical probabilities only • Gamble responsibly
        </p>
      </div>
    </div>
  );
};

export default App;
