import React, { useState, useCallback, useMemo } from 'react';
import { Translations, Language, Message, User, Conversation } from '../../types';
import { CURRENT_USER_ID, AI_USER_ID } from '../../constants';
import ChatWindow from './ChatWindow';
import NewChatModal from './NewChatModal';
import { PlantIcon } from '../icons/PlantIcon';
import { getAiChatResponse, isConfigured } from '../../services/geminiService';
import { SearchIcon } from '../icons/SearchIcon';
import { PlusIcon } from '../icons/PlusIcon';

interface ChatPageProps {
  translations: Translations;
  language: Language;
  users: Record<string, User>;
  conversations: Conversation[];
  setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>;
}

const Avatar: React.FC<{ user: User }> = ({ user }) => (
    <div className="relative flex-shrink-0">
        {user.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.name} className="w-12 h-12 rounded-full object-cover" />
        ) : (
            <div className={`w-12 h-12 rounded-full ${user.avatarColor} flex items-center justify-center text-white font-bold text-xl`}>
                {user.id === AI_USER_ID ? <PlantIcon className="w-6 h-6"/> : user.name.charAt(0).toUpperCase()}
            </div>
        )}
        {user.isOnline && user.id !== 'group' && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>}
    </div>
);

const ConversationListItem: React.FC<{
    conversation: Conversation;
    isActive: boolean;
    onClick: () => void;
    users: Record<string, User>;
}> = ({ conversation, isActive, onClick, users }) => {
    const currentUser = users[CURRENT_USER_ID];
    const otherParticipants = conversation.participants.filter(p => p !== currentUser.id);
    const displayUser = users[otherParticipants[0]];
    
    if (!displayUser) return null; // Safety check if a user in a convo was deleted

    const name = conversation.type === 'group' ? conversation.name : displayUser.name;
    const avatarUser = conversation.type === 'group' ? ({ id: 'group', name: name!, role: 'Farmer', avatarColor: 'bg-gray-500', status: '', profileLinkToken: '', linkExpiry: 'never', isLinkActive: false, connectionRequests: [], rejectedUserIds: [] } as User) : displayUser;
    
    const lastMessage = conversation.messages[conversation.messages.length - 1];
    const snippet = lastMessage ? `${lastMessage.senderId === currentUser.id ? 'You: ' : ''}${lastMessage.text}` : 'No messages yet';

    return (
        <button onClick={onClick} className={`w-full text-left p-3 flex items-center space-x-4 rounded-lg transition-colors duration-150 ${isActive ? 'bg-green-100 dark:bg-green-900/50' : 'hover:bg-gray-100 dark:hover:bg-gray-700/50'}`}>
            <Avatar user={avatarUser} />
            <div className="flex-1 overflow-hidden">
                <div className="flex justify-between items-center">
                    <p className="font-semibold text-gray-800 dark:text-gray-100 truncate">{name}</p>
                    {lastMessage && <p className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">{new Date(lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{snippet}</p>
            </div>
        </button>
    );
};

const WelcomePlaceholder: React.FC<{ translations: Translations['chat'] }> = ({ translations }) => (
    <div className="hidden md:flex flex-col items-center justify-center h-full text-center bg-gray-50 dark:bg-gray-800/50 p-8">
        <PlantIcon className="w-24 h-24 text-green-500/50 dark:text-green-500/30 mb-4" />
        <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200">{translations.welcomeTitle}</h2>
        <p className="mt-2 max-w-sm text-gray-500 dark:text-gray-400">{translations.welcomeMessage}</p>
    </div>
);

const ChatPage: React.FC<ChatPageProps> = ({ translations, language, users, conversations, setConversations }) => {
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
    const [isAiTyping, setIsAiTyping] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);

    const handleStartNewConversation = useCallback((userId: string) => {
        const existingConvo = conversations.find(c => c.type === 'dm' && c.participants.includes(userId));
        if (existingConvo) {
            setActiveConversationId(existingConvo.id);
            setIsNewChatModalOpen(false);
            return;
        }

        const newConversation: Conversation = {
            id: `convo-${userId}-${Date.now()}`,
            type: 'dm',
            participants: [CURRENT_USER_ID, userId],
            messages: [{
                id: `msg-${Date.now()}`,
                senderId: 'system',
                text: translations.chat.chatStartedSystemMessage.replace('{0}', users[userId].name),
                timestamp: new Date().toISOString()
            }],
        };
        
        setConversations(prev => [newConversation, ...prev]);
        setActiveConversationId(newConversation.id);
        setIsNewChatModalOpen(false);

    }, [conversations, translations.chat.chatStartedSystemMessage, users, setConversations]);

    const activeConversation = useMemo(() => {
        return conversations.find(c => c.id === activeConversationId);
    }, [activeConversationId, conversations]);

    const handleSendMessage = useCallback(async (text: string) => {
        if (!activeConversation) return;

        const newMessage: Message = {
            id: `msg-${Date.now()}`,
            text,
            senderId: CURRENT_USER_ID,
            timestamp: new Date().toISOString(),
        };

        const updatedConversations = conversations.map(c =>
            c.id === activeConversationId ? { ...c, messages: [...c.messages, newMessage] } : c
        );
        setConversations(updatedConversations);

        if (activeConversation.participants.includes(AI_USER_ID) && isConfigured()) {
            setIsAiTyping(true);
            const currentMessages = updatedConversations.find(c => c.id === activeConversationId)!.messages;
            
            try {
                const aiResponseText = await getAiChatResponse(activeConversation.id, currentMessages, AI_USER_ID, language);
                const aiMessage: Message = {
                    id: `msg-${Date.now() + 1}`,
                    text: aiResponseText,
                    senderId: AI_USER_ID,
                    timestamp: new Date().toISOString(),
                };

                setConversations(prev => prev.map(c =>
                    c.id === activeConversationId ? { ...c, messages: [...c.messages, aiMessage] } : c
                ));
            } catch (error) {
                console.error("Failed to get AI response", error);
                 const errorMessage: Message = {
                    id: `msg-${Date.now() + 1}`,
                    text: "Sorry, I couldn't connect. Please check your connection or API key.",
                    senderId: AI_USER_ID,
                    timestamp: new Date().toISOString(),
                };
                 setConversations(prev => prev.map(c =>
                    c.id === activeConversationId ? { ...c, messages: [...c.messages, errorMessage] } : c
                ));
            } finally {
                setIsAiTyping(false);
            }
        }
    }, [activeConversation, conversations, activeConversationId, language, setConversations]);

    const filteredConversations = useMemo(() => {
        if (!searchQuery) return conversations;
        return conversations.filter(c => {
             const otherUserId = c.participants.find(p => p !== CURRENT_USER_ID);
             if (c.type === 'dm' && otherUserId && users[otherUserId]) {
                return users[otherUserId].name.toLowerCase().includes(searchQuery.toLowerCase());
             }
             if (c.type === 'group' && c.name) {
                return c.name.toLowerCase().includes(searchQuery.toLowerCase());
             }
             return false;
        });
    }, [searchQuery, conversations, users]);

    const usersToAdd = useMemo(() => {
        const existingChatPartners = new Set(
            conversations
                .filter(c => c.type === 'dm')
                .flatMap(c => c.participants)
        );
        return Object.values(users).filter(user => 
            user.id !== CURRENT_USER_ID && 
            user.id !== AI_USER_ID && 
            !existingChatPartners.has(user.id)
        );
    }, [conversations, users]);

    const sidebar = (
        <aside className={`w-full md:w-1/3 lg:w-1/4 h-full flex flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 ${activeConversationId !== null ? 'hidden md:flex' : 'flex'}`}>
            <header className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-green-700 dark:text-green-400 truncate">{translations.chat.title}</h1>
                <button
                    onClick={() => setIsNewChatModalOpen(true)}
                    className="flex-shrink-0 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-gray-800 transition-colors"
                    title={translations.chat.newChat}
                >
                    <PlusIcon className="w-5 h-5"/>
                    <span className="hidden sm:inline">{translations.chat.newChat}</span>
                </button>
            </header>
            <div className="p-2">
                <div className="relative">
                     <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"/>
                     <input 
                        type="text"
                        placeholder={translations.chat.searchPlaceholder}
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full bg-gray-100 dark:bg-gray-700 border-transparent rounded-full pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                     />
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {filteredConversations.map(c => (
                    <ConversationListItem 
                        key={c.id}
                        conversation={c}
                        isActive={c.id === activeConversationId}
                        onClick={() => setActiveConversationId(c.id)}
                        users={users}
                    />
                ))}
            </div>
        </aside>
    );

    return (
        <div className="flex h-[calc(100vh-65px-4rem)] md:h-[calc(100vh-65px-4rem)] sm:h-[calc(100vh-65px-4rem-52px)]">
            {sidebar}
            <main className={`flex-1 ${activeConversationId === null ? 'hidden md:flex' : 'flex'}`}>
                {activeConversation ? (
                    <ChatWindow 
                        conversation={activeConversation}
                        messages={activeConversation.messages}
                        onSendMessage={handleSendMessage}
                        translations={translations.chat}
                        currentUser={users[CURRENT_USER_ID]}
                        users={users}
                        isAiTyping={isAiTyping && activeConversation.participants.includes(AI_USER_ID)}
                        onBack={() => setActiveConversationId(null)}
                    />
                ) : (
                    <WelcomePlaceholder translations={translations.chat} />
                )}
            </main>
            <NewChatModal
                isOpen={isNewChatModalOpen}
                onClose={() => setIsNewChatModalOpen(false)}
                users={usersToAdd}
                onStartChat={handleStartNewConversation}
                translations={translations.chat}
            />
        </div>
    );
};

export default ChatPage;