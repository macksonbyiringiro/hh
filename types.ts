export enum Language {
    EN = 'en',
    RW = 'rw',
}

export enum Crop {
    MAIZE = 'Maize',
    BEANS = 'Beans',
    POTATOES = 'Potatoes',
    CASSAVA = 'Cassava',
    COFFEE = 'Coffee',
    TEA = 'Tea',
}

export interface ConnectionRequest {
  fromUserId: string;
  timestamp: string;
  status: 'pending' | 'accepted' | 'rejected';
}

export type LinkExpiry = '24h' | '3d' | '7d' | 'never';

export interface User {
  id: string;
  name: string;
  role: 'Farmer' | 'Buyer' | 'You' | 'AI Assistant';
  avatarUrl?: string;
  avatarColor: string; // e.g., 'bg-blue-500'
  isOnline?: boolean;
  status: string;
  profileLinkToken: string;
  linkExpiry: LinkExpiry;
  isLinkActive: boolean;
  connectionRequests: ConnectionRequest[];
  rejectedUserIds: string[];
}

export type MessageType = 'text' | 'audio' | 'image' | 'video' | 'system';

export interface Message {
    id: string;
    senderId: string;
    timestamp: string;
    type: MessageType;
    text?: string;
    url?: string;
    meta?: {
        duration?: string;
        fileName?: string;
        fileSize?: number;
        mimeType?: string;
    }
}

export type MessagePayload = 
    { type: 'text', text: string } | 
    { type: 'audio' | 'image' | 'video', url: string, meta: Message['meta'] };


export type ConversationType = 'dm' | 'group';

export interface Conversation {
    id: string;
    type: ConversationType;
    name?: string; // For groups
    participants: string[]; // array of user IDs
    messages: Message[];
}

export interface Product {
    id: string;
    name: string;
    sellerId: string;
    price: number;
    unit: 'kg' | 'bunch' | 'bag';
    imageUrl: string;
    crop: Crop;
    dateAdded: string;
}

export interface Alert {
    id: string;
    title: string;
    description: string;
    type: 'warning' | 'info' | 'announcement';
    date: string;
}

export interface MarketTrendData {
    month: string;
    price: number;
}

export interface Comment {
    id: string;
    authorId: string;
    timestamp: string;
    content: string;
}

export interface Post {
    id: string;
    authorId: string;
    timestamp: string;
    content: string;
    imageUrl?: string;
    likes: number;
    comments: Comment[];
}

export interface FarmlandPlot {
    id: string;
    locationName: string;
    district: string;
    size: string; // e.g. "2 Hectares"
    soilType: string;
    price: string; // e.g. "RWF 500,000 / year"
    ownerId: string;
    imageUrl: string;
    coords: { x: number, y: number }; // Percentage-based coordinates for SVG map
}

