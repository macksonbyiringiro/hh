
import React from 'react';

interface TipDisplayProps {
    content: string;
}

export const TipDisplay: React.FC<TipDisplayProps> = ({ content }) => {
    // A simple markdown to HTML converter for lists and bold text
    const renderContent = () => {
        const lines = content.split('\n');
        return lines.map((line, index) => {
            line = line.trim();
            if (line.startsWith('* ') || line.startsWith('- ')) {
                return (
                    <li key={index} className="flex items-start">
                        <span className="text-green-500 mr-3 mt-1">&#10003;</span>
                        <span dangerouslySetInnerHTML={{ __html: line.substring(2).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                    </li>
                );
            }
            if (line.trim() !== '') {
                 return <p key={index} dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />;
            }
            return null;
        });
    };

    return (
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <ul className="space-y-2 text-gray-700">
                {renderContent()}
            </ul>
        </div>
    );
};
