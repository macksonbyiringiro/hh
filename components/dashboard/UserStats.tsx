import React from 'react';
import { Card } from './Card';
import { TagIcon } from '../icons/TagIcon';
import { UsersIcon } from '../icons/UsersIcon';

interface UserStatsProps {
    translations: {
        title: string;
        productsSold: string;
        connections: string;
    };
    productsSold: number;
    connections: number;
}

const StatItem: React.FC<{ icon: React.ReactNode; value: number; label: string; }> = ({ icon, value, label }) => (
    <div className="flex items-center gap-4">
        <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-full">
            {icon}
        </div>
        <div>
            <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{value}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        </div>
    </div>
);

export const UserStats: React.FC<UserStatsProps> = ({ translations, productsSold, connections }) => {
    return (
        <Card title={translations.title} fullHeight>
            <div className="flex flex-col justify-center gap-6 h-full">
                <StatItem 
                    icon={<TagIcon className="w-6 h-6 text-green-600 dark:text-green-400" />}
                    value={productsSold}
                    label={translations.productsSold}
                />
                <StatItem 
                    icon={<UsersIcon className="w-6 h-6 text-green-600 dark:text-green-400" />}
                    value={connections}
                    label={translations.connections}
                />
            </div>
        </Card>
    );
};
