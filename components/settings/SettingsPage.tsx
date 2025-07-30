import React, { useState, useEffect, useRef } from 'react';
import { Language, Translations, User, PrivacySettings, NotificationSettings, ConnectionRequest, LinkExpiry, Conversation } from '../../types';
import { CURRENT_USER_ID, AI_USER_ID } from '../../constants';

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
import { XIcon } from '../icons/XIcon';
import { PlantIcon } from '../icons/PlantIcon';
import { UserPlusIcon } from '../icons/UserPlusIcon';
import { LinkIcon } from '../icons/LinkIcon';
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
    <label className="flex items-center justify-between cursor-pointer">
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
    const [isSaved, setIsSaved] = useState(false);
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
        props.setBlockedUsers(prev => [...prev, userId]);
        setBlockUserModalOpen(false);
    };
    
    const handleDeleteAccount = () => {
        alert("Account deleted simulation. Resetting app state.");
        if (typeof window !== 'undefined') localStorage.clear();
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
        const token = connectLink.split('/').pop();
        const targetUser = Object.values(users).find(u => u.profileLinkToken === token);

        if (targetUser?.id === CURRENT_USER_ID) {
            setToastMessage(t.cannotRequestSelf); return;
        }
        if (!targetUser || !targetUser.isLinkActive) {
            setToastMessage(t.invalidLink); return;
        }
        if (targetUser.rejectedUserIds.includes(CURRENT_USER_ID) || props.blockedUsers.includes(targetUser.id)) {
            setToastMessage(t.requestBlocked); return;
        }
        if (conversations.some(c => c.type === 'dm' && c.participants.includes(targetUser.id))) {
            setToastMessage(t.alreadyConnected); return;
        }

        onSendRequest(targetUser.id);
        setToastMessage(t.requestSent);
        setConnectLink('');
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
      <svg width="200" height="200" viewBox="0 0 256 256" className="bg-white p-4 rounded-lg shadow-md">
        <path d="M0 0h256v256H0z" fill="#fff" />
        <path d="M50 50h70v70H50zm10 10v50h50V60zm70-10h70v70h-70zm10 10v50h50V60zM50 130h70v70H50zm10 10v50h50v-50z" fill="#000" />
        <path d="M150 130h10v10h-10zm20 0h10v10h-10zm20 0h10v10h-10zm-30 10h10v10h-10zm20 10h10v10h-10zm10-10h10v10h-10zm-30 10h10v10h-10zm-10 10h10v10h-10zm30 10h10v10h-10zm-20 20h10v10h-10zm20 0h10v10h-10zm-10-10h10v10h-10zm-10-10h10v10h-10zm30-20h10v10h-10zm0 20h10v10h-10z" fill="#000" />
      </svg>
    );

    const renderMainList = () => (
        <div className="p-4 sm:p-6 md:p-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-green-800 dark:text-green-300 mb-6">{t.title}</h1>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700">
                {sections.map(({ id, icon, title, desc, badge }) => (
                    <button key={id} onClick={() => setActiveSection(id)} className="w-full text-left flex items-center p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        {id === 'profile' ? (
                            currentUser.avatarUrl ? (
                                <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-10 h-10 rounded-full object-cover mr-4" />
                            ) : (
                                <div className={`w-10 h-10 rounded-full ${currentUser.avatarColor} flex items-center justify-center text-white font-bold mr-4`}>
                                    {currentUser.name.charAt(0).toUpperCase()}
                                </div>
                            )
                        ) : (
                            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 mr-4">{icon}</div>
                        )}
                        <div className="flex-1">
                            <p className="font-semibold text-gray-800 dark:text-gray-100">{title}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{desc}</p>
                        </div>
                        <div className="flex items-center gap-2">
                        {badge && badge > 0 && <span className="px-2 py-0.5 text-xs font-bold text-white bg-red-500 rounded-full">{t.pendingRequests.replace('{0}', badge.toString())}</span>}
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
                                     <input type="file" ref={fileInputRef} onChange={handlePhotoChange} className="hidden" accept="image/*" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t.displayName}</label>
                                <input id="displayName" type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
                            </div>
                             <div className="space-y-2">
                                <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t.status}</label>
                                <input id="status" type="text" value={status} onChange={e => setStatus(e.target.value)} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
                            </div>
                            <button onClick={handleSaveProfile} className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">{t.save}</button>
                        </div>
                    </div>
                );
            case 'sharing':
                const TabButton: React.FC<{label: string, section: SharingSubSection, badge?: number}> = ({ label, section, badge }) => (
                    <button onClick={() => setSharingSubSection(section)} className={`relative px-4 py-2 text-sm font-medium rounded-full transition-colors ${sharingSubSection === section ? 'bg-green-600 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                        {label}
                        {badge && badge > 0 && <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold">{badge}</span>}
                    </button>
                );
                return (
                    <div>
                        <SettingsHeader title={t.shareProfileTitle} onBack={() => setActiveSection(null)} />
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-center space-x-2">
                            <TabButton label={t.myLink} section="myLink" />
                            <TabButton label={t.requests} section="requests" badge={pendingRequestCount} />
                            <TabButton label={t.connect} section="connect" />
                        </div>
                        <div className="p-6">
                            {sharingSubSection === 'myLink' && (
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.yourProfileLink}</label>
                                        <div className="flex gap-2">
                                            <input type="text" readOnly value={`https://ubuhinzi360.app/connect/${currentUser.profileLinkToken}`} className="flex-1 p-2 border rounded-md bg-gray-100 dark:bg-gray-700 dark:border-gray-600 truncate"/>
                                            <button onClick={handleCopyLink} className="p-2 bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500"><CopyIcon className="w-5 h-5"/></button>
                                            <button onClick={() => setQrModalOpen(true)} className="p-2 bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500"><QrCodeIcon className="w-5 h-5"/></button>
                                        </div>
                                    </div>
                                    <div className="border-t dark:border-gray-700 pt-6 space-y-4">
                                        <h3 className="font-semibold text-lg">{t.linkSettings}</h3>
                                        <ToggleSwitch label={t.linkActive} description={t.linkActiveDescription} checked={currentUser.isLinkActive} onChange={e => handleSetLinkActive(e.target.checked)} />
                                        <div>
                                            <label className="block text-sm font-medium mb-2">{t.linkExpiry}</label>
                                            <select value={currentUser.linkExpiry} onChange={e => handleSetLinkExpiry(e.target.value as LinkExpiry)} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600">
                                                <option value="24h">{t.expiry24h}</option>
                                                <option value="3d">{t.expiry3d}</option>
                                                <option value="7d">{t.expiry7d}</option>
                                                <option value="never">{t.expiryNever}</option>
                                            </select>
                                        </div>
                                    </div>
                                    {isQrModalOpen && (
                                        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center" onClick={() => setQrModalOpen(false)}>
                                            <div className="p-4 bg-white rounded-lg" onClick={e => e.stopPropagation()}>
                                                <SimpleQRCode value={`https://ubuhinzi360.app/connect/${currentUser.profileLinkToken}`} />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                            {sharingSubSection === 'requests' && (
                                <div>
                                    <h3 className="font-semibold text-lg mb-2">{t.pending}</h3>
                                    <ul className="space-y-2">
                                        {currentUser.connectionRequests.filter(r => r.status === 'pending').map(r => (
                                            <li key={r.fromUserId} className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                                <span className="font-medium">{users[r.fromUserId]?.name || '...'}</span>
                                                <div className="flex gap-2">
                                                    <button onClick={() => onRejectRequest(r)} className="px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700">{t.reject}</button>
                                                    <button onClick={() => onAcceptRequest(r)} className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700">{t.accept}</button>
                                                </div>
                                            </li>
                                        ))}
                                        {pendingRequestCount === 0 && <p className="text-center text-gray-500 dark:text-gray-400 py-4">{t.noPendingRequests}</p>}
                                    </ul>
                                    <h3 className="font-semibold text-lg mt-6 mb-2">{t.history}</h3>
                                     <ul className="space-y-2">
                                        {currentUser.connectionRequests.filter(r => r.status !== 'pending').map(r => (
                                            <li key={r.fromUserId} className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
                                                <span className="font-medium">{users[r.fromUserId]?.name || '...'}</span>
                                                <span className={`text-sm font-bold ${r.status === 'accepted' ? 'text-green-500' : 'text-red-500'}`}>{r.status === 'accepted' ? t.accepted : t.rejected}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                             {sharingSubSection === 'connect' && (
                                <div className="space-y-4">
                                     <h3 className="font-semibold text-lg">{t.connectWithUser}</h3>
                                     <div>
                                         <label htmlFor="connectLink" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.pasteLink}</label>
                                         <input id="connectLink" type="text" value={connectLink} onChange={e => setConnectLink(e.target.value)} placeholder="https://ubuhinzi360.app/connect/..." className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"/>
                                     </div>
                                     <button onClick={handleConnectWithLink} className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">{t.sendRequest}</button>
                                </div>
                            )}
                        </div>
                    </div>
                );
            case 'blocked':
                const usersToBlock = Object.values(users).filter(u => u.id !== CURRENT_USER_ID && !props.blockedUsers.includes(u.id));
                return (
                     <div>
                        <SettingsHeader title={t.blockedUsers} onBack={() => setActiveSection(null)} />
                        <div className="p-6 space-y-4">
                            {props.blockedUsers.length === 0 ? (
                                <p className="text-center text-gray-500 dark:text-gray-400 py-4">{t.noBlockedUsers}</p>
                            ) : (
                                <ul className="divide-y dark:divide-gray-700">
                                    {props.blockedUsers.map(id => (
                                        <li key={id} className="flex items-center justify-between py-3">
                                            <span className="font-medium">{users[id]?.name || 'Unknown User'}</span>
                                            <button onClick={() => handleUnblockUser(id)} className="px-3 py-1 text-sm text-red-600 border border-red-600 rounded-md hover:bg-red-50 dark:hover:bg-red-900/50">{t.unblock}</button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                            <button onClick={() => setBlockUserModalOpen(true)} className="w-full mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">{t.blockNewUser}</button>
                            {isBlockUserModalOpen && (
                                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setBlockUserModalOpen(false)}>
                                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                                        <header className="flex items-center justify-between p-4 border-b dark:border-gray-700"><h3 className="font-bold text-lg">{t.selectUserToBlock}</h3><button onClick={() => setBlockUserModalOpen(false)}><XIcon className="w-6 h-6" /></button></header>
                                        <ul className="p-2 max-h-64 overflow-y-auto">
                                            {usersToBlock.map(u => (
                                                <li key={u.id} className="flex items-center justify-between p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
                                                    <span>{u.name} ({u.role})</span>
                                                    <button onClick={() => handleBlockUser(u.id)} className="px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700">{t.blockUser}</button>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                );
            case 'theme':
                return (
                    <div>
                        <SettingsHeader title={t.theme} onBack={() => setActiveSection(null)} />
                        <div className="p-6 space-y-4">
                            <button onClick={() => props.toggleTheme()} className={`w-full p-4 border-2 rounded-lg text-left ${props.theme === 'light' ? 'border-green-500' : 'border-transparent'}`}>
                                <h4 className="font-bold">{t.light}</h4>
                            </button>
                             <button onClick={() => props.toggleTheme()} className={`w-full p-4 border-2 rounded-lg text-left ${props.theme === 'dark' ? 'border-green-500' : 'border-transparent'}`}>
                                <h4 className="font-bold">{t.dark}</h4>
                            </button>
                        </div>
                    </div>
                );
            case 'language':
                 return (
                    <div>
                        <SettingsHeader title={t.language} onBack={() => setActiveSection(null)} />
                        <div className="p-6 space-y-4">
                            <button onClick={() => props.setLanguage(Language.EN)} className={`w-full p-4 border-2 rounded-lg text-left ${props.language === Language.EN ? 'border-green-500' : 'border-transparent'}`}>
                                <h4 className="font-bold">{t.english}</h4>
                            </button>
                             <button onClick={() => props.setLanguage(Language.RW)} className={`w-full p-4 border-2 rounded-lg text-left ${props.language === Language.RW ? 'border-green-500' : 'border-transparent'}`}>
                                <h4 className="font-bold">{t.kinyarwanda}</h4>
                            </button>
                        </div>
                    </div>
                );
            case 'privacy':
                return (
                    <div>
                        <SettingsHeader title={t.privacy} onBack={() => setActiveSection(null)} />
                        <div className="p-6 space-y-4">
                            {[
                                { key: 'contact', title: t.whoCanContactMe },
                                { key: 'profilePhoto', title: t.whoCanSeeProfile },
                                { key: 'status', title: t.whoCanSeeStatus }
                            ].map(item => (
                                <div key={item.key}>
                                    <label className="block text-sm font-medium mb-2">{item.title}</label>
                                    <select 
                                        value={props.privacySettings[item.key as keyof PrivacySettings]} 
                                        onChange={e => props.setPrivacySettings(prev => ({...prev, [item.key]: e.target.value}))}
                                        className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                                    >
                                        <option value="everyone">{t.everyone}</option>
                                        <option value="contactsOnly">{t.contactsOnly}</option>
                                        <option value="nobody">{t.nobody}</option>
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
                        <div className="p-6 space-y-6">
                            <ToggleSwitch label={t.messageNotifications} checked={props.notificationSettings.messages} onChange={e => props.setNotificationSettings(p => ({...p, messages: e.target.checked}))} />
                            <ToggleSwitch label={t.groupNotifications} checked={props.notificationSettings.groups} onChange={e => props.setNotificationSettings(p => ({...p, groups: e.target.checked}))} />
                            <ToggleSwitch label={t.sound} checked={props.notificationSettings.sound} onChange={e => props.setNotificationSettings(p => ({...p, sound: e.target.checked}))} />
                            <ToggleSwitch label={t.vibration} checked={props.notificationSettings.vibration} onChange={e => props.setNotificationSettings(p => ({...p, vibration: e.target.checked}))} />
                        </div>
                    </div>
                );
            case 'account':
                 return (
                    <div>
                        <SettingsHeader title={t.account} onBack={() => setActiveSection(null)} />
                        <div className="p-6 space-y-4">
                            <button className="w-full flex items-center justify-center gap-2 p-3 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                                <LogoutIcon className="w-5 h-5"/>
                                <span>{t.logout}</span>
                            </button>
                             <button onClick={() => setDeleteConfirmModalOpen(true)} className="w-full flex items-center justify-center gap-2 p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-md hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors">
                                <TrashIcon className="w-5 h-5"/>
                                <span>{t.deleteAccount}</span>
                            </button>
                             {isDeleteConfirmModalOpen && (
                                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setDeleteConfirmModalOpen(false)}>
                                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md p-6 text-center" onClick={e => e.stopPropagation()}>
                                        <PlantIcon className="w-12 h-12 mx-auto text-red-500 mb-4"/>
                                        <h3 className="font-bold text-lg mb-2">{t.deleteAccountConfirmationTitle}</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{t.deleteAccountConfirmationMessage}</p>
                                        <div className="flex gap-4">
                                             <button onClick={() => setDeleteConfirmModalOpen(false)} className="flex-1 p-2 bg-gray-200 dark:bg-gray-600 rounded-md">{t.cancel}</button>
                                             <button onClick={handleDeleteAccount} className="flex-1 p-2 bg-red-600 text-white rounded-md">{t.delete}</button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                );
            case 'help':
                 return (
                    <div>
                        <SettingsHeader title={t.help} onBack={() => setActiveSection(null)} />
                        <div className="p-6 space-y-3">
                            {[{ title: t.faq}, { title: t.contactSupport}, { title: t.reportProblem }].map(item => (
                                 <a key={item.title} href="#" className="w-full flex items-center justify-between p-4 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <span>{item.title}</span>
                                    <ChevronRightIcon className="w-5 h-5 text-gray-400"/>
                                 </a>
                            ))}
                        </div>
                    </div>
                );
            default:
                return renderMainList();
        }
    };

    return (
        <div className="bg-gray-50 dark:bg-gray-900 min-h-[calc(100vh-128px)]">
            {toastMessage && <Toast message={toastMessage} onDismiss={() => setToastMessage(null)} />}
            {renderSectionContent()}
        </div>
    );
};

export default SettingsPage;