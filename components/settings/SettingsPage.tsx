import React, { useState, useEffect, useRef } from 'react';
import { Language, Translations, User, PrivacySettings, NotificationSettings, ConnectionRequest, LinkExpiry, Conversation } from '../../types';
import { CURRENT_USER_ID, LANGUAGE_OPTIONS } from '../../constants';

import { ChevronRightIcon } from '../icons/ChevronRightIcon';
import { UserCircleIcon } from '../icons/UserCircleIcon';
import { BlockIcon } from '../icons/BlockIcon';
import { MoonIcon } from '../icons/MoonIcon';
import { LockIcon } from '../icons/LockIcon';
import { NotificationsIcon } from '../icons/NotificationsIcon';
import { HelpIcon } from '../icons/HelpIcon';
import { LogoutIcon } from '../icons/LogoutIcon';
import { TrashIcon } from '../icons/TrashIcon';
import { ArrowLeftIcon } from '../icons/ArrowLeftIcon';
import { UserPlusIcon } from '../icons/UserPlusIcon';
import { QrCodeIcon } from '../icons/QrCodeIcon';
import { CopyIcon } from '../icons/CopyIcon';
import { CheckCircleIcon } from '../icons/CheckCircleIcon';


type SettingsPageProps = {
    translations: Translations;
    language: Language;
    setLanguage: (lang: Language) => void;
    theme: 'light' | 'dark';
    toggleTheme: () => void;
    users: Record<string, User>;
    setUsers: React.Dispatch<React.SetStateAction<Record<string, User>>>;
    currentUser: User;
    blockedUsers: string[];
    setBlockedUsers: React.Dispatch<React.SetStateAction<string[]>>;
    privacySettings: PrivacySettings;
    setPrivacySettings: React.Dispatch<React.SetStateAction<PrivacySettings>>;
    notificationSettings: NotificationSettings;
    setNotificationSettings: React.Dispatch<React.SetStateAction<NotificationSettings>>;
    onAcceptRequest: (request: ConnectionRequest) => void;
    onRejectRequest: (request: ConnectionRequest) => void;
    onSendRequest: (toUserId: string) => void;
    conversations: Conversation[];
    setActiveView: (view: 'dashboard' | 'chat' | 'settings') => void;
};

type SettingsSection = 'profile' | 'sharing' | 'blocked' | 'theme' | 'language' | 'privacy' | 'notifications' | 'account' | 'help';
type SharingSubSection = 'myLink' | 'requests' | 'connect';

const Toast: React.FC<{ message: string; onDismiss: () => void }> = ({ message, onDismiss }) => {
    useEffect(() => {
        const timer = setTimeout(onDismiss, 3000);
        return () => clearTimeout(timer);
    }, [onDismiss]);

    return (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-full shadow-lg z-50 flex items-center gap-2">
            <CheckCircleIcon className="w-6 h-6" />
            <span>{message}</span>
        </div>
    );
};


// Reusable components
const SettingsHeader: React.FC<{ title: string; onBack: () => void }> = ({ title, onBack }) => (
    <header className="flex items-center p-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-gray-50 dark:bg-gray-900 z-10">
        <button onClick={onBack} className="mr-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" aria-label="Back">
            <ArrowLeftIcon className="w-6 h-6" />
        </button>
        <h2 className="text-xl font-bold">{title}</h2>
    </header>
);

const ToggleSwitch: React.FC<{ checked: boolean; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; label: string; description?: string }> = ({ checked, onChange, label, description }) => (
    <label className="flex items-center justify-between cursor-pointer p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors">
        <div className="flex-1">
            <span className="text-gray-700 dark:text-gray-300 font-medium">{label}</span>
            {description && <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>}
        </div>
        <div className="relative ml-4">
            <input type="checkbox" className="sr-only" checked={checked} onChange={onChange} />
            <div className="block bg-gray-300 dark:bg-gray-600 w-14 h-8 rounded-full"></div>
            <div className={`dot absolute left-1 top-1 w-6 h-6 rounded-full transition-transform ${checked ? 'transform translate-x-6 bg-green-500' : 'bg-white'}`}></div>
        </div>
    </label>
);

