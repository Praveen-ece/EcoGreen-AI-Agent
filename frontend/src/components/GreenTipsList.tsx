import React from 'react';
import { Compass, CheckCircle } from 'lucide-react';

interface GreenTipsListProps {
  aiTips?: string[];
}

export const GreenTipsList: React.FC<GreenTipsListProps> = ({ aiTips = [] }) => {
  // Core static guidelines
  const staticTips = [
    'Buy only when absolutely needed to prevent waste and reduce consumer demand.',
    'Prefer local manufacturers and sellers to drastically reduce long-distance shipping emissions.',
    'Choose standard shipping options instead of express delivery to optimize transport efficiency.',
    'Prefer minimal, paper, or compostable packaging over single-use plastics.',
    'Extend the lifecycle of products by reusing, repairing, and recycling them whenever possible.'
  ];

  // Merge static and AI-augmented tips, making sure we have unique entries
  const allTips = [...staticTips];
  
  if (aiTips && aiTips.length > 0) {
    aiTips.forEach(tip => {
      const isDuplicate = allTips.some(
        existing => existing.toLowerCase().includes(tip.toLowerCase().slice(0, 15))
      );
      if (!isDuplicate && tip.trim() !== '') {
        allTips.push(tip);
      }
    });
  }

  // Limit to a clean 5-7 list
  const displayTips = allTips.slice(0, 7);

  return (
    <div className="glass-panel dark:dark-glass-panel rounded-3xl p-6 md:p-8 border-2 border-emerald-100/50 dark:border-emerald-800/30 shadow-md">
      <div className="flex items-center gap-2 mb-6">
        <Compass className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
        <h4 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight uppercase">Green Shopping Guidelines</h4>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayTips.map((tip, idx) => (
          <div 
            key={idx} 
            className="flex gap-3 items-start bg-white/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 rounded-2xl p-4 transition-all hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:-translate-y-0.5 hover:shadow-sm group animate-fade-in-up"
            style={{ animationDelay: `${idx * 0.1}s` }}
          >
            <div className="bg-emerald-100 dark:bg-emerald-900/50 p-1 rounded-full mt-0.5 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-800 transition-colors">
              <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
              {tip}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
export default GreenTipsList;
