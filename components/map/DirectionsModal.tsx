
import React, { useState, useEffect } from 'react';
import { Plot, Language, Translations } from '../../types';
import { getAiDirections } from '../../services/geminiService';
import { TipDisplay } from '../TipDisplay';
import { XIcon } from '../icons/XIcon';
import { NavigationIcon } from '../icons/NavigationIcon';

interface DirectionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    plot: Plot;
    language: Language;
    translations: Translations['map'];
}

const LoadingSpinner: React.FC = () => (
    <div className="w-6 h-6 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
);

const LoadingIndicator: React.FC<{text: string}> = ({text}) => (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <div className="w-8 h-8 border-4 border-t-transparent border-green-500 rounded-full animate-spin"></div>
        <p className="text-gray-500 dark:text-gray-400">{text}</p>
    </div>
);


const DirectionsModal: React.FC<DirectionsModalProps> = ({ isOpen, onClose, plot, language, translations }) => {
    type Status = 'idle' | 'generating' | 'success' | 'error';
    const [startLocation, setStartLocation] = useState('');
    const [status, setStatus] = useState<Status>('idle');
    const [directions, setDirections] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleGenerateDirections = async () => {
        if (!startLocation.trim()) {
            setError(translations.startLocationRequiredError);
            setStatus('error');
            return;
        }

        setStatus('generating');
        setError(null);
        setDirections(null);

        try {
            const end: [number, number] = plot.coordinates;
            const result = await getAiDirections(startLocation, end, plot.name, language);
            setDirections(result);
            setStatus('success');
        } catch (e) {
            setError(translations.directionsError);
            setStatus('error');
        }
    };

    // Reset state when modal is closed or plot changes
    useEffect(() => {
        if (!isOpen) {
            setTimeout(() => { // Allow animation to finish
                setStatus('idle');
                setStartLocation('');
                setDirections(null);
                setError(null);
            }, 300);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const googleMapsUrl = `https://www.google.com/maps/dir/${encodeURIComponent(startLocation)}/${plot.coordinates.join(',')}`;

    const renderContent = () => {
        switch (status) {
            case 'generating':
                return <LoadingIndicator text={translations.generatingDirections} />;
            case 'error':
                return <div className="p-4 text-center text-red-600 bg-red-50 dark:bg-red-900/50 rounded-lg">{error}</div>;
            case 'success':
                return directions ? <TipDisplay content={directions} /> : <div className="p-4 text-center">{translations.directionsError}</div>;
            case 'idle':
            default:
                return (
                    <div className="text-center p-4 text-gray-500 dark:text-gray-400">
                        <p>{`Enter your starting point above to get AI-powered directions to "${plot.name}".`}</p>
                    </div>
                );
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={onClose} role="dialog" aria-modal="true">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="p-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold">{translations.directionsTo.replace('{0}', plot.name)}</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700" aria-label="Close">
                        <XIcon className="w-6 h-6" />
                    </button>
                </header>
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="start-location" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            {translations.startLocation}
                        </label>
                        <input
                            type="text"
                            id="start-location"
                            value={startLocation}
                            onChange={(e) => setStartLocation(e.target.value)}
                            placeholder={translations.startLocationPlaceholder}
                            className="w-full p-2 text-base bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                        />
                    </div>

                    <button
                        onClick={handleGenerateDirections}
                        disabled={status === 'generating' || !startLocation.trim()}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-md bg-green-600 hover:bg-green-700 text-white font-semibold transition-colors disabled:bg-gray-400 dark:disabled:bg-gray-500"
                    >
                        {status === 'generating' ? <LoadingSpinner /> : <NavigationIcon className="w-5 h-5"/>}
                        {translations.getDirections}
                    </button>
                    
                    <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                        {renderContent()}
                    </div>
                </div>
                {startLocation.trim() && (
                    <footer className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                        <a 
                            href={googleMapsUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors"
                        >
                            <NavigationIcon className="w-5 h-5"/>
                            {translations.openInGoogleMaps}
                        </a>
                    </footer>
                )}
            </div>
        </div>
    );
};

export default DirectionsModal;