# Resonance - Gemini 3 Hackathon Task List

## Phase 1: Clone & Strip (The Foundation)
- [ ] Initialize Project Artifacts (Implementation Plan, Task List) `[/]`
- [ ] Analyze `kymatic` codebase for Auth and Subscription dependencies `[x]`
- [/] Create `resonance` project (clone of `kymatic`)
    - [x] Clone repository
    - [ ] Remove `.git` history
    - [ ] Remove `.env` (start fresh)
- [x] Remove Supabase Auth Integration
    - [x] Replace Auth Provider with Mock Provider
    - [x] Update middleware/guards to allow all routes (N/A - bypassed via mock)
- [x] Remove Subscription/Paywall Logic
    - [x] Mock `useSubscription` to return PRO/Unlimited tier (updated default)
    - [x] Remove "Upgrade to Pro" UI elements
    - [x] Remove payment processing code (Polar/Stripe)
- [x] Verify "Open Access" functionality
- [x] Implement Browser Persistence (LocalStorage)

## Phase 2: The "Vibe Sprint" (Gemini 3 Integration)
- [x] **Implement Gemini 3 Pro "Thinking Mode" (Server Actions)**
    - [x] Create `ThinkingPanel` component
    - [x] Implement `src/actions/gemini.ts` with streaming
- [x] Build "Auto-Foley" Agent (Video-to-Audio) using Gemini Multimodal
    - [x] Implement Sound Library Mapping & Trajectory Wiring

- [x] Refine "Thinking Panel" UI (Collapsible + Close Button)
    - [x] Fix Timeline Loading/Scrolling Issues (Synced vertical scroll)
- [x] **Fix AI Director State:** Resolve issue requiring page refresh to talk to AI.
- [x] **Verify Auto-Foley:** Test video capabilities.
- [x] **Asset Library:** Create a web library (Public URL/S3) with pre-defined audio assets.
    - [ ] ~~Verify/Host all sound assets~~ (Moved to Backlog)

## Phase 3: IAMF Export (Current Focus)
- [x] **Python Export Script**
    - [x] Create `scripts/export_iamf.py`
    - [x] Implement `generate_iamf` function (Mock)
    - [ ] Handle audio mixing and spatial rendering (Future)
- [x] **Next.js Server Action**
    - [x] Create `src/actions/export.ts`
    - [x] Wire to Python script
    - [x] Connect UI in `SpatialAudioEditor.tsx`
- [x] **Stability Fixes:**
    - [x] Refactor AI Streaming (Heartbeat/Keep-Alive)
    - [x] Fix React Key Warnings
    - [x] **Switch to Blocking API** (Streaming replaced by robust await)

## Phase 4: Demo & Submission (Current Focus)
- [/] **Create Demo Video**
    - [x] Draft Script/Storyboard (`demo_script.md`)
    - [ ] Record screen capture of features
    - [ ] Voiceover/Text overlay
- [ ] Finalize Documentation (README updates)
- [ ] Submission

## Backlog
- [ ] Asset Library Refinement (Self-hosting)
- [x] Auto-save Projects (LocalStorage persistence on change)
- [ ] **Release Prep:** Update API Model to `gemini-3-flash-preview` (currently `gemini-2.5-flash-lite`)
- [ ] **Real IAMF Implementation:** Replace mock script with actual audio mixing/rendering logic (ffmpeg/numpy integration).
- [ ] remove all useless files and rename the appication completely
