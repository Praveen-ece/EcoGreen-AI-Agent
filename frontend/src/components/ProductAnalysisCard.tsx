import React, { useState } from 'react';
import { Package, Tag, ShieldAlert, ChevronDown, ChevronUp } from 'lucide-react';
import { ProductAnalysis } from '../types/product';
import SustainabilityScoreGauge from './SustainabilityScoreGauge';
import CarbonFootprintBadge from './CarbonFootprintBadge';

interface ProductAnalysisCardProps {
  analysis: ProductAnalysis['productAnalysis'];
}

export const ProductAnalysisCard: React.FC<ProductAnalysisCardProps> = ({ analysis }) => {
  const [showConcerns, setShowConcerns] = useState(false);

  return (
    <div className="glass-panel dark:dark-glass-panel rounded-3xl shadow-lg border-2 border-emerald-100/50 dark:border-emerald-800/30 overflow-hidden h-full flex flex-col transition-colors">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-800 dark:from-emerald-900 dark:to-teal-900 px-6 py-5 flex flex-wrap justify-between items-center gap-3">
        <div className="flex items-center gap-2.5">
          <Package className="w-5 h-5 text-emerald-300" />
          <h3 className="text-white font-black text-lg tracking-wide uppercase">Original Product</h3>
        </div>
        <span className="bg-white/10 border border-white/20 text-emerald-50 text-xs px-3 py-1.5 rounded-full font-bold shadow-inner">
          {analysis.category || 'General'}
        </span>
      </div>

      {/* Body — gauge centered, then details below */}
      <div className="flex-1 flex flex-col p-6 gap-6">
        {/* Gauge centered */}
        <div className="flex justify-center -mt-2">
          <SustainabilityScoreGauge score={analysis.sustainabilityScore} />
        </div>

        {/* Divider */}
        <div className="border-t border-slate-100 dark:border-slate-800" />

        {/* Product name + material + badge */}
        <div className="space-y-4">
          <div>
            <h4 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 leading-tight break-words">
              {analysis.product}
            </h4>
            {analysis.material && (
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1.5 flex items-center gap-2">
                <Tag className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                {analysis.material}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <CarbonFootprintBadge level={analysis.estimatedCarbonFootprint} />
            
            {/* CO₂ kg estimate */}
            {analysis.carbonFootprintKg > 0 && (
              <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 shadow-sm">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">CO₂e</span>
                <span className="text-sm font-black text-slate-800 dark:text-slate-200">{analysis.carbonFootprintKg} kg</span>
              </div>
            )}
          </div>

          {/* Environmental Concerns */}
          {analysis.environmentalConcerns && analysis.environmentalConcerns.length > 0 && (
            <div className="bg-rose-50/80 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800/50 rounded-2xl overflow-hidden transition-all">
              <button 
                onClick={() => setShowConcerns(!showConcerns)}
                className="w-full flex items-center justify-between p-4 hover:bg-rose-100/50 dark:hover:bg-rose-900/40 transition-colors"
              >
                <div className="flex items-center gap-2 text-rose-800 dark:text-rose-400 font-bold text-xs uppercase tracking-wider">
                  <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-500" />
                  Environmental Concerns ({analysis.environmentalConcerns.length})
                </div>
                {showConcerns ? <ChevronUp className="w-4 h-4 text-rose-600" /> : <ChevronDown className="w-4 h-4 text-rose-600" />}
              </button>
              
              {showConcerns && (
                <div className="px-4 pb-4 animate-fade-in">
                  <ul className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                    {analysis.environmentalConcerns.map((concern, idx) => (
                      <li key={idx} className="text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2">
                        <span className="text-rose-500 font-bold mt-0.5 flex-shrink-0">•</span>
                        <span className="leading-relaxed">{concern}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default ProductAnalysisCard;
