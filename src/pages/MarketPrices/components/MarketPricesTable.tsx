import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, YAxis } from 'recharts';
import { useApp } from '../../../context/AppContext';

interface MarketPricesTableProps {
  filteredPrices: any[];
  setSelectedCrop: (crop: string) => void;
}

export const MarketPricesTable: React.FC<MarketPricesTableProps> = ({
  filteredPrices,
  setSelectedCrop,
}) => {
  const { language } = useApp();
  
  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
      <div className="p-4 border-b border-stone-100 flex items-center justify-between">
        <h3 className="font-bold text-stone-900 text-sm">
          {language === 'hi' ? 'सक्रिय मंडी दर सूची' : 'Verified APMC Mandi Comparison Table'}
        </h3>
        <span className="text-xs text-stone-500 font-mono">UPDATED: TODAY, 09:00 AM</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase font-bold text-[10px] tracking-wider">
            <tr>
              <th className="py-3 px-4">Crop & Variety</th>
              <th className="py-3 px-4">APMC Mandi</th>
              <th className="py-3 px-4">Min/Max Price</th>
              <th className="py-3 px-4">Modal Price</th>
              <th className="py-3 px-4">7-Day Trend</th>
              <th className="py-3 px-4">Daily Arrival</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 font-medium">
            {filteredPrices.map((item) => (
              <tr key={item.id} className="hover:bg-stone-50/80 transition-colors">
                <td className="py-3.5 px-4">
                  <div className="font-bold text-stone-900">{item.crop}</div>
                  <div className="text-[11px] text-stone-500">{item.variety}</div>
                </td>

                <td className="py-3.5 px-4">
                  <div className="font-bold text-stone-800 flex items-center gap-1.5">
                    <span>{item.mandi}</span>
                    {item.isBestMandi && (
                      <span className="text-[9px] font-bold bg-emerald-600 text-white px-1.5 py-0.5 rounded">
                        BEST RATE
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-stone-500">{item.district}, {item.state}</div>
                </td>

                <td className="py-3.5 px-4">
                  <div className="font-mono text-stone-500 text-xs">
                    ₹{item.minPricePerQuintal} - ₹{item.maxPricePerQuintal}
                  </div>
                </td>

                <td className="py-3.5 px-4">
                  <div className="flex flex-col gap-1">
                    <span className="font-mono font-bold text-stone-900 text-sm">
                      ₹{item.modalPricePerQuintal}
                    </span>
                    <div className={`flex items-center gap-0.5 text-[10px] font-sans font-bold px-1.5 py-0.5 rounded-md w-fit ${
                      item.priceChangeDailyPct >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                    }`}>
                      {item.priceChangeDailyPct >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      <span>{item.priceChangeDailyPct > 0 ? `+${item.priceChangeDailyPct}%` : `${item.priceChangeDailyPct}%`}</span>
                    </div>
                  </div>
                </td>

                <td className="py-3.5 px-4 w-32">
                  <div className="h-10 w-24">
                    {item.priceTrend && item.priceTrend.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={item.priceTrend}>
                          <YAxis domain={['dataMin', 'dataMax']} hide />
                          <Line
                            type="monotone"
                            dataKey="price"
                            stroke={item.priceChangeDailyPct >= 0 ? '#10b981' : '#f43f5e'}
                            strokeWidth={2.5}
                            dot={false}
                            isAnimationActive={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="text-[10px] text-stone-400">No Data</div>
                    )}
                  </div>
                </td>

                <td className="py-3.5 px-4 text-stone-700 text-xs">
                  {item.dailyArrivalQuintals ? item.dailyArrivalQuintals.toLocaleString() : (item.arrivalVolumeQuintals ? item.arrivalVolumeQuintals.toLocaleString() : 0)} Qtl
                </td>

                <td className="py-3.5 px-4 text-right">
                  <button
                    onClick={() => {
                      setSelectedCrop(item.crop);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="px-3 py-1.5 bg-green-700 hover:bg-green-800 text-white text-[11px] font-bold rounded-xl transition-all cursor-pointer"
                  >
                    View Chart
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
