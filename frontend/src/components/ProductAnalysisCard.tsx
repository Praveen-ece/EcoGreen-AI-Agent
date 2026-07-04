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
    <div className="glass-panel rounded-2xl shadow-lg border border-emerald-100/50 overflow-hidden">
      {/* Header section with category and badge */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-800 px-6 py-4 flex flex-wrap justify-between items-center gap-3">
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-emerald-300" />
          <h3 className="text-white font-bold text-lg tracking-wide uppercase">Original Product</h3>
        </div>
        <span className="bg-emerald-700/50 text-emerald-100 border border-emerald-600/30 text-xs px-3 py-1 rounded-full font-medium">
          Category: {analysis.category || 'General'}
        </span>
      </div>

      <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* Score circular gauge */}
        <div className="flex justify-center border-b md:border-b-0 md:border-r border-slate-100 pb-6 md:pb-0">
          <SustainabilityScoreGauge score={analysis.sustainabilityScore} />
        </div>

        {/* Product specs & carbon footprint badge */}
        <div className="md:col-span-2 space-y-5">
          <div>
            <h4 className="text-2xl font-extrabold text-slate-800 leading-tight">
              {analysis.product}
            </h4>
            {analysis.material && (
              <p className="text-sm font-medium text-slate-500 mt-1 flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-emerald-600" />
                Material: {analysis.material}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <CarbonFootprintBadge level={analysis.estimatedCarbonFootprint} />
          </div>

          {/* Environmental Concerns */}
          {analysis.environmentalConcerns && analysis.environmentalConcerns.length > 0 && (
            <div className="bg-rose-50/50 border border-rose-100 rounded-xl p-4 space-y-2.5">
              <div className="flex items-center gap-2 text-rose-800 font-bold text-xs uppercase tracking-wider">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                Environmental Concerns
              </div>
              <ul className="space-y-1.5">
                {analysis.environmentalConcerns.map((concern, idx) => (
                  <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                    <span className="text-rose-500 font-bold text-xs mt-0.5">•</span>
                    <span>{concern}</span>
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
