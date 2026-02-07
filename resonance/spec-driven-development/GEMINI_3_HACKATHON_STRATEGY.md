# Resolab: Gemini 3 Hackathon Strategy & Roadmap

**Target Archetype:** Archetype C: The "Vibe Coded" Dream Machine
**Core Concept:** A "Generative Reality" engine where the user speaks a soundscape, and Resolab builds it using Gemini 3's Thinking Mode and Eclipsa Audio (IAMF).

---

## 🚀 Part 1: The "Winning Edge" Features (Aligned with Gemini 3)

We will execute the **"Autonomous Vibe Architect"** strategy.

### 1. The "Auto-Foley" Agent (Video-to-Spatial-Scene)
*Aligned with Archetype A (Self-Correcting)*
*   **Input:** User uploads a video.
*   **System 2 Reasoning:** Gemini 3 Pro "watches" the video, identifies objects, trajectories, and acoustic environments (e.g., "tunnel," "forest").
*   **Action:** Automatically generates audio assets, places them in 3D space, and animates their paths to match the video.

### 2. The "AI Director" (System 2 Reasoning & Thinking Mode)
*Aligned with Archetype C (Vibe Coded)*
*   **Thinking Mode Visualization:** We will EXPOSE the agent's internal monologue in the UI.
    *   *User:* "Make it sound like a horror movie."
    *   *UI Panel:* `> Analyzing genre conventions... > Identifying minor keys and dissonant chords... > Retrieving "creaking door" assets... > Applying heavy reverb (Decay: 4s)...`
*   **Interaction:** Full-duplex voice interaction using the **Gemini Live API** (referenced in your code snippets).

### 3. "Vibe Coding" the Project
*The Meta-Narrative*
*   We will document the **creation process** itself.
*   **Steering Documents:** We will maintain a `STEERING.md` to guide the AI's "vibe," proving we are steering the model, not just prompting it.
*   **Artifacts:** We will save logs of the "Thinking Process" to submit as part of the "Vibe Coding" evidence.

---

## 🛠 Tech Stack: The "System of Intelligence"

### Frontend (The "Face")
*   **Framework:** Next.js 16 (React 19) + Tailwind CSS 4
*   **3D:** Three.js (React Three Fiber)
*   **Audio:** Web Audio API (Preview)

### Backend (The "Brain") - *New!*
*   **Runtime:** Python (FastAPI) - *Essential for the advanced agentic code you provided.*
*   **Inference:**
    *   **Gemini 3 Pro:** Via Google Gen AI SDK (Reasoning & Orchestration).
    *   **Gemini Live:** For real-time voice direction.
    *   **vLLM (Optional):** For local efficient inference if we need a specialized small model for low-latency tasks (as per your code snippets).
*   **Tools:** `iamf-tools` (Eclipsa Audio export).

---

## 📅 Execution Roadmap

### Phase 1: The Vibe Sprint (Speed & Narrative)
*Goal: A functional "Vibe Coded" Prototype.*
1.  **Initialize Project:** Scaffold Next.js + Python backend.
2.  **The "Steering" Setup:** Create `STEERING.md` to define the project's soul.
3.  **Core Visuals:** Build the Three.js editor scene.
4.  **The "Director" Loop:** Implement the Gemini Live connection (Python) to control the Three.js scene (JS) via WebSocket.

### Phase 2: The Agentic Layer (Depth)
1.  **Video-to-Audio:** Implement the multimodal video analysis pipeline.
2.  **Thinking Mode UI:** Build the "Brain Panel" to visualize Gemini's reasoning.
3.  **Eclipsa Export:** Hook up the `iamf-tools` for the "Next-Gen" download format.

### Phase 3: The Polish
1.  **The Video:** Create a cinematic demo showing the "Director" in action.
2.  **The Story:** Write the Devpost submission focusing on "System 2 Reasoning" and "Vibe Coding."