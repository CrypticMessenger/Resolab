
"use server";

import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";

// Initialize Gemini SDK
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");

// Model Definitions
const PRIMARY_MODEL = "gemini-2.5-flash-lite";
const FALLBACK_MODEL = "gemini-2.0-flash-lite";

/**
 * Helper to get a generative model instance.
 */
function getModel(modelName: string): GenerativeModel {
    return genAI.getGenerativeModel({ model: modelName });
}

/**
 * Tries to generate content from primary model, falls back to secondary if it fails.
 */
async function getCascadingContent(
    systemPrompt: string,
    userContent: any[],
    actionName: string
): Promise<{ text: string, usedModel: string }> {
    try {
        const model = getModel(PRIMARY_MODEL);
        console.log(`[${actionName}] Calling Primary Model: ${PRIMARY_MODEL}...`);

        const result = await model.generateContent([
            systemPrompt,
            ...userContent
        ]);
        const response = await result.response;
        return { text: response.text(), usedModel: PRIMARY_MODEL };
    } catch (error: any) {
        console.warn(`[${actionName}] Primary model failed: ${error.message}. Switching to Fallback...`);

        try {
            const fallbackModel = getModel(FALLBACK_MODEL);
            console.log(`[${actionName}] Calling Fallback Model: ${FALLBACK_MODEL}...`);

            const result = await fallbackModel.generateContent([
                systemPrompt,
                ...userContent
            ]);
            const response = await result.response;
            return { text: response.text(), usedModel: FALLBACK_MODEL };
        } catch (fallbackError: any) {
            console.error(`[${actionName}] FATAL: All models failed.`, fallbackError);
            throw fallbackError;
        }
    }
}

/**
 * Generates a spatial audio scene description (Non-Streaming).
 */
export async function generateSpatialSceneAction(prompt: string): Promise<any> {
    const systemPrompt = `
    You are an expert Spatial Audio Director. Your goal is to design immersive 3D audio scenes based on user descriptions.
    
    OUTPUT FORMAT:
    1. First, think about the scene layout in your head (no need to output thoughts).
    2. Output a SINGLE valid JSON object representing the scene.
    
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

    try {
        const { text, usedModel } = await getCascadingContent(
            systemPrompt,
            [`User Prompt: ${prompt}`],
            "Director"
        );

        console.log(`[Director] Success with ${usedModel}. Parsing JSON...`);

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        } else {
            throw new Error("No JSON found in response");
        }
    } catch (error: any) {
        console.error("[Director] Error:", error);
        return { type: 'error', message: error.message };
    }
}

/**
 * Analyzes video data (base64) to generate spatial audio (Non-Streaming).
 */
export async function analyzeVideoAction(videoBase64: string): Promise<any> {
    const systemPrompt = `
    You are an Auto-Foley Artist. Analyze the video and generate a spatial audio scene synchronization.
    
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
    `;

    try {
        // Convert base64 to GenerativePart (inline data)
        const validBase64 = videoBase64.split(',')[1] || videoBase64;

        const { text, usedModel } = await getCascadingContent(
            systemPrompt,
            [{
                inlineData: {
                    data: validBase64,
                    mimeType: "video/mp4"
                }
            }],
            "AutoFoley"
        );

        console.log(`[AutoFoley] Success with ${usedModel}. Parsing JSON...`);

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        } else {
            throw new Error("No JSON found in response");
        }
    } catch (error: any) {
        console.error("[AutoFoley] Error:", error);
        return { type: 'error', message: error.message };
    }
}
