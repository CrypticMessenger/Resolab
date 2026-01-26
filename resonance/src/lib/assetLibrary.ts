
export interface AudioAsset {
    tags: string[];
    url: string;
    category: string;
}

// Master list of assets
const ASSET_DATABASE: AudioAsset[] = [
    // --- AMBIENCE / WEATHER ---
    { tags: ['rain', 'storm', 'weather', 'downpour'], url: 'https://pcdebvnuuryykgligezd.supabase.co/storage/v1/object/public/globalAssets/rain.mp3', category: 'Ambience' },
    { tags: ['wind', 'breeze', 'gale', 'air'], url: 'https://pcdebvnuuryykgligezd.supabase.co/storage/v1/object/public/globalAssets/wind.mp3', category: 'Ambience' },
    { tags: ['thunder', 'lightning'], url: 'https://pcdebvnuuryykgligezd.supabase.co/storage/v1/object/public/globalAssets/thunder.mp3', category: 'Ambience' },
    { tags: ['forest', 'nature', 'woods'], url: 'https://pcdebvnuuryykgligezd.supabase.co/storage/v1/object/public/globalAssets/forest-ambience.mp3', category: 'Ambience' },
    { tags: ['ocean', 'waves', 'sea', 'beach'], url: 'https://pcdebvnuuryykgligezd.supabase.co/storage/v1/object/public/globalAssets/waves-crashing%20(1).mp3', category: 'Ambience' },
    { tags: ['stream', 'river', 'water', 'brook'], url: 'https://pcdebvnuuryykgligezd.supabase.co/storage/v1/object/public/globalAssets/babbling-brook.mp3', category: 'Ambience' },
    { tags: ['fire', 'flame', 'crackling', 'campfire'], url: 'https://pcdebvnuuryykgligezd.supabase.co/storage/v1/object/public/globalAssets/fire-sound-334130.mp3', category: 'Ambience' },

    // --- CITY / URBAN ---
    { tags: ['traffic', 'cars', 'highway', 'street', 'city'], url: 'https://pcdebvnuuryykgligezd.supabase.co/storage/v1/object/public/globalAssets/highway-traffic-ambience-indian-sfx-library-266395.mp3', category: 'Urban' },
    { tags: ['siren', 'police', 'ambulance', 'alarm'], url: 'https://pcdebvnuuryykgligezd.supabase.co/storage/v1/object/public/globalAssets/police-6007.mp3', category: 'Urban' },
    { tags: ['crowd', 'people', 'talking', 'busy'], url: 'https://pcdebvnuuryykgligezd.supabase.co/storage/v1/object/public/globalAssets/crowd_talking-6762.mp3', category: 'Urban' },
    { tags: ['train', 'subway', 'metro'], url: 'https://pcdebvnuuryykgligezd.supabase.co/storage/v1/object/public/globalAssets/train-passing-by-283841.mp3', category: 'Urban' },

    // --- FOLEY / HUMAN ---
    { tags: ['footsteps', 'walking', 'steps', 'run'], url: 'https://pcdebvnuuryykgligezd.supabase.co/storage/v1/object/public/globalAssets/footsteps-walking-boots-parquet-1-420135.mp3', category: 'Foley' },
    { tags: ['running', 'sprint'], url: 'https://pcdebvnuuryykgligezd.supabase.co/storage/v1/object/public/globalAssets/running-on-the-floor-359909.mp3', category: 'Foley' },
    { tags: ['door', 'open', 'close', 'creak'], url: 'https://pcdebvnuuryykgligezd.supabase.co/storage/v1/object/public/globalAssets/door-open-close-45475.mp3', category: 'Foley' },
    { tags: ['knock', 'banging'], url: 'https://pcdebvnuuryykgligezd.supabase.co/storage/v1/object/public/globalAssets/knock-on-door-86241.mp3', category: 'Foley' },
    { tags: ['glass', 'break', 'shatter'], url: 'https://pcdebvnuuryykgligezd.supabase.co/storage/v1/object/public/globalAssets/glass-shatter-7-95202.mp3', category: 'Foley' },
    { tags: ['laugh', 'laughter', 'giggle'], url: 'https://pcdebvnuuryykgligezd.supabase.co/storage/v1/object/public/globalAssets/male-laugh-242216.mp3', category: 'Foley' },
    { tags: ['scream', 'shout', 'yell'], url: 'https://pcdebvnuuryykgligezd.supabase.co/storage/v1/object/public/globalAssets/hey_give_it_back-83379.mp3', category: 'Foley' },

    // --- ANIMALS ---
    { tags: ['bird', 'chirp', 'tweet', 'sparrow'], url: 'https://pcdebvnuuryykgligezd.supabase.co/storage/v1/object/public/globalAssets/sparrow.mp3', category: 'Animals' },
    { tags: ['dog', 'bark', 'puppy'], url: 'https://pcdebvnuuryykgligezd.supabase.co/storage/v1/object/public/globalAssets/dog-barking-406629.mp3', category: 'Animals' },
    { tags: ['cat', 'meow', 'kitten'], url: 'https://pcdebvnuuryykgligezd.supabase.co/storage/v1/object/public/globalAssets/meow-sfx-405456.mp3', category: 'Animals' },
    { tags: ['lion', 'growl', 'roar', 'beast'], url: 'https://pcdebvnuuryykgligezd.supabase.co/storage/v1/object/public/globalAssets/lion-snarl-growl-354324.mp3', category: 'Animals' },

    // --- TECH / SCI-FI ---
    { tags: ['robot', 'spaceship', 'drone', 'mech'], url: 'https://pcdebvnuuryykgligezd.supabase.co/storage/v1/object/public/globalAssets/alien-spaceship-roar-287340.mp3', category: 'SciFi' },
    { tags: ['laser', 'shoot', 'pew'], url: 'https://pcdebvnuuryykgligezd.supabase.co/storage/v1/object/public/globalAssets/laser-gun-shot-sound-future-sci-fi-lazer-wobble-chakongaudio-174883.mp3', category: 'SciFi' },
    { tags: ['explode', 'explosion', 'boom'], url: 'https://pcdebvnuuryykgligezd.supabase.co/storage/v1/object/public/globalAssets/explosion-fx-343683.mp3', category: 'SciFi' },

    // --- MUSIC / INSTRUMENTS ---
    { tags: ['piano', 'note'], url: 'https://pcdebvnuuryykgligezd.supabase.co/storage/v1/object/public/globalAssets/short-melancholic-theme-on-piano-34024.mp3', category: 'Music' },
    { tags: ['drum', 'kick', 'beat'], url: 'https://pcdebvnuuryykgligezd.supabase.co/storage/v1/object/public/globalAssets/playing-drums-90bpm-73410.mp3', category: 'Music' },
];

