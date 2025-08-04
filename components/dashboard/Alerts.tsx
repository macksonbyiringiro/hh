import React from 'react';
import { Card } from './Card';
import { Alert } from '../../types';
import { AlertTriangleIcon } from '../icons/AlertTriangleIcon';
import { InfoIcon } from '../icons/InfoIcon';
import { MegaphoneIcon } from '../icons/MegaphoneIcon';

interface AlertsProps {
    translations: {
        title: string;
        noAlerts: string;
    };
    alerts: Alert[];
}

const AlertIcon: React.FC<{ type: Alert['type'] }> = ({ type }) => {
    switch (type) {
        case 'warning':
            return <AlertTriangleIcon className="w-6 h-6 text-yellow-500" />;
        case 'announcement':
            return <MegaphoneIcon className="w-6 h-6 text-blue-500" />;
        case 'info':
            return <InfoIcon className="w-6 h-6 text-cyan-500" />;
        default:
            return <InfoIcon className="w-6 h-6 text-gray-500" />;
    }
};

const getBackgroundColor = (type: Alert['type']) => {
    switch (type) {
        case 'warning':
            return 'bg-yellow-50 dark:bg-yellow-900/20';
        case 'announcement':
            return 'bg-blue-50 dark:bg-blue-900/20';
        case 'info':
            return 'bg-cyan-50 dark:bg-cyan-900/20';
        default:
            return 'bg-gray-50 dark:bg-gray-700/50';
    }
}

export const Alerts: React.FC<AlertsProps> = ({ translations, alerts }) => {
    const sortedAlerts = [...alerts].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <Card title={translations.title}>
            {sortedAlerts.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                    <p>{translations.noAlerts}</p>
                </div>
            ) : (
                <ul className="space-y-3">
                    {sortedAlerts.map(alert => (
                        <li key={alert.id} className={`flex items-start gap-3 p-3 rounded-lg ${getBackgroundColor(alert.type)}`}>
                            <div className="flex-shrink-0 pt-1">
                                <AlertIcon type={alert.type} />
                            </div>
                            <div>
                                <h4 className="font-semibold text-sm text-gray-800 dark:text-gray-200">{alert.title}</h4>
                                <p className="text-xs text-gray-600 dark:text-gray-400">{alert.description}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </Card>
    );
};
