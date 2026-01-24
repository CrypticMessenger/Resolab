
// Web-based Asset Library for Resonance AI
// Defaulting to Google Actions Sounds (Public Domain).
// User checks: Please replace any URLs that do not work for your region/network.

export interface AudioAsset {
    tags: string[];
    url: string;
    category: string;
}

// Master list of assets
const ASSET_DATABASE: AudioAsset[] = [
    // --- AMBIENCE / WEATHER ---
    { tags: ['rain', 'storm', 'weather', 'downpour'], url: 'https://actions.google.com/sounds/v1/weather/rain_heavy_loud.ogg', category: 'Ambience' },
    { tags: ['wind', 'breeze', 'gale', 'air'], url: 'https://actions.google.com/sounds/v1/weather/wind_blowing_strong.ogg', category: 'Ambience' },
    { tags: ['thunder', 'lightning'], url: 'https://actions.google.com/sounds/v1/weather/thunder_crack.ogg', category: 'Ambience' },
    { tags: ['forest', 'nature', 'woods'], url: 'https://actions.google.com/sounds/v1/ambiences/forest_morning.ogg', category: 'Ambience' },
    { tags: ['ocean', 'waves', 'sea', 'beach'], url: 'https://actions.google.com/sounds/v1/water/waves_crashing_on_rocks_1.ogg', category: 'Ambience' },
    { tags: ['stream', 'river', 'water', 'brook'], url: 'https://actions.google.com/sounds/v1/water/babbling_brook.ogg', category: 'Ambience' },
    { tags: ['fire', 'flame', 'crackling', 'campfire'], url: 'https://actions.google.com/sounds/v1/ambiences/fire.ogg', category: 'Ambience' },

    // --- CITY / URBAN ---
    { tags: ['traffic', 'cars', 'highway', 'street', 'city'], url: 'https://actions.google.com/sounds/v1/transportation/traffic_highway_distant.ogg', category: 'Urban' },
    { tags: ['siren', 'police', 'ambulance', 'alarm'], url: 'https://actions.google.com/sounds/v1/emergency/siren_wail.ogg', category: 'Urban' },
    { tags: ['crowd', 'people', 'talking', 'busy'], url: 'https://actions.google.com/sounds/v1/ambiences/crowd_talking.ogg', category: 'Urban' },
    { tags: ['train', 'subway', 'metro'], url: 'https://actions.google.com/sounds/v1/transportation/subway_train_passing_by.ogg', category: 'Urban' },

    // --- FOLEY / HUMAN ---
    { tags: ['footsteps', 'walking', 'steps', 'run'], url: 'https://actions.google.com/sounds/v1/foley/footsteps_on_concrete.ogg', category: 'Foley' },
    { tags: ['running', 'sprint'], url: 'https://actions.google.com/sounds/v1/foley/running_on_pavement.ogg', category: 'Foley' },
    { tags: ['door', 'open', 'close', 'creak'], url: 'https://actions.google.com/sounds/v1/household/door_open_close_wooden.ogg', category: 'Foley' },
    { tags: ['knock', 'banging'], url: 'https://actions.google.com/sounds/v1/household/wood_door_knock_1.ogg', category: 'Foley' },
    { tags: ['glass', 'break', 'shatter'], url: 'https://actions.google.com/sounds/v1/foley/glass_shatter_crashes.ogg', category: 'Foley' },
    { tags: ['laugh', 'laughter', 'giggle'], url: 'https://actions.google.com/sounds/v1/human_voices/human_laugh_male.ogg', category: 'Foley' },
    { tags: ['scream', 'shout', 'yell'], url: 'https://actions.google.com/sounds/v1/human_voices/human_yell_male.ogg', category: 'Foley' },

    // --- ANIMALS ---
    { tags: ['bird', 'chirp', 'tweet', 'sparrow'], url: 'https://actions.google.com/sounds/v1/animals/sparrow_chirp.ogg', category: 'Animals' },
    { tags: ['dog', 'bark', 'puppy'], url: 'https://actions.google.com/sounds/v1/animals/dog_barking_large.ogg', category: 'Animals' },
    { tags: ['cat', 'meow', 'kitten'], url: 'https://actions.google.com/sounds/v1/animals/grey_kitten_meow.ogg', category: 'Animals' },
    { tags: ['lion', 'growl', 'roar', 'beast'], url: 'https://actions.google.com/sounds/v1/animals/lion_growl.ogg', category: 'Animals' },

    // --- TECH / SCI-FI ---
    { tags: ['robot', 'servo', 'mech'], url: 'https://actions.google.com/sounds/v1/science_fiction/robotic_arm_movement.ogg', category: 'SciFi' },
    { tags: ['laser', 'shoot', 'pew'], url: 'https://actions.google.com/sounds/v1/science_fiction/laser_gun_shot.ogg', category: 'SciFi' },
    { tags: ['explode', 'explosion', 'boom'], url: 'https://actions.google.com/sounds/v1/explosions/explosion_large_distant.ogg', category: 'SciFi' },

    // --- MUSIC / INSTRUMENTS ---
    { tags: ['piano', 'note'], url: 'https://actions.google.com/sounds/v1/musical_instruments/piano_middle_c.ogg', category: 'Music' },
    { tags: ['drum', 'kick', 'beat'], url: 'https://actions.google.com/sounds/v1/musical_instruments/drum_kit_bass_kick.ogg', category: 'Music' },
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
    if (lowerTag.includes('water')) return 'https://actions.google.com/sounds/v1/water/babbling_brook.ogg';
    if (lowerTag.includes('wind')) return 'https://actions.google.com/sounds/v1/weather/wind_blowing_strong.ogg';

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
