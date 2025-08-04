import React, { useState, useMemo } from 'react';
import { Card } from './Card';
import { MarketTrendData, Crop } from '../../types';
import { CROP_OPTIONS } from '../../constants';
import { BarChartIcon } from '../icons/BarChartIcon';

interface MarketTrendsProps {
    translations: {
        title: string;
        priceHistoryFor: string;
        selectCrop: string;
    };
    marketTrends: Record<Crop, MarketTrendData[]>;
}

export const MarketTrends: React.FC<MarketTrendsProps> = ({ translations, marketTrends }) => {
    const [selectedCrop, setSelectedCrop] = useState<Crop>(Crop.MAIZE);
    const data = marketTrends[selectedCrop];

    const maxPrice = useMemo(() => Math.max(...data.map(d => d.price), 0), [data]);

    return (
        <Card title={translations.title} fullHeight>
            <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-4">
                     <h3 className="font-semibold text-gray-600 dark:text-gray-300 text-sm">
                        {translations.priceHistoryFor} {selectedCrop}
                    </h3>
                    <select
                        value={selectedCrop}
                        onChange={(e) => setSelectedCrop(e.target.value as Crop)}
                        className="text-xs p-1 border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 focus:ring-green-500 focus:border-green-500"
                        aria-label={translations.selectCrop}
                    >
                        {CROP_OPTIONS.map(crop => <option key={crop} value={crop}>{crop}</option>)}
                    </select>
                </div>
                {data.length > 0 ? (
                    <div className="flex-grow flex items-end gap-2 border-l border-b border-gray-200 dark:border-gray-700 pl-4 pb-4 pr-2 relative">
                        {/* Y-Axis labels */}
                        <div className="absolute -left-2 top-0 bottom-4 flex flex-col justify-between text-xs text-gray-400">
                            <span>{maxPrice}</span>
                            <span>{Math.round(maxPrice / 2)}</span>
                            <span>0</span>
                        </div>
                        {data.map((d, index) => (
                            <div key={index} className="flex-1 flex flex-col items-center justify-end gap-1 group">
                                <span className="text-xs font-bold text-gray-700 dark:text-gray-200 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {d.price}
                                </span>
                                <div 
                                    className="w-full bg-green-300 dark:bg-green-700 rounded-t-sm hover:bg-green-400 dark:hover:bg-green-600 transition-colors"
                                    style={{ height: `${(d.price / maxPrice) * 100}%` }}
                                    title={`RWF ${d.price}`}
                                ></div>
                                <span className="text-xs text-gray-500 dark:text-gray-400">{d.month}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex-grow flex items-center justify-center text-gray-500">
                        <BarChartIcon className="w-12 h-12 text-gray-300 dark:text-gray-600" />
                    </div>
                )}
            </div>
        </Card>
    );
};
