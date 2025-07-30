import React from 'react';
import { WeatherCard } from './WeatherCard';
import { FarmingTips } from './FarmingTips';
import { Language, Translations } from '../types';

interface DashboardPageProps {
  translations: Translations;
  language: Language;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ translations, language }) => {
  return (
    <div className="p-4 sm:p-6 md:p-8">
       <h1 className="text-2xl sm:text-3xl font-bold text-green-800 dark:text-green-300 mb-6">
          {translations.dashboard.title}
        </h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2">
            <FarmingTips translations={translations.farmingTips} language={language} />
          </div>
          <div className="lg:col-span-1">
            <WeatherCard translations={translations.weather} />
          </div>
        </div>
    </div>
  );
};

export default DashboardPage;