const FALLBACK_ASSET = '/assets/audio/default_osc.mp3';

/**
 * Finds the best matching audio asset URL for a given semantic tag.
 * Uses rudimentary keyword matching.
 */
export const findBestAssetMatch = (tag: string): string => {
    if (!tag) return FALLBACK_ASSET;
    const lowerTag = tag.toLowerCase().trim();

    // 1. Exact tag match
    const exact = ASSET_DATABASE.find(a => a.tags.includes(lowerTag));
    if (exact) return exact.url;

    // 2. Partial/Keyword match (check if tag contains keyword or keyword contains tag)
    const partial = ASSET_DATABASE.find(a =>
        a.tags.some(t => lowerTag.includes(t) || t.includes(lowerTag))
    );
    if (partial) return partial.url;

    // 3. Fallback logic for common generalized terms
    if (lowerTag.includes('water')) return 'https://pcdebvnuuryykgligezd.supabase.co/storage/v1/object/public/globalAssets/babbling-brook.mp3';
    if (lowerTag.includes('wind')) return 'https://pcdebvnuuryykgligezd.supabase.co/storage/v1/object/public/globalAssets/wind.mp3';

    console.warn(`[AssetLibrary] No match found for tag: "${tag}". Using fallback.`);
    return FALLBACK_ASSET;
};

/**
 * Returns a list of all available categories.
 */
export const getAssetCategories = () => {
    return Array.from(new Set(ASSET_DATABASE.map(a => a.category)));
};

/**
 * Returns all assets for a given category.
 */
export const getAssetsByCategory = (category: string) => {
    return ASSET_DATABASE.filter(a => a.category === category);
};

/**
 * Returns the full list of assets (for UI display).
 */
export const getAllAssets = () => {
    return ASSET_DATABASE;
};

/**
 * Returns a comma-separated string of all available tags for AI prompting.
 */
export const getAvailableTagsString = (): string => {
    const allTags = new Set<string>();
    ASSET_DATABASE.forEach(asset => {
        asset.tags.forEach(tag => allTags.add(tag));
    });
    return Array.from(allTags).join(', ');
};
