

import React, { useState, useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, Polyline } from 'react-leaflet';
import L, { LatLng } from 'leaflet';
import { Translations, Plot, User, Crop, Language } from '../../types';
import { CROP_OPTIONS } from '../../constants';
import AddPlotModal from './AddPlotModal';
import PlotDetailPanel from './PlotDetailPanel';
import FilterPanel from './FilterPanel'; // Import new component
import DirectionsModal from './DirectionsModal';
import { XIcon } from '../icons/XIcon';
import { PlusIcon } from '../icons/PlusIcon';
import { MinusIcon } from '../icons/MinusIcon';
import { FilterIcon } from '../icons/FilterIcon';


interface MapPageProps {
    translations: Translations;
    plots: Plot[];
    users: Record<string, User>;
    setPlots: React.Dispatch<React.SetStateAction<Plot[]>>;
    language: Language;
    currentUser: User;
}

// Custom DivIcon for plot markers
const createPlotIcon = (crop: Crop) => {
    const cropEmojiMap: Record<Crop, string> = {
        [Crop.MAIZE]: '🌽',
        [Crop.BEANS]: '🫘',
        [Crop.POTATOES]: '🥔',
        [Crop.CASSAVA]: '🍠',
        [Crop.COFFEE]: '☕',
        [Crop.TEA]: '🍵',
    };
    const html = `<div class="w-8 h-8 rounded-full flex items-center justify-center text-xl bg-white shadow-lg border-2 border-green-500">${cropEmojiMap[crop] || '📍'}</div>`;
    return new L.DivIcon({
        html,
        className: 'bg-transparent border-none',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
    });
};

const AddPlotMarker: React.FC<{position: LatLng}> = ({position}) => {
    const icon = new L.DivIcon({
        html: `<div class="w-8 h-8 rounded-full flex items-center justify-center text-xl bg-blue-500 text-white shadow-lg border-2 border-white animate-pulse"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg></div>`,
        className: 'bg-transparent border-none',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
    });
    return <Marker position={position} icon={icon} />;
};

const MapPage: React.FC<MapPageProps> = ({ translations, plots, users, setPlots, language, currentUser }) => {
    const t = translations.map;
    const [map, setMap] = useState<L.Map | null>(null);

    // State
    const [activeCropFilter, setActiveCropFilter] = useState<string>('all');
    const [activeFarmerFilter, setActiveFarmerFilter] = useState<string>('all');
    const [activeView, setActiveView] = useState<'streets' | 'satellite'>('streets');
    const [isAddingPlot, setIsAddingPlot] = useState(false);
    const [newPlotPosition, setNewPlotPosition] = useState<LatLng | null>(null);
    const [isPlotModalOpen, setIsPlotModalOpen] = useState(false);
    const [selectedPlot, setSelectedPlot] = useState<Plot | null>(null);
    const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

    // Directions State
    const [directionsTargetPlot, setDirectionsTargetPlot] = useState<Plot | null>(null);
    const [isDirectionsModalOpen, setIsDirectionsModalOpen] = useState(false);
    const [directionsRoute, setDirectionsRoute] = useState<L.LatLngExpression[] | null>(null);

    const farmers = useMemo(() => Object.values(users).filter(u => u.role === 'Farmer' || u.role === 'You'), [users]);

    const filteredPlots = useMemo(() => {
        return plots.filter(plot => {
            const cropMatch = activeCropFilter === 'all' || plot.crop === activeCropFilter;
            const farmerMatch = activeFarmerFilter === 'all' || plot.ownerId === activeFarmerFilter;
            return cropMatch && farmerMatch;
        });
    }, [plots, activeCropFilter, activeFarmerFilter]);

    const MapEventsHandler = () => {
        useMapEvents({
            click(e: L.LeafletMouseEvent) {
                if (isAddingPlot) {
                    setNewPlotPosition(e.latlng);
                    setIsPlotModalOpen(true);
                } else {
                    // Close panels when clicking on the map
                    setSelectedPlot(null);
                    setIsFilterPanelOpen(false);
                }
            },
        });
        return null;
    };

    const handleSavePlot = (newPlot: Omit<Plot, 'id' | 'coordinates'>) => {
        if (!newPlotPosition) return;
        const plotToAdd: Plot = {
            id: `plot-${Date.now()}`,
            ...newPlot,
            ownerId: currentUser.id,
            coordinates: [newPlotPosition.lat, newPlotPosition.lng],
        };
        setPlots(prev => [...prev, plotToAdd]);
        setIsPlotModalOpen(false);
        setIsAddingPlot(false);
        setNewPlotPosition(null);
    };

    const handleUpdatePlot = (updatedPlot: Plot) => {
        setPlots(prevPlots => prevPlots.map(p => p.id === updatedPlot.id ? updatedPlot : p));
        setSelectedPlot(updatedPlot);
    };
    
    const handleGetDirections = (plot: Plot) => {
        setDirectionsTargetPlot(plot);
        setIsDirectionsModalOpen(true);
        setDirectionsRoute(null); // Clear previous route
    };
    
    const handleCloseDirections = () => {
        setIsDirectionsModalOpen(false);
        setDirectionsRoute(null); // Clear route on close
        // Do not set target plot to null immediately to avoid modal content flicker on close animation
        setTimeout(() => setDirectionsTargetPlot(null), 300);
    };


    useEffect(() => {
        if (map && selectedPlot) {
            map.flyTo(selectedPlot.coordinates, 15);
        }
    }, [selectedPlot, map]);
    
    const handleZoomIn = () => {
        if (map) map.zoomIn();
    };

    const handleZoomOut = () => {
        if (map) map.zoomOut();
    };

    const handleAddPlotClick = () => {
        setIsAddingPlot(true);
        setIsFilterPanelOpen(false);
    }

    const handleCancelAddPlot = () => {
        setIsAddingPlot(false);
        setNewPlotPosition(null);
    }


    return (
        <div className="relative w-full h-full">
            <MapContainer center={[-1.9444, 30.0619]} zoom={11} ref={setMap} className="w-full h-full z-0" zoomControl={false}>
                {activeView === 'streets' ? (
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                ) : (
                    <TileLayer
                         attribution='&copy; <a href="https://www.esri.com/">Esri</a>, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                         url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                    />
                )}

                {filteredPlots.map(plot => (
                    <Marker key={plot.id} position={plot.coordinates} icon={createPlotIcon(plot.crop)} eventHandlers={{ click: (e) => { setSelectedPlot(plot); L.DomEvent.stopPropagation(e); } }} />
                ))}

                {directionsRoute && (
                    <Polyline pathOptions={{ color: '#2563eb', weight: 5, opacity: 0.8 }} positions={directionsRoute} />
                )}

                <MapEventsHandler />
                {isAddingPlot && newPlotPosition && <AddPlotMarker position={newPlotPosition} />}
            </MapContainer>
            
            {/* Toolbar */}
            <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
                <div className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-lg flex flex-col gap-2">
                    {isAddingPlot ? (
                         <button onClick={handleCancelAddPlot} className='p-2 rounded-md bg-red-500 text-white' title={t.cancel}>
                            <XIcon className="w-6 h-6"/>
                        </button>
                    ) : (
                        <button onClick={(e) => { setIsFilterPanelOpen(true); L.DomEvent.stopPropagation(e.nativeEvent); }} className='p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700' title={t.filterByCrop}>
                            <FilterIcon className="w-6 h-6" />
                        </button>
                    )}
                </div>
            </div>
            
            <FilterPanel 
                isOpen={isFilterPanelOpen}
                onClose={() => setIsFilterPanelOpen(false)}
                translations={t}
                activeCropFilter={activeCropFilter}
                setActiveCropFilter={setActiveCropFilter}
                activeFarmerFilter={activeFarmerFilter}
                setActiveFarmerFilter={setActiveFarmerFilter}
                activeView={activeView}
                setActiveView={setActiveView}
                onAddPlotClick={handleAddPlotClick}
                farmers={farmers}
            />


            {/* Control Group (bottom-right) */}
            <div className="absolute bottom-3 right-3 z-10 flex flex-col items-end gap-2">
                {/* Zoom Controls */}
                <div className="bg-white dark:bg-gray-800 p-1 rounded-lg shadow-lg flex flex-col">
                    <button onClick={handleZoomIn} className="p-2 rounded-t-md hover:bg-gray-100 dark:hover:bg-gray-700" title="Zoom In">
                        <PlusIcon className="w-5 h-5"/>
                    </button>
                    <div className="h-[1px] bg-gray-200 dark:bg-gray-700"></div>
                    <button onClick={handleZoomOut} className="p-2 rounded-b-md hover:bg-gray-100 dark:hover:bg-gray-700" title="Zoom Out">
                        <MinusIcon className="w-5 h-5"/>
                    </button>
                </div>
            </div>
            
            {isAddingPlot && (
                <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-black px-4 py-2 rounded-full shadow-lg text-sm font-semibold animate-pulse z-10">
                    {t.clickToPlace}
                </div>
            )}
            
            <AddPlotModal
                isOpen={isPlotModalOpen}
                onClose={() => {
                    setIsPlotModalOpen(false);
                    if (isAddingPlot) handleCancelAddPlot();
                }}
                onSave={handleSavePlot}
                translations={t}
                currentUser={currentUser}
            />

            <PlotDetailPanel
                plot={selectedPlot}
                onClose={() => setSelectedPlot(null)}
                translations={t}
                users={users}
                onUpdatePlot={handleUpdatePlot}
                language={language}
                isOwner={selectedPlot?.ownerId === currentUser.id}
                onGetDirections={handleGetDirections}
            />

            {directionsTargetPlot && (
                <DirectionsModal
                    isOpen={isDirectionsModalOpen}
                    onClose={handleCloseDirections}
                    plot={directionsTargetPlot}
                    translations={t}
                    language={language}
                    onRouteGenerated={setDirectionsRoute}
                />
            )}
        </div>
    );
};

export default MapPage;
