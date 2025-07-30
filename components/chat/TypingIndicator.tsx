import React from 'react';
import { PlantIcon } from '../icons/PlantIcon';

interface TypingIndicatorProps {
    text: string;
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ text }) => {
    return (
        <div className="flex items-end gap-2 justify-start">
             <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                    <PlantIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div className="px-4 py-3 rounded-2xl rounded-bl-none bg-gray-200 dark:bg-gray-700">
                <div className="flex items-center space-x-1">
                    <span className="sr-only">{text}</span>
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse"></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
            </div>
        </div>
    );
};

export default TypingIndicator;
