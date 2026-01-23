
"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

interface ThinkingStep {
    id: string;
    text: string;
    type: 'analysis' | 'decision' | 'action';
    timestamp: number;
}

// Initialize Gemini - Defaulting to 1.5 Flash for stability/rate-limits
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// --- Mock Fallbacks (for reliability/demo purposes) ---
function simulateSpatialScene(prompt: string): ReadableStream {
    const encoder = new TextEncoder();
    return new ReadableStream({
        async start(controller) {
            const pushStep = (text: string, type: 'analysis' | 'decision' | 'action', delayMs: number) => {
                return new Promise<void>(resolve => {
                    setTimeout(() => {
                        const step: ThinkingStep = { id: crypto.randomUUID(), text, type, timestamp: Date.now() };
                        controller.enqueue(encoder.encode(JSON.stringify(step) + "\n"));
                        resolve();
                    }, delayMs);
                });
            };

            try {
                // Simulate "Thinking" Process
                await pushStep(`[FALLBACK] Analyzing prompt: "${prompt}"`, 'analysis', 500);
                await pushStep("API Rate Limit Hit - Using Local Simulation engine...", 'analysis', 800);

                if (prompt.toLowerCase().includes("forest")) {
                    await pushStep("Identified acoustic environment: Forest/Outdoor", 'decision', 600);
                    await pushStep("Retrieving ambient texture: 'wind_in_trees.wav'", 'action', 400);
                    await pushStep("Adding randomized bird calls for organic feel", 'action', 500);
                } else if (prompt.toLowerCase().includes("city")) {
                    await pushStep("Identified acoustic environment: Urban/City", 'decision', 600);
                    await pushStep("Retrieving ambient texture: 'city_traffic_distant.wav'", 'action', 400);
                } else {
                    await pushStep("Inferring abstract environment from semantics", 'decision', 1000);
                    await pushStep("Selecting neutral reverb convolution", 'action', 500);
                }

                await pushStep("Calculating spatial coordinates for sources...", 'analysis', 700);

                // Final Result (Simulated)
                const finalResult = {
                    type: 'result',
                    data: {
                        name: "Generated Scene (Simulated)",
                        sources: [
                            { id: 's1', position: { x: -2, y: 0, z: 2 }, name: "Ambience", trajectory: "orbit", semanticTag: "wind" },
                            { id: 's2', position: { x: 3, y: 1, z: -1 }, name: "Effect", trajectory: "linear_forward", semanticTag: "bird" }
                        ]
                    }
                };
                controller.enqueue(encoder.encode(JSON.stringify(finalResult) + "\n"));

            } finally {
                controller.close();
            }
        }
    });
}

function simulateVideoAnalysis(videoName: string): ReadableStream {
    const encoder = new TextEncoder();
    return new ReadableStream({
        async start(controller) {
            const pushStep = (text: string, type: 'analysis' | 'decision' | 'action', delayMs: number) => {
                return new Promise<void>(resolve => {
                    setTimeout(() => {
                        const step: ThinkingStep = { id: crypto.randomUUID(), text, type, timestamp: Date.now() };
                        controller.enqueue(encoder.encode(JSON.stringify(step) + "\n"));
                        resolve();
                    }, delayMs);
                });
            };

            try {
                // Simulate Video Analysis
                await pushStep(`[FALLBACK] Analyzing video...`, 'analysis', 1000);
                await pushStep("API Rate Limit Hit - Using Local Simulation engine...", 'analysis', 500);
                await pushStep("Extracting keyframes for multimodal analysis...", 'analysis', 1500);

                await pushStep("Detected: Generic motion events", 'decision', 800);
                await pushStep("Synthesizing synchronized foley effects", 'action', 600);

                // Final Result
                const finalResult = {
                    type: 'result',
                    data: {
                        name: "Auto-Foley Scene (Simulated)",
                        sources: [
                            { id: 'f1', position: { x: 0, y: 0, z: 2 }, name: "Footsteps", timelineStart: 2, trajectory: "linear_forward", semanticTag: "footsteps" },
                            { id: 'f2', position: { x: 2, y: 0, z: 0 }, name: "Ambience", timelineStart: 0, trajectory: "static", semanticTag: "rain" }
                        ]
                    }
                };
                controller.enqueue(encoder.encode(JSON.stringify(finalResult) + "\n"));

            } finally {
                controller.close();
            }
        }
    });
}


