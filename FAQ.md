# Resolab FAQ & Troubleshooting

## 🔑 How do I change the Gemini 3 API Key?
If you encounter a `Model Overload` or `Limit Exceeded` error (common with the free tier of Gemini Flash Preview), you have two options:

### Option 1: The Judge-Friendly Settings UI (Recommended)
You don't need to restart the server! We built a hot-swappable settings menu.
1.  Open any project in the Editor.
2.  Click the **Settings Logic** icon (Gear) in the top-right toolbar.
3.  Navigate to the **AI Settings** tab.
4.  Paste your new `GEMINI_API_KEY` into the input field.
5.  Click **Save**. The app will immediately start using your new key for all future requests (Auto-Foley & Director).

### Option 2: Environment Variable (Developer Way)
1.  Open the root folder of the project.
2.  Edit the `.env.local` file.
3.  Update the value: `NEXT_PUBLIC_GEMINI_API_KEY=your_new_key_here`.
4.  Restart the development server (`npm run dev`).

---

## 🎥 How do I use the Auto-Foley Agent?
The Auto-Foley agent is the "Magic Drag & Drop" feature.

1.  **Locate a Video File:** Ensure it's under 50MB.
2.  **Drag & Drop:** Simply drag the video file from your computer folder directly onto the **3D Canvas** (the main grid area).
3.  **Watch the Magic:**
    *   A "Uploading to AI..." spinner will appear.
    *   The **Auto-Foley Agent** analyzes the video for visual events and depth.
    *   Within seconds, the scene will populate with 3D audio sources that match the video's content (e.g., footsteps, engines, ambience) placed at the correct spatial coordinates.

---

## 🏛️ What does "Reverb" do?
Reverb (Reverberation) simulates the physical acoustics of a space.

*   **Without Reverb:** Sounds feel "dry" and unnatural, like they are playing inside your ear.
*   **With Reverb:** Sounds interact with the environment.
    *   **Cave:** Long, muddy echoes.
    *   **Hall:** Bright, spacious reflections.
    *   **Room:** Tight, intimate ambience.

**How we do it:**
We use **Convolution Reverb**, the gold standard for realism. When the AI Director detects a specific environment (e.g., "A large cathedral"), it loads a real-world **Impulse Response (IR)** file into the Web Audio API's `ConvolverNode`. This mathematically convolving the source audio with the acoustic fingerprint of that real space.

---

## ☄️ Using Linear Trajectory & The "Shadow Sphere"
Resolab supports dynamic movement for sounds.

*   **Linear Trajectory:** This defines a sound that moves in a straight line from Point A to Point B over time (e.g., a car driving past).
*   **The Shadow Sphere Concept:**
    *   When you select a source and switch its **Trajectory Mode** to `Linear`, you will see a second, translucent sphere appear—this is the **Shadow Sphere**.
    *   **Primary Sphere:** Represents the **Start Position** (t=0).
    *   **Shadow Sphere (Ghost):** Represents the **End Position** (t=end).
    *   **The Line:** The line connecting them shows the path the sound will travel.

**To animate a "drive-by":**
1.  Select a sound source (e.g., Car Engine).
2.  Set **Trajectory** to `Linear`.
3.  Drag the **Primary Sphere** to where the car *starts* (e.g., Left side).
4.  Change the X, Y, Z coordinates of the **Shadow Sphere** to where the car *ends* (e.g., Right side).
5.  Hit **Play**. You will hear the sound physically move across the stereo field with accurate Doppler shift!

---
