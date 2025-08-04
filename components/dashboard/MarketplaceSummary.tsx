import React from 'react';
import { Card } from './Card';
import { Product, User } from '../../types';
import { TrendingUpIcon } from '../icons/TrendingUpIcon';
import { TrendingDownIcon } from '../icons/TrendingDownIcon';

interface MarketplaceSummaryProps {
    translations: {
        title: string;
        newlyAdded: string;
        marketMovers: string;
        viewAll: string;
    };
    products: Product[];
    users: Record<string, User>;
}

export const MarketplaceSummary: React.FC<MarketplaceSummaryProps> = ({ translations, products, users }) => {
    const newProducts = [...products].sort((a,b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()).slice(0, 2);
    
    // Mock data for market movers
    const movers = [
        { name: 'Coffee', trend: 'up', change: '+5.2%' },
        { name: 'Beans', trend: 'up', change: '+2.1%' },
        { name: 'Potatoes', trend: 'down', change: '-1.5%' },
    ];

    return (
        <Card title={translations.title}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h3 className="font-semibold text-gray-600 dark:text-gray-300 mb-2">{translations.newlyAdded}</h3>
                    <div className="space-y-3">
                        {newProducts.map(product => (
                            <div key={product.id} className="flex items-center gap-3">
                                <img src={product.imageUrl} alt={product.name} className="w-12 h-12 object-cover rounded-lg bg-gray-200" />
                                <div>
                                    <p className="font-semibold text-sm text-gray-800 dark:text-gray-200">{product.name}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">RWF {product.price} / {product.unit}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                 <div>
                    <h3 className="font-semibold text-gray-600 dark:text-gray-300 mb-2">{translations.marketMovers}</h3>
                     <div className="space-y-3">
                        {movers.map(mover => (
                            <div key={mover.name} className="flex items-center justify-between">
                                <span className="font-semibold text-sm text-gray-800 dark:text-gray-200">{mover.name}</span>
                                <div className={`flex items-center gap-1 text-xs font-bold ${mover.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                                    {mover.trend === 'up' ? <TrendingUpIcon className="w-4 h-4" /> : <TrendingDownIcon className="w-4 h-4" />}
                                    <span>{mover.change}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-center">
                <a href="#" className="text-sm font-semibold text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300">
                    {translations.viewAll} &rarr;
                </a>
            </div>
        </Card>
    );
};
