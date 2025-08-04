import React, { useState } from 'react';
import { SendIcon } from '../icons/SendIcon';
import { PaperclipIcon } from '../icons/PaperclipIcon';
import { MicrophoneIcon } from '../icons/MicrophoneIcon';

interface ChatInputProps {
    onSendMessage: (text: string) => void;
    placeholder: string;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, placeholder }) => {
    const [text, setText] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (text.trim()) {
            onSendMessage(text.trim());
            setText('');
        }
    };
    
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex items-center space-x-1 sm:space-x-2">
             <button type="button" className="p-2 text-gray-500 dark:text-gray-400 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                <PaperclipIcon className="w-6 h-6" />
                <span className="sr-only">Attach file</span>
            </button>
             <button type="button" className="p-2 text-gray-500 dark:text-gray-400 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                <MicrophoneIcon className="w-6 h-6" />
                <span className="sr-only">Record voice note</span>
            </button>
            <div className="flex-1 relative">
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    rows={1}
                    className="w-full py-2 pl-4 pr-12 bg-gray-100 dark:bg-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 resize-none max-h-40 border border-transparent"
                />
                 <button 
                    type="submit" 
                    className="absolute right-1 top-1/2 -translate-y-1/2 p-2 rounded-full text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400 dark:disabled:bg-gray-500 transition-colors"
                    disabled={!text.trim()}
                    aria-label="Send message"
                >
                    <SendIcon className="w-5 h-5" />
                </button>
            </div>
        </form>
    );
};

export default ChatInput;
