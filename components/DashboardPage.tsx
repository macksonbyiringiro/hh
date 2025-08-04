
import React from 'react';
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
        <div className="max-w-3xl mx-auto">
          <FarmingTips translations={translations.farmingTips} language={language} />
        </div>
    </div>
  );
};

export default DashboardPage;
