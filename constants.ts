
import { Language, Translations, Crop } from './types';

export const translations: Record<Language, Translations> = {
    [Language.EN]: {
        header: {
            title: 'Ubuhinzi360',
            language: 'Language',
        },
        dashboard: {
            title: 'Farmer\'s Dashboard',
        },
        weather: {
            title: 'Weather in Kigali',
            location: 'Kigali, Rwanda',
            description: 'Partly Cloudy',
            humidity: 'Humidity',
            wind: 'Wind',
        },
        farmingTips: {
            title: 'AI Farming Assistant',
            selectCrop: 'Select a crop to get personalized tips:',
            getTips: 'Get Farming Tips',
            generating: 'Generating tips, please wait...',
            tipIntro: 'Here are some AI-generated tips for growing',
            error: 'Sorry, an error occurred while fetching tips. Please try again.',
        },
    },
    [Language.RW]: {
        header: {
            title: 'Ubuhinzi360',
            language: 'Ururimi',
        },
        dashboard: {
            title: 'Imbonerahamwe y\'Umuhinzi',
        },
        weather: {
            title: 'Iteganyagihe i Kigali',
            location: 'Kigali, u Rwanda',
            description: 'Igice cy\'ibicu',
            humidity: 'Ubuhehere',
            wind: 'Umuyaga',
        },
        farmingTips: {
            title: 'Umujyanama mu Buhinzi wa AI',
            selectCrop: 'Hitamo igihingwa kugirango ubone inama:',
            getTips: 'Saba Inama z\'Ubuhinzi',
            generating: 'Turimo gutunganya inama, nyamuneka tegereza...',
            tipIntro: 'Dore inama z\'ubwenge bwa mudasobwa zo guhinga',
            error: 'Tubiseguyeho, habaye ikibazo mu kubona inama. Nyamuneka ongera ugerageze.',
        },
    }
};

export const CROP_OPTIONS = Object.values(Crop);
