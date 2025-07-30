import React from 'react';
import { Message, User } from '../../types';
import { PlantIcon } from '../icons/PlantIcon';
import { AI_USER_ID } from '../../constants';

interface MessageBubbleProps {
    message: Message;
    currentUser: User;
    users: Record<string, User>;
}

const Avatar: React.FC<{ user: User }> = ({ user }) => (
    user.avatarUrl ? (
        <img src={user.avatarUrl} alt={user.name} className="flex-shrink-0 w-8 h-8 rounded-full object-cover" />
    ) : (
        <div className={`flex-shrink-0 w-8 h-8 rounded-full ${user.avatarColor} flex items-center justify-center text-white font-bold text-sm`}>
            {user.id === AI_USER_ID ? <PlantIcon className="w-5 h-5" /> : user.name.charAt(0).toUpperCase()}
        </div>
    )
);

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, currentUser, users }) => {
    const isCurrentUser = message.senderId === currentUser.id;
    const sender = users[message.senderId];

    if (!sender) { // System messages or unknown users
        return (
            <div className="text-center text-xs text-gray-500 dark:text-gray-400 py-2 px-4">
                <span className="bg-gray-200 dark:bg-gray-700 rounded-full px-3 py-1">{message.text}</span>
            </div>
        )
    }

    const bubbleClasses = isCurrentUser
        ? 'bg-green-600 text-white rounded-br-none'
        : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none';

    const containerClasses = isCurrentUser ? 'justify-end' : 'justify-start';
    
    const renderText = (text: string) => {
        let html = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/\n/g, '<br />');
        return <div className="text-sm" dangerouslySetInnerHTML={{ __html: html }} />;
    };

    return (
        <div className={`flex items-start gap-2 ${containerClasses}`}>
            {!isCurrentUser && (
                <Avatar user={sender} />
            )}
            <div
                className={`flex flex-col max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-2xl shadow-sm ${bubbleClasses}`}
            >
                {!isCurrentUser && (
                     <p className="text-xs font-bold mb-1" style={{ color: sender.avatarColor.includes('bg-') ? undefined : sender.avatarColor }}>
                        {sender.name}
                    </p>
                )}
                <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-strong:text-inherit">
                    {renderText(message.text)}
                </div>
            </div>
        </div>
    );
};

export default MessageBubble;