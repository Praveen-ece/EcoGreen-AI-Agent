import React from 'react';
import { ShieldCheck, MapPin, Truck, Box, Recycle, Activity, Globe, DollarSign, Star, ExternalLink, ShoppingCart } from 'lucide-react';
import { Alternative } from '../types/product';
import CarbonFootprintBadge from './CarbonFootprintBadge';

interface AlternativesGridProps {
  alternatives: Alternative[];
  bestChoiceName?: string;
}

export const AlternativesGrid: React.FC<AlternativesGridProps> = ({ alternatives, bestChoiceName }) => {
  if (!alternatives || alternatives.length === 0) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
        <h3 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">Eco-Friendlier Alternatives</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
        {alternatives.map((alt, index) => {
          const isBest = bestChoiceName && alt.productName.toLowerCase().trim() === bestChoiceName.toLowerCase().trim();

          return (
            <div
              key={index}
              className={`glass-panel dark:dark-glass-panel rounded-3xl p-6 border-2 transition-all hover:-translate-y-1 hover:shadow-xl flex flex-col justify-between ${
                isBest 
                  ? 'border-emerald-300 dark:border-emerald-500 shadow-emerald-500/20 shadow-lg' 
                  : 'border-emerald-100/50 dark:border-emerald-800/30 hover:border-emerald-200 dark:hover:border-emerald-700/50'
              }`}
            >
              <div className="space-y-4">
                {/* Header: Name and Carbon Badge */}
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md ${
                        isBest 
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-sm'
                          : 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                      }`}>
                        {isBest ? '🏆 Top Pick' : `Alternative #${index + 1}`}
                      </span>
                    </div>
                    <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100 leading-tight">
                      {alt.productName}
                    </h4>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <CarbonFootprintBadge level={alt.estimatedCarbonFootprint} />
                    {alt.carbonFootprintKg > 0 && (
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                        {alt.carbonFootprintKg} kg CO₂e
                      </span>
                    )}
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-start gap-2">
                    <Box className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span><strong className="text-slate-700 dark:text-slate-200">Material:</strong> {alt.material || 'N/A'}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span><strong className="text-slate-700 dark:text-slate-200">Origin:</strong> {alt.manufacturingCountry || 'N/A'}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Truck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span><strong className="text-slate-700 dark:text-slate-200">Shipping:</strong> {alt.estimatedShippingImpact || 'N/A'}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Box className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span><strong className="text-slate-700 dark:text-slate-200">Packaging:</strong> {alt.packagingType || 'N/A'}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Recycle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span><strong className="text-slate-700 dark:text-slate-200">Recycle:</strong> {alt.recyclability || 'N/A'}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Activity className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span><strong className="text-slate-700 dark:text-slate-200">Durability:</strong> {alt.durability || 'N/A'}</span>
                  </div>
                </div>

                {/* Text Reason for Recommendation */}
                <p className="text-sm text-slate-700 dark:text-slate-300 bg-emerald-50/40 dark:bg-emerald-900/10 border border-emerald-100/50 dark:border-emerald-800/30 p-4 rounded-2xl leading-relaxed mt-2">
                  {alt.reasonForRecommendation}
                </p>
              </div>

              {/* Price, Rating and Web availability */}
              <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                    <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-xs">Est. Price:</span> <strong className="text-slate-800 dark:text-slate-200">{alt.averagePrice || 'N/A'}</strong>
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                    <Star className="w-4 h-4 fill-amber-400 stroke-amber-500 text-amber-500" />
                    <span className="text-xs">Rating:</span> <strong className="text-slate-800 dark:text-slate-200">{alt.customerRating || 'N/A'}</strong>
                  </span>
                </div>

                {/* Shopping Links on ALL alternatives */}
                {alt.websiteAvailability && alt.websiteAvailability.length > 0 && (
                  <div className="space-y-2 mt-4">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <ShoppingCart className="w-3.5 h-3.5" /> Available at
                    </span>
                    <div className="space-y-2">
                      {alt.websiteAvailability.map((web, idx) => (
                        <div
                          key={idx}
                          className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 transition-colors hover:border-emerald-300 dark:hover:border-emerald-600"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <Globe className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                              <span className="font-bold text-xs text-slate-700 dark:text-slate-200">{web.website}</span>
                              {web.seller && <span className="text-[10px] text-slate-400 dark:text-slate-500">• {web.seller}</span>}
                            </div>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
                              <span>Delivers: {web.estimatedDelivery || 'N/A'}</span>
                              <span className="w-1 h-1 bg-slate-300 dark:bg-slate-600 rounded-full"></span>
                              <span className={web.availability.toLowerCase().includes('stock') ? 'text-emerald-600 dark:text-emerald-400 font-medium' : ''}>{web.availability || 'In Stock'}</span>
                            </p>
                          </div>
                          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                            <span className="font-bold text-emerald-700 dark:text-emerald-400 text-sm">{web.price}</span>
                            {web.link && (
                              <a
                                href={web.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm ${
                                  isBest 
                                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20' 
                                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200'
                                }`}
                              >
                                View Deal
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default AlternativesGrid;
