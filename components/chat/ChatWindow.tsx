import React, { useRef, useEffect, useMemo } from 'react';
import { Message, User, Translations, Conversation, ChatSettings, MessagePayload } from '../../types';
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
    onSendMessage: (payload: MessagePayload) => void;
    translations: Translations['chat'];
    currentUser: User;
    users: Record<string, User>;
    isAiTyping?: boolean;
    onBack: () => void;
    chatSettings: ChatSettings;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ conversation, messages, onSendMessage, translations, currentUser, users, isAiTyping, onBack, chatSettings }) => {
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
        
    const backgroundStyle = useMemo(() => {
        const { backgroundType, backgroundValue } = chatSettings;
        if (backgroundType === 'color') {
            return { backgroundColor: backgroundValue };
        }
        if (backgroundType === 'gradient') {
            return { backgroundImage: backgroundValue };
        }
        if (backgroundType === 'preset' || backgroundType === 'upload') {
            return { backgroundImage: `url(${backgroundValue})` };
        }
        return {};
    }, [chatSettings]);

    const hasImageBackground = chatSettings.backgroundType === 'preset' || chatSettings.backgroundType === 'upload';


    return (
        <div className="relative flex flex-col flex-1 h-full shadow-lg overflow-hidden">
            {/* Background Layer */}
            <div 
                className="absolute inset-0 w-full h-full bg-cover bg-center"
                style={backgroundStyle}
            >
                {hasImageBackground && (
                    <div className="absolute inset-0 w-full h-full bg-white/85 dark:bg-black/60 backdrop-blur-sm"></div>
                )}
            </div>
            
            {/* Content Layer */}
            <div className="relative z-10 flex flex-col flex-1 h-full bg-transparent">
                <header className="flex items-center p-3 sm:p-4 border-b border-gray-200/50 dark:border-gray-700/50 bg-white/70 dark:bg-gray-800/70 backdrop-blur-md">
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
                    <div className="space-y-1">
                        {messages.map((msg) => (
                            <MessageBubble key={msg.id} message={msg} currentUser={currentUser} users={users} />
                        ))}
                        {isAiTyping && <TypingIndicator text={translations.typing} />}
                        <div ref={messagesEndRef} />
                    </div>
                </main>
                <footer className="p-2 sm:p-4 border-t border-gray-200/50 dark:border-gray-700/50 bg-white/70 dark:bg-gray-800/70 backdrop-blur-md">
                    <ChatInput onSendMessage={onSendMessage} translations={translations} />
                </footer>
            </div>
        </div>
    );
};

export default ChatWindow;