export interface Translations {
    header: {
        title: string;
        language: string;
        dashboard: string;
        chat: string;
        community: string;
        settings: string;
        findLand: string;
    };
    dashboard: {
        title: string;
        quickActions: {
            title: string;
            addProduct: string;
            sendMessage: string;
            search: string;
        };
        userStats: {
            title: string;
            productsSold: string;
            connections: string;
        };
        activityFeed: {
            title: string;
            newMessageFrom: string;
            newMessageIn: string;
            connectionRequestFrom: string;
            accept: string;
            reject: string;
            viewChat: string;
            noActivity: string;
            sentAnImage: string;
            sentAVideo: string;
            sentAVoiceMessage: string;
        };
        marketplace: {
            title: string;
            newlyAdded: string;
            marketMovers: string;
            viewAll: string;
        };
        marketTrends: {
            title: string;
            priceHistoryFor: string;
            selectCrop: string;
        };
        alerts: {
            title: string;
            noAlerts: string;
        };
    };
    weather: {
        title: string;
        location: string;
        description: string;
        humidity: string;
        wind: string;
    };
    farmingTips: {
        title:string;
        selectCrop: string;
        getTips: string;
        generating: string;
        tipIntro: string;
        error: string;
    };
     community: {
        title: string;
        newPostPlaceholder: string;
        postButton: string;
        like: string;
        comment: string;
        addCommentPlaceholder: string;
        noPosts: string;
        viewAllComments: string;
        comments: string;
        addImage: string;
    };
    chat: {
        title: string;
        groupName: string;
        participants: string;
        inputPlaceholder: string;
        searchPlaceholder: string;
        newChat: string;
        welcomeTitle: string;
        welcomeMessage: string;
        typing: string;
        newChatTitle: string;
        startChat: string;
        noUsers: string;
        chatStartedSystemMessage: string; // Takes one argument: user name
        cancel: string;
        recording: string;
    };
    settings: {
        title: string;
        // Sections
        profile: string;
        profileDescription: string;
        shareProfile: string;
        shareProfileDescription: string;
        pendingRequests: string;
        blockedUsers: string;
        blockedUsersDescription: string;
        theme: string;
        themeDescription: string;
        chatAppearance: string;
        chatAppearanceDescription: string;
        language: string;
        languageDescription: string;
        privacy: string;
        privacyDescription: string;
        notifications: string;
        notificationsDescription: string;
        account: string;
        accountDescription: string;
        help: string;
        helpDescription: string;
        findLand: {
            title: string;
            description: string;
            filterByDistrict: string;
            allDistricts: string;
            noPlotsFound: string;
            size: string;
            soil: string;
            contactOwner: string;
            plotDetails: string;
        };
        // Profile
        editProfile: string;
        editPhoto: string;
        displayName: string;
        status: string;
        save: string;
        saved: string;
        // Blocked Users
        unblock: string;
        noBlockedUsers: string;
        blockNewUser: string;
        blockUser: string;
        selectUserToBlock: string;
        // Theme
        light: string;
        dark: string;
        // Chat Appearance
        chatBackground: string;
        presetImages: string;
        gradients: string;
        solidColors: string;
        uploadYourOwn: string;
        uploadFromDevice: string;
        takeAPicture: string;
        resetToDefault: string;
        // Language
        english: string;
        kinyarwanda: string;
        // Privacy
        whoCanContactMe: string;
        whoCanSeeProfile: string;
        whoCanSeeStatus: string;
        everyone: string;
        contactsOnly: string;
        nobody: string;
        // Notifications
        messageNotifications: string;
        groupNotifications: string;
        sound: string;
        vibration: string;
        // Account
        logout: string;
        deleteAccount: string;
        deleteAccountConfirmationTitle: string;
        deleteAccountConfirmationMessage: string;
        cancel: string;
        delete: string;
        // Help
        faq: string;
        contactSupport: string;
        reportProblem: string;
        // Sharing
        shareProfileTitle: string;
        myLink: string;
        requests: string;
        connect: string;
        yourProfileLink: string;
        copyLink: string;
        linkCopied: string;
        showQrCode: string;
        linkSettings: string;
        linkActive: string;
        linkActiveDescription: string;
        linkExpiry: string;
        expiry24h: string;
        expiry3d: string;
        expiry7d: string;
        expiryNever: string;
        pending: string;
        history: string;
        noPendingRequests: string;
        accept: string;
        reject: string;
        accepted: string;
        rejected: string;
        connectWithUser: string;
        pasteLink: string;
        sendRequest: string;
        requestSent: string;
        invalidLink: string;
        cannotRequestSelf: string;
        alreadyConnected: string;
        requestBlocked: string;
        // Generic
        back: string;
    };
}

export interface PrivacySettings {
    contact: 'everyone' | 'contactsOnly' | 'nobody';
    profilePhoto: 'everyone' | 'contactsOnly' | 'nobody';
    status: 'everyone' | 'contactsOnly' | 'nobody';
}

export interface NotificationSettings {
    messages: boolean;
    groups: boolean;
    sound: boolean;
    vibration: boolean;
}

export type BackgroundType = 'preset' | 'gradient' | 'upload' | 'color';

export interface ChatSettings {
    backgroundType: BackgroundType;
    backgroundValue: string; // URL for preset/upload, CSS for gradient, or hex for color
}