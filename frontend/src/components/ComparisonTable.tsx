import React, { useState } from 'react';
import { Leaf, ArrowUpDown, ChevronDown, ChevronUp } from 'lucide-react';
import { ProductAnalysis, Alternative } from '../types/product';
import CarbonFootprintBadge from './CarbonFootprintBadge';

interface ComparisonTableProps {
  productAnalysis: ProductAnalysis['productAnalysis'];
  alternatives: Alternative[];
  bestChoiceName: string;
}

export const ComparisonTable: React.FC<ComparisonTableProps> = ({
  productAnalysis,
  alternatives,
  bestChoiceName,
}) => {
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);

  const originalRow = {
    name: productAnalysis.product,
    isOriginal: true,
    carbon: productAnalysis.estimatedCarbonFootprint,
    material: productAnalysis.material || 'N/A',
    country: 'Reference Product',
    shipping: 'Reference Product',
    packaging: 'Reference Product',
    recyclability: 'Reference Product',
    durability: 'Reference Product',
    price: 'Reference Product',
    rating: 'Reference Product',
    availability: 'Reference Product',
    rawCarbonKg: productAnalysis.carbonFootprintKg || 0
  };

  const altRows = alternatives.map(alt => ({
    name: alt.productName,
    isOriginal: false,
    carbon: alt.estimatedCarbonFootprint,
    material: alt.material,
    country: alt.manufacturingCountry,
    shipping: alt.estimatedShippingImpact,
    packaging: alt.packagingType,
    recyclability: alt.recyclability,
    durability: alt.durability,
    price: alt.averagePrice,
    rating: alt.customerRating,
    availability: alt.availability,
    rawCarbonKg: alt.carbonFootprintKg || 0
  }));

  // Sorting logic (simplified for demonstration)
  const sortedAltRows = [...altRows].sort((a, b) => {
    if (!sortConfig) return 0;
    
    // Sort by name
    if (sortConfig.key === 'name') {
      return sortConfig.direction === 'asc' 
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    }
    
    // Sort by carbon (using raw kg if available)
    if (sortConfig.key === 'carbon') {
      return sortConfig.direction === 'asc'
        ? a.rawCarbonKg - b.rawCarbonKg
        : b.rawCarbonKg - a.rawCarbonKg;
    }
    
    return 0;
  });

  const allRows = [originalRow, ...sortedAltRows];

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <ArrowUpDown className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
        <h3 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">Side-by-Side Comparison</h3>
      </div>

      <div className="glass-panel dark:dark-glass-panel rounded-2xl shadow-lg border-2 border-emerald-100/50 dark:border-emerald-800/30 overflow-hidden">
        {/* Horizontal Scroll Wrapper */}
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-gradient-to-r from-emerald-800 to-teal-800 dark:from-emerald-900 dark:to-teal-900 text-white font-bold text-xs uppercase tracking-wider">
                <th 
                  className="px-6 py-4 sticky left-0 z-10 bg-emerald-800 dark:bg-emerald-900 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.3)] cursor-pointer hover:bg-emerald-700 transition-colors"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center gap-1">
                    Product Name
                    {sortConfig?.key === 'name' && (
                      sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-4 py-4 cursor-pointer hover:bg-white/5 transition-colors"
                  onClick={() => handleSort('carbon')}
                >
                  <div className="flex items-center gap-1">
                    Carbon Footprint
                    {sortConfig?.key === 'carbon' && (
                      sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                    )}
                  </div>
                </th>
                <th className="px-4 py-4">Material</th>
                <th className="px-4 py-4">Manufacturing Origin</th>
                <th className="px-4 py-4">Shipping Impact</th>
                <th className="px-4 py-4">Packaging Type</th>
                <th className="px-4 py-4">Recyclability</th>
                <th className="px-4 py-4">Durability</th>
                <th className="px-4 py-4">Price</th>
                <th className="px-4 py-4">Rating</th>
                <th className="px-6 py-4">Availability</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              {allRows.map((row, idx) => {
                const isBestChoice = !row.isOriginal && row.name.toLowerCase() === bestChoiceName.toLowerCase();
                
                return (
                  <tr
                    key={idx}
                    className={`transition-all hover:bg-slate-50/80 dark:hover:bg-slate-800/80 group ${
                      row.isOriginal 
                        ? 'bg-slate-50/50 dark:bg-slate-800/30' 
                        : isBestChoice 
                        ? 'bg-emerald-50/50 dark:bg-emerald-900/20 font-medium' 
                        : 'bg-white dark:bg-slate-900/50'
                    }`}
                  >
                    {/* Name column - STICKY */}
                    <td className={`px-6 py-4 sticky left-0 z-10 transition-colors shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] dark:shadow-[2px_0_5px_-2px_rgba(0,0,0,0.5)] group-hover:bg-slate-50 dark:group-hover:bg-slate-800 ${
                      row.isOriginal 
                        ? 'bg-slate-50 dark:bg-slate-800/80' 
                        : isBestChoice 
                        ? 'bg-emerald-50 dark:bg-emerald-900/80 border-l-4 border-l-emerald-500' 
                        : 'bg-white dark:bg-slate-900'
                    }`}>
                      <div className="flex items-center gap-2">
                        {isBestChoice && (
                          <Leaf className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 fill-emerald-100 dark:fill-emerald-900" />
                        )}
                        <div>
                          <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate max-w-[200px]" title={row.name}>{row.name}</span>
                          {row.isOriginal && (
                            <span className="text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider mt-1 inline-block">
                              Original Product
                            </span>
                          )}
                          {isBestChoice && (
                            <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.5 rounded font-bold uppercase tracking-wider mt-1 inline-block shadow-sm">
                              Top Pick
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <CarbonFootprintBadge level={row.carbon} />
                    </td>
                    <td className="px-4 py-4 text-slate-700 dark:text-slate-300 font-medium">{row.material}</td>
                    <td className="px-4 py-4 text-slate-600 dark:text-slate-400">{row.country}</td>
                    <td className="px-4 py-4 text-slate-600 dark:text-slate-400">{row.shipping}</td>
                    <td className="px-4 py-4 text-slate-600 dark:text-slate-400">{row.packaging}</td>
                    <td className="px-4 py-4 text-slate-600 dark:text-slate-400">{row.recyclability}</td>
                    <td className="px-4 py-4 text-slate-600 dark:text-slate-400">{row.durability}</td>
                    <td className="px-4 py-4 font-bold text-slate-800 dark:text-slate-200">{row.price}</td>
                    <td className="px-4 py-4 text-slate-700 dark:text-slate-300">{row.rating}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{row.availability}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default ComparisonTable;
