import React from 'react';
import { Translations, User, Crop } from '../../types';
import { CROP_OPTIONS } from '../../constants';
import { XIcon } from '../icons/XIcon';
import { PlusIcon } from '../icons/PlusIcon';

interface FilterPanelProps {
    isOpen: boolean;
    onClose: () => void;
    translations: Translations['map'];
    activeCropFilter: string;
    setActiveCropFilter: (value: string) => void;
    activeFarmerFilter: string;
    setActiveFarmerFilter: (value: string) => void;
    activeView: 'streets' | 'satellite';
    setActiveView: (view: 'streets' | 'satellite') => void;
    onAddPlotClick: () => void;
    farmers: User[];
}

const FilterPanel: React.FC<FilterPanelProps> = ({
    isOpen,
    onClose,
    translations: t,
    activeCropFilter,
    setActiveCropFilter,
    activeFarmerFilter,
    setActiveFarmerFilter,
    activeView,
    setActiveView,
    onAddPlotClick,
    farmers,
}) => {
    return (
        <>
            {/* Backdrop */}
            {isOpen && <div className="fixed inset-0 bg-black bg-opacity-30 z-10" onClick={onClose}></div>}

            <div 
                className={`fixed top-0 left-0 h-full w-full max-w-xs bg-white dark:bg-gray-800 shadow-2xl transform transition-transform duration-300 ease-in-out z-20 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="filter-panel-title"
            >
                <div className="flex flex-col h-full">
                    <header className="p-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
                        <h2 id="filter-panel-title" className="text-xl font-bold">Filters &amp; Layers</h2>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700" aria-label="Close filters">
                            <XIcon className="w-6 h-6" />
                        </button>
                    </header>
                    <div className="flex-1 p-6 overflow-y-auto space-y-6">
                        
                        {/* Add Plot Section */}
                        <div>
                            <button 
                                onClick={onAddPlotClick} 
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-md bg-green-600 hover:bg-green-700 text-white font-semibold transition-colors"
                            >
                                <PlusIcon className="w-5 h-5"/>
                                {t.addPlot}
                            </button>
                        </div>

                        {/* View Toggle Section */}
                        <div className="space-y-2">
                             <h3 className="font-semibold text-gray-700 dark:text-gray-300">Map View</h3>
                             <div className="bg-gray-100 dark:bg-gray-700 p-1 rounded-lg flex gap-1">
                                <button onClick={() => setActiveView('streets')} className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all ${activeView === 'streets' ? 'bg-white dark:bg-gray-800 shadow text-green-600' : 'hover:bg-gray-200 dark:hover:bg-gray-600'}`}>{t.streetView}</button>
                                <button onClick={() => setActiveView('satellite')} className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all ${activeView === 'satellite' ? 'bg-white dark:bg-gray-800 shadow text-green-600' : 'hover:bg-gray-200 dark:hover:bg-gray-600'}`}>{t.satelliteView}</button>
                            </div>
                        </div>

                        {/* Filters Section */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-gray-700 dark:text-gray-300">Filters</h3>
                             <div>
                                <label htmlFor="crop-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.filterByCrop}</label>
                                 <select id="crop-filter" value={activeCropFilter} onChange={e => setActiveCropFilter(e.target.value)} className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200">
                                     <option value="all">{t.allCrops}</option>
                                     {CROP_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                                 </select>
                             </div>
                             <div>
                                <label htmlFor="farmer-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.filterByFarmer}</label>
                                 <select id="farmer-filter" value={activeFarmerFilter} onChange={e => setActiveFarmerFilter(e.target.value)} className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200">
                                     <option value="all">{t.allFarmers}</option>
                                     {farmers.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                                 </select>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </>
    );
};

export default FilterPanel;
