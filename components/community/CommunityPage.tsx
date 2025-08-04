import React from 'react';
import { Translations, User, Post } from '../../types';
import NewPostForm from './NewPostForm';
import PostCard from './PostCard';
import { CommunityIcon } from '../icons/CommunityIcon';

type CommunityPageProps = {
    translations: Translations;
    currentUser: User;
    users: Record<string, User>;
    posts: Post[];
    onAddNewPost: (content: string, imageUrl?: string) => void;
    onAddNewComment: (postId: string, content: string) => void;
    onLikePost: (postId: string) => void;
};

const CommunityPage: React.FC<CommunityPageProps> = (props) => {
    const { translations, currentUser, users, posts, onAddNewPost, onAddNewComment, onLikePost } = props;
    const t = translations.community;

    return (
        <div className="p-4 sm:p-6 md:p-8 space-y-6 sm:pb-20 max-w-3xl mx-auto">
            <h1 className="text-2xl sm:text-3xl font-bold text-green-800 dark:text-green-300">
                {t.title}
            </h1>
            
            <NewPostForm
                currentUser={currentUser}
                onAddNewPost={onAddNewPost}
                translations={t}
            />

            <div className="space-y-6">
                {posts.length > 0 ? (
                    posts.map(post => (
                        <PostCard
                            key={post.id}
                            post={post}
                            currentUser={currentUser}
                            users={users}
                            onAddNewComment={onAddNewComment}
                            onLikePost={onLikePost}
                            translations={t}
                        />
                    ))
                ) : (
                    <div className="text-center py-16 px-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                        <CommunityIcon className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">{t.noPosts}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CommunityPage;