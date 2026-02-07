# Auto-Foley Timeline Mapping

- [x] [/] Research current Auto-Foley implementation <!-- id: 0 -->
    - [x] Read `src/actions/gemini.ts` <!-- id: 1 -->
    - [x] Read `DEMO_SCRIPT.md` <!-- id: 2 -->
    - [x] specific check for timestamp/timeline support in Gemini response <!-- id: 3 -->
- [x] Plan implementation for mapping audio to timelines <!-- id: 4 -->
- [x] Implement mapping logic <!-- id: 5 -->
    - [x] Update `SpatialAudioEditor.tsx` to handle `timelineStart` and `timelineDuration` <!-- id: 7 -->
- [x] Verify implementation <!-- id: 6 -->

# Auto-Save Implementation

- [x] Plan auto-save logic and UI <!-- id: 8 -->
- [x] Implement `useAutoSave` logic in `SpatialAudioEditor.tsx` <!-- id: 9 -->
    - [x] Add `saveStatus` state <!-- id: 10 -->
    - [x] Add debounced save effect <!-- id: 11 -->
    - [x] Update `saveProject` to reflect status <!-- id: 12 -->
- [x] Add UI Indicator for Save Status <!-- id: 13 -->
- [x] Verify auto-save behavior <!-- id: 14 -->

# Fix Timeline Markers

- [x] Analyze `Timeline.tsx` rendering logic <!-- id: 15 -->
- [x] Fix marker generation to support scrolling/infinite width <!-- id: 16 -->
- [x] Verify fix <!-- id: 17 -->

# Replace IAMF with Audio Export

- [ ] Read `SourceObject.ts` to understand audio graph <!-- id: 18 -->
- [ ] Remove `export_iamf` code from `SpatialAudioEditor.tsx` <!-- id: 19 -->
- [ ] Implement `exportToWav` using `OfflineAudioContext` <!-- id: 20 -->
    - [ ] Sample automation trajectories <!-- id: 21 -->
    - [ ] Schedule `AudioParam` updates for panner nodes <!-- id: 22 -->
    - [ ] Encode and download WAV <!-- id: 23 -->
- [ ] Verify export matches timeline <!-- id: 24 -->
