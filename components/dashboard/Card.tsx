import React from 'react';

interface CardProps {
    title: string;
    children: React.ReactNode;
    fullHeight?: boolean;
}

export const Card: React.FC<CardProps> = ({ title, children, fullHeight }) => {
    return (
        <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 flex flex-col ${fullHeight ? 'h-full' : ''}`}>
            <header className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-bold text-gray-700 dark:text-gray-200">{title}</h2>
            </header>
            <div className="p-4 flex-grow">
                {children}
            </div>
        </div>
    );
};
