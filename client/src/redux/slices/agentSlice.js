import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as agentApi from "../../api/agentApi";

export const askAiThunk = createAsyncThunk(
    "agent/askAi",
    async ({ agentType, prompt, history }, { rejectWithValue }) => {
        try {
            const { data } = await agentApi.askAI({ agentType, prompt, history });
            return { agentType, response: data.data.response };
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

const initialState = {
    historyByAgent: {
        study: [],
        mentor: [],
        wellbeing: [],
        feedback: [],
    },
    loading: false,
    error: null,
};

const agentSlice = createSlice({
    name: "agent",
    initialState,
    reducers: {
        addMessage: (state, action) => {
            const { agentType, message } = action.payload;
            if (state.historyByAgent[agentType]) {
                state.historyByAgent[agentType].push(message);
            }
        },
        clearHistory: (state, action) => {
            const agentType = action.payload;
            if (state.historyByAgent[agentType]) {
                state.historyByAgent[agentType] = [];
            }
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(askAiThunk.pending, (state) => {
                state.loading = true;
            })
            .addCase(askAiThunk.fulfilled, (state, action) => {
                const { agentType, response } = action.payload;
                state.historyByAgent[agentType].push({
                    text: response,
                    sender: "agent",
                    timestamp: new Date().toISOString(),
                });
                state.loading = false;
            })
            .addCase(askAiThunk.rejected, (state, action) => {
                state.error = action.payload;
                state.loading = false;
            });
    },
});

export const { addMessage, clearHistory } = agentSlice.actions;

export const selectAgentHistory = (agentType) => (state) =>
    state.agent.historyByAgent[agentType] || [];
export const selectAgentLoading = (state) => state.agent.loading;

export default agentSlice.reducer;
