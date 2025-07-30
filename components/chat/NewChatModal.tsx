import React from 'react';
import { User, Translations } from '../../types';
import { XIcon } from '../icons/XIcon';
import { PlantIcon } from '../icons/PlantIcon';

interface NewChatModalProps {
    isOpen: boolean;
    onClose: () => void;
    users: User[];
    onStartChat: (userId: string) => void;
    translations: Translations['chat'];
}

const UserListItem: React.FC<{ user: User; onStartChat: (userId: string) => void; translations: Translations['chat'] }> = ({ user, onStartChat, translations }) => (
    <div className="flex items-center p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
        <div className={`w-10 h-10 rounded-full ${user.avatarColor} flex items-center justify-center text-white font-bold text-lg mr-4`}>
            {user.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
            <p className="font-semibold text-gray-800 dark:text-gray-100">{user.name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{user.role}</p>
        </div>
        <button
            onClick={() => onStartChat(user.id)}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-gray-800 transition-colors"
        >
            {translations.startChat}
        </button>
    </div>
);

const NewChatModal: React.FC<NewChatModalProps> = ({ isOpen, onClose, users, onStartChat, translations }) => {
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="new-chat-title"
        >
            <div 
                className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 id="new-chat-title" className="text-xl font-bold text-gray-800 dark:text-gray-100">{translations.newChatTitle}</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700" aria-label="Close">
                        <XIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                    </button>
                </header>
                <div className="flex-1 overflow-y-auto p-2">
                    {users.length > 0 ? (
                        <ul className="space-y-1">
                            {users.map(user => (
                                <li key={user.id}>
                                    <UserListItem user={user} onStartChat={onStartChat} translations={translations} />
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="text-center p-8 text-gray-500 dark:text-gray-400">
                             <PlantIcon className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                            <p>{translations.noUsers}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NewChatModal;