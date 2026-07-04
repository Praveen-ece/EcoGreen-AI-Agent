import React from 'react';
import { Leaf, ArrowUpDown } from 'lucide-react';
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
  // Construct rows list
  // The first row is the original product
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
  }));

  const allRows = [originalRow, ...altRows];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <ArrowUpDown className="w-6 h-6 text-emerald-600" />
        <h3 className="text-xl font-extrabold text-slate-800 tracking-tight">Side-by-Side Comparison</h3>
      </div>

      <div className="glass-panel rounded-2xl shadow-lg border border-emerald-100/50 overflow-hidden">
        {/* Horizontal Scroll Wrapper */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white font-bold text-xs uppercase tracking-wider">
                <th className="px-6 py-4 rounded-tl-2xl">Product Name</th>
                <th className="px-4 py-4">Carbon Footprint</th>
                <th className="px-4 py-4">Material</th>
                <th className="px-4 py-4">Manufacturing Origin</th>
                <th className="px-4 py-4">Shipping Impact</th>
                <th className="px-4 py-4">Packaging Type</th>
                <th className="px-4 py-4">Recyclability</th>
                <th className="px-4 py-4">Durability</th>
                <th className="px-4 py-4">Price</th>
                <th className="px-4 py-4">Rating</th>
                <th className="px-6 py-4 rounded-tr-2xl">Availability</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {allRows.map((row, idx) => {
                const isBestChoice = !row.isOriginal && row.name.toLowerCase() === bestChoiceName.toLowerCase();
                
                return (
                  <tr
                    key={idx}
                    className={`transition-colors hover:bg-slate-50/50 ${
                      row.isOriginal 
                        ? 'bg-slate-50/30' 
                        : isBestChoice 
                        ? 'bg-emerald-50/50 border-l-4 border-emerald-600 font-medium' 
                        : 'bg-white'
                    }`}
                  >
                    {/* Name column */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {isBestChoice && (
                          <Leaf className="w-4 h-4 text-emerald-600 flex-shrink-0 fill-emerald-100" />
                        )}
                        <div>
                          <span className="font-semibold text-slate-800 block">{row.name}</span>
                          {row.isOriginal && (
                            <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                              Current Product
                            </span>
                          )}
                          {isBestChoice && (
                            <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                              Best Choice
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Carbon Footprint */}
                    <td className="px-4 py-4">
                      <CarbonFootprintBadge level={row.carbon} />
                    </td>

                    {/* Material */}
                    <td className="px-4 py-4 text-slate-700 font-medium">{row.material}</td>

                    {/* Country of origin */}
                    <td className="px-4 py-4 text-slate-600">{row.country}</td>

                    {/* Shipping Impact */}
                    <td className="px-4 py-4 text-slate-600">{row.shipping}</td>

                    {/* Packaging */}
                    <td className="px-4 py-4 text-slate-600">{row.packaging}</td>

                    {/* Recyclability */}
                    <td className="px-4 py-4 text-slate-600">{row.recyclability}</td>

                    {/* Durability */}
                    <td className="px-4 py-4 text-slate-600">{row.durability}</td>

                    {/* Price */}
                    <td className="px-4 py-4 font-bold text-slate-800">{row.price}</td>

                    {/* Rating */}
                    <td className="px-4 py-4 text-slate-700">{row.rating}</td>

                    {/* Availability */}
                    <td className="px-6 py-4 text-slate-600">{row.availability}</td>
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
