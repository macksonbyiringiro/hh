
import React from 'react';
import { Language } from '../types';
import { PlantIcon } from './icons/PlantIcon';

interface HeaderProps {
    language: Language;
    setLanguage: (lang: Language) => void;
    translations: {
        title: string;
        language: string;
    };
}

export const Header: React.FC<HeaderProps> = ({ language, setLanguage, translations }) => {
    return (
        <header className="bg-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <PlantIcon className="h-8 w-8 text-green-600" />
                        <span className="ml-3 text-2xl font-bold text-green-700">{translations.title}</span>
                    </div>
                    <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-600 mr-3 hidden sm:block">{translations.language}</span>
                        <div className="relative">
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value as Language)}
                                className="appearance-none bg-gray-100 border border-gray-300 rounded-md py-2 pl-3 pr-8 text-sm leading-5
                                 text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500
                                 transition duration-150 ease-in-out"
                            >
                                <option value={Language.EN}>English</option>
                                <option value={Language.RW}>Kinyarwanda</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};
