
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
    { icon: '⚽', label: 'Predict Match', query: 'Predict a match for me' },
    { icon: '📊', label: 'Form Analysis', query: 'Show me team form analysis for upcoming big games' },
    { icon: '📉', label: 'Over/Under Tips', query: 'Best over/under 2.5 goals tips for today' },
    { icon: '🏆', label: 'League Standings', query: 'What are the current league leaders in Europe?' },
    { icon: '❓', label: 'Help', query: 'How do I use this bot?' },
  ];

  return (
    <div className="absolute bottom-full left-0 right-0 mb-2 p-2 z-30 animate-in slide-in-from-bottom-4 fade-in duration-200">
      <div className="bg-[#17212b] rounded-2xl shadow-2xl border border-white/10 p-3 grid grid-cols-2 gap-2 max-w-md mx-auto">
        <div className="col-span-2 flex justify-between items-center px-2 mb-1">
          <span className="text-[10px] font-bold text-[#708499] uppercase">Quick Menu</span>
          <button onClick={onClose} className="text-[#708499] hover:text-white">
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
            className="flex items-center gap-3 p-3 bg-[#242f3d] hover:bg-[#2b5278] rounded-xl text-left transition-colors group"
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
