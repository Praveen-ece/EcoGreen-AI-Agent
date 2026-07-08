import React from 'react';
import { ShieldCheck, MapPin, Truck, Box, Recycle, Activity, Globe, DollarSign, Star, ExternalLink } from 'lucide-react';
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
        <ShieldCheck className="w-6 h-6 text-emerald-600" />
        <h3 className="text-xl font-extrabold text-slate-800 tracking-tight">Eco-Friendlier Alternatives</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
        {alternatives.map((alt, index) => (
          <div
            key={index}
            className="glass-panel hover-lift rounded-2xl p-6 border border-emerald-100/50 shadow-md flex flex-col justify-between"
          >
            <div className="space-y-4">
              {/* Header: Name and Carbon Badge */}
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="space-y-1 flex-1 min-w-0">
                  <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded">
                    Alternative #{index + 1}
                  </span>
                  <h4 className="text-lg font-bold text-slate-800 leading-tight">
                    {alt.productName}
                  </h4>
                </div>
                <CarbonFootprintBadge level={alt.estimatedCarbonFootprint} />
                {alt.carbonFootprintKg > 0 && (
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                    {alt.carbonFootprintKg} kg CO₂e
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs text-slate-600">
                <div className="flex items-start gap-1.5">
                  <Box className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Material:</strong> {alt.material || 'N/A'}</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Origin:</strong> {alt.manufacturingCountry || 'N/A'}</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Shipping:</strong> {alt.estimatedShippingImpact || 'N/A'}</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <Box className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Packaging:</strong> {alt.packagingType || 'N/A'}</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <Recycle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Recycle:</strong> {alt.recyclability || 'N/A'}</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Durability:</strong> {alt.durability || 'N/A'}</span>
                </div>
              </div>

              {/* Text Reason for Recommendation */}
              <p className="text-sm text-slate-700 bg-emerald-50/40 border border-emerald-100/50 p-3.5 rounded-xl leading-relaxed">
                {alt.reasonForRecommendation}
              </p>
            </div>

            {/* Price, Rating and Web availability */}
            <div className="mt-5 pt-4 border-t border-slate-100 space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1 text-slate-500">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  Avg Price: <strong className="text-slate-800">{alt.averagePrice || 'N/A'}</strong>
                </span>
                <span className="flex items-center gap-1 text-slate-500">
                  <Star className="w-4 h-4 fill-amber-400 stroke-amber-500 text-amber-500" />
                  Rating: <strong className="text-slate-800">{alt.customerRating || 'N/A'}</strong>
                </span>
              </div>

              {/* Web listings — show full buttons only for best choice */}
              {(() => {
                const isBest = bestChoiceName &&
                  alt.productName.toLowerCase().trim() === bestChoiceName.toLowerCase().trim();

                if (isBest && alt.websiteAvailability && alt.websiteAvailability.length > 0) {
                  return (
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block flex items-center gap-1">
                        🏆 Best Choice — Shop Now
                      </span>
                      <div className="space-y-1.5">
                        {alt.websiteAvailability.map((web, idx) => (
                          <div
                            key={idx}
                            className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2.5"
                          >
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1.5">
                                <Globe className="w-3.5 h-3.5 text-emerald-600" />
                                <span className="font-bold text-xs text-slate-700">{web.website}</span>
                                <span className="text-[10px] text-slate-400">• {web.seller || 'Direct'}</span>
                              </div>
                              <p className="text-[10px] text-slate-500">
                                Delivered: {web.estimatedDelivery || 'N/A'} • Availability: {web.availability || 'In Stock'}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                              <span className="font-bold text-emerald-700 text-sm">{web.price}</span>
                              {web.link && (
                                <a
                                  href={web.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm"
                                >
                                  Verify on site
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }

                // Non-best cards — no shopping buttons
                return null;
              })()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default AlternativesGrid;
