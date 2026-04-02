import OpenAI from "openai";
import Groq from "groq-sdk";
import { ApiError } from "../utils/ApiError.js";

// AI Service to handle chat completions for various providers
export class AIService {
    static async getChatResponse(provider, systemPrompt, userMessage, history) {
        if (!systemPrompt || !userMessage) {
            throw new ApiError(400, "systemPrompt and userMessage are required");
        }

        const activeProvider = provider || process.env.AI_PROVIDER || 'gemini';

        switch (activeProvider) {
            case 'openai':
                return this.callOpenAI(systemPrompt, history, userMessage);
            case 'groq':
                return this.callGroq(systemPrompt, history, userMessage);
            case 'gemini':
            default:
                return this.callGemini(systemPrompt, history, userMessage);
        }
    }

    static async callGemini(systemPrompt, history, userMessage) {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) throw new ApiError(500, "GEMINI_API_KEY is not configured");

        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;

        const contents = [];
        if (history && history.length > 0) {
            for (const msg of history) {
                if (msg.role === 'user') {
                    contents.push({ role: 'user', parts: [{ text: msg.content }] });
                } else if (msg.role === 'agent' || msg.role === 'assistant') {
                    contents.push({ role: 'model', parts: [{ text: msg.content }] });
                }
            }
        }

        contents.push({ role: 'user', parts: [{ text: userMessage }] });

        const body = {
            system_instruction: { parts: [{ text: systemPrompt }] },
            contents,
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 600,
                topP: 0.9,
            },
        };

        const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            throw new ApiError(res.status, `Gemini API Error: ${res.statusText}`);
        }

        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
            throw new ApiError(500, "Empty response from Gemini");
        }

        return text;
    }

    static async callOpenAI(systemPrompt, history, userMessage) {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) throw new ApiError(500, "OPENAI_API_KEY is not configured");

        const openai = new OpenAI({ apiKey });

        const messages = [{ role: 'system', content: systemPrompt }];
        if (history && history.length > 0) {
            for (const msg of history) {
                if (msg.role === 'user') {
                    messages.push({ role: 'user', content: msg.content });
                } else if (msg.role === 'agent' || msg.role === 'assistant') {
                    messages.push({ role: 'assistant', content: msg.content });
                }
            }
        }
        messages.push({ role: 'user', content: userMessage });

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages,
            temperature: 0.7,
            max_tokens: 600,
        });

        return completion.choices[0]?.message?.content || "";
    }

    static async callGroq(systemPrompt, history, userMessage) {
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) throw new ApiError(500, "GROQ_API_KEY is not configured");

        const groq = new Groq({ apiKey });

        const messages = [{ role: 'system', content: systemPrompt }];
        if (history && history.length > 0) {
            for (const msg of history) {
                if (msg.role === 'user') {
                    messages.push({ role: 'user', content: msg.content });
                } else if (msg.role === 'agent' || msg.role === 'assistant') {
                    messages.push({ role: 'assistant', content: msg.content });
                }
            }
        }
        messages.push({ role: 'user', content: userMessage });

        const completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages,
            temperature: 0.7,
            max_tokens: 600,
        });

        return completion.choices[0]?.message?.content || "";
    }
}
