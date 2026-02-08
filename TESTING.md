1. While on landing page of Resolab click "Start creating for free"
2. Click "Create a new project" 
3. Type project name
4. Click on "video" icon to the right of "Add source" button. - That's auto foley agent.
5. Upload one of the testing videos added in the Zip of this project. 
Note: Currently the audio library is limited for proof-of-concept, thus Resolab will generate objects and trajectories on your custom videos, but might not be able to attach sound effects to all of them, due to limited audio library.
6. Preferably upload video of 8-10 seconds for faster reliable results. 
Note: Since I am using free version API keys, longer videos might produce inconsistent result, and may result in time-outs. Use following troubleshooting section to set your own keys.
6. Wait for about 30-40 seconds. Notice that the UI loads objects, sounds and trajectories.
Note: If you face "model limit exceeded" errors then please follow the following troubleshooting guide.
7. To know more about which of the sounds exist in the pre-built asset library. 
Click on any object > "Props" tab on sidebar > Under 'audio control' section > "manage audio". 
This will list all the available pre-built sound effects.
rain, wind, thunder, forest, ocean, stream, fire, traffic, siren, crowd, train 
footsteps, running, door, knock, glass, laugh, scream, bird, dog, cat
lion, robot, laser, explode, piano, drum

8. use "AI director" to ask AI to add elements to your scenes. Try "Add fire sound to my left" "Add sound of crashing waves to my right far away" "Add swarm of birds around my head" "Add door knock behind toward left side" "Add a man laughing in front of me" ... essentially anything which has a sound preset present would be added with sound, for super niche examples "Add sound of aliens on left" - Resolab with create object and add it to left, but since there is not preset for alien sounds, it won't be able to attach sound. 

9. You can ofcourse create objects manually and add your own custom sound effects.
10. You can change reverb (under "Global" tab) to play with acoustic properties of environment.
11. Change timelines to create descriptive scenes.
12. press "Play/pause" to check real-time rendering of audio 
13. When satisfied, Go to "Global" tab > "Export audio" and export your audio soundscapes.

To verify that this works in realtime and not hardcoded, you can upload the same video multiple times and verify that AI gives different response and soundscapes each time.

-------

# Basic troubleshooting
## 🔑 How do I change the Gemini 3 API Key?
If you encounter a `Model Overload` or `Limit Exceeded` error (common with the free tier of Gemini Flash Preview), you have two options:

### Option 1: The Judge-Friendly Settings UI (Recommended)
Checkout this 30 second video guide : [Link](https://drive.google.com/file/d/13ftJJ7d2IwIe8iaBMBcmTw-D7wLISx2J/view?usp=sharing)
You don't need to restart the server! We built a hot-swappable settings menu.
1.  Open any project in the Editor.
2.  Click the **Settings Logic** icon (Gear) in the top-right toolbar.
3.  Navigate to the **AI Settings** tab.
4. Get your GEMINI API KEY From https://aistudio.google.com/app/api-keys
4.  Paste your new `GEMINI_API_KEY` into the input field.
5.  Click **Save**. The app will immediately start using your new key for all future requests (Auto-Foley & Director).

### Option 2: Environment Variable (Developer Way)
1.  Open the root folder of the project.
2.  Edit the `.env.local` file.
3.  Update the value: `NEXT_PUBLIC_GEMINI_API_KEY=your_new_key_here`.
4.  Restart the development server (`npm run dev`).

---

## 🎥 How do I use the Auto-Foley Agent?
Checkout this 30 second video guide : [Link](https://drive.google.com/file/d/1W9AHGqrOhqzizrjnmiU9RCcGYg7ttS89/view?usp=sharing)
The Auto-Foley agent is the "Magic Drag & Drop" feature.

1.  **Locate a Video File:** Ensure it's under 50MB.
2.  **Drag & Drop:** Simply drag the video file from your computer folder directly onto the **3D Canvas** (the main grid area).
3.  **Watch the Magic:**
    *   A "Uploading to AI..." spinner will appear.
    *   The **Auto-Foley Agent** analyzes the video for visual events and depth.
    *   Within seconds, the scene will populate with 3D audio sources that match the video's content (e.g., footsteps, engines, ambience) placed at the correct spatial coordinates.

Follow this troubleshooting guide (and videos) if you face any problem: [Link](https://github.com/CrypticMessenger/Resolab/blob/main/FAQ.md)