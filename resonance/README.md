# Resonance - Spatial Audio Studio

> **The Future of Spatial Audio Authoring.** Define soundscapes with natural language, design with multimodal AI, and export for the spatial web.

![Status](https://img.shields.io/badge/status-beta-purple) ![Version](https://img.shields.io/badge/version-2.0.0-blue) ![AI](https://img.shields.io/badge/AI-Gemini_3-orange)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [The Resonance Workflow](#-the-resonance-workflow)
- [Feature Deep Dive](#-feature-deep-dive)
    - [AI Director (Gemini 3)](#-ai-director-gemini-3)
    - [Auto-Foley Agent](#-auto-foley-agent)
    - [Spatial Audio Engine](#-spatial-audio-engine)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)

---

## 🌌 Overview

**Resonance** is a next-generation spatial audio DAW (Digital Audio Workstation) that moves beyond traditional 2D stereo mixing. Instead of manually dragging faders and panning knobs, you interact with sound semantically.

Powered by **Google's Gemini 3**, Resonance understands scene descriptions ("cyberpunk market in rain") and video context, automatically instantiating and placing audio sources in a 3D environment with realistic HRTF (Head-Related Transfer Function) spatialization.

### Why Resonance?
*   **Semantic Authoring**: "Make it sound like a cathedral" > tweaking reverb parameters manually.
*   **Multimodal Design**: Drag in a video, get a spatial soundtrack.
*   **Spatial First**: Built from the ground up for 3D audio (VR, AR, Spatial Computing).

---

## ⚡ The Resonance Workflow

1.  **Prompt or Upload**: Start with a text prompt ("Forest at night") or upload a video clip.
2.  **AI Generation**: The **AI Director** agents analyze the intent and generate a spatial scene graph.
3.  **3D Editing**: Visualize audio sources as objects in a 3D space. Manipulate trails, orbits, and Doppler shifts visually.
4.  **Export**: Render to high-fidelity WAV or spatial formats (IAMF ready).

---

## 🧠 Feature Deep Dive

### 🎬 AI Director (Gemini 3)

The **AI Director** is the core intelligence of Resonance. It replaces the "empty canvas" problem with an immediate, complex scene.

*   **Model**: Powered by **Gemini 3 Flash** (Primary) with automatic fallback to **Gemini 2.0 Flash Lite** for robust performance.
*   **Judge-Friendly Config**: Includes a built-in Settings UI allowing users to bring their own API Keys or switch models dynamically without code changes.
*   **Capabilities**:
    *   **Scene Decomposition**: Breaks down abstract concepts ("Busy Cafe") into concrete audio assets ("Espresso Machine", "Chatter", "Dish Clatter").
    *   **Spatial Reasoning**: Assigns logical 3D coordinates. Ambient sounds (Wind, Traffic) are placed in distant orbits, while focal sounds (Footsteps) are placed near the listener.
    *   **Trajectory Logic**: Generates movement patterns. Birds *fly over*, cars *pass by*, rain *remains static*.

**Under the Hood**:
The Director outputs a proprietary generic Scene Graph JSON that the engine hydrates into `SourceObject` instances.

```json
{
  "name": "Cyberpunk Market",
  "sources": [
    {
      "id": "neon_hum",
      "position": { "x": 2, "y": 3, "z": -1 },
      "trajectory": "static"
    },
    {
      "id": "hover_car",
      "trajectory": "linear_pass",
      "timelineStart": 2.5
    }
  ]
}
```

### 🎥 Auto-Foley Agent

The **Auto-Foley** agent brings video to life using Gemini's multimodal capabilities.

*   **Vision Analysis**: Takes video frames (base64 encoded) and identifies visual events (e.g., "Dog barking", "Glass breaking", "Footsteps").
*   **Temporal Synchronization**: Maps visual timestamps to audio timeline markers.
*   **Material Detection**: Distinguishes between "Footsteps on gravel" vs "Footsteps on concrete" to select the correct texture.
*   **Video-to-Spatial**: Places the sound source at the 2D screen position projected into 3D depth, creating an accurate soundstage for the video.

### 🎧 Spatial Audio Engine

Resonance runs a high-performance audio graph on top of the **Web Audio API**.

*   **HRTF Rendering**: Uses `PannerNode` with `HRTF` panning model for realistic binaural output over standard headphones.
*   **Physics-Based Audio**:
    *   **Distance Attenuation**: Inverse distance models mimic real-world sound falloff.
    *   **Doppler Effect**: Simulated velocity-based pitch shifting for moving objects.
*   **Visualizers**: Real-time `AnalyserNode` integration drives the React Three Fiber mesh visualizations (pulsing spheres).
*   **Offline Rendering**: The export pipeline uses `OfflineAudioContext` to fast-render complex scenes (including all automation and reverb) into a studio-grade 32-bit WAV file.

---

## 🏗️ Architecture

Resonance bridges a reactive UI, a 3D canvas, and a graph-based audio engine.

```mermaid
graph TB
    subgraph "Frontend Layer"
        UI[React 19 UI]
        Canvas[Three.js Scene]
        Manager[Editor State Manager]
    end

    subgraph "AI Agents"
        Director[AI Director (Text-to-Scene)]
        Foley[Auto-Foley (Video-to-Audio)]
        Gemini[Gemini 3 API]
    end

    subgraph "Audio & Data"
        Audio[Web Audio Graph]
        Export[Offline Renderer]
        DB[(Supabase)]
    end

    UI --> Director
    UI --> Foley
    Director --> Gemini
    Foley --> Gemini
    
    Director -- "Scene JSON" --> Manager
    Foley -- "Sync Map" --> Manager
    
    Manager --> Canvas
    Manager --> Audio
    
    Canvas -. "Sync" .- Audio
    
    Manager -- "Persist" --> DB
    Manager --> Export
```

### Key Components

*   `SpatialAudioEditor`: The orchestrator that binds React state, Three.js meshes, and WebAudio nodes.
*   `gemini.ts` (Server Actions): Securely handles AI model negotiation, fallback strategies (`gemini-2.0-flash-lite`), and prompt engineering.
*   `audioExport.ts`: Handles the complex logic of baking automation curves `setValueCurveAtTime` into the final export mix.

---

## 🛠️ Tech Stack

*   **Framework**: Next.js 16 (App Router)
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS 4
*   **3D Engine**: Three.js / React Three Fiber
*   **Audio**: Web Audio API (Native)
*   **AI**: Google Gemini API (`@google/generative-ai`)
*   **Backend**: Supabase (PostgreSQL, Auth, Storage)

---

## 🚀 Getting Started

### Prerequisites

*   Node.js 18+
*   Supabase Account
*   Google Gemini API Key

### Installation

1.  **Clone the repo**
    ```bash
    git clone https://github.com/CrypticMessenger/Resonance.git
    cd resonance
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    Create `.env.local`:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
    NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_key
    ```

4.  **Run Development Server**
    ```bash
    npm run dev
    ```

Open [http://localhost:3000](http://localhost:3000) to start creating.

---

## 🤝 Contributing

We welcome contributions! Please see `CONTRIBUTING.md` for details on how to submit pull requests, report issues, and request features.

---

**Resonance** — *Hear the Future.*