const SettingsPage: React.FC<SettingsPageProps> = (props) => {
    const { translations, users, setUsers, currentUser, onAcceptRequest, onRejectRequest, onSendRequest, conversations, setActiveView } = props;
    const t = translations.settings;
    const [activeSection, setActiveSection] = useState<SettingsSection | null>(null);
    const [sharingSubSection, setSharingSubSection] = useState<SharingSubSection>('myLink');

    // Profile State
    const [name, setName] = useState(currentUser.name);
    const [status, setStatus] = useState(currentUser.status);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [connectLink, setConnectLink] = useState('');

    // Modals
    const [isBlockUserModalOpen, setBlockUserModalOpen] = useState(false);
    const [isDeleteConfirmModalOpen, setDeleteConfirmModalOpen] = useState(false);
    const [isQrModalOpen, setQrModalOpen] = useState(false);
    
    const pendingRequestCount = currentUser.connectionRequests.filter(r => r.status === 'pending').length;

    useEffect(() => {
        setName(currentUser.name);
        setStatus(currentUser.status);
    }, [currentUser]);

    const handleSaveProfile = () => {
        setUsers(prev => ({
            ...prev,
            [CURRENT_USER_ID]: { ...prev[CURRENT_USER_ID], name, status }
        }));
        setToastMessage(t.saved);
    };

    const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const newAvatarUrl = reader.result as string;
                setUsers(prev => ({
                    ...prev,
                    [CURRENT_USER_ID]: { ...prev[CURRENT_USER_ID], avatarUrl: newAvatarUrl }
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUnblockUser = (userId: string) => {
        props.setBlockedUsers(prev => prev.filter(id => id !== userId));
    };

    const handleBlockUser = (userId: string) => {
        if (!userId) return;
        props.setBlockedUsers(prev => [...new Set([...prev, userId])]);
        setBlockUserModalOpen(false);
    };
    
    const handleDeleteAccount = () => {
        console.log("Deleting account...");
        localStorage.clear();
        window.location.reload();
    };
    
    const handleCopyLink = () => {
        const link = `https://ubuhinzi360.app/connect/${currentUser.profileLinkToken}`;
        navigator.clipboard.writeText(link);
        setToastMessage(t.linkCopied);
    };

    const handleSetLinkExpiry = (expiry: LinkExpiry) => {
         setUsers(prev => ({...prev, [CURRENT_USER_ID]: {...prev[CURRENT_USER_ID], linkExpiry: expiry}}));
    }
    
    const handleSetLinkActive = (isActive: boolean) => {
        setUsers(prev => ({...prev, [CURRENT_USER_ID]: {...prev[CURRENT_USER_ID], isLinkActive: isActive}}));
    }

    const handleConnectWithLink = () => {
        if (!connectLink.trim()) return;
        const token = connectLink.split('/').pop()?.trim();
        const targetUser = Object.values(users).find(u => u.profileLinkToken === token);

        if (!targetUser || !targetUser.isLinkActive) {
            setToastMessage(t.invalidLink); return;
        }
        if (targetUser.id === CURRENT_USER_ID) {
            setToastMessage(t.cannotRequestSelf); return;
        }
        if (conversations.some(c => c.type === 'dm' && c.participants.includes(targetUser.id))) {
            setToastMessage(t.alreadyConnected); return;
        }
        if (targetUser.rejectedUserIds.includes(CURRENT_USER_ID) || props.blockedUsers.includes(targetUser.id)) {
            setToastMessage(t.requestBlocked); return;
        }

        onSendRequest(targetUser.id);
        setToastMessage(t.requestSent);
        setConnectLink('');
    };

    const handleAcceptAndChat = (request: ConnectionRequest) => {
        onAcceptRequest(request);
        setActiveView('chat');
    };

    const sections: { id: SettingsSection; icon: React.ReactNode; title: string; desc: string; badge?: number }[] = [
        { id: 'profile', icon: <UserCircleIcon className="w-6 h-6 text-blue-500"/>, title: t.profile, desc: t.profileDescription },
        { id: 'sharing', icon: <UserPlusIcon className="w-6 h-6 text-purple-500"/>, title: t.shareProfile, desc: t.shareProfileDescription, badge: pendingRequestCount },
        { id: 'blocked', icon: <BlockIcon className="w-6 h-6 text-red-500"/>, title: t.blockedUsers, desc: t.blockedUsersDescription },
        { id: 'theme', icon: <MoonIcon className="w-6 h-6 text-indigo-500"/>, title: t.theme, desc: t.themeDescription },
        { id: 'language', icon: <span className="text-xl font-bold">A/あ</span>, title: t.language, desc: t.languageDescription },
        { id: 'privacy', icon: <LockIcon className="w-6 h-6 text-gray-500"/>, title: t.privacy, desc: t.privacyDescription },
        { id: 'notifications', icon: <NotificationsIcon className="w-6 h-6 text-yellow-500"/>, title: t.notifications, desc: t.notificationsDescription },
        { id: 'account', icon: <LogoutIcon className="w-6 h-6 text-orange-500"/>, title: t.account, desc: t.accountDescription },
        { id: 'help', icon: <HelpIcon className="w-6 h-6 text-green-500"/>, title: t.help, desc: t.helpDescription },
    ];
    
    const SimpleQRCode: React.FC<{value: string}> = ({value}) => (
      <div className="bg-white p-4 rounded-lg shadow-md inline-block">
        <svg width="200" height="200" viewBox="0 0 256 256" >
            <path d="M0 0h256v256H0z" fill="#fff" />
            <path d="M50 50h70v70H50zm10 10v50h50V60zm70-10h70v70h-70zm10 10v50h50V60zM50 130h70v70H50zm10 10v50h50v-50z" fill="#000" />
            <path d="M150 130h10v10h-10zm20 0h10v10h-10zm20 0h10v10h-10zm-30 10h10v10h-10zm20 10h10v10h-10zm10-10h10v10h-10zm-30 10h10v10h-10zm-10 10h10v10h-10zm30 10h10v10h-10zm-20 20h10v10h-10zm20 0h10v10h-10zm-10-10h10v10h-10zm-10-10h10v10h-10zm30-20h10v10h-10zm0 20h10v10h-10z" fill="#000" />
        </svg>
      </div>
    );

    const renderMainList = () => (
        <div className="p-4 sm:p-6 md:p-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-green-800 dark:text-green-300 mb-6">{t.title}</h1>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700">
                {sections.map(({ id, icon, title, desc, badge }) => (
                    <button key={id} onClick={() => setActiveSection(id)} className="w-full text-left flex items-center p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 mr-4">{icon}</div>
                        <div className="flex-1">
                            <p className="font-semibold text-gray-800 dark:text-gray-100">{title}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{desc}</p>
                        </div>
                        <div className="flex items-center gap-2">
                        {badge !== undefined && badge > 0 && <span className="px-2 py-0.5 text-xs font-bold text-white bg-red-500 rounded-full">{t.pendingRequests.replace('{0}', badge.toString())}</span>}
                        <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
    
    const renderSectionContent = () => {
        switch (activeSection) {
            case 'profile':
                return (
                    <div>
                        <SettingsHeader title={t.editProfile} onBack={() => setActiveSection(null)} />
                        <div className="p-6 space-y-6">
                            <div className="flex flex-col items-center space-y-4">
                               <div className="relative">
                                    {currentUser.avatarUrl ? (
                                        <img src={currentUser.avatarUrl} alt="Profile" className="w-24 h-24 rounded-full object-cover shadow-md" />
                                    ) : (
                                        <div className={`w-24 h-24 rounded-full ${currentUser.avatarColor} flex items-center justify-center text-white font-bold text-4xl shadow-md`}>
                                            {currentUser.name.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                     <button 
                                        onClick={() => fileInputRef.current?.click()} 
                                        className="absolute -bottom-1 -right-1 bg-white dark:bg-gray-700 p-2 rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                                        aria-label={t.editPhoto}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 dark:text-gray-300" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                                            <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                    <input type="file" ref={fileInputRef} onChange={handlePhotoChange} accept="image/*" className="hidden" />
                               </div>
                            </div>
                             <div className="w-full space-y-4">
                                <div>
                                    <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t.displayName}</label>
                                    <input
                                        type="text"
                                        id="displayName"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t.status}</label>
                                    <input
                                        type="text"
                                        id="status"
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value)}
                                        className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                    />
                                </div>
                                <button
                                    onClick={handleSaveProfile}
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                >
                                    {t.save}
                                </button>
                            </div>
                        </div>
                    </div>
                );
            case 'sharing':
                const pendingRequests = currentUser.connectionRequests.filter(r => r.status === 'pending');
                const historyRequests = currentUser.connectionRequests.filter(r => r.status !== 'pending');

                return (
                     <div>
                        <SettingsHeader title={t.shareProfileTitle} onBack={() => setActiveSection(null)} />
                         <div className="border-b border-gray-200 dark:border-gray-700">
                             <nav className="flex space-x-4 px-4" aria-label="Tabs">
                                 {(['myLink', 'requests', 'connect'] as SharingSubSection[]).map(tab => (
                                      <button
                                         key={tab}
                                         onClick={() => setSharingSubSection(tab)}
                                         className={`${sharingSubSection === tab ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm relative`}
                                     >
                                        {t[tab]}
                                        {tab === 'requests' && pendingRequestCount > 0 && <span className="ml-2 bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5">{pendingRequestCount}</span>}
                                     </button>
                                 ))}
                             </nav>
                         </div>
                         <div className="p-6">
                            {sharingSubSection === 'myLink' && (
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.yourProfileLink}</label>
                                        <div className="flex items-center gap-2">
                                            <input type="text" readOnly value={`https://ubuhinzi360.app/connect/${currentUser.profileLinkToken}`} className="flex-1 block w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm sm:text-sm" />
                                            <button onClick={handleCopyLink} className="p-2 rounded-md bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500"><CopyIcon className="w-5 h-5"/></button>
                                            <button onClick={() => setQrModalOpen(true)} className="p-2 rounded-md bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500"><QrCodeIcon className="w-5 h-5"/></button>
                                        </div>
                                    </div>
                                    <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                         <h3 className="font-semibold">{t.linkSettings}</h3>
                                         <ToggleSwitch checked={currentUser.isLinkActive} onChange={e => handleSetLinkActive(e.target.checked)} label={t.linkActive} description={t.linkActiveDescription} />
                                         <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t.linkExpiry}</label>
                                            <select value={currentUser.linkExpiry} onChange={e => handleSetLinkExpiry(e.target.value as LinkExpiry)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600">
                                                <option value="24h">{t.expiry24h}</option>
                                                <option value="3d">{t.expiry3d}</option>
                                                <option value="7d">{t.expiry7d}</option>
                                                <option value="never">{t.expiryNever}</option>
                                            </select>
                                         </div>
                                    </div>
                                </div>
                            )}
                             {sharingSubSection === 'requests' && (
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="font-semibold mb-2">{t.pending}</h3>
                                        {pendingRequests.length === 0 ? <p className="text-sm text-gray-500 dark:text-gray-400">{t.noPendingRequests}</p> : (
                                            <ul className="space-y-2">
                                                {pendingRequests.map(req => (
                                                    <li key={req.fromUserId} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                                        <span>{users[req.fromUserId]?.name || 'Unknown User'}</span>
                                                        <div className="flex gap-2">
                                                            <button onClick={() => handleAcceptAndChat(req)} className="px-3 py-1 text-sm font-semibold text-white bg-green-600 rounded-md hover:bg-green-700">{t.accept}</button>
                                                            <button onClick={() => onRejectRequest(req)} className="px-3 py-1 text-sm font-semibold text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500">{t.reject}</button>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                    <div>
                                         <h3 className="font-semibold mb-2">{t.history}</h3>
                                        {historyRequests.length === 0 ? <p className="text-sm text-gray-500 dark:text-gray-400">No previous requests.</p> : (
                                            <ul className="space-y-2">
                                                {historyRequests.map(req => (
                                                    <li key={req.fromUserId} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                                         <span>{users[req.fromUserId]?.name || 'Unknown User'}</span>
                                                         <span className={`text-sm font-semibold ${req.status === 'accepted' ? 'text-green-600' : 'text-red-600'}`}>
                                                            {t[req.status]}
                                                         </span>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </div>
                             )}
                              {sharingSubSection === 'connect' && (
                                <div className="space-y-4">
                                     <h3 className="font-semibold">{t.connectWithUser}</h3>
                                     <div>
                                        <label htmlFor="connect-link" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t.pasteLink}</label>
                                        <input type="text" id="connect-link" value={connectLink} onChange={e => setConnectLink(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm" />
                                    </div>
                                    <button onClick={handleConnectWithLink} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">{t.sendRequest}</button>
                                </div>
                              )}
                         </div>
                    </div>
                );
             case 'blocked':
                return (
                    <div>
                        <SettingsHeader title={t.blockedUsers} onBack={() => setActiveSection(null)} />
                        <div className="p-6">
                            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                                {props.blockedUsers.length > 0 ? props.blockedUsers.map(userId => (
                                    <li key={userId} className="py-3 flex items-center justify-between">
                                        <span className="text-gray-800 dark:text-gray-200">{users[userId]?.name || 'Unknown User'}</span>
                                        <button onClick={() => handleUnblockUser(userId)} className="text-sm font-semibold text-blue-600 hover:text-blue-800">{t.unblock}</button>
                                    </li>
                                )) : <p className="text-center text-gray-500 py-4">{t.noBlockedUsers}</p>}
                            </ul>
                            <button onClick={() => setBlockUserModalOpen(true)} className="mt-6 w-full flex justify-center items-center gap-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                                <BlockIcon className="w-5 h-5"/>
                                {t.blockNewUser}
                            </button>
                        </div>
                    </div>
                );
            case 'theme':
                return (
                    <div>
                         <SettingsHeader title={t.theme} onBack={() => setActiveSection(null)} />
                         <div className="p-6 space-y-4">
                            <button onClick={props.toggleTheme} className={`w-full p-4 rounded-lg border-2 text-left ${props.theme === 'light' ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-transparent dark:bg-gray-800 hover:dark:bg-gray-700/50'}`}>
                                {t.light}
                            </button>
                            <button onClick={props.toggleTheme} className={`w-full p-4 rounded-lg border-2 text-left ${props.theme === 'dark' ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-transparent bg-white dark:bg-gray-800 hover:dark:bg-gray-700/50'}`}>
                                 {t.dark}
                            </button>
                         </div>
                    </div>
                );
            case 'language':
                 return (
                    <div>
                        <SettingsHeader title={t.language} onBack={() => setActiveSection(null)} />
                        <div className="p-6 space-y-4">
                            {LANGUAGE_OPTIONS.map(({ code, name }) => (
                                <button
                                    key={code}
                                    onClick={() => props.setLanguage(code)}
                                    className={`w-full p-4 rounded-lg border-2 text-left ${props.language === code ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-transparent bg-white dark:bg-gray-800 hover:dark:bg-gray-700/50'}`}
                                >
                                    {name}
                                </button>
                            ))}
                        </div>
                    </div>
                );
            case 'privacy':
                const privacyOptions: ('everyone' | 'contactsOnly' | 'nobody')[] = ['everyone', 'contactsOnly', 'nobody'];
                return (
                    <div>
                        <SettingsHeader title={t.privacy} onBack={() => setActiveSection(null)} />
                        <div className="p-6 space-y-6">
                           {[
                               {key: 'contact', label: t.whoCanContactMe}, 
                               {key: 'profilePhoto', label: t.whoCanSeeProfile},
                               {key: 'status', label: t.whoCanSeeStatus}
                           ].map(({key, label}) => (
                            <div key={key}>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
                                <select 
                                    value={props.privacySettings[key as keyof PrivacySettings]}
                                    onChange={(e) => props.setPrivacySettings(prev => ({...prev, [key]: e.target.value as any}))}
                                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600"
                                >
                                  {privacyOptions.map(opt => <option key={opt} value={opt}>{t[opt]}</option>)}
                                </select>
                            </div>
                           ))}
                        </div>
                    </div>
                );
            case 'notifications':
                return (
                     <div>
                        <SettingsHeader title={t.notifications} onBack={() => setActiveSection(null)} />
                        <div className="p-2 divide-y divide-gray-200 dark:divide-gray-700">
                           <ToggleSwitch checked={props.notificationSettings.messages} onChange={e => props.setNotificationSettings(p => ({...p, messages: e.target.checked}))} label={t.messageNotifications} />
                           <ToggleSwitch checked={props.notificationSettings.groups} onChange={e => props.setNotificationSettings(p => ({...p, groups: e.target.checked}))} label={t.groupNotifications} />
                           <ToggleSwitch checked={props.notificationSettings.sound} onChange={e => props.setNotificationSettings(p => ({...p, sound: e.target.checked}))} label={t.sound} />
                           <ToggleSwitch checked={props.notificationSettings.vibration} onChange={e => props.setNotificationSettings(p => ({...p, vibration: e.target.checked}))} label={t.vibration} />
                        </div>
                    </div>
                );
            case 'account':
                 return (
                    <div>
                        <SettingsHeader title={t.account} onBack={() => setActiveSection(null)} />
                        <div className="p-6 space-y-4">
                            <button className="w-full text-left p-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-4 text-gray-700 dark:text-gray-300">
                                <LogoutIcon className="w-6 h-6"/>
                                {t.logout}
                            </button>
                            <button onClick={() => setDeleteConfirmModalOpen(true)} className="w-full text-left p-4 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/50 flex items-center gap-4 text-red-600 dark:text-red-400">
                                <TrashIcon className="w-6 h-6"/>
                                {t.deleteAccount}
                            </button>
                        </div>
                    </div>
                );
            case 'help':
                return (
                    <div>
                        <SettingsHeader title={t.help} onBack={() => setActiveSection(null)} />
                        <div className="p-6 space-y-2">
                             {[{label: t.faq}, {label: t.contactSupport}, {label: t.reportProblem}].map(item => (
                                 <a href="#" key={item.label} className="w-full text-left p-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between text-gray-700 dark:text-gray-300">
                                    <span>{item.label}</span>
                                    <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                                 </a>
                             ))}
                        </div>
                    </div>
                );
            default:
                return renderMainList();
        }
    };
    
    const unblockedUsers = Object.values(users).filter(u => u.id !== CURRENT_USER_ID && !props.blockedUsers.includes(u.id));

    return (
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
            {toastMessage && <Toast message={toastMessage} onDismiss={() => setToastMessage(null)} />}
            
            {activeSection ? renderSectionContent() : renderMainList()}
            
            {isBlockUserModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6">
                        <h3 className="text-lg font-bold mb-4">{t.blockNewUser}</h3>
                        <select id="user-to-block" className="mb-4 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600">
                            <option value="">{t.selectUserToBlock}</option>
                            {unblockedUsers.map(user => (
                                <option key={user.id} value={user.id}>{user.name}</option>
                            ))}
                        </select>
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setBlockUserModalOpen(false)} className="px-4 py-2 text-sm font-medium rounded-md">{t.cancel}</button>
                            <button onClick={() => handleBlockUser((document.getElementById('user-to-block') as HTMLSelectElement)?.value)} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700">{t.blockUser}</button>
                        </div>
                    </div>
                </div>
            )}
            {isDeleteConfirmModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6 text-center">
                        <TrashIcon className="w-12 h-12 text-red-500 mx-auto mb-4"/>
                        <h3 className="text-lg font-bold mb-2">{t.deleteAccountConfirmationTitle}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{t.deleteAccountConfirmationMessage}</p>
                        <div className="flex justify-center gap-4">
                            <button onClick={() => setDeleteConfirmModalOpen(false)} className="px-6 py-2 text-sm font-medium rounded-md bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500">{t.cancel}</button>
                            <button onClick={handleDeleteAccount} className="px-6 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700">{t.delete}</button>
                        </div>
                    </div>
                </div>
            )}
            {isQrModalOpen && (
                 <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4" onClick={() => setQrModalOpen(false)}>
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 text-center" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-bold mb-4">{t.yourProfileLink}</h3>
                        <SimpleQRCode value={`https://ubuhinzi360.app/connect/${currentUser.profileLinkToken}`} />
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-4 break-all p-2 bg-gray-100 dark:bg-gray-700 rounded-md">{`https://ubuhinzi360.app/connect/${currentUser.profileLinkToken}`}</p>
                    </div>
                 </div>
            )}
        </div>
    );
};
export default SettingsPage;