import React from 'react';
import { Language } from '../types';
import { PlantIcon } from './icons/PlantIcon';
import { MoonIcon } from './icons/MoonIcon';
import { SunIcon } from './icons/SunIcon';
import { DashboardIcon } from './icons/DashboardIcon';
import { ChatIcon } from './icons/ChatIcon';
import { SettingsIcon } from './icons/SettingsIcon';

interface HeaderProps {
    language: Language;
    setLanguage: (lang: Language) => void;
    translations: {
        title: string;
        language: string;
        dashboard: string;
        chat: string;
        settings: string;
    };
    activeView: 'dashboard' | 'chat' | 'settings';
    setActiveView: (view: 'dashboard' | 'chat' | 'settings') => void;
    theme: 'light' | 'dark';
    toggleTheme: () => void;
    pendingRequestCount: number;
}

const NavItem: React.FC<{
  label: string;
  isActive: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  badgeCount?: number;
}> = ({ label, isActive, onClick, icon, badgeCount = 0 }) => (
    <button
        onClick={onClick}
        className={`relative flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${
            isActive
                ? 'bg-green-100 text-green-700 dark:bg-green-800 dark:text-white'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
        }`}
        aria-current={isActive ? 'page' : undefined}
    >
        {icon}
        <span className="ml-2">{label}</span>
        {badgeCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                {badgeCount}
            </span>
        )}
    </button>
);

const MobileNavItem: React.FC<{
  label: string;
  isActive: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  badgeCount?: number;
}> = ({ label, isActive, onClick, icon, badgeCount = 0 }) => (
     <button
        onClick={onClick}
        className={`relative flex flex-col items-center justify-center w-full py-1 rounded-md text-xs font-medium transition-colors duration-150 ${
            isActive
                ? 'text-green-600 dark:text-green-400'
                : 'text-gray-500 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
        }`}
        aria-current={isActive ? 'page' : undefined}
    >
        {icon}
        <span className="mt-1">{label}</span>
        {badgeCount > 0 && (
            <span className="absolute top-0 right-1/2 translate-x-4 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                {badgeCount}
            </span>
        )}
    </button>
);


export const Header: React.FC<HeaderProps> = ({ language, setLanguage, translations, activeView, setActiveView, theme, toggleTheme, pendingRequestCount }) => {
    return (
        <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <PlantIcon className="h-8 w-8 text-green-600" />
                        <span className="ml-3 text-2xl font-bold text-green-700 dark:text-green-400">{translations.title}</span>
                    </div>

                    <div className="hidden sm:flex items-center space-x-4">
                        <NavItem label={translations.dashboard} isActive={activeView === 'dashboard'} onClick={() => setActiveView('dashboard')} icon={<DashboardIcon className="h-5 w-5" />} />
                        <NavItem label={translations.chat} isActive={activeView === 'chat'} onClick={() => setActiveView('chat')} icon={<ChatIcon className="h-5 w-5" />} />
                        <NavItem label={translations.settings} isActive={activeView === 'settings'} onClick={() => setActiveView('settings')} icon={<SettingsIcon className="h-5 w-5" />} badgeCount={pendingRequestCount}/>
                    </div>

                    <div className="flex items-center">
                         <button
                            onClick={toggleTheme}
                            type="button"
                            className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-800 focus:ring-green-500 mr-4"
                            aria-label="Toggle theme"
                        >
                            {theme === 'light' ? <MoonIcon className="h-6 w-6" /> : <SunIcon className="h-6 w-6" />}
                        </button>
                        <div className="relative">
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value as Language)}
                                className="appearance-none bg-gray-100 border border-gray-300 rounded-md py-2 pl-3 pr-8 text-sm leading-5
                                 text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500
                                 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-600
                                 transition duration-150 ease-in-out"
                                aria-label={translations.language}
                            >
                                <option value={Language.EN}>English</option>
                                <option value={Language.RW}>Kinyarwanda</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-400">
                                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
             {/* Bottom nav for mobile */}
            <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t dark:border-gray-700 flex justify-around p-1 z-20">
                 <MobileNavItem label={translations.dashboard} isActive={activeView === 'dashboard'} onClick={() => setActiveView('dashboard')} icon={<DashboardIcon className="h-6 w-6" />} />
                 <MobileNavItem label={translations.chat} isActive={activeView === 'chat'} onClick={() => setActiveView('chat')} icon={<ChatIcon className="h-6 w-6" />} />
                 <MobileNavItem label={translations.settings} isActive={activeView === 'settings'} onClick={() => setActiveView('settings')} icon={<SettingsIcon className="h-6 w-6" />} badgeCount={pendingRequestCount}/>
            </div>
        </header>
    );
};