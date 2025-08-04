import React, { useState, useMemo } from 'react';
import { Translations, User, FarmlandPlot } from '../../types';
import { INITIAL_FARMLAND_DATA, RWANDA_DISTRICTS } from '../../constants';
import InteractiveMap from './map/InteractiveMap';
import { RulerIcon } from '../icons/RulerIcon';
import { MountainIcon } from '../icons/MountainIcon';

type FindLandPageProps = {
    translations: Translations;
    users: Record<string, User>;
    setActiveView: (view: 'chat' | 'dashboard' | 'settings' | 'land') => void;
};

const PlotDetailCard: React.FC<{ plot: FarmlandPlot, owner?: User, translations: Translations['settings']['findLand'], onContact: () => void }> = ({ plot, owner, translations, onContact }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <img src={plot.imageUrl} alt={plot.locationName} className="w-full h-48 object-cover" />
        <div className="p-4">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">{plot.locationName}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{plot.district}</p>
            <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                    <RulerIcon className="w-5 h-5 text-green-500" />
                    <span><span className="font-semibold">{translations.size}:</span> {plot.size}</span>
                </div>
                <div className="flex items-center gap-3">
                    <MountainIcon className="w-5 h-5 text-green-500" />
                    <span><span className="font-semibold">{translations.soil}:</span> {plot.soilType}</span>
                </div>
                <div className="flex items-center gap-3 font-bold text-lg text-green-600 dark:text-green-400">
                    <span>{plot.price}</span>
                </div>
            </div>
            {owner && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button 
                        onClick={onContact}
                        className="w-full bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                    >
                        {translations.contactOwner} ({owner.name})
                    </button>
                </div>
            )}
        </div>
    </div>
);

const FindLandPage: React.FC<FindLandPageProps> = ({ translations, users, setActiveView }) => {
    const t = translations.settings.findLand;
    const [plots] = useState<FarmlandPlot[]>(INITIAL_FARMLAND_DATA);
    const [selectedPlotId, setSelectedPlotId] = useState<string | null>(plots.length > 0 ? plots[0].id : null);
    const [filterDistrict, setFilterDistrict] = useState<string>('all');

    const filteredPlots = useMemo(() => {
        if (filterDistrict === 'all') {
            return plots;
        }
        return plots.filter(p => p.district === filterDistrict);
    }, [plots, filterDistrict]);
    
    const selectedPlot = useMemo(() => {
        const plot = plots.find(p => p.id === selectedPlotId);
        if(plot) return plot;
        
        // if selected plot is filtered out, select the first of the filtered list
        if(filteredPlots.length > 0) {
            setSelectedPlotId(filteredPlots[0].id);
            return filteredPlots[0];
        }

        setSelectedPlotId(null);
        return undefined;
    }, [plots, selectedPlotId, filteredPlots]);
    
    const handleContactOwner = (ownerId: string) => {
        // This is a simplified navigation. A real app might pass state.
        alert(`Navigating to chat with owner. In a real app, this would open a chat window with user ${ownerId}.`);
        setActiveView('chat');
    };

    return (
        <div className="p-4 sm:p-6 md:p-8 space-y-6 sm:pb-20">
            <h1 className="text-2xl sm:text-3xl font-bold text-green-800 dark:text-green-300">
                {t.title}
            </h1>
            <div>
                <label htmlFor="district-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t.filterByDistrict}
                </label>
                <select
                    id="district-filter"
                    value={filterDistrict}
                    onChange={(e) => setFilterDistrict(e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600"
                >
                    <option value="all">{t.allDistricts}</option>
                    {RWANDA_DISTRICTS.map(district => (
                        <option key={district} value={district}>{district}</option>
                    ))}
                </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <InteractiveMap
                        plots={filteredPlots}
                        selectedPlotId={selectedPlotId}
                        onSelectPlot={setSelectedPlotId}
                    />
                </div>

                <div className="md:col-span-1 lg:col-span-1">
                    <h2 className="text-xl font-bold mb-2">{t.plotDetails}</h2>
                    {selectedPlot ? (
                        <PlotDetailCard 
                            plot={selectedPlot} 
                            owner={users[selectedPlot.ownerId]}
                            translations={t}
                            onContact={() => handleContactOwner(selectedPlot.ownerId)}
                        />
                    ) : (
                         <div className="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-800 rounded-lg p-8 text-center text-gray-500 dark:text-gray-400">
                            {t.noPlotsFound}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FindLandPage;