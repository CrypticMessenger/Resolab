"use server";

import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";
import { getAvailableTagsString } from '@/lib/assetLibrary';

// Initialize Gemini SDK
// Initialize Gemini SDK with dynamic key helper
const createGenAI = (apiKey?: string) => new GoogleGenerativeAI(apiKey || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");

// Model Definitions
const DEFAULT_PRIMARY_MODEL = "gemini-3-flash-preview";
const DEFAULT_FALLBACK_MODEL = "gemini-2.0-flash-lite";

/**
 * Helper to get a generative model instance.
 */
function getModel(modelName: string, apiKey?: string): GenerativeModel {
    const genAI = createGenAI(apiKey);
    return genAI.getGenerativeModel({ model: modelName });
}

/**
 * Tries to generate content from primary model, falls back to secondary if it fails.
 */
async function getCascadingContent(
    systemPrompt: string,
    userContent: any[],
    actionName: string,
    config?: { apiKey?: string; modelName?: string }
): Promise<{ text: string, usedModel: string }> {
    const primaryModelName = config?.modelName || DEFAULT_PRIMARY_MODEL;

    try {
        const model = getModel(primaryModelName, config?.apiKey);
        console.log(`[${actionName}] Calling Model: ${primaryModelName}...`);

        const result = await model.generateContent([
            systemPrompt,
            ...userContent
        ]);
        const response = await result.response;
        return { text: response.text(), usedModel: primaryModelName };
    } catch (error: any) {
        console.warn(`[${actionName}] Primary model (${primaryModelName}) failed: ${error.message}. Switching to Fallback...`);

        // If user specified a custom model and it failed, we still try the default fallback
        try {
            const fallbackModel = getModel(DEFAULT_FALLBACK_MODEL, config?.apiKey);
            console.log(`[${actionName}] Calling Fallback Model: ${DEFAULT_FALLBACK_MODEL}...`);

            const result = await fallbackModel.generateContent([
                systemPrompt,
                ...userContent
            ]);
            const response = await result.response;
            return { text: response.text(), usedModel: DEFAULT_FALLBACK_MODEL };
        } catch (fallbackError: any) {
            console.error(`[${actionName}] FATAL: All models failed.`, fallbackError);
            throw fallbackError;
        }
    }
}

/**
 * Generates a spatial audio scene description (Non-Streaming).
 */
export async function generateSpatialSceneAction(prompt: string, config?: { apiKey?: string; modelName?: string }): Promise<any> {
    const availableTags = getAvailableTagsString();

    const systemPrompt = `
    You are an expert Spatial Audio Director. Your goal is to design immersive 3D audio scenes based on user descriptions.
    
    CRITICAL: You must ONLY use the following 'semanticTag' values for your sources. Do not invent new tags.
    AVAILABLE TAGS: [${availableTags}]
    
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
    - Coordinate System:
      - X < 0: Left side of user
      - X > 0: Right side of user
      - Y > 0: Above user (Height)
      - Z > 0: Front of user
      - Z < 0: Behind user
    - User Head Position: The listener is always fixed at (0, 0, 0).
    - Motion Rules:
      - If an object moves towards the camera/listener and exits the frame, it implies passing the user. You MUST animate the source moving from Positive Z to Negative Z (e.g., Z=5 -> Z=-5) to simulate it passing *behind* the user.
      - Do not let objects just vanish at Z=0.
    - Trajectories: Use 'orbit' for surrounding sounds, 'linear_forward' for passing sounds.
    `;

    try {
        const { text, usedModel } = await getCascadingContent(
            systemPrompt,
            [`User Prompt: ${prompt}`],
            "Director",
            config
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
export async function analyzeVideoAction(videoBase64: string, config?: { apiKey?: string; modelName?: string }): Promise<any> {
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
            "AutoFoley",
            config
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
