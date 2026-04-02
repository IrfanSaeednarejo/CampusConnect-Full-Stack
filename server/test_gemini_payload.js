import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config({ path: '.env' });

async function testGemini() {
    const apiKey = process.env.GEMINI_API_KEY;
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    // Test 1: system_instruction
    const body1 = {
        system_instruction: { parts: [{ text: "test" }] },
        contents: [{ role: 'user', parts: [{ text: "hello" }] }]
    };

    // Test 2: systemInstruction
    const body2 = {
        systemInstruction: { parts: [{ text: "test" }] },
        contents: [{ role: 'user', parts: [{ text: "hello" }] }]
    };

    console.log("Testing system_instruction:");
    const res1 = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body1) });
    console.log(res1.status, await res1.text());

    console.log("\nTesting systemInstruction:");
    const res2 = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body2) });
    console.log(res2.status, await res2.text());
}

testGemini();
