import React from 'react';
import { Card } from './Card';
import { User, ConnectionRequest, Conversation, Message } from '../../types';
import { ChatIcon } from '../icons/ChatIcon';
import { UserPlusIcon } from '../icons/UserPlusIcon';

interface ActivityFeedProps {
    translations: {
        title: string;
        newMessageFrom: string;
        newMessageIn: string;
        connectionRequestFrom: string;
        accept: string;
        reject: string;
        viewChat: string;
        noActivity: string;
        sentAnImage: string;
        sentAVideo: string;
        sentAVoiceMessage: string;
    };
    currentUser: User;
    users: Record<string, User>;
    conversations: Conversation[];
    onAcceptRequest: (request: ConnectionRequest) => void;
    onRejectRequest: (request: ConnectionRequest) => void;
}

// Define specific types for items in the feed
type ActivityRequestItem = ConnectionRequest & { type: 'request' };

type ActivityMessageItem = {
    id: string; // This will be the conversation ID
    message: Message;
    type: 'message';
    timestamp: string;
};

// Create a union type for all possible items in the feed
type ActivityItem = ActivityRequestItem | ActivityMessageItem;


export const ActivityFeed: React.FC<ActivityFeedProps> = ({ translations, currentUser, users, conversations, onAcceptRequest, onRejectRequest }) => {

    // 1. Get all pending connection requests and map them to our ActivityItem type
    const pendingRequests: ActivityRequestItem[] = currentUser.connectionRequests
        .filter(r => r.status === 'pending')
        .map(r => ({ ...r, type: 'request' }));

    // 2. Get the last message from each conversation, if it's not from the current user
    const recentMessages: ActivityMessageItem[] = conversations
        .map(c => {
            const lastMessage = c.messages.length > 0 ? c.messages[c.messages.length - 1] : null;
            // Only include conversations with messages not from the current user or the system
            if (lastMessage && lastMessage.senderId !== currentUser.id && lastMessage.senderId !== 'system') {
                return {
                    id: c.id,
                    message: lastMessage,
                    type: 'message',
                    timestamp: lastMessage.timestamp,
                };
            }
            return null;
        })
        .filter((item): item is ActivityMessageItem => item !== null); // Filter out nulls and satisfy TypeScript

    // 3. Combine, sort by timestamp, and get the most recent items
    const combinedFeed: ActivityItem[] = [...pendingRequests, ...recentMessages]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 5); // Limit to 5 most recent items
        
    const getMessageSnippet = (message: Message) => {
        switch (message.type) {
            case 'text':
                return message.text;
            case 'image':
                return `🖼️ ${translations.sentAnImage}`;
            case 'video':
                return `📹 ${translations.sentAVideo}`;
            case 'audio':
                return `🎤 ${translations.sentAVoiceMessage}`;
            default:
                return '';
        }
    };


    return (
        <Card title={translations.title}>
            {combinedFeed.length === 0 ? (
                 <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                    <p>{translations.noActivity}</p>
                </div>
            ) : (
                <ul className="space-y-3">
                    {combinedFeed.map(item => {
                        // Use a type guard to render a request item
                        if (item.type === 'request') {
                            const fromUser = users[item.fromUserId];
                            if (!fromUser) return null;
                            
                            // To resolve potential type issues, create a plain ConnectionRequest object.
                            const connectionRequest: ConnectionRequest = {
                                fromUserId: item.fromUserId,
                                status: item.status,
                                timestamp: item.timestamp,
                            };

                            return (
                                <li key={`req-${item.fromUserId}`} className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                    <UserPlusIcon className="w-6 h-6 text-purple-500 flex-shrink-0" />
                                    <div className="flex-grow">
                                        <p className="text-sm text-gray-800 dark:text-gray-200">
                                            {translations.connectionRequestFrom} <span className="font-semibold">{fromUser.name}</span>
                                        </p>
                                    </div>
                                    <div className="flex gap-2 flex-shrink-0">
                                        <button onClick={() => onRejectRequest(connectionRequest)} className="px-3 py-1 text-xs font-semibold text-red-700 bg-red-100 hover:bg-red-200 dark:bg-red-900/50 dark:text-red-300 dark:hover:bg-red-900 rounded-full">{translations.reject}</button>
                                        <button onClick={() => onAcceptRequest(connectionRequest)} className="px-3 py-1 text-xs font-semibold text-white bg-green-600 hover:bg-green-700 rounded-full">{translations.accept}</button>
                                    </div>
                                </li>
                            );
                        }
                        
                        // Use a type guard to render a message item
                        if (item.type === 'message') {
                            const sender = users[item.message.senderId];
                            const conversation = conversations.find(c => c.id === item.id);

                            if (!sender || !conversation) return null;

                            const isGroup = conversation.type === 'group';
                            
                            return (
                                 <li key={`msg-${item.id}`} className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg">
                                    <ChatIcon className="w-6 h-6 text-blue-500 flex-shrink-0" />
                                    <div className="flex-grow overflow-hidden">
                                        <p className="text-sm text-gray-800 dark:text-gray-200">
                                            {isGroup ? translations.newMessageIn : translations.newMessageFrom}{' '}
                                            <span className="font-semibold">{isGroup ? conversation.name : sender.name}</span>
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                            {isGroup ? `${sender.name}: ` : ''}{getMessageSnippet(item.message)}
                                        </p>
                                    </div>
                                    <button className="px-3 py-1 text-xs font-semibold text-green-700 bg-green-100 hover:bg-green-200 dark:bg-green-900/50 dark:text-green-300 dark:hover:bg-green-900 rounded-full flex-shrink-0">{translations.viewChat}</button>
                                </li>
                            )
                        }
                        
                        return null;
                    })}
                </ul>
            )}
        </Card>
    );
};