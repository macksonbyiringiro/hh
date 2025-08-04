import React, { useState, useRef, useEffect } from 'react';
import { Message, User } from '../../types';
import { PlantIcon } from '../icons/PlantIcon';
import { AI_USER_ID } from '../../constants';
import { PlayIcon } from '../icons/PlayIcon';
import { PauseIcon } from '../icons/PauseIcon';

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

const AudioPlayer: React.FC<{ src: string, isCurrentUser: boolean }> = ({ src, isCurrentUser }) => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState("0:00");

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const setAudioData = () => {
            if (audio.duration && isFinite(audio.duration)) {
                const minutes = Math.floor(audio.duration / 60);
                const seconds = Math.floor(audio.duration % 60);
                setDuration(`${minutes}:${seconds.toString().padStart(2, '0')}`);
            }
        };

        const updateProgress = () => {
            if (audio.duration) {
                setProgress((audio.currentTime / audio.duration) * 100);
            }
        };
        
        const handleEnded = () => {
             setIsPlaying(false);
             setProgress(0);
        }

        audio.addEventListener('loadedmetadata', setAudioData);
        audio.addEventListener('timeupdate', updateProgress);
        audio.addEventListener('ended', handleEnded);

        // if the src changes, load the new audio
        audio.load();

        return () => {
            audio.removeEventListener('loadedmetadata', setAudioData);
            audio.removeEventListener('timeupdate', updateProgress);
            audio.removeEventListener('ended', handleEnded);
        };
    }, [src]);

    const togglePlayPause = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };
    
    const playPauseColor = isCurrentUser ? 'text-[#1B5E20] dark:text-[#D0F0C0]' : 'text-[#4E342E] dark:text-[#FFF3E0]';
    const progressBgColor = isCurrentUser ? 'bg-green-200 dark:bg-green-900' : 'bg-orange-200 dark:bg-orange-900';
    const progressFgColor = isCurrentUser ? 'bg-green-500 dark:bg-green-400' : 'bg-orange-500 dark:bg-orange-400';

    return (
        <div className="flex items-center gap-2 w-60">
             <audio ref={audioRef} src={src} preload="metadata"></audio>
            <button onClick={togglePlayPause} className={`p-1 rounded-full ${playPauseColor}`}>
                {isPlaying ? <PauseIcon className="w-6 h-6" /> : <PlayIcon className="w-6 h-6" />}
            </button>
            <div className="flex-1 flex flex-col justify-center">
                 <div className={`w-full h-1.5 rounded-full ${progressBgColor}`}>
                    <div className={`h-full rounded-full ${progressFgColor}`} style={{ width: `${progress}%` }}></div>
                </div>
            </div>
            <span className="text-xs font-mono w-10 text-right">{duration}</span>
        </div>
    );
};


const MessageBubble: React.FC<MessageBubbleProps> = ({ message, currentUser, users }) => {
    const isCurrentUser = message.senderId === currentUser.id;
    const sender = users[message.senderId];

    if (message.type === 'system') {
        return (
            <div className="text-center text-xs text-gray-500 dark:text-gray-400 py-2 px-4">
                <span className="bg-gray-200 dark:bg-gray-700 rounded-full px-3 py-1">{message.text}</span>
            </div>
        )
    }

    if (!sender) return null; // Should not happen for non-system messages

    const bubbleClasses = isCurrentUser
        ? 'bg-[#D0F0C0] text-[#1B5E20] dark:bg-[#1B5E20] dark:text-[#D0F0C0] rounded-br-none'
        : 'bg-[#FFF3E0] text-[#4E342E] dark:bg-[#4E342E] dark:text-[#FFF3E0] rounded-bl-none';
    
    const containerClasses = isCurrentUser ? 'justify-end' : 'justify-start';

    const renderContent = () => {
        switch (message.type) {
            case 'text':
                let html = message.text!.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                html = html.replace(/\n/g, '<br />');
                return <div className="text-[14px]" dangerouslySetInnerHTML={{ __html: html }} />;
            case 'image':
                return <img src={message.url} alt={message.meta?.fileName || 'image'} className="rounded-lg max-w-xs max-h-80 object-contain" />;
            case 'video':
                return <video src={message.url} controls className="rounded-lg max-w-xs max-h-80" />;
            case 'audio':
                return <AudioPlayer src={message.url!} isCurrentUser={isCurrentUser} />;
            default:
                return null;
        }
    };
    
    const paddingClass = message.type === 'text' ? 'px-4 py-2' : 'p-2';

    return (
        <div className={`flex items-end gap-2 ${containerClasses}`}>
            {!isCurrentUser && (
                <Avatar user={sender} />
            )}
            <div className="flex flex-col">
                <div
                    className={`flex flex-col max-w-xs md:max-w-md lg:max-w-lg rounded-2xl shadow-sm ${bubbleClasses} ${paddingClass}`}
                >
                    {!isCurrentUser && (
                         <p className="text-xs font-bold mb-1 px-2" style={{ color: sender.avatarColor.includes('bg-') ? undefined : sender.avatarColor }}>
                            {sender.name}
                        </p>
                    )}
                    <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-strong:text-inherit">
                        {renderContent()}
                    </div>
                </div>
                <div className={`mt-1 px-1 text-[12px] text-gray-500 dark:text-gray-400 ${isCurrentUser ? 'text-right' : 'text-left'}`}>
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
            </div>
             {isCurrentUser && (
                <div className="w-8 h-8"></div>
            )}
        </div>
    );
};

export default MessageBubble;