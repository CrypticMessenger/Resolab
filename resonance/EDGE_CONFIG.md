# Edge Config Integration Guide

## Overview
The application now fetches `TIER_LIMITS` from Vercel Edge Config, allowing you to update pricing and limits without redeploying the application.

## Architecture

### Files Created
1. **`src/lib/edge-config.ts`**: Server-side utility to fetch from Edge Config
2. **`src/app/api/tier-limits/route.ts`**: API endpoint that exposes tier limits
3. **`src/lib/hooks/useTierLimits.ts`**: React hook for client components

### Files Modified
1. **`src/lib/subscription.ts`**: Added static methods to update limits dynamically
2. **`src/components/LandingPage.tsx`**: Uses `useTierLimits` hook
3. **`src/components/spaudio/UpgradeModal.tsx`**: Uses `useTierLimits` hook

## How It Works

```mermaid
graph TD
    A[Edge Config Storage] -->|Fetch| B[edge-config.ts]
    B --> C[/api/tier-limits]
    C -->|HTTP| D[useTierLimits Hook]
    D --> E[LandingPage]
    D --> F[UpgradeModal]
    D -->|Updates| G[SubscriptionManager]
    G --> H[SpatialAudioEditor]
```

1. **Edge Config**: Stores the JSON configuration (see below)
2. **Server-side Fetch**: `edge-config.ts` fetches from Edge Config with fallback
3. **API Route**: `/api/tier-limits` exposes config via HTTP (edge runtime, 60s revalidation)
4. **Client Hook**: `useTierLimits` fetches on mount and updates `SubscriptionManager`
5. **Components**: Use the hook to get latest config

## Environment Setup

Ensure you have the Edge Config connection string in your environment:

```bash
# .env.local
EDGE_CONFIG=https://edge-config.vercel.com/...
```

## Edge Config JSON Structure

Store this in Vercel Edge Config with key `TIER_LIMITS`:
```json
{
  "TIER_LIMITS": {
    "FREE": {
      "name": "Discovery",
      "maxSourcesPerScene": 2,
      "maxFilesPerProject": 3,
      "maxTotalStorageMB": 30,
      "maxExportDurationSec": 60,
      "canUseAiDirector": false,
      "features": [...]
    },
    "PRO": {
      "name": "Creator",
      "maxSourcesPerScene": 10,
      "maxFilesPerProject": null,     // null = Unlimited
      "maxProjects": null,            // null = Unlimited
      "maxTotalStorageMB": 100,
      "maxExportDurationSec": 300,
      "canUseAiDirector": true,
      "features": [...]
    },
    "ELITE": {
      "name": "Professional",
      "maxSourcesPerScene": null,     // null = Unlimited
      "maxFilesPerProject": null,
      "maxTotalStorageMB": 10240,
      "features": [...]
    }
  }
}
```

**Note**: Use `null` to represent "Unlimited" for any numerical limit key.

## Fallback Behavior

If Edge Config is unavailable or the fetch fails:
- The app falls back to the local `TIER_LIMITS` in `subscription.ts`
- No errors are thrown to the user
- Logs are written to the console for debugging

## Updating Configuration

1. Go to your Vercel project dashboard
2. Navigate to Edge Config
3. Update the `TIER_LIMITS` key
4. Changes propagate within 60 seconds (API route revalidation)
5. Client components fetch on mount, so users will see changes on next page load

## Testing

To test the integration:

1. **Local Development**: Set `EDGE_CONFIG` in `.env.local`
2. **Check Fallback**: Remove the env var and verify app uses local config
3. **Update Config**: Change a price in Edge Config and reload the page

## Benefits

- **No Redeployment**: Update pricing instantly via Vercel dashboard
- **A/B Testing**: Can implement tier-based experiments
- **Graceful Degradation**: Falls back to local config if Edge Config is down
- **Performance**: Edge runtime with automatic revalidation
