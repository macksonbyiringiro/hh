import React, { useRef, useEffect } from 'react';
import { Message, User, Translations, Conversation } from '../../types';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import { UsersIcon } from '../icons/UsersIcon';
import { CURRENT_USER_ID } from '../../constants';
import TypingIndicator from './TypingIndicator';
import { PlantIcon } from '../icons/PlantIcon';
import { ArrowLeftIcon } from '../icons/ArrowLeftIcon';

interface ChatWindowProps {
    conversation: Conversation;
    messages: Message[];
    onSendMessage: (text: string) => void;
    translations: Translations['chat'];
    currentUser: User;
    users: Record<string, User>;
    isAiTyping?: boolean;
    onBack: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ conversation, messages, onSendMessage, translations, currentUser, users, isAiTyping, onBack }) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };



    useEffect(() => {
        scrollToBottom();
    }, [messages, isAiTyping]);

    const otherParticipants = conversation.participants.filter(p => p !== CURRENT_USER_ID);
    const displayUser = users[otherParticipants[0]];

    const chatName = conversation.type === 'group' ? conversation.name : displayUser.name;
    const chatAvatar = conversation.type === 'group' 
        ? <UsersIcon className="w-8 h-8 text-green-500" /> 
        : (
            displayUser.avatarUrl ? (
                <img src={displayUser.avatarUrl} alt={displayUser.name} className="w-8 h-8 rounded-full object-cover" />
            ) :
            displayUser.role === 'AI Assistant' 
            ? <PlantIcon className="w-8 h-8 text-green-500" />
            : <div className={`w-8 h-8 rounded-full ${displayUser.avatarColor} flex items-center justify-center text-white font-bold`}>{displayUser.name.charAt(0)}</div>
        );

    const subTitle = conversation.type === 'group' 
        ? `${conversation.participants.length} ${translations.participants}` 
        : (displayUser.isOnline ? 'Online' : 'Offline');

    return (
        <div className="flex flex-col flex-1 h-full bg-white dark:bg-gray-800 shadow-lg border-gray-200 dark:border-gray-700">
            <header className="flex items-center p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
                <button onClick={onBack} className="mr-2 p-2 rounded-full md:hidden hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" aria-label="Back to chats">
                    <ArrowLeftIcon className="w-6 h-6" />
                </button>
                {chatAvatar}
                <div className="ml-4">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">{chatName}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{subTitle}</p>
                </div>
            </header>
            <main className="flex-1 p-4 overflow-y-auto">
                <div className="space-y-4">
                    {messages.map((msg) => (
                        <MessageBubble key={msg.id} message={msg} currentUser={currentUser} users={users} />
                    ))}
                    {isAiTyping && <TypingIndicator text={translations.typing} />}
                    <div ref={messagesEndRef} />
                </div>
            </main>
            <footer className="p-2 sm:p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <ChatInput onSendMessage={onSendMessage} placeholder={translations.inputPlaceholder} />
            </footer>
        </div>
    );
};

export default ChatWindow;