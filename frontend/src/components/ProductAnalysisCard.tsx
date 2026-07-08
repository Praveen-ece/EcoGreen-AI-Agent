import React from 'react';
import { Package, Tag, ShieldAlert } from 'lucide-react';
import { ProductAnalysis } from '../types/product';
import SustainabilityScoreGauge from './SustainabilityScoreGauge';
import CarbonFootprintBadge from './CarbonFootprintBadge';

interface ProductAnalysisCardProps {
  analysis: ProductAnalysis['productAnalysis'];
}

export const ProductAnalysisCard: React.FC<ProductAnalysisCardProps> = ({ analysis }) => {
  return (
    <div className="glass-panel rounded-2xl shadow-lg border border-emerald-100/50 overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-800 px-5 py-4 flex flex-wrap justify-between items-center gap-2">
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-emerald-300" />
          <h3 className="text-white font-bold text-base tracking-wide uppercase">Original Product</h3>
        </div>
        <span className="bg-emerald-700/50 text-emerald-100 border border-emerald-600/30 text-xs px-2.5 py-1 rounded-full font-medium">
          {analysis.category || 'General'}
        </span>
      </div>

      {/* Body — gauge centered, then details below */}
      <div className="flex-1 flex flex-col p-5 gap-5">
        {/* Gauge centered */}
        <div className="flex justify-center">
          <SustainabilityScoreGauge score={analysis.sustainabilityScore} />
        </div>

        {/* Divider */}
        <div className="border-t border-slate-100" />

        {/* Product name + material + badge */}
        <div className="space-y-3">
          <div>
            <h4 className="text-xl font-extrabold text-slate-800 leading-tight break-words">
              {analysis.product}
            </h4>
            {analysis.material && (
              <p className="text-sm font-medium text-slate-500 mt-1 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                {analysis.material}
              </p>
            )}
          </div>

          <CarbonFootprintBadge level={analysis.estimatedCarbonFootprint} />

          {/* CO₂ kg estimate */}
          {analysis.carbonFootprintKg > 0 && (
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">CO₂ Estimate</span>
              <span className="text-sm font-extrabold text-slate-800">{analysis.carbonFootprintKg} kg</span>
              <span className="text-[10px] text-slate-400">CO₂e lifecycle</span>
            </div>
          )}

          {/* Environmental Concerns */}
          {analysis.environmentalConcerns && analysis.environmentalConcerns.length > 0 && (
            <div className="bg-rose-50/60 border border-rose-100 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center gap-1.5 text-rose-800 font-bold text-xs uppercase tracking-wider">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                Environmental Concerns
              </div>
              <ul className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {analysis.environmentalConcerns.map((concern, idx) => (
                  <li key={idx} className="text-xs text-slate-700 flex items-start gap-1.5">
                    <span className="text-rose-500 font-bold mt-0.5 flex-shrink-0">•</span>
                    <span className="leading-relaxed">{concern}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default ProductAnalysisCard;
