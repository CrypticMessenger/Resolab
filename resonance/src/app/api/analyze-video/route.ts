import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager } from "@google/generative-ai/server";
import { getAvailableTagsString } from '@/lib/assetLibrary';
import fs from "fs";
import os from "os";
import path from "path";
import { pipeline } from "stream/promises";
import { NextResponse } from 'next/server';

// Initialize Gemini SDK with dynamic key helper
const createGenAI = (apiKey?: string) => new GoogleGenerativeAI(apiKey || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");
const DEFAULT_PRIMARY_MODEL = "gemini-3-flash-preview";

export async function POST(req: Request) {
    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    const writeLog = async (msg: string) => {
        await writer.write(encoder.encode(JSON.stringify({ type: 'log', message: msg }) + '\n'));
    };

    const cleanup = async (tempFilePath: string | null, fileManager: GoogleAIFileManager | null, uploadResult: any) => {
        if (tempFilePath && fs.existsSync(tempFilePath)) {
            try { fs.unlinkSync(tempFilePath); } catch (e) { console.error("Cleanup local error", e); }
        }
        if (uploadResult && fileManager) {
            try {
                await fileManager.deleteFile(uploadResult.file.name);
                await writeLog("[AutoFoley] Cleaned up Gemini file");
            } catch (e) { console.error("Cleanup Gemini error", e); }
        }
    };

    // Background processing function that writes to the stream
    (async () => {
        let tempFilePath: string | null = null;
        let uploadResult: any = null;
        let fileManager: GoogleAIFileManager | null = null;

        try {
            const body = await req.json();
            const { videoUrl, config } = body;
            const apiKey = config?.apiKey || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";

            if (!apiKey) {
                throw new Error("Missing Gemini API Key");
            }

            fileManager = new GoogleAIFileManager(apiKey);
            const availableTags = getAvailableTagsString();

            const systemPrompt = `
            You are an Auto-Foley Artist. Analyze the video and generate a spatial audio scene synchronization.
            
            CRITICAL: You must ONLY use the following 'semanticTag' values.
            AVAILABLE TAGS: [${availableTags}]
            
            OUTPUT FORMAT:
            Output a SINGLE valid JSON object.
            
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

            RULES:
            - Coordinate System:
              - X < 0: Left side of user
              - X > 0: Right side of user
              - Y > 0: Above user (Height)
              - Z > 0: Front of user
              - Z < 0: Behind user
            - User Head Position: The listener is always fixed at (0, 0, 0).
            - Motion Rules:
              - If an object in the video moves towards the camera and exits the frame (left/right/bottom), it implies passing the listener.
              - You MUST animate the source coordinates moving from Positive Z to Negative Z (e.g., Z=3 -> Z=-3).
              - This creates a realistic "fly-by" or "pass-through" effect where audio continues behind the user.
            `;

            await writeLog(`[AutoFoley] Download started: ${videoUrl.substring(0, 40)}...`);

            // 1. Download Video
            const response = await fetch(videoUrl);
            if (!response.ok) throw new Error(`Failed to fetch video: ${response.statusText}`);

            const tempDir = os.tmpdir();
            const fileExt = videoUrl.split('.').pop()?.split('?')[0] || 'mp4';
            tempFilePath = path.join(tempDir, `gemini_upload_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`);

            const fileStream = fs.createWriteStream(tempFilePath);
            // @ts-ignore
            await pipeline(response.body, fileStream);

            await writeLog(`[AutoFoley] Downloaded. Uploading to Gemini...`);

            // 2. Upload to Gemini
            uploadResult = await fileManager.uploadFile(tempFilePath, {
                mimeType: "video/mp4",
                displayName: "AutoFoley Video",
            });

            await writeLog(`[AutoFoley] Uploaded: ${uploadResult.file.uri}`);
            await writeLog(`[AutoFoley] Waiting for video processing...`);

            // 3. Polling Loop
            let file = uploadResult.file;
            let attempt = 0;
            while (file.state === "PROCESSING" && attempt < 30) {
                await new Promise(resolve => setTimeout(resolve, 2000));
                file = await fileManager.getFile(file.name);
                await writeLog(`[AutoFoley] Processing state: ${file.state}`);
                attempt++;
            }

            if (file.state !== "ACTIVE") {
                throw new Error(`Video failed to process. State: ${file.state}`);
            }

            await writeLog(`[AutoFoley] Generating content...`);

            // 4. Generate Content
            const genAI = createGenAI(apiKey);
            const modelName = config?.modelName || DEFAULT_PRIMARY_MODEL;
            const model = genAI.getGenerativeModel({ model: modelName });

            const result = await model.generateContent([
                systemPrompt,
                {
                    fileData: {
                        mimeType: uploadResult.file.mimeType,
                        fileUri: uploadResult.file.uri
                    }
                },
                { text: "Analyze this video." }
            ]);

            await writeLog(`[AutoFoley] Analysis complete. Parsing...`);
            const text = result.response.text();

            const jsonMatch = text.match(/\{[\s\S]*\}/);
            let finalData;

            if (jsonMatch) {
                finalData = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error("No JSON found in response");
            }

            // Send final result
            await writer.write(encoder.encode(JSON.stringify(finalData) + '\n'));

        } catch (error: any) {
            console.error("Stream Error:", error);
            const errorMsg = JSON.stringify({ type: 'error', message: error.message }) + '\n';
            await writer.write(encoder.encode(errorMsg));
        } finally {
            await cleanup(tempFilePath, fileManager, uploadResult);
            await writer.close();
        }
    })();

    return new Response(stream.readable, {
        headers: {
            'Content-Type': 'text/plain; charset=utf-8',
        },
    });
}
