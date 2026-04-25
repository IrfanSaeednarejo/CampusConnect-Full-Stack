import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
    throw new Error("[GeminiClient] GEMINI_API_KEY is not set in environment variables.");
}

const genAI = new GoogleGenerativeAI(API_KEY);

const MODEL_NAME = "gemini-2.5-flash-preview-04-17";

/**
 * Get the base generative model instance.
 * @param {object} [config] - Optional generation config overrides.
 */
const getModel = (config = {}) => {
    return genAI.getGenerativeModel({
        model: MODEL_NAME,
        generationConfig: {
            temperature: 0.7,
            topP: 0.95,
            topK: 40,
            maxOutputTokens: 8192,
            ...config,
        },
    });
};

/**
 * Single-turn content generation.
 * @param {string} prompt - The user prompt.
 * @param {string} [systemInstruction] - Optional system-level instruction.
 * @returns {Promise<string>} - Plain text response.
 */
export const generateContent = async (prompt, systemInstruction = "") => {
    const model = genAI.getGenerativeModel({
        model: MODEL_NAME,
        systemInstruction: systemInstruction || undefined,
        generationConfig: {
            temperature: 0.7,
            topP: 0.95,
            maxOutputTokens: 8192,
        },
    });

    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text();
};

/**
 * Generate a structured JSON response (intent parsing).
 * Forces the model to return valid JSON.
 * @param {string} prompt - The structured prompt requesting JSON output.
 * @param {string} systemInstruction - System instruction that defines the JSON schema.
 * @returns {Promise<object>} - Parsed JSON object.
 */
export const generateStructuredJSON = async (prompt, systemInstruction) => {
    const model = genAI.getGenerativeModel({
        model: MODEL_NAME,
        systemInstruction,
        generationConfig: {
            temperature: 0.2,      // Lower temp for deterministic JSON
            topP: 0.9,
            maxOutputTokens: 2048,
            responseMimeType: "application/json",
        },
    });

    const result = await model.generateContent(prompt);
    const rawText = result.response.text();

    try {
        return JSON.parse(rawText);
    } catch {
        // Attempt to extract JSON from markdown code fences if model wrapped it
        const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[1].trim());
        }
        throw new Error(`[GeminiClient] Failed to parse structured JSON. Raw: ${rawText.slice(0, 200)}`);
    }
};

/**
 * Start a multi-turn chat session with optional conversation history.
 * @param {Array<{role: string, parts: Array<{text: string}>}>} history - Prior conversation turns.
 * @param {string} [systemInstruction] - System-level instruction for the chat.
 * @returns {object} - Gemini chat session object with .sendMessage()
 */
export const startChat = (history = [], systemInstruction = "") => {
    const model = genAI.getGenerativeModel({
        model: MODEL_NAME,
        systemInstruction: systemInstruction || undefined,
        generationConfig: {
            temperature: 0.75,
            topP: 0.95,
            maxOutputTokens: 8192,
        },
    });

    return model.startChat({ history });
};

/**
 * Count approximate tokens in a string (rough estimate: 4 chars ≈ 1 token).
 * Used for context window management.
 * @param {string} text
 * @returns {number}
 */
export const estimateTokens = (text) => Math.ceil((text || "").length / 4);

/**
 * Truncate conversation history to fit within a token budget.
 * Always keeps the most recent messages.
 * @param {Array} messages - Array of { role, content } objects.
 * @param {number} [maxTokens=6000] - Maximum token budget for history.
 * @returns {Array} - Trimmed message array.
 */
export const trimHistory = (messages, maxTokens = 6000) => {
    let total = 0;
    const kept = [];

    for (let i = messages.length - 1; i >= 0; i--) {
        const tokens = estimateTokens(messages[i].content);
        if (total + tokens > maxTokens) break;
        total += tokens;
        kept.unshift(messages[i]);
    }

    return kept;
};

export default { generateContent, generateStructuredJSON, startChat, estimateTokens, trimHistory };
