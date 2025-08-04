import React, { useState } from 'react';
import { Post, User, Comment } from '../../types';
import { ThumbsUpIcon } from '../icons/ThumbsUpIcon';
import { MessageSquareIcon } from '../icons/MessageSquareIcon';
import { SendIcon } from '../icons/SendIcon';

interface PostCardProps {
    post: Post;
    currentUser: User;
    users: Record<string, User>;
    onAddNewComment: (postId: string, content: string) => void;
    onLikePost: (postId: string) => void;
    translations: {
        like: string;
        comment: string;
        addCommentPlaceholder: string;
        viewAllComments: string;
        comments: string;
    };
}

const Avatar: React.FC<{ user?: User }> = ({ user }) => {
    if (!user) return <div className="w-10 h-10 rounded-full bg-gray-300" />;
    return user.avatarUrl ? (
        <img src={user.avatarUrl} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
    ) : (
        <div className={`w-10 h-10 rounded-full ${user.avatarColor} flex items-center justify-center text-white font-bold`}>
            {user.name.charAt(0).toUpperCase()}
        </div>
    );
};

const formatTimeAgo = (timestamp: string): string => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
};

const PostCard: React.FC<PostCardProps> = ({ post, currentUser, users, onAddNewComment, onLikePost, translations }) => {
    const author = users[post.authorId];
    const [commentText, setCommentText] = useState('');
    const [showComments, setShowComments] = useState(false);

    const handleCommentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentText.trim()) return;
        onAddNewComment(post.id, commentText);
        setCommentText('');
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="p-4">
                <div className="flex items-center space-x-3">
                    <Avatar user={author} />
                    <div>
                        <p className="font-bold text-gray-800 dark:text-gray-100">{author?.name || 'Unknown User'}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{formatTimeAgo(post.timestamp)}</p>
                    </div>
                </div>
                <p className="my-4 text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{post.content}</p>
                {post.imageUrl && (
                    <img src={post.imageUrl} alt="Post content" className="mt-2 rounded-lg w-full object-cover max-h-96" />
                )}
            </div>

            <div className="px-4 pb-2 flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                <span>{post.likes} {translations.like}s</span>
                <button onClick={() => setShowComments(prev => !prev)}>
                    {post.comments.length} {translations.comment}s
                </button>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-600 mx-4"></div>

            <div className="flex justify-around p-1">
                <button
                    onClick={() => onLikePost(post.id)}
                    className="flex-1 flex items-center justify-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 font-semibold transition-colors"
                >
                    <ThumbsUpIcon className="w-5 h-5" />
                    <span>{translations.like}</span>
                </button>
                <button
                    onClick={() => setShowComments(true)}
                    className="flex-1 flex items-center justify-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 font-semibold transition-colors"
                >
                    <MessageSquareIcon className="w-5 h-5" />
                    <span>{translations.comment}</span>
                </button>
            </div>
            
            {showComments && (
                 <div className="border-t border-gray-200 dark:border-gray-600 p-4 space-y-4">
                    {post.comments.map(comment => {
                        const commentAuthor = users[comment.authorId];
                        return (
                            <div key={comment.id} className="flex items-start space-x-3">
                                <div className="flex-shrink-0">
                                    <Avatar user={commentAuthor} />
                                </div>
                                <div>
                                    <div className="bg-gray-100 dark:bg-gray-700 rounded-xl px-3 py-2">
                                        <p className="font-semibold text-sm text-gray-800 dark:text-gray-100">{commentAuthor?.name || 'Unknown'}</p>
                                        <p className="text-sm text-gray-700 dark:text-gray-300">{comment.content}</p>
                                    </div>
                                     <p className="text-xs text-gray-400 mt-1">{formatTimeAgo(comment.timestamp)}</p>
                                </div>
                            </div>
                        )
                    })}
                    <form onSubmit={handleCommentSubmit} className="flex items-center space-x-3 pt-2">
                        <div className="flex-shrink-0">
                            <Avatar user={currentUser} />
                        </div>
                        <div className="flex-1 relative">
                             <input
                                type="text"
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                placeholder={translations.addCommentPlaceholder}
                                className="w-full bg-gray-100 dark:bg-gray-700 border-transparent rounded-full pl-4 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                             />
                             <button type="submit" className="absolute right-1 top-1/2 -translate-y-1/2 p-2 rounded-full text-green-600 hover:bg-green-100 dark:text-green-400 dark:hover:bg-green-900/50" disabled={!commentText.trim()}>
                                 <SendIcon className="w-5 h-5"/>
                             </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default PostCard;