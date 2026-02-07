# Walkthrough - Offline Timeline Audio Export

I have replaced the complex IAMF export with a robust "Offline Audio Export" feature. This renders the exact state of your timeline—including 3D positions, automation, and mixing—into a WAV file that sounds identical to the app playback.

## Changes

### 1. New Utility: `src/utils/audioExport.ts`

-   **`renderTimelineToWav`**: This function handles the entire rendering process.
    -   **Asset Loading**: Fetches and decodes all audio files used in the project.
    -   **Offline Rendering**: Creates an `OfflineAudioContext` equivalent to the project duration.
    -   **Replication**: Recreates the audio graph (Source -> Panner -> Gain) for each object.
    -   **Automation Baking**: Mathematically calculates the X/Y/Z position for every 50ms interval based on your automation settings (Orbit, Linear, Pulse) and "bakes" them into `calcPosition` curves.
    -   **Encoding**: Converts the rendered buffer into a standard 16-bit WAV file.

### 2. SpatialAudioEditor.tsx

-   Removed `export_iamf` backend integration.
-   Updated the "Export" button to trigger the client-side `renderTimelineToWav` process.
-   Added UI feedback: "Preparing Export...", "Downloading Assets...", "Rendering...", "Export Complete".

## Verification

### Manual Verification
1.  **Setup Scene**:
    -   Place a sound on the **Left**.
    -   Create another sound with **Orbit** automation.
    -   Create a **Linear** moving sound from Right to Left.
2.  **Export**: Click "Export Audio".
3.  **Result**:
    -   Wait for the "Rendering..." process.
    -   A WAV file is downloaded.
4.  **Listen**: Open the WAV file.
    -   Confirm you hear the static sound on the left.
    -   Confirm you hear the orbiting sound spinning around your head.
    -   Confirm you hear the linear sound passing from right to left.
