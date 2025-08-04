import React from 'react';
import { Plot, Translations } from '../../types';
import { XIcon } from '../icons/XIcon';

interface QRCodeModalProps {
    isOpen: boolean;
    onClose: () => void;
    plot: Plot | null;
    translations: Translations['map'];
}

// Simple static QR code SVG for demonstration purposes. 
// A real app would use a library to generate this from the plot ID.
const SimpleQRCode: React.FC<{ value: string }> = ({ value }) => (
    <div className="bg-white p-4 rounded-lg shadow-md inline-block">
        <svg width="200" height="200" viewBox="0 0 256 256" >
            <path d="M0 0h256v256H0z" fill="#fff" />
            <path d="M40 40h60v60H40zm10 10v40h40V50zm80-10h60v60h-60zm10 10v40h40V50zM40 150h60v60H40zm10 10v40h40v-40z" fill="#000" />
            <path d="M140 150h10v10h-10zm20 0h10v10h-10zm-10 10h10v10h-10zm-10 10h10v10h-10zm30 0h10v10h-10zm10 0h10v10h-10zm-20 10h10v10h-10zm-10 20h10v10h-10zm20 0h10v10h-10zm10-10h10v10h-10zm-30-10h10v10h-10zm40 0h10v10h-10zM180 150h20v10h-20z" fill="#000" />
        </svg>
    </div>
);


const QRCodeModal: React.FC<QRCodeModalProps> = ({ isOpen, onClose, plot, translations }) => {
    if (!isOpen || !plot) return null;
    
    // In a real app, this would be a unique URL to the plot's page.
    const qrValue = `ubuhinzi360://plot/${plot.id}`; 

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 text-center max-w-sm w-full" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold">{translations.qrCodeTitle}</h3>
                     <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700" aria-label="Close">
                        <XIcon className="w-5 h-5" />
                    </button>
                </header>
                <div className="mb-4">
                    <SimpleQRCode value={qrValue} />
                </div>
                <p className="font-semibold text-xl">{plot.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{translations.scanQrCode}</p>
            </div>
        </div>
    );
};

export default QRCodeModal;
