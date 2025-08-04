import React, { useState, useRef } from 'react';
import { User } from '../../types';
import { ImageIcon } from '../icons/ImageIcon';
import { XIcon } from '../icons/XIcon';

interface NewPostFormProps {
    currentUser: User;
    onAddNewPost: (content: string, imageUrl?: string) => void;
    translations: {
        newPostPlaceholder: string;
        postButton: string;
        addImage: string;
    };
}

const NewPostForm: React.FC<NewPostFormProps> = ({ currentUser, onAddNewPost, translations }) => {
    const [content, setContent] = useState('');
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;
        onAddNewPost(content, imagePreview || undefined);
        setContent('');
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };
    
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 border border-gray-100 dark:border-gray-700">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex items-start space-x-4">
                    {currentUser.avatarUrl ? (
                        <img src={currentUser.avatarUrl} alt="You" className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                        <div className={`w-12 h-12 rounded-full ${currentUser.avatarColor} flex items-center justify-center text-white font-bold text-xl`}>
                            {currentUser.name.charAt(0).toUpperCase()}
                        </div>
                    )}
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder={translations.newPostPlaceholder}
                        className="w-full p-2 border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 resize-none"
                        rows={3}
                    />
                </div>

                {imagePreview && (
                    <div className="relative ml-16">
                        <img src={imagePreview} alt="Preview" className="mt-2 rounded-lg max-h-60 w-auto" />
                        <button
                            type="button"
                            onClick={() => {
                                setImagePreview(null);
                                if (fileInputRef.current) fileInputRef.current.value = '';
                            }}
                            className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/75"
                        >
                            <XIcon className="w-4 h-4" />
                        </button>
                    </div>
                )}

                <div className="flex justify-between items-center ml-16">
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 text-gray-500 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400 transition-colors"
                        title={translations.addImage}
                    >
                        <ImageIcon className="w-6 h-6" />
                        <span className="text-sm font-medium sr-only">{translations.addImage}</span>
                    </button>
                    <button
                        type="submit"
                        disabled={!content.trim()}
                        className="px-6 py-2 bg-green-600 text-white font-semibold rounded-full hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                        {translations.postButton}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default NewPostForm;