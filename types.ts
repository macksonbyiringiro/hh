
export enum Language {
    EN = 'en',
    RW = 'rw',
    FR = 'fr',
    SW = 'sw',
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
  // New properties for secure sharing
  profileLinkToken: string;
  linkExpiry: LinkExpiry;
  isLinkActive: boolean;
  connectionRequests: ConnectionRequest[];
  rejectedUserIds: string[];
}

export interface Plot {
    id: string;
    ownerId: string;
    name: string;
    coordinates: [number, number]; // [lat, lng]
    crop: Crop;
    size: number; // in hectares
    farmingStage: 'Planting' | 'Growing' | 'Harvesting' | 'Fallow';
}

export interface Message {
    id: string;
    text: string;
    senderId: string;
    timestamp: string;
}

export type ConversationType = 'dm' | 'group';

export interface Conversation {
    id: string;
    type: ConversationType;
    name?: string; // For groups
    participants: string[]; // array of user IDs
    messages: Message[];
}

export interface Translations {
    header: {
        title: string;
        language: string;
        dashboard: string;
        map: string;
        chat: string;
        settings: string;
    };
    dashboard: {
        title: string;
    };
    farmingTips: {
        title:string;
        selectCrop: string;
        getTips: string;
        generating: string;
        tipIntro: string;
        error: string;
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
    };
    map: {
        title: string;
        addPlot: string;
        legend: string;
        satelliteView: string;
        streetView: string;
        filterByCrop: string;
        filterByFarmer: string;
        allCrops: string;
        allFarmers: string;
        plotDetails: string;
        owner: string;
        crop: string;
        size: string;
        hectares: string;
        farmingStage: string;
        generateQrCode: string;
        editDetails: string;
        addPlotTitle: string;
        plotName: string;
        clickToPlace: string;
        savePlot: string;
        cancel: string;
        qrCodeTitle: string;
        scanQrCode: string;
        yieldPrediction: string;
        getYieldPrediction: string;
        predicting: string;
        predictedYield: string; // Takes one argument: yield amount
        predictionError: string;
        getDirections: string;
        // New keys for directions
        directionsTo: string; // "Directions to {0}"
        fetchingLocation: string;
        locationError: string;
        generatingDirections: string;
        directionsError: string;
        yourLocation: string;
        destination: string;
        openInGoogleMaps: string;
        startLocation: string;
        startLocationPlaceholder: string;
        startLocationRequiredError: string;
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