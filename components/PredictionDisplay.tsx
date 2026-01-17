
import React from 'react';
import { MatchPrediction } from '../types';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';

interface Props {
  prediction: MatchPrediction;
  onAction?: (action: string) => void;
}

const PredictionDisplay: React.FC<Props> = ({ prediction, onAction }) => {
  const winData = [
    { name: 'Home', value: prediction.probabilities.homeWin, color: '#40a7e3' },
    { name: 'Draw', value: prediction.probabilities.draw, color: '#546e7a' },
    { name: 'Away', value: prediction.probabilities.awayWin, color: '#e53935' },
  ];

  return (
    <div className="mt-3 space-y-4 text-left border-t border-white/5 pt-3">
      {/* 1X2 Probabilities */}
      <div className="bg-[#0e1621] p-3 rounded-lg border border-white/5">
        <p className="text-[10px] font-bold text-[#708499] uppercase mb-2 flex justify-between">
          <span>Outcome Probabilities</span>
          <span className="text-emerald-400">Live Data</span>
        </p>
        <div className="h-32 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={winData} layout="vertical">
              <XAxis type="number" hide domain={[0, 100]} />
              <YAxis dataKey="name" type="category" stroke="#708499" fontSize={10} width={40} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={16}>
                {winData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Variables Breakdown */}
      <div className="space-y-2">
        <p className="text-[10px] font-bold text-[#708499] uppercase px-1">Key Match Variables</p>
        <div className="grid grid-cols-1 gap-2">
          {prediction.variables.form && (
            <div className="bg-[#17212b] p-2.5 rounded-lg border border-white/5">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-bold text-white uppercase tracking-tighter">Current Form</span>
              </div>
              <p className="text-[10px] text-[#708499] leading-relaxed">{prediction.variables.form}</p>
            </div>
          )}
          {prediction.variables.h2h && (
            <div className="bg-[#17212b] p-2.5 rounded-lg border border-white/5">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-bold text-white uppercase tracking-tighter">Head to Head</span>
              </div>
              <p className="text-[10px] text-[#708499] leading-relaxed">{prediction.variables.h2h}</p>
            </div>
          )}
          {prediction.variables.injuries && (
            <div className="bg-[#17212b] p-2.5 rounded-lg border border-white/5">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-bold text-white uppercase tracking-tighter">Injuries & Squad</span>
              </div>
              <p className="text-[10px] text-[#708499] leading-relaxed">{prediction.variables.injuries}</p>
            </div>
          )}
        </div>
      </div>

      {/* Market Grid */}
      <div className="grid grid-cols-2 gap-2">
        <div className="p-2.5 bg-[#0e1621] rounded border border-white/5 flex justify-between items-center">
          <div>
            <p className="text-[9px] text-[#708499] uppercase">Over 2.5</p>
            <p className="text-xs font-bold text-white">{prediction.probabilities.over25}%</p>
          </div>
          <div className="w-8 h-8 rounded-full border-2 border-violet-500/30 flex items-center justify-center text-[9px] font-bold">O</div>
        </div>
        <div className="p-2.5 bg-[#0e1621] rounded border border-white/5 flex justify-between items-center">
          <div>
            <p className="text-[9px] text-[#708499] uppercase">BTTS Yes</p>
            <p className="text-xs font-bold text-white">{prediction.probabilities.bttsYes}%</p>
          </div>
          <div className="w-8 h-8 rounded-full border-2 border-emerald-500/30 flex items-center justify-center text-[9px] font-bold">B</div>
        </div>
      </div>

      {/* Player Props */}
      {prediction.playerProps && prediction.playerProps.length > 0 && (
        <div className="bg-[#0e1621] rounded-lg border border-white/5 p-3">
          <p className="text-[10px] font-bold text-[#708499] uppercase mb-3 flex items-center gap-2">
             Player Specials
          </p>
          <div className="space-y-3">
            {prediction.playerProps.map((p, i) => (
              <div key={i} className="flex items-center justify-between border-b border-white/5 pb-2 last:border-0 last:pb-0">
                <div>
                  <p className="text-[11px] font-bold text-white">{p.playerName}</p>
                  <p className="text-[9px] text-[#708499]">{p.market}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-emerald-400">{p.probability}%</p>
                  <p className="text-[9px] text-[#708499]">{p.prediction}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Verdict */}
      <div className="bg-[#40a7e3]/10 p-3 rounded-lg border border-[#40a7e3]/20 shadow-inner">
        <div className="flex justify-between items-start mb-1">
          <span className="text-[10px] font-bold text-[#40a7e3] uppercase tracking-wider">Bot Verdict</span>
          <span className="text-[10px] font-bold text-white px-1.5 py-0.5 bg-[#40a7e3] rounded-sm">{prediction.confidence}% Confidence</span>
        </div>
        <p className="text-xs font-bold text-white leading-tight italic">{prediction.suggestedBet}</p>
      </div>

      {/* Sources */}
      {prediction.sources && prediction.sources.length > 0 && (
        <div className="pt-2 border-t border-white/5">
          <p className="text-[9px] text-[#708499] uppercase mb-2">Verified Sources</p>
          <div className="flex flex-wrap gap-2">
            {prediction.sources.map((source, i) => (
              <a 
                key={i} 
                href={source.uri} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[10px] text-[#64b5ef] hover:underline flex items-center gap-1 bg-[#17212b] px-2 py-1 rounded border border-white/5"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                {source.title.length > 15 ? source.title.substring(0, 15) + '...' : source.title}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Follow-up Suggestions */}
      {prediction.suggestedFollowUps && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {prediction.suggestedFollowUps.map((text, i) => (
            <button 
              key={i}
              onClick={() => onAction?.(text)}
              className="px-2.5 py-1 bg-[#2b5278] hover:bg-[#396996] text-white text-[10px] rounded-full transition-all shadow-sm"
            >
              {text}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default PredictionDisplay;
