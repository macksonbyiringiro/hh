import React, { useState, useRef, useEffect } from 'react';
import { SendIcon } from '../icons/SendIcon';
import { PaperclipIcon } from '../icons/PaperclipIcon';
import { MicrophoneIcon } from '../icons/MicrophoneIcon';
import { MessagePayload, Translations } from '../../types';
import { StopCircleIcon } from '../icons/StopCircleIcon';
import { TrashIcon } from '../icons/TrashIcon';

interface ChatInputProps {
    onSendMessage: (payload: MessagePayload) => void;
    translations: Translations['chat'];
}

const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, translations }) => {
    const [text, setText] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        let interval: number;
        if (isRecording) {
            interval = window.setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        }
        return () => window.clearInterval(interval);
    }, [isRecording]);

    const handleTextSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (text.trim()) {
            onSendMessage({ type: 'text', text: text.trim() });
            setText('');
        }
    };
    
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleTextSubmit(e);
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            setIsRecording(true);
            setRecordingTime(0);
            audioChunksRef.current = [];
            
            const recorder = new MediaRecorder(stream);
            mediaRecorderRef.current = recorder;
            
            recorder.ondataavailable = event => {
                audioChunksRef.current.push(event.data);
            };

            recorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const audioUrl = URL.createObjectURL(audioBlob);
                onSendMessage({
                    type: 'audio',
                    url: audioUrl,
                    meta: {
                        duration: formatTime(recordingTime),
                        fileSize: audioBlob.size,
                        mimeType: audioBlob.type,
                    }
                });
                stream.getTracks().forEach(track => track.stop());
                setIsRecording(false);
            };

            recorder.start();
        } catch (error) {
            console.error("Error accessing microphone:", error);
            alert("Could not access microphone. Please check permissions.");
        }
    };

    const stopRecording = (cancel = false) => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
            if (cancel) {
                // onstop will still fire, but we can clear the chunks
                audioChunksRef.current = [];
                setIsRecording(false);
                 mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
            }
        } else {
             setIsRecording(false);
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const url = e.target?.result as string;
            const type = file.type.startsWith('image/') ? 'image' : 'video';
            if (type === 'image' || type === 'video') {
                onSendMessage({
                    type,
                    url,
                    meta: {
                        fileName: file.name,
                        fileSize: file.size,
                        mimeType: file.type
                    }
                });
            }
        };
        reader.readAsDataURL(file);

        // Reset file input
        if(fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    if (isRecording) {
        return (
            <div className="flex items-center space-x-2 w-full">
                <button onClick={() => stopRecording(true)} className="p-2 text-gray-500 dark:text-gray-400 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors" aria-label={translations.cancel}>
                    <TrashIcon className="w-6 h-6 text-red-500" />
                </button>
                <div className="flex-1 flex items-center bg-[#F5F5F5] dark:bg-gray-700 rounded-full h-10 px-4">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="ml-3 font-mono text-gray-700 dark:text-gray-200">{formatTime(recordingTime)}</span>
                </div>
                <button 
                    onClick={() => stopRecording(false)} 
                    className="p-2 rounded-full text-white bg-[#4CAF50] hover:bg-green-700"
                    aria-label="Send voice note"
                >
                    <SendIcon className="w-5 h-5" />
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleTextSubmit} className="flex items-center space-x-1 sm:space-x-2">
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,video/*" />
            <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-500 dark:text-gray-400 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                <PaperclipIcon className="w-6 h-6" />
                <span className="sr-only">Attach file</span>
            </button>
            <div className="flex-1 relative">
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={translations.inputPlaceholder}
                    rows={1}
                    className="w-full py-2 pl-4 pr-12 bg-[#F5F5F5] dark:bg-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 resize-none max-h-40 border border-transparent"
                />
                 <button 
                    type="submit" 
                    className="absolute right-1 top-1/2 -translate-y-1/2 p-2 rounded-full text-white bg-[#4CAF50] hover:bg-green-700 disabled:bg-gray-400 dark:disabled:bg-gray-500 transition-colors"
                    disabled={!text.trim()}
                    aria-label="Send message"
                >
                    <SendIcon className="w-5 h-5" />
                </button>
            </div>
             <button type="button" onClick={startRecording} className="p-2 text-gray-500 dark:text-gray-400 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                <MicrophoneIcon className="w-6 h-6" />
                <span className="sr-only">Record voice note</span>
            </button>
        </form>
    );
};

export default ChatInput;