/**
 * Generates a spatial audio scene description from a text prompt.
 * Uses Gemini 1.5 Flash to stream "thoughts" and then the final JSON configuration.
 * Fallbacks to simulation on error (e.g. Rate Limits).
 */
export async function generateSpatialSceneAction(prompt: string): Promise<ReadableStream> {
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
        async start(controller) {
            try {
                const systemPrompt = `
                You are an expert Spatial Audio Director. Your goal is to design immersive 3D audio scenes based on user descriptions.
                
                OUTPUT FORMAT:
                1. You MUST first output your "Reasoning Steps" to explain your creative process. Prefix each step with "THOUGHT:".
                2. Finally, output a SINGLE valid JSON object representing the scene.
                
                JSON SCHEMA:
                {
                    "type": "result",
                    "data": {
                        "name": "Scene Name",
                        "sources": [
                            {
                                "id": "unique_id",
                                "name": "Readable Name",
                                "position": { "x": number, "y": number, "z": number },
                                "semanticTag": "keyword_for_asset_search",
                                "trajectory": "static" | "orbit" | "linear_forward" | "linear_pass",
                                "timelineStart": number (optional delay in seconds),
                                "timelineDuration": number (duration in seconds)
                            }
                        ]
                    }
                }

                RULES:
                - Coordinates: x (-5 to 5), y (0 to 3), z (-5 to 5).
                - Trajectories: Use 'orbit' for surrounding sounds, 'linear_forward' for passing sounds.
                - Assets: Use simple keywords for 'semanticTag' like 'rain', 'wind', 'footsteps', 'bird', 'traffic'.
                `;

                const result = await model.generateContentStream([
                    systemPrompt,
                    `User Prompt: ${prompt}`
                ]);

                let buffer = "";

                for await (const chunk of result.stream) {
                    const text = chunk.text();
                    buffer += text;

                    // Parse "THOUGHT:" lines on the fly
                    const lines = buffer.split('\n');
                    // Keep the last line in buffer if it's incomplete (no newline)
                    buffer = lines.pop() || "";

                    for (const line of lines) {
                        const trimmed = line.trim();
                        if (trimmed.startsWith("THOUGHT:")) {
                            const thoughtText = trimmed.replace("THOUGHT:", "").trim();
                            const step: ThinkingStep = {
                                id: crypto.randomUUID(),
                                text: thoughtText,
                                type: 'analysis', // Generic type for now
                                timestamp: Date.now()
                            };
                            controller.enqueue(encoder.encode(JSON.stringify(step) + "\n"));
                        }
                    }
                }

                // After stream ends, try to find the JSON
                const response = await result.response;
                const fullText = response.text();

                // Extract JSON block
                const jsonMatch = fullText.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    try {
                        const jsonStr = jsonMatch[0];
                        const parsed = JSON.parse(jsonStr);
                        // Send the final result
                        controller.enqueue(encoder.encode(JSON.stringify(parsed) + "\n"));
                    } catch (e) {
                        console.error("Failed to parse JSON result", e);
                        const errorStep: ThinkingStep = { id: 'err', text: "Failed to parse scene configuration.", type: 'action', timestamp: Date.now() };
                        controller.enqueue(encoder.encode(JSON.stringify(errorStep) + "\n"));
                    }
                }

            } catch (error: any) {
                console.error("Gemini API Error:", error);

                // Fallback Logic
                // If it's a rate limit or any other error, default to simulation for the Demo
                console.log("Error encountered. Switching to fallback simulation.");

                // Directly enqueue fallback steps
                const step: ThinkingStep = { id: 'warn', text: "⚠️ API Warning: " + (error.message || "Unknown Error") + ". Switching to Offline Mode...", type: 'decision', timestamp: Date.now() };
                controller.enqueue(encoder.encode(JSON.stringify(step) + "\n"));

                // We need to 'simulate' the mock response. We can't reuse the stream function easily inside here,
                // so we just hardcode the mock output sequence for simplicity.

                const mockEncoder = new TextEncoder();
                const pushMock = (t: string, type: 'analysis' | 'decision' | 'action') => {
                    const s = { id: crypto.randomUUID(), text: t, type, timestamp: Date.now() };
                    controller.enqueue(mockEncoder.encode(JSON.stringify(s) + "\n"));
                };

                pushMock("Re-routing via Local Processing Engine...", 'analysis');

                if (prompt.toLowerCase().includes("forest")) {
                    pushMock("Identified acoustic environment: Forest/Outdoor", 'decision');
                    pushMock("Retrieving ambient texture: 'wind_in_trees.wav'", 'action');
                } else {
                    pushMock("Inferring abstract environment from semantics", 'decision');
                    pushMock("Selecting neutral reverb convolution", 'action');
                }

                const finalResult = {
                    type: 'result',
                    data: {
                        name: "Generated Scene (Offline)",
                        sources: [
                            { id: 's1', position: { x: -2, y: 0, z: 2 }, name: "Ambience", trajectory: "orbit", semanticTag: "wind" },
                            { id: 's2', position: { x: 3, y: 1, z: -1 }, name: "Effect", trajectory: "linear_forward", semanticTag: "bird" }
                        ]
                    }
                };

                // Add a small delay for realism if possible, but inside a catch block async sleep is fine
                await new Promise(r => setTimeout(r, 1000));
                controller.enqueue(mockEncoder.encode(JSON.stringify(finalResult) + "\n"));

            } finally {
                try { controller.close(); } catch (e) { }
            }
        }
    });

    return stream;
}

