
import React from 'react';

interface BotMenuProps {
  onSelect: (option: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const BotMenu: React.FC<BotMenuProps> = ({ onSelect, isOpen, onClose }) => {
  if (!isOpen) return null;

  const menuItems = [
    { icon: '🔥', label: 'Top Picks', query: 'What are the top football picks for today?' },
    { icon: '⚽', label: 'Predict Match', query: 'Predict an upcoming football match for me' },
    { icon: '📊', label: 'Form Analysis', query: 'Show me detailed team form analysis' },
    { icon: '🎯', label: 'Player Watch', query: 'Best player prop predictions for today' },
    { icon: '❓', label: 'Help', query: 'How do I use this bot?' },
    { icon: '🗑️', label: 'Clear Chat', query: '/clear' },
  ];

  return (
    <div className="absolute bottom-full left-0 right-0 mb-2 p-2 z-30 animate-in slide-in-from-bottom-4 fade-in duration-200">
      <div className="bg-[#17212b] rounded-2xl shadow-2xl border border-white/10 p-3 grid grid-cols-2 gap-2 max-w-md mx-auto">
        <div className="col-span-2 flex justify-between items-center px-2 mb-1">
          <span className="text-[10px] font-bold text-[#708499] uppercase tracking-widest">Bot Commands</span>
          <button onClick={onClose} className="text-[#708499] hover:text-white transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        {menuItems.map((item, index) => (
          <button
            key={index}
            onClick={() => {
              onSelect(item.query);
              onClose();
            }}
            className="flex items-center gap-3 p-3 bg-[#242f3d] hover:bg-[#2b5278] rounded-xl text-left transition-colors group border border-transparent hover:border-white/5"
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-xs font-medium text-slate-200 group-hover:text-white">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default BotMenu;
