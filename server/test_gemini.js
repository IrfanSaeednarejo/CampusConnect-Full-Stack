import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config({ path: '.env' });

async function listGeminiModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

    try {
        const res = await fetch(endpoint);
        const data = await res.json();
        if (data.models) {
            console.log("Available Models:", data.models.map(m => m.name).filter(n => n.includes('gemini')));
        } else {
            console.log(data);
        }
    } catch (err) {
        console.error("Fetch failed:", err);
    }
}

listGeminiModels();
