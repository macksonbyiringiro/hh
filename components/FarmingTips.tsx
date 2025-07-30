
import React, { useState, useCallback } from 'react';
import { Crop, Language } from '../types';
import { CROP_OPTIONS } from '../constants';
import { generateFarmingTipStream } from '../services/geminiService';
import { TipDisplay } from './TipDisplay';

interface FarmingTipsProps {
    translations: {
        title: string;
        selectCrop: string;
        getTips: string;
        generating: string;
        tipIntro: string;
        error: string;
    };
    language: Language;
}

const LoadingSpinner: React.FC = () => (
    <div className="flex items-center justify-center space-x-2">
        <div className="w-4 h-4 rounded-full animate-pulse bg-green-600"></div>
        <div className="w-4 h-4 rounded-full animate-pulse bg-green-600" style={{ animationDelay: '0.2s' }}></div>
        <div className="w-4 h-4 rounded-full animate-pulse bg-green-600" style={{ animationDelay: '0.4s' }}></div>
    </div>
);


export const FarmingTips: React.FC<FarmingTipsProps> = ({ translations, language }) => {
    const [selectedCrop, setSelectedCrop] = useState<Crop>(Crop.MAIZE);
    const [tip, setTip] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleGetTips = useCallback(async () => {
        if (!process.env.API_KEY) {
            setError("API Key is not configured. This feature is disabled.");
            return;
        }
        
        setIsLoading(true);
        setError(null);
        setTip('');

        try {
            const stream = await generateFarmingTipStream(selectedCrop, language);
            for await (const chunk of stream) {
                setTip(prev => prev + chunk.text);
            }
        } catch (err) {
            setError(translations.error);
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [selectedCrop, language, translations.error]);

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 border border-gray-100">
            <h2 className="text-xl sm:text-2xl font-bold text-green-800 mb-4">{translations.title}</h2>
            <div className="space-y-6">
                <div>
                    <label htmlFor="crop-select" className="block text-sm font-medium text-gray-700 mb-2">
                        {translations.selectCrop}
                    </label>
                    <select
                        id="crop-select"
                        value={selectedCrop}
                        onChange={(e) => setSelectedCrop(e.target.value as Crop)}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md shadow-sm"
                    >
                        {CROP_OPTIONS.map(crop => (
                            <option key={crop} value={crop}>{crop}</option>
                        ))}
                    </select>
                </div>
                <button
                    onClick={handleGetTips}
                    disabled={isLoading}
                    className="w-full flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-150 ease-in-out"
                >
                    {isLoading ? <LoadingSpinner/> : translations.getTips}
                </button>

                {isLoading && !tip && (
                     <p className="text-center text-gray-500 animate-pulse">{translations.generating}</p>
                )}

                {error && <p className="text-center text-red-600 bg-red-100 p-3 rounded-md">{error}</p>}
                
                {tip && (
                     <div className="mt-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">{translations.tipIntro} {selectedCrop}:</h3>
                        <TipDisplay content={tip} />
                     </div>
                )}
            </div>
        </div>
    );
};
