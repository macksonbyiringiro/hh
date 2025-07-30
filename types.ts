
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

export interface Translations {
    header: {
        title: string;
        language: string;
    };
    dashboard: {
        title: string;
    };
    weather: {
        title: string;
        location: string;
        description: string;
        humidity: string;
        wind: string;
    };
    farmingTips: {
        title: string;
        selectCrop: string;
        getTips: string;
        generating: string;
        tipIntro: string;
        error: string;
    };
}