/**
 * Analyzes video data (base64) to generate spatial audio.
 */
export async function analyzeVideoAction(videoBase64: string): Promise<ReadableStream> {
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
        async start(controller) {
            try {
                const systemPrompt = `
                You are an Auto-Foley Artist. Analyze the video and generate a spatial audio scene synchronization.
                
                OUTPUT FORMAT:
                1. Output "THOUGHT:" lines describing visual events (e.g., "THOUGHT: Detected footsteps at 00:02").
                2. Output a SINGLE valid JSON object at the end.
                
                JSON SCHEMA:
                {
                    "type": "result",
                    "data": {
                        "name": "Auto-Foley Scene",
                        "sources": [
                            {
                                "id": "f_1",
                                "name": "Event Name",
                                "position": { "x": number, "y": 0, "z": number },
                                "semanticTag": "sound_keyword",
                                "timelineStart": number (seconds),
                                "timelineDuration": number (seconds),
                                "trajectory": "static" | "linear_forward"
                            }
                        ]
                    }
                }
                `;

                // Convert base64 to GenerativePart (inline data)
                const validBase64 = videoBase64.split(',')[1] || videoBase64;

                const result = await model.generateContentStream([
                    systemPrompt,
                    {
                        inlineData: {
                            data: validBase64,
                            mimeType: "video/mp4"
                        }
                    }
                ]);

                let buffer = "";

                for await (const chunk of result.stream) {
                    const text = chunk.text();
                    buffer += text;
                    const lines = buffer.split('\n');
                    buffer = lines.pop() || "";

                    for (const line of lines) {
                        const trimmed = line.trim();
                        if (trimmed.startsWith("THOUGHT:")) {
                            const thoughtText = trimmed.replace("THOUGHT:", "").trim();
                            const step: ThinkingStep = {
                                id: crypto.randomUUID(),
                                text: thoughtText,
                                type: 'analysis',
                                timestamp: Date.now()
                            };
                            controller.enqueue(encoder.encode(JSON.stringify(step) + "\n"));
                        }
                    }
                }

                const response = await result.response;
                const fullText = response.text();
                const jsonMatch = fullText.match(/\{[\s\S]*\}/);

                if (jsonMatch) {
                    const parsed = JSON.parse(jsonMatch[0]);
                    controller.enqueue(encoder.encode(JSON.stringify(parsed) + "\n"));
                }

            } catch (error: any) {
                console.error("Auto-Foley Error:", error);

                console.log("Error encountered. Switching to fallback simulation.");
                const step: ThinkingStep = { id: 'warn', text: "⚠️ API Rate Limit Hit. Switching to Offline Mode...", type: 'decision', timestamp: Date.now() };
                controller.enqueue(encoder.encode(JSON.stringify(step) + "\n"));

                const finalResult = {
                    type: 'result',
                    data: {
                        name: "Auto-Foley (Offline)",
                        sources: [
                            { id: 'f1', position: { x: 0, y: 0, z: 2 }, name: "Footsteps", timelineStart: 2, trajectory: "linear_forward", semanticTag: "footsteps" },
                            { id: 'f2', position: { x: 2, y: 0, z: 0 }, name: "Ambience", timelineStart: 0, trajectory: "static", semanticTag: "rain" }
                        ]
                    }
                };
                await new Promise(r => setTimeout(r, 1000));
                controller.enqueue(encoder.encode(JSON.stringify(finalResult) + "\n"));

            } finally {
                try { controller.close(); } catch (e) { }
            }
        }
    });

    return stream;
}
