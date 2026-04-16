import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const askAI = asyncHandler(async (req, res) => {
    const { agentType, prompt, history } = req.body;

    if (!prompt) {
        throw new ApiError(400, "Prompt is required");
    }

    // Placeholder for AI logic. This could be extended with OpenAI or Gemini SDKs.
    // For now, it returns a simulated helpful response.
    const responses = {
        study: `I've analyzed your question about "${prompt}". Breaking it down: 1) Focus on the core principles. 2) Look at related examples. 3) Practice active recall.`,
        mentor: `Based on your query "${prompt}", I recommend connecting with seniors in the Computer Science department who have experience in this field.`,
        wellbeing: `It's important to balance your studies. Regarding "${prompt}", make sure to take regular breaks and stay hydrated.`,
        feedback: `Thank you for your feedback on "${prompt}". We've noted this and will use it to improve the platform experience.`
    };

    const response = responses[agentType] || `I'm here to help with your question: "${prompt}". Please provide more context if you'd like a more detailed answer.`;

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return res.status(200).json(new ApiResponse(200, { response }, "AI response generated"));
});

export { askAI };