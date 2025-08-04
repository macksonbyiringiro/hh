
import React, { useState } from 'react';
import { Translations, Crop, Plot, User } from '../../types';
import { CROP_OPTIONS } from '../../constants';
import { XIcon } from '../icons/XIcon';

interface AddPlotModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (newPlot: Omit<Plot, 'id' | 'coordinates' | 'ownerId'>) => void;
    translations: Translations['map'];
    currentUser: User;
}

const AddPlotModal: React.FC<AddPlotModalProps> = ({ isOpen, onClose, onSave, translations, currentUser }) => {
    const [name, setName] = useState(`${currentUser.name}'s New Plot`);
    const [crop, setCrop] = useState<Crop>(Crop.MAIZE);
    const [size, setSize] = useState<number>(1);
    const [farmingStage, setFarmingStage] = useState<Plot['farmingStage']>('Fallow');

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ name, crop, size, farmingStage });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <header className="p-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold">{translations.addPlotTitle}</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700" aria-label="Close">
                        <XIcon className="w-6 h-6" />
                    </button>
                </header>
                <form onSubmit={handleSave} className="p-6 space-y-4">
                    <div>
                        <label htmlFor="plot-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{translations.plotName}</label>
                        <input type="text" id="plot-name" value={name} onChange={e => setName(e.target.value)} required className="mt-1 w-full p-2 rounded-md bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600" />
                    </div>
                    <div>
                        <label htmlFor="crop-type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{translations.crop}</label>
                        <select id="crop-type" value={crop} onChange={e => setCrop(e.target.value as Crop)} className="mt-1 w-full p-2 rounded-md bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600">
                           {CROP_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="plot-size" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{translations.size} ({translations.hectares})</label>
                        <input type="number" id="plot-size" value={size} min="0.1" step="0.1" onChange={e => setSize(parseFloat(e.target.value))} required className="mt-1 w-full p-2 rounded-md bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600" />
                    </div>
                     <div>
                        <label htmlFor="farming-stage" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{translations.farmingStage}</label>
                        <select id="farming-stage" value={farmingStage} onChange={e => setFarmingStage(e.target.value as any)} className="mt-1 w-full p-2 rounded-md bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600">
                           {['Planting', 'Growing', 'Harvesting', 'Fallow'].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                         <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium rounded-md bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500">{translations.cancel}</button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700">{translations.savePlot}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddPlotModal;
