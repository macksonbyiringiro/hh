import React, { useState, useMemo, useEffect } from 'react';
import { Header } from './components/Header';
import { Language, User, ConnectionRequest, Conversation, PrivacySettings, NotificationSettings, Product, Alert, MarketTrendData, ChatSettings, Post, Comment } from './types';
import { translations, INITIAL_USERS, INITIAL_CONVERSATIONS, CURRENT_USER_ID, INITIAL_PRODUCTS, INITIAL_ALERTS, MARKET_TREND_DATA, DEFAULT_CHAT_SETTINGS, INITIAL_POSTS } from './constants';
import DashboardPage from './components/DashboardPage';
import ChatPage from './components/chat/ChatPage';
import SettingsPage from './components/settings/SettingsPage';
import FindLandPage from './components/settings/FindLandPage';
import CommunityPage from './components/community/CommunityPage';

type View = 'dashboard' | 'chat' | 'settings' | 'land' | 'community';
type Theme = 'light' | 'dark';

const getFromStorage = <T,>(key: string, defaultValue: T): T => {
    if (typeof window !== 'undefined' && window.localStorage) {
        const stored = localStorage.getItem(key);
        if (stored) {
            try {
                return JSON.parse(stored) as T;
            } catch (error) {
                console.error(`Error parsing localStorage key "${key}":`, error);
                return defaultValue;
            }
        }
    }
    return defaultValue;
};


const App: React.FC = () => {
  const [language, setLanguage] = useState<Language>(() => getFromStorage<Language>('language', Language.EN));
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [theme, setTheme] = useState<Theme>(() => getFromStorage<Theme>('theme', 'light'));

  const [users, setUsers] = useState<Record<string, User>>(() => getFromStorage<Record<string, User>>('users', INITIAL_USERS));
  const [conversations, setConversations] = useState<Conversation[]>(() => getFromStorage<Conversation[]>('conversations', INITIAL_CONVERSATIONS));
  const [products, setProducts] = useState<Product[]>(() => getFromStorage<Product[]>('products', INITIAL_PRODUCTS));
  const [alerts, setAlerts] = useState<Alert[]>(() => getFromStorage<Alert[]>('alerts', INITIAL_ALERTS));
  const [posts, setPosts] = useState<Post[]>(() => getFromStorage<Post[]>('posts', INITIAL_POSTS));


  const [blockedUsers, setBlockedUsers] = useState<string[]>(() => getFromStorage<string[]>('blockedUsers', []));
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>(() => getFromStorage<PrivacySettings>('privacySettings', {
      contact: 'everyone',
      profilePhoto: 'everyone',
      status: 'everyone'
  }));
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(() => getFromStorage<NotificationSettings>('notificationSettings', {
      messages: true,
      groups: true,
      sound: true,
      vibration: false
  }));
   const [chatSettings, setChatSettings] = useState<ChatSettings>(() => getFromStorage<ChatSettings>('chatSettings', DEFAULT_CHAT_SETTINGS));
  
  const currentTranslations = useMemo(() => translations[language], [language]);
  const currentUser = useMemo(() => users[CURRENT_USER_ID], [users]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(theme === 'light' ? 'dark' : 'light');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  useEffect(() => { localStorage.setItem('language', language); }, [language]);
  useEffect(() => { localStorage.setItem('users', JSON.stringify(users)); }, [users]);
  useEffect(() => { localStorage.setItem('conversations', JSON.stringify(conversations)); }, [conversations]);
  useEffect(() => { localStorage.setItem('products', JSON.stringify(products)); }, [products]);
  useEffect(() => { localStorage.setItem('alerts', JSON.stringify(alerts)); }, [alerts]);
  useEffect(() => { localStorage.setItem('posts', JSON.stringify(posts)); }, [posts]);
  useEffect(() => { localStorage.setItem('blockedUsers', JSON.stringify(blockedUsers)); }, [blockedUsers]);
  useEffect(() => { localStorage.setItem('privacySettings', JSON.stringify(privacySettings)); }, [privacySettings]);
  useEffect(() => { localStorage.setItem('notificationSettings', JSON.stringify(notificationSettings)); }, [notificationSettings]);
  useEffect(() => { localStorage.setItem('chatSettings', JSON.stringify(chatSettings)); }, [chatSettings]);


  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const handleAcceptRequest = (request: ConnectionRequest) => {
    const fromUser = users[request.fromUserId];
    if (!fromUser) return;

    setUsers(prevUsers => ({
      ...prevUsers,
      [CURRENT_USER_ID]: {
        ...prevUsers[CURRENT_USER_ID],
        connectionRequests: prevUsers[CURRENT_USER_ID].connectionRequests.map(r => 
            r.fromUserId === request.fromUserId ? { ...r, status: 'accepted' } : r
        ),
      },
    }));

    const newConversation: Conversation = {
      id: `convo-${CURRENT_USER_ID}-${fromUser.id}-${Date.now()}`,
      type: 'dm',
      participants: [CURRENT_USER_ID, fromUser.id],
      messages: [{
        id: `msg-start-${Date.now()}`,
        senderId: 'system',
        text: `You are now connected with ${fromUser.name}.`,
        timestamp: new Date().toISOString(),
        type: 'system'
      }],
    };
    setConversations(prev => [newConversation, ...prev]);
  };

  const handleRejectRequest = (request: ConnectionRequest) => {
    setUsers(prevUsers => ({
      ...prevUsers,
      [CURRENT_USER_ID]: {
        ...prevUsers[CURRENT_USER_ID],
        connectionRequests: prevUsers[CURRENT_USER_ID].connectionRequests.map(r =>
          r.fromUserId === request.fromUserId ? { ...r, status: 'rejected' } : r
        ),
        rejectedUserIds: [...new Set([...prevUsers[CURRENT_USER_ID].rejectedUserIds, request.fromUserId])]
      },
    }));
  };

  const handleSendConnectionRequest = (toUserId: string) => {
    const newRequest: ConnectionRequest = {
        fromUserId: CURRENT_USER_ID,
        timestamp: new Date().toISOString(),
        status: 'pending',
    };

    setUsers(prevUsers => ({
        ...prevUsers,
        [toUserId]: {
            ...prevUsers[toUserId],
            connectionRequests: [newRequest, ...prevUsers[toUserId].connectionRequests],
        }
    }));
  };

  const handleAddNewPost = (content: string, imageUrl?: string) => {
    const newPost: Post = {
        id: `post-${Date.now()}`,
        authorId: CURRENT_USER_ID,
        timestamp: new Date().toISOString(),
        content,
        imageUrl,
        likes: 0,
        comments: [],
    };
    setPosts(prev => [newPost, ...prev]);
  };

  const handleAddNewComment = (postId: string, content: string) => {
    const newComment: Comment = {
        id: `comment-${Date.now()}`,
        authorId: CURRENT_USER_ID,
        timestamp: new Date().toISOString(),
        content,
    };
    setPosts(prev => prev.map(p => 
        p.id === postId ? { ...p, comments: [...p.comments, newComment] } : p
    ));
  };

  const handleLikePost = (postId: string) => {
     setPosts(prev => prev.map(p => 
        p.id === postId ? { ...p, likes: p.likes + 1 } : p
    ));
  };


  return (
    <div className="min-h-screen bg-green-50 dark:bg-gray-900 font-sans text-gray-800 dark:text-gray-200">
      <Header 
        language={language} 
        setLanguage={setLanguage} 
        translations={currentTranslations.header} 
        activeView={activeView}
        setActiveView={setActiveView}
        theme={theme}
        toggleTheme={toggleTheme}
        pendingRequestCount={currentUser.connectionRequests.filter(r => r.status === 'pending').length}
      />
      <main className="max-w-7xl mx-auto">
        {activeView === 'dashboard' && <DashboardPage 
            translations={currentTranslations} 
            language={language}
            currentUser={currentUser}
            users={users}
            conversations={conversations}
            products={products}
            alerts={alerts}
            marketTrends={MARKET_TREND_DATA}
            onAcceptRequest={handleAcceptRequest}
            onRejectRequest={handleRejectRequest}
            setActiveView={setActiveView}
        />}
        {activeView === 'chat' && <ChatPage 
            translations={currentTranslations} 
            language={language} 
            users={users} 
            conversations={conversations}
            setConversations={setConversations}
            chatSettings={chatSettings}
        />}
        {activeView === 'settings' && 
            <SettingsPage
                translations={currentTranslations}
                language={language}
                setLanguage={setLanguage}
                theme={theme}
                toggleTheme={toggleTheme}
                users={users}
                setUsers={setUsers}
                currentUser={currentUser}
                blockedUsers={blockedUsers}
                setBlockedUsers={setBlockedUsers}
                privacySettings={privacySettings}
                setPrivacySettings={setPrivacySettings}
                notificationSettings={notificationSettings}
                setNotificationSettings={setNotificationSettings}
                chatSettings={chatSettings}
                setChatSettings={setChatSettings}
                onAcceptRequest={handleAcceptRequest}
                onRejectRequest={handleRejectRequest}
                onSendRequest={handleSendConnectionRequest}
                conversations={conversations}
                setActiveView={setActiveView}
            />
        }
        {activeView === 'land' &&
            <FindLandPage
                translations={currentTranslations}
                users={users}
                setActiveView={setActiveView}
            />
        }
        {activeView === 'community' &&
            <CommunityPage
                translations={currentTranslations}
                currentUser={currentUser}
                users={users}
                posts={posts}
                onAddNewPost={handleAddNewPost}
                onAddNewComment={handleAddNewComment}
                onLikePost={handleLikePost}
            />
        }
      </main>
      <footer className="text-center p-4 mt-8 text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 sm:pb-16">
        © 2024 Ubuhinzi360. All rights reserved.
      </footer>
    </div>
  );
};

export default App;