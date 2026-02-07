# Resolab - Hackathon Submission Details

## Project Info
*   **Project Name:** Resolab
*   **Tagline:** The Future of Spatial Audio Authoring
*   **Challenge:** Gemini 3 Global Hackathon

---

## 📝 Gemini Integration Description (For Devpost)
*(Approx 200 words)*

**Resolab** redefines spatial audio creation by leveraging **Google Gemini 3's** advanced reasoning and multimodal capabilities to turn natural language and video into immersive 3D soundscapes. Traditional spatial audio workflow is technical and tedious—Resolab makes it semantic.

We utilize **Gemini 3 Flash** as an "AI Director" that performs complex spatial reasoning. When a user types "Cyberpunk market in the rain," the model doesn't just list sounds; it constructs a logic-based scene graph. It infers that "rain" should be an ambient occlusion layer, "flying cars" require linear trajectory automation, and "vendors" are static positional sources. This reasoning happens in milliseconds, enabling a real-time creative feedback loop.

Furthermore, we employ **Gemini's Multimodal** capabilities for "Auto-Foley". By analyzing video frames, Resolab identifies visual events (like footsteps or breaking glass), determines their material properties, and places synchronized audio sources at the correct 3D depth relative to the camera. This transforms a flat video file into a spatial audio experience automatically.

Resolab demonstrates that Gemini 3 is not just for chat—it is a powerful engine for spatial computing and creative logic.

---

## 🏆 Judging Criteria Breakdown

### Technical Execution (40%)
*   **Gemini 3 Usage:**
    *   **Reasoning:** Determining complex 3D coordinates and trajectory logic (`orbit`, `linear_pass`) from abstract intent.
    *   **Multimodal:** analyzing user-uploaded video to generate synchronized foley tracks.
*   **Architecture:** Next.js 16 App Router, React 19, Three.js (R3F), and Web Audio API.
*   **System:** Implements a custom Audio Graph engine with HRTF panning and Impulse Response reverb. Uses `OfflineAudioContext` for studio-grade WAV export.
*   **Dynamic Configuration:** Client-side settings for API Key injection and Model Selection (privacy-first LocalStorage persistence).

### Potential Impact (20%)
*   **Democratization:** Makes high-end Spatial Audio (essential for VR/AR/Vision Pro) accessible to creators who don't know audio engineering.
*   **Market:** Useful for GameDevs (rapid prototyping), Film (pre-viz), and Meditation/Wellness app creators.

### Innovation / Wow Factor (30%)
*   **Novelty:** Most audio AI is just "text-to-sound". Resolab is "text-to-SCENE". It generates the **structure** and **physics** of the audio, not just the waveforms.
*   **The "Magic" Moment:** watching the system parse a vague prompt like "Haunted House" and instantly populating the 3D grid with ghosts circling the user and floorboards creaking below.

### Presentation (10%)
*   **Demo Video:** Showcases the "Director" agent thinking processes and the visualizer pulsing in 3D.
*   **Docs:** Comprehensive architectural diagrams and deep-dives included in `README.md`.

---

## 🔗 Links (Fill these in before submitting)
*   **Public Project Link (Demo):** [Your Vercel/Demo Link Here]
*   **Public Code Repo:** [GitHub Link Here]
*   **Demo Video:** [YouTube/Vimeo Link Here]
