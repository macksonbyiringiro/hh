import React from 'react';
import { FarmlandPlot } from '../../../types';
import { MapPinIcon } from '../../icons/MapPinIcon';

interface InteractiveMapProps {
    plots: FarmlandPlot[];
    selectedPlotId: string | null;
    onSelectPlot: (id: string) => void;
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({ plots, selectedPlotId, onSelectPlot }) => {
    return (
        <div className="relative w-full aspect-square bg-green-50 dark:bg-gray-700 rounded-lg shadow-inner overflow-hidden">
            {/* Base Map SVG */}
            <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
                {/* Simplified polygon for Rwanda's shape */}
                <path 
                    d="M55,5 L75,15 L85,40 L90,60 L70,80 L50,95 L30,85 L10,65 L5,45 L15,20 L35,10 Z" 
                    className="fill-green-200 dark:fill-green-900/50 stroke-green-400 dark:stroke-green-700"
                    strokeWidth="0.5"
                />
                 {/* Lake Kivu */}
                 <path
                    d="M5,45 C-5,55 0,65 10,65 L15,60 C5,60 5,50 5,45 Z"
                    className="fill-blue-300 dark:fill-blue-800/60"
                 />
            </svg>
            
            {/* Plot Pins */}
            <div className="absolute inset-0 w-full h-full">
                {plots.map(plot => (
                    <button
                        key={plot.id}
                        className="absolute transform -translate-x-1/2 -translate-y-full transition-all duration-200 ease-out"
                        style={{ left: `${plot.coords.x}%`, top: `${plot.coords.y}%` }}
                        onClick={() => onSelectPlot(plot.id)}
                        aria-label={`Select plot ${plot.locationName}`}
                    >
                        <MapPinIcon 
                            className={`
                                w-6 h-6 drop-shadow-lg
                                ${selectedPlotId === plot.id 
                                    ? 'text-red-500 scale-125' 
                                    : 'text-orange-500 hover:text-red-500'
                                }
                            `} 
                        />
                        {selectedPlotId === plot.id && (
                           <span className="absolute bottom-full mb-1 w-max max-w-xs px-2 py-1 text-xs text-white bg-black/70 rounded-md -translate-x-1/2 left-1/2">
                               {plot.locationName}
                           </span>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default InteractiveMap;