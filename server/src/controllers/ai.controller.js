import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { AIService } from "../services/ai.service.js";

export const handleChat = asyncHandler(async (req, res) => {
    const { provider, systemPrompt, userMessage, history } = req.body;

    // Call the unified AI service 
    const responseText = await AIService.getChatResponse(provider, systemPrompt, userMessage, history);

    // Send response back
    res.status(200).json(new ApiResponse(200, { response: responseText }, "AI responded successfully"));
});