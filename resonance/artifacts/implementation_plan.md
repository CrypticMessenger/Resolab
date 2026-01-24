# WAV Export Optimization Plan

## Goal Description
The user reports that the WAV export "hangs". Our analysis points to two potential causes:
1.  **Inefficient Audio Encoding**: The `bufferToWav` function manually iterates millions of samples using `DataView.setInt16`, which is extremely slow and blocks the main thread, causing the UI to freeze (perceived as a hang).
2.  **Sequential Asset Loading**: Assets are loaded one-by-one. If one is slow or fails, the entire process waits.

We will optimize the export process to be significantly faster and more robust.

## User Review Required
> [!NOTE]
> This plan focuses on performance optimization and reliability fixes for the existing "POV" WAV export.

## Proposed Changes

### [MODIFY] [src/utils/audioExport.ts](file:///Users/ambrose_/Desktop/exploration/Resonance/resonance/src/utils/audioExport.ts)
-   **Parallelize Loading**: Switch from a `for` loop with `await` to `Promise.all` for loading audio buffers. This greatly speeds up the "Downloading assets..." phase.
-   **Optimize Encoder**:
    -   Replace the slow `DataView` loop with direct `Int16Array` manipulation.
    -   This avoids millions of function calls and boundary checks.
    -   Logic:
        1.  Create `Int16Array` for the PCM data.
        2.  Interleave and convert float samples (-1.0 to 1.0) to PCM16 in a single fast loop.
        3.  Concatenate the header and data.
-   **Yielding**: If the duration is very long (>1min), we might still block. For now, the TypedArray optimization often yields a 10-50x speedup, likely solving the "hang".

### [MODIFY] [src/components/SpatialAudioEditor.tsx](file:///Users/ambrose_/Desktop/exploration/Resonance/resonance/src/components/SpatialAudioEditor.tsx)
-   Reflect granular loading progress if possible (e.g. "Loaded 3/5 sources").

## Verification Plan
### Manual Verification
1.  Load a project with multiple sources.
2.  Click Export.
3.  Observe "Downloading assets..." - should be faster.
4.  Observe "Encoding WAV..." - should be nearly instantaneous or very fast for <30s clips.
5.  Verify the generated WAV plays correctly in a system player (QuickTime/Windows Media).
