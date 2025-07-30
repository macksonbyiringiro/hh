
import React, { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { WeatherCard } from './components/WeatherCard';
import { FarmingTips } from './components/FarmingTips';
import { Language } from './types';
import { translations } from './constants';

const App: React.FC = () => {
  const [language, setLanguage] = useState<Language>(Language.EN);
  
  const currentTranslations = useMemo(() => translations[language], [language]);

  return (
    <div className="min-h-screen bg-green-50 font-sans text-gray-800">
      <Header 
        language={language} 
        setLanguage={setLanguage} 
        translations={currentTranslations.header} 
      />
      <main className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-green-800 mb-6">
          {currentTranslations.dashboard.title}
        </h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2">
            <FarmingTips translations={currentTranslations.farmingTips} language={language} />
          </div>
          <div className="lg:col-span-1">
            <WeatherCard translations={currentTranslations.weather} />
          </div>
        </div>
      </main>
      <footer className="text-center p-4 mt-8 text-sm text-gray-500 border-t border-gray-200">
        © 2024 Ubuhinzi360. All rights reserved.
      </footer>
    </div>
  );
};

export default App;
