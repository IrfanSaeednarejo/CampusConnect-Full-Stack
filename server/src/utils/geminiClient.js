import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
    throw new Error("[GeminiClient] GEMINI_API_KEY is not set in environment variables.");
}

const genAI = new GoogleGenerativeAI(API_KEY);

// gemini-2.5-flash works on all API key tiers (free + paid).
const MODEL_NAME = "gemini-2.5-flash";

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
        ...(systemInstruction ? { systemInstruction } : {}),
        generationConfig: {
            temperature: 0.7,
            topP: 0.95,
            maxOutputTokens: 8192,
        },
    });

    const result = await model.generateContent(prompt);
    return result.response.text();
};

/**
 * Generate a structured JSON response (intent parsing).
 * NOTE: We do NOT use responseMimeType:"application/json" as it is restricted to
 * specific model versions. Instead we instruct the model in the system prompt to
 * return raw JSON and parse it ourselves.
 *
 * @param {string} prompt - The structured prompt requesting JSON output.
 * @param {string} systemInstruction - System instruction that defines the JSON schema.
 * @returns {Promise<object>} - Parsed JSON object.
 */
export const generateStructuredJSON = async (prompt, systemInstruction) => {
    const model = genAI.getGenerativeModel({
        model: MODEL_NAME,
        ...(systemInstruction ? { systemInstruction } : {}),
        generationConfig: {
            temperature: 0.2,   // Low temp for deterministic JSON
            topP: 0.9,
            maxOutputTokens: 2048,
            // No responseMimeType here — not universally supported
        },
    });

    const result = await model.generateContent(prompt);
    const rawText = result.response.text().trim();

    // Try direct parse first
    try {
        return JSON.parse(rawText);
    } catch {
        // Strip markdown code fences if the model wrapped the JSON
        const fenceMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (fenceMatch) {
            try {
                return JSON.parse(fenceMatch[1].trim());
            } catch {
                // ignore, fall through to error
            }
        }

        // Last resort: extract the first {...} block from the response
        const braceMatch = rawText.match(/\{[\s\S]*\}/);
        if (braceMatch) {
            try {
                return JSON.parse(braceMatch[0]);
            } catch {
                // ignore, fall through to error
            }
        }

        console.error("[GeminiClient] Raw JSON response could not be parsed:", rawText.slice(0, 300));
        throw new Error(`[GeminiClient] Failed to parse structured JSON.`);
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
        ...(systemInstruction ? { systemInstruction } : {}),
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
