# High Quality Reverb Plan

Upgrade the current "noisy" reverb to a professional-sounding "Studio Hall" reverb by generating better Impulse Responses (IR).

## The Solution
Instead of raw white noise, we will use **Frequency-Dependent Decay**. Real rooms absorb high frequencies faster than low ones. We will simulate this by generating the IR using an `OfflineAudioContext` to process noise through a dynamic Low-Pass Filter.

## Proposed Changes

### [Audio Logic]
#### [NEW] [reverbUtils.ts](file:///Users/ambrose_/Desktop/exploration/Resonance/resonance/src/utils/reverbUtils.ts)
-   `generateImpulseResponse(ctx, duration, decayTime, brightness)`:
    -   Use `OfflineAudioContext` to render the IR.
    -   **Source**: White Noise.
    -   **Filter**: `BiquadFilterNode` (LowPass) that sweeps from High to Low frequency over the duration (simulating air absorption).
    -   **Envelope**: Exponential gain decay.
    -   **Stereo**: Generate distinct Left/Right channels for width.

#### [MODIFY] [SpatialAudioEditor.tsx](file:///Users/ambrose_/Desktop/exploration/Resonance/resonance/src/components/SpatialAudioEditor.tsx)
-   Replace the `for` loop generation with `generateImpulseResponse`.
-   Add a "Tone" (Brightness) slider ideally? (Maybe later, for now just fix the quality).

#### [MODIFY] [audioExport.ts](file:///Users/ambrose_/Desktop/exploration/Resonance/resonance/src/utils/audioExport.ts)
-   **CRITICAL FIX**: Reverb was missing from exports!
-   Add a Global Reverb Bus to the export graph.
-   Generate the same IR using `reverbUtils`.
-   Route: `Source -> ReverbConvolver -> Mix -> Destination`.

## Verification Plan
1.  **Listen in Editor**:
    -   The reverb should sound smooth, warm, and "spacious", not like static hiss.
2.  **Verify Export**:
    -   Export a clip with reverb enabled.
    -   Confirm the reverb is audible in the WAV file.
