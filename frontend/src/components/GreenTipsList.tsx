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
    <div className="glass-panel rounded-2xl p-6 md:p-8 border border-emerald-100/50 shadow-md">
      <div className="flex items-center gap-2 mb-4">
        <Compass className="w-5.5 h-5.5 text-emerald-600" />
        <h4 className="text-lg font-bold text-slate-800 tracking-tight uppercase">Green Shopping Guidelines</h4>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayTips.map((tip, idx) => (
          <div key={idx} className="flex gap-3 items-start bg-white/50 border border-slate-100 rounded-xl p-4 transition-all hover:bg-emerald-50/20">
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-slate-700 leading-relaxed font-medium">
              {tip}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
export default GreenTipsList;
