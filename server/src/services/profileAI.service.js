import { generateContent, generateStructuredJSON } from "../utils/geminiClient.js";

const CAMPUS_SYSTEM = `You are an AI writing assistant for CampusNexus, a university social platform.
Users are students, Mentors, and society leads. Keep content professional, encouraging, and campus-appropriate.
Never generate offensive, political, or inappropriate content.`;

/**
 * Generate a professional bio suggestion based on the user's profile context.
 * @param {object} userContext - { displayName, degree, department, interests, experience, skills }
 * @returns {{ bio: string }}
 */
export const generateBioSuggestion = async (userContext) => {
    const {
        displayName = "a student",
        degree = "",
        department = "",
        interests = [],
        experience = [],
        skills = [],
    } = userContext;

    const contextLines = [
        degree && `Degree: ${degree}`,
        department && `Department: ${department}`,
        interests.length && `Interests: ${interests.slice(0, 5).join(", ")}`,
        skills.length && `Skills: ${skills.slice(0, 5).join(", ")}`,
        experience.length && `Latest role: ${experience[0].title} at ${experience[0].organization}`,
    ].filter(Boolean).join("\n");

    const prompt = `
Write a professional and engaging campus profile bio for ${displayName}.
Context about this person:
${contextLines || "No additional context provided."}

Requirements:
- 2–4 sentences (max 250 characters)
- First person voice
- Highlights academic background and interests
- Ends with a forward-looking or collaborative statement
- Do NOT include any hashtags

Return ONLY the bio text, nothing else.
`.trim();

    const bio = await generateContent(prompt, CAMPUS_SYSTEM);
    return { bio: bio.trim().slice(0, 280) };
};

/**
 * Rewrite an experience description in a professional tone.
 * @param {string} description - Raw description the user typed
 * @param {string} title       - Job/role title
 * @param {string} organization - Organization name
 * @returns {{ description: string }}
 */
export const improveExperienceDescription = async (description, title, organization) => {
    const prompt = `
Rewrite the following experience description for a campus profile section.
Role: "${title}" at "${organization}"
Original description: "${description}"

Requirements:
- Professional, action-oriented tone (use strong verbs)
- 2–4 bullet-points or 2–3 sentences
- Highlight impact and skills used
- Max 400 characters
- Return ONLY the rewritten description text

`.trim();

    const improved = await generateContent(prompt, CAMPUS_SYSTEM);
    return { description: improved.trim().slice(0, 450) };
};

/**
 * Generate a short headline suggestion based on user's academic/experience context.
 * @param {object} userContext - { degree, department, experience, interests }
 * @returns {{ headline: string }}
 */
export const generateHeadlineSuggestion = async (userContext) => {
    const { degree = "", department = "", experience = [], interests = [] } = userContext;

    const prompt = `
Generate a concise professional headline for a university student's campus profile.
Context:
- Degree/Dept: ${degree} ${department}
- Latest role: ${experience[0] ? `${experience[0].title} at ${experience[0].organization}` : "None"}
- Interests: ${interests.slice(0, 3).join(", ") || "Not specified"}

Requirements:
- Max 100 characters
- Like a LinkedIn headline (role | interest | aspiration)
- Professional and campus-appropriate
- Return ONLY the headline text

`.trim();

    const headline = await generateContent(prompt, CAMPUS_SYSTEM);
    return { headline: headline.trim().slice(0, 120) };
};
