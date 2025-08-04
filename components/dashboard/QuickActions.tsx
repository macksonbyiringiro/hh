import React from 'react';
import { PlusIcon } from '../icons/PlusIcon';
import { ChatIcon } from '../icons/ChatIcon';
import { SearchIcon } from '../icons/SearchIcon';

interface QuickActionsProps {
    translations: {
        addProduct: string;
        sendMessage: string;
        search: string;
    };
    setActiveView: (view: 'dashboard' | 'chat' | 'settings') => void;
}

const ActionButton: React.FC<{ icon: React.ReactNode; label: string; onClick: () => void; }> = ({ icon, label, onClick }) => (
    <button 
        onClick={onClick}
        className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-2 p-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-md transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75">
        {icon}
        <span>{label}</span>
    </button>
);


export const QuickActions: React.FC<QuickActionsProps> = ({ translations, setActiveView }) => {
    
    const handleAddProduct = () => {
        alert('Add Product feature is coming soon!');
    };

    const handleSearch = () => {
        alert('Search feature is coming soon!');
    };

    return (
        <div className="grid grid-cols-3 gap-4">
            <ActionButton icon={<PlusIcon className="w-6 h-6"/>} label={translations.addProduct} onClick={handleAddProduct} />
            <ActionButton icon={<ChatIcon className="w-6 h-6"/>} label={translations.sendMessage} onClick={() => setActiveView('chat')} />
            <ActionButton icon={<SearchIcon className="w-6 h-6"/>} label={translations.search} onClick={handleSearch} />
        </div>
    );
};
