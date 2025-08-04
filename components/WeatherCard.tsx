import React from 'react';
import { SunIcon } from '../icons/SunIcon';
import { CloudIcon } from '../icons/CloudIcon';

interface WeatherCardProps {
    translations: {
        title: string;
        location: string;
        description: string;
        humidity: string;
        wind: string;
    }
}

export const WeatherCard: React.FC<WeatherCardProps> = ({ translations }) => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-700 dark:text-gray-200 mb-4">{translations.title}</h2>
            <div className="flex items-center justify-between mb-4">
                <div>
                    <p className="text-4xl font-bold text-gray-800 dark:text-gray-100">24°C</p>
                    <p className="text-gray-500 dark:text-gray-400">{translations.location}</p>
                </div>
                <div className="relative">
                    <SunIcon className="h-16 w-16 text-yellow-400" />
                    <CloudIcon className="h-12 w-12 text-gray-400 absolute -bottom-2 -right-2" />
                </div>
            </div>
            <p className="text-center text-lg font-medium text-gray-600 dark:text-gray-300 mb-6">{translations.description}</p>
            <div className="flex justify-around text-center border-t dark:border-gray-700 pt-4">
                <div>
                    <p className="font-bold text-gray-800 dark:text-gray-100">75%</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{translations.humidity}</p>
                </div>
                <div>
                    <p className="font-bold text-gray-800 dark:text-gray-100">12 km/h</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{translations.wind}</p>
                </div>
            </div>
        </div>
    );
};
