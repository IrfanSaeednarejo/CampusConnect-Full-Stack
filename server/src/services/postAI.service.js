import { generateContent, generateStructuredJSON } from "../utils/geminiClient.js";

// ─── Shared System Context ────────────────────────────────────────────────────
const CAMPUS_SYSTEM_INSTRUCTION = `You are an AI writing assistant embedded in CampusConnect, 
a university social platform. Users are students, faculty, and student society leads. 
Keep all content appropriate, constructive, respectful, and campus-community-focused. 
Never generate offensive, discriminatory, political, or adult content. 
Be helpful, concise, and match the requested tone.`;

// ─── 1. Draft Post from Idea ──────────────────────────────────────────────────
/**
 * Generate a full post body from a rough topic or bullet-point idea.
 * @param {string} topic - The user's rough idea or bullet points.
 * @param {object} userContext - { displayName, role, campusName }
 * @param {string} tone - casual | professional | academic | inspirational | witty
 * @returns {{ body: string }}
 */
export const draftPost = async (topic, userContext = {}, tone = "casual") => {
    const { displayName = "a student", campusName = "the university" } = userContext;

    const prompt = `
Write a social media post for ${displayName} at ${campusName}.
Topic / rough idea: "${topic}"
Tone: ${tone}
Length: 80–200 words. Do NOT include any hashtags — those will be added separately.
Return ONLY the post body text, nothing else.
`.trim();

    const body = await generateContent(prompt, CAMPUS_SYSTEM_INSTRUCTION);
    return { body: body.trim() };
};

// ─── 2. Improve Existing Post ─────────────────────────────────────────────────
/**
 * Rewrite an existing post body with a specific tone.
 * @param {string} body - Current post body.
 * @param {string} tone - casual | professional | academic | inspirational | witty
 * @returns {{ body: string }}
 */
export const improvePost = async (body, tone = "casual") => {
    const prompt = `
Rewrite the following campus social media post in a ${tone} tone.
Keep the core message and intent. Keep hashtags if present.
Target length: similar to original (within 20%).
Return ONLY the rewritten post text, nothing else.

Original post:
"""
${body}
"""
`.trim();

    const improved = await generateContent(prompt, CAMPUS_SYSTEM_INSTRUCTION);
    return { body: improved.trim() };
};

// ─── 3. Suggest Hashtags ──────────────────────────────────────────────────────
/**
 * Generate 3–7 relevant hashtags from the post body.
 * @param {string} body - The post body text.
 * @returns {{ hashtags: string[] }}
 */
export const suggestHashtags = async (body) => {
    const systemInstruction = `${CAMPUS_SYSTEM_INSTRUCTION}
You always return a valid JSON object with a single key "hashtags" containing an array of strings.
Each hashtag must start with # and contain only letters and numbers. No spaces. No duplicates.`;

    const prompt = `
Generate 3 to 7 relevant hashtags for this campus social media post.
Do NOT include generic hashtags like #post, #social, #update.
Focus on the topic, event type, subject, or community mentioned.

Post:
"""
${body}
"""

Return ONLY valid JSON: { "hashtags": ["#example1", "#example2"] }
`.trim();

    const result = await generateStructuredJSON(prompt, systemInstruction);

    // Normalise — ensure every tag starts with #
    const hashtags = (result.hashtags || [])
        .map((t) => (t.startsWith("#") ? t : `#${t}`))
        .slice(0, 7);

    return { hashtags };
};

// ─── 4. Generate Poll Options ──────────────────────────────────────────────────
/**
 * Generate smart poll options from a question prompt.
 * @param {string} question - The poll question the user typed.
 * @returns {{ options: string[] }}
 */
export const generatePollOptions = async (question) => {
    const systemInstruction = `${CAMPUS_SYSTEM_INSTRUCTION}
You always return a valid JSON object with a single key "options" containing an array of 4 strings.
Each option must be short (max 60 chars), distinct, and non-overlapping.`;

    const prompt = `
Generate exactly 4 poll answer options for this campus poll question.
Options must be concise, mutually exclusive, and relevant.
Do not include the question itself in the options.

Question: "${question}"

Return ONLY valid JSON: { "options": ["Option A", "Option B", "Option C", "Option D"] }
`.trim();

    const result = await generateStructuredJSON(prompt, systemInstruction);
    const options = (result.options || []).slice(0, 4);
    return { options };
};

// ─── 5. Moderate Content ──────────────────────────────────────────────────────
/**
 * Pre-submission content safety check.
 * Returns a risk score and whether the content is safe to post.
 * @param {string} body - The post body to moderate.
 * @returns {{ safe: boolean, score: number, reason: string | null }}
 */
export const moderateContent = async (body) => {
    if (!body || body.trim().length < 10) {
        return { safe: true, score: 0, reason: null };
    }

    const systemInstruction = `You are a content moderation AI for a university social platform.
You always return a valid JSON object with keys: safe (boolean), score (0-100), reason (string or null).
Score 0 = completely safe. Score 100 = severely inappropriate.
Be lenient — flag only genuinely harmful content (hate speech, explicit content, bullying, threats, spam).
Normal campus discourse (complaints, opinions, debate) is always safe.`;

    const prompt = `
Evaluate the following campus social media post for content safety.
- "safe": true if the post is appropriate, false if it violates community standards
- "score": integer 0–100 (0 = completely safe, 100 = severely inappropriate)
- "reason": null if safe, otherwise a brief 1-sentence explanation of the flag

Post:
"""
${body}
"""

Return ONLY valid JSON: { "safe": true, "score": 0, "reason": null }
`.trim();

    try {
        const result = await generateStructuredJSON(prompt, systemInstruction);
        return {
            safe:   result.safe   !== undefined ? Boolean(result.safe)       : true,
            score:  result.score  !== undefined ? Math.min(100, Math.max(0, Number(result.score))) : 0,
            reason: result.reason || null,
        };
    } catch {
        // Fail open — if moderation errors, allow the post
        return { safe: true, score: 0, reason: null };
    }
};
