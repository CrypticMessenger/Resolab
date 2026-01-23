import { SourceData } from "@/types/spaudio";

export enum UserTier {
    FREE = 'FREE',
    PRO = 'PRO',
    ELITE = 'ELITE'
}

export interface TierFeature {
    label: string;
    included: boolean;
    highlight?: boolean;
    negative?: boolean;
}

export interface TierLimits {
    // UI Config
    name: string;
    price: string;
    priceSuffix: string;
    description: string;
    buttonText: string;
    mostPopular?: boolean;
    badge?: string; // For "Professional 👑"
    isVisible?: boolean; // Control visibility from Edge Config
    features: TierFeature[];

    // Logic Limits
    maxSourcesPerScene: number | null;
    maxFilesPerProject: number | null;
    maxProjects: number | null;
    maxTotalStorageMB: number;
    maxFileSizeMB: number; // New: Limit per individual file
    maxExportDurationSec: number | null;
    maxExportsPerMonth: number | null; // New: Monthly export limit
    allowedExportFormats: string[];
    canUseAiDirector: boolean;
}

export const TIER_LIMITS: Record<UserTier, TierLimits> = {
    [UserTier.FREE]: {
        name: 'Discovery',
        price: '$0',
        priceSuffix: '/mo',
        description: 'Perfect for experimenting with spatial audio.',
        buttonText: 'Current Plan',
        isVisible: true,
        features: [
            { label: '2 Audio Sources / Scene', included: true },
            { label: '3 Files / Project', included: true },
            { label: '30MB Storage Cap', included: true },
            { label: '60s Export (WebM)', included: true },
            { label: 'Watermarked Exports', included: false, negative: true },
            { label: 'AI Director', included: false, negative: true }
        ],
        maxSourcesPerScene: 1, // REDUCED FROM 2
        maxFilesPerProject: 3,
        maxProjects: 2,
        maxTotalStorageMB: 30, // 30MB
        maxFileSizeMB: 10,     // 10MB
        maxExportDurationSec: 60,
        maxExportsPerMonth: 10, // 10/month
        allowedExportFormats: ['webm'],
        canUseAiDirector: false
    },
    [UserTier.PRO]: {
        name: 'Creator',
        price: '$12',
        priceSuffix: '/mo',
        description: 'For content creators & podcasters.',
        buttonText: 'Upgrade to Pro',
        mostPopular: true,
        isVisible: true,
        features: [
            { label: '10 Audio Sources / Scene', included: true },
            { label: 'Unlimited Files', included: true },
            { label: '100MB Storage', included: true },
            { label: '5 min Export (WAV/MP3)', included: true },
            { label: 'No Watermark', included: true },
            { label: 'AI Director', included: true }
        ],
        maxSourcesPerScene: 10,
        maxFilesPerProject: null,
        maxProjects: null,
        maxTotalStorageMB: 100, // 100MB
        maxFileSizeMB: 50,      // 50MB
        maxExportDurationSec: 300, // 5 mins
        maxExportsPerMonth: null,
        allowedExportFormats: ['wav', 'mp3', 'webm'],
        canUseAiDirector: true
    },
    [UserTier.ELITE]: {
        name: 'Professional',
        price: '$39',
        priceSuffix: '/mo',
        description: 'For studios & power users.',
        buttonText: 'Contact Sales',
        badge: '👑',
        isVisible: false, // Hidden by default, can be enabled via Edge Config
        features: [
            { label: 'Unlimited Sources', included: true, highlight: true },
            { label: 'Unlimited Files', included: true },
            { label: '10GB Storage', included: true, highlight: true },
            { label: 'Unlimited Export (All Formats)', included: true },
            { label: 'Priority Rendering', included: true },
            { label: 'API Access', included: true }
        ],
        maxSourcesPerScene: null,
        maxFilesPerProject: null,
        maxProjects: null,
        maxTotalStorageMB: 10240, // 10GB
        maxFileSizeMB: 500,       // 500MB
        maxExportDurationSec: null,
        maxExportsPerMonth: null,
        allowedExportFormats: ['wav', 'flac', 'imaf', 'dolby'],
        canUseAiDirector: true
    }
};

export class SubscriptionManager {
    private currentTier: UserTier;
    private static customTierLimits: Record<UserTier, TierLimits> | null = null;

    constructor(tier: UserTier = UserTier.ELITE) {
        this.currentTier = tier;
    }

    /**
     * Update TIER_LIMITS dynamically (e.g., from Edge Config)
     */
    public static setTierLimits(limits: Record<UserTier, TierLimits>) {
        SubscriptionManager.customTierLimits = limits;
    }

    /**
     * Reset to default TIER_LIMITS
     */
    public static resetTierLimits() {
        SubscriptionManager.customTierLimits = null;
    }

    public setTier(tier: UserTier) {
        this.currentTier = tier;
    }

    public getTier(): UserTier {
        return this.currentTier;
    }

    public getLimits(): TierLimits {
        const limits = SubscriptionManager.customTierLimits || TIER_LIMITS;
        return limits[this.currentTier];
    }

    public canAddSource(currentCount: number): { allowed: boolean; reason?: string } {
        const limit = this.getLimits().maxSourcesPerScene;
        if (limit === null) return { allowed: true };

        if (currentCount >= limit) {
            return { allowed: false, reason: `Free tier limited to ${limit} source per scene.` };
        }
        return { allowed: true };
    }

    public canAddFileToProject(currentFileCount: number): { allowed: boolean; reason?: string } {
        const limit = this.getLimits().maxFilesPerProject;
        if (limit === null) return { allowed: true };

        if (currentFileCount >= limit) {
            return { allowed: false, reason: `Free tier limited to ${limit} files per project.` };
        }
        return { allowed: true };
    }

    public canCreateProject(currentProjectCount: number): { allowed: boolean; reason?: string } {
        const limit = this.getLimits().maxProjects;
        if (limit === null) return { allowed: true };

        if (currentProjectCount >= limit) {
            return { allowed: false, reason: `Free tier limited to ${limit} projects.` };
        }
        return { allowed: true };
    }

    public canUploadFile(currentTotalSizeMB: number, newFileSizeMB: number): { allowed: boolean; reason?: string } {
        const limits = this.getLimits();

        // 1. Check individual file size
        if (newFileSizeMB > limits.maxFileSizeMB) {
            return { allowed: false, reason: `File too large. Limit is ${limits.maxFileSizeMB}MB.` };
        }

        // 2. Check total storage
        if (currentTotalSizeMB + newFileSizeMB > limits.maxTotalStorageMB) {
            return { allowed: false, reason: `Storage limit of ${limits.maxTotalStorageMB}MB reached.` };
        }
        return { allowed: true };
    }

    public getMaxExportDuration(): number {
        return this.getLimits().maxExportDurationSec || Infinity;
    }

    public canUseAiDirector(): boolean {
        return this.getLimits().canUseAiDirector;
    }
}

export const subscriptionManager = new SubscriptionManager();
