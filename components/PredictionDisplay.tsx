
import React from 'react';
import { MatchPrediction } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

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

  const goalsData = [
    { name: 'Over', value: prediction.probabilities.over25, color: '#8e24aa' },
    { name: 'Under', value: prediction.probabilities.under25, color: '#1e88e5' },
  ];

  return (
    <div className="mt-3 space-y-4 text-left border-t border-white/5 pt-3">
      {/* Probabilities Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#0e1621] p-3 rounded-lg border border-white/5">
          <p className="text-[10px] font-bold text-[#708499] uppercase mb-2">Outcome Probabilities</p>
          <div className="h-28 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={winData} layout="vertical">
                <XAxis type="number" hide domain={[0, 100]} />
                <YAxis dataKey="name" type="category" stroke="#708499" fontSize={10} width={35} />
                <Bar dataKey="value" radius={[0, 2, 2, 0]} barSize={12}>
                  {winData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#0e1621] p-3 rounded-lg border border-white/5">
          <p className="text-[10px] font-bold text-[#708499] uppercase mb-2">Goals Over/Under</p>
          <div className="h-28 w-full flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={goalsData} cx="50%" cy="50%" innerRadius={20} outerRadius={35} paddingAngle={5} dataKey="value">
                  {goalsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-2 text-[9px] text-[#708499]">
              <span>O: {prediction.probabilities.over25}%</span>
              <span>U: {prediction.probabilities.under25}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Markets Table */}
      <div className="bg-[#0e1621] rounded-lg border border-white/5 overflow-hidden">
        <table className="w-full text-[11px]">
          <thead className="bg-white/5">
            <tr>
              <th className="px-3 py-1.5 text-left text-[#708499]">Market</th>
              <th className="px-3 py-1.5 text-right text-[#708499]">Value/Prob</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            <tr>
              <td className="px-3 py-1.5">BTTS Yes</td>
              <td className="px-3 py-1.5 text-right font-bold text-[#64b5ef]">{prediction.probabilities.bttsYes}%</td>
            </tr>
            <tr>
              <td className="px-3 py-1.5">Double Chance (1X)</td>
              <td className="px-3 py-1.5 text-right font-bold text-[#64b5ef]">{prediction.probabilities.doubleChance?.["1X"]}%</td>
            </tr>
            {prediction.additionalMarkets.slice(0, 2).map((m, i) => (
              <tr key={i}>
                <td className="px-3 py-1.5">{m.name}</td>
                <td className="px-3 py-1.5 text-right font-bold text-[#64b5ef]">{m.probability}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Verdict */}
      <div className="bg-[#40a7e3]/10 p-3 rounded-lg border border-[#40a7e3]/20">
        <div className="flex justify-between items-start mb-1">
          <span className="text-[10px] font-bold text-[#40a7e3] uppercase">Bot Recommendation</span>
          <span className="text-[10px] font-bold text-white px-1.5 py-0.5 bg-[#40a7e3] rounded">{prediction.confidence}% Confidence</span>
        </div>
        <p className="text-xs font-bold text-white">{prediction.suggestedBet}</p>
      </div>

      {/* Inline Interactive Buttons */}
      <div className="flex flex-wrap gap-2 mt-2">
        <button 
          onClick={() => onAction?.(`Detailed H2H analysis for ${prediction.matchName}`)}
          className="flex-1 min-w-[120px] bg-[#17212b] hover:bg-[#2b5278] border border-white/10 rounded-lg py-2 text-[11px] font-medium text-[#64b5ef] transition-colors"
        >
          📈 H2H Details
        </button>
        <button 
          onClick={() => onAction?.(`Squad injury news for ${prediction.matchName}`)}
          className="flex-1 min-w-[120px] bg-[#17212b] hover:bg-[#2b5278] border border-white/10 rounded-lg py-2 text-[11px] font-medium text-[#64b5ef] transition-colors"
        >
          🚑 Injury Reports
        </button>
      </div>

      {/* Analysis */}
      <p className="text-xs text-[#708499] italic leading-relaxed">
        {prediction.analysis.length > 200 ? prediction.analysis.substring(0, 200) + '...' : prediction.analysis}
      </p>
    </div>
  );
};

export default PredictionDisplay;
