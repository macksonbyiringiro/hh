

import React, { useState, useEffect } from 'react';
import { Plot, User, Translations, Crop, Language } from '../../types';
import { CROP_OPTIONS } from '../../constants';
import { getYieldPrediction } from '../../services/geminiService';
import QRCodeModal from './QRCodeModal';
import { XIcon } from '../icons/XIcon';
import { BrainCircuitIcon } from '../icons/BrainCircuitIcon';
import { QrCodeIcon } from '../icons/QrCodeIcon';
import { NavigationIcon } from '../icons/NavigationIcon';

interface PlotDetailPanelProps {
    plot: Plot | null;
    onClose: () => void;
    translations: Translations['map'];
    users: Record<string, User>;
    onUpdatePlot: (plot: Plot) => void;
    language: Language;
    isOwner: boolean;
    onGetDirections: (plot: Plot) => void;
}

const LoadingSpinner: React.FC = () => (
    <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
);

const PlotDetailPanel: React.FC<PlotDetailPanelProps> = ({ plot, onClose, translations, users, onUpdatePlot, language, isOwner, onGetDirections }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedPlot, setEditedPlot] = useState<Plot | null>(plot);
    const [isQrModalOpen, setQrModalOpen] = useState(false);
    const [isPredicting, setIsPredicting] = useState(false);
    const [prediction, setPrediction] = useState<string | null>(null);

    useEffect(() => {
        setEditedPlot(plot);
        setIsEditing(false);
        setPrediction(null); // Reset prediction when plot changes
    }, [plot]);

    if (!plot || !editedPlot) return null;

    const owner = users[plot.ownerId