import React, { useState, useMemo, useEffect } from 'react';
import { Header } from './components/Header';
import { Language, User, ConnectionRequest, Conversation, PrivacySettings, NotificationSettings, Plot } from './types';
import { translations, INITIAL_USERS, INITIAL_CONVERSATIONS, CURRENT_USER_ID, INITIAL_PLOTS } from './constants';
import DashboardPage from './components/DashboardPage';
import ChatPage from './components/chat/ChatPage';
import SettingsPage from './components/settings/SettingsPage';
import MapPage from './components/map/MapPage';

type View = 'dashboard' | 'map' | 'chat' | 'settings';
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
  const [plots, setPlots] = useState<Plot[]>(() => getFromStorage<Plot[]>('plots', INITIAL_PLOTS));
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
  
  const currentTranslations = useMemo(() => translations[language], [language]);
  const currentUser = useMemo(() => users[CURRENT_USER_ID], [users]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(theme === 'light' ? 'dark' : 'light');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  useEffect(() => {
      localStorage.setItem('language', language);
  }, [language]);

  useEffect(() => {
      localStorage.setItem('users', JSON.stringify(users));
  }, [users]);
  
  useEffect(() => {
      localStorage.setItem('conversations', JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
      localStorage.setItem('plots', JSON.stringify(plots));
  }, [plots]);

  useEffect(() => {
      localStorage.setItem('blockedUsers', JSON.stringify(blockedUsers));
  }, [blockedUsers]);
  
  useEffect(() => {
      localStorage.setItem('privacySettings', JSON.stringify(privacySettings));
  }, [privacySettings]);
  
  useEffect(() => {
      localStorage.setItem('notificationSettings', JSON.stringify(notificationSettings));
  }, [notificationSettings]);


  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const handleAcceptRequest = (request: ConnectionRequest) => {
    const fromUser = users[request.fromUserId];
    if (!fromUser) return;

    // 1. Update the request status for the current user
    setUsers(prevUsers => ({
      ...prevUsers,
      [CURRENT_USER_ID]: {
        ...prevUsers[CURRENT_USER_ID],
        connectionRequests: prevUsers[CURRENT_USER_ID].connectionRequests.map(r => 
            r.fromUserId === request.fromUserId ? { ...r, status: 'accepted' } : r
        ),
      },
    }));

    // 2. Create a new conversation
    const newConversation: Conversation = {
      id: `convo-${CURRENT_USER_ID}-${fromUser.id}-${Date.now()}`,
      type: 'dm',
      participants: [CURRENT_USER_ID, fromUser.id],
      messages: [{
        id: `msg-start-${Date.now()}`,
        senderId: 'system',
        text: `You are now connected with ${fromUser.name}.`,
        timestamp: new Date().toISOString()
      }],
    };
    setConversations(prev => [newConversation, ...prev]);

    // 3. Switch to chat view and open the new conversation
    // This is handled inside the settings page for better UX
  };

  const handleRejectRequest = (request: ConnectionRequest) => {
    setUsers(prevUsers => ({
      ...prevUsers,
      [CURRENT_USER_ID]: {
        ...prevUsers[CURRENT_USER_ID],
        connectionRequests: prevUsers[CURRENT_USER_ID].connectionRequests.map(r =>
          r.fromUserId === request.fromUserId ? { ...r, status: 'rejected' } : r
        ),
        // Add to rejected list to prevent future requests from this user
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

  const mainContentHeight = "h-[calc(100vh-65px-4rem)] sm:h-[calc(100vh-65px-57px)]";

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
        {activeView === 'dashboard' && <DashboardPage translations={currentTranslations} language={language} />}
        {activeView === 'map' && 
          <div className={mainContentHeight}>
            <MapPage 
                translations={currentTranslations} 
                plots={plots}
                users={users}
                setPlots={setPlots}
                language={language}
                currentUser={currentUser}
            />
          </div>
        }
        {activeView === 'chat' && 
          <div className={mainContentHeight}>
            <ChatPage 
              translations={currentTranslations} 
              language={language} 
              users={users} 
              conversations={conversations}
              setConversations={setConversations}
            />
          </div>
        }
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
                onAcceptRequest={handleAcceptRequest}
                onRejectRequest={handleRejectRequest}
                onSendRequest={handleSendConnectionRequest}
                conversations={conversations}
                setActiveView={setActiveView}
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