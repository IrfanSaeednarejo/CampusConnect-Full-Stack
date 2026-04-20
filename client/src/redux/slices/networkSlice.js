import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as networkApi from "../../api/networkApi";

export const fetchNetworkState = createAsyncThunk(
    "network/fetchState",
    async (_, { rejectWithValue }) => {
        try {
            const response = await networkApi.getNetworkState();
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message || "Failed to fetch network state");
        }
    }
);

export const fetchSuggestedMembers = createAsyncThunk(
    "network/fetchSuggested",
    async (limit = 10, { rejectWithValue }) => {
        try {
            const response = await networkApi.getSuggestedMembers(limit);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message || "Failed to fetch suggested members");
        }
    }
);

const initialState = {
    connected: [],
    pendingSent: [],
    pendingReceived: [],
    suggested: [],
    loading: false,
    error: null,
};

const networkSlice = createSlice({
    name: "network",
    initialState,
    reducers: {
        addPendingSent(state, action) {
            state.pendingSent.push(action.payload);
            const index = state.suggested.findIndex(s => s._id === action.payload.user._id);
            if(index !== -1) state.suggested.splice(index, 1);
        },
        addPendingReceived(state, action) {
            state.pendingReceived.push(action.payload);
        },
        acceptRequestSuccess(state, action) {
            // Find either in pendingSent or pendingReceived
            const connection = action.payload; // Populated Connection
            
            state.pendingReceived = state.pendingReceived.filter(p => p.connectionId !== connection._id);
            state.pendingSent = state.pendingSent.filter(p => p.connectionId !== connection._id);

            // Need to figure out the peer
            // Since we don't have requestUser ID here easily, we'll wait for a refetch or just add the generic object.
            // But actually we just rely on fetchNetworkState() currently in the frontend components,
            // However, to keep it consistent, let's just trigger a refetch if we are complex, or we can just push it:
            state.connected.push({
                connectionId: connection._id,
                user: connection.requester, // Roughly. The real fetchNetworkState will sync it perfectly.
                connectedAt: new Date().toISOString()
            });
        },
        removePendingReceived(state, action) {
            state.pendingReceived = state.pendingReceived.filter(p => p.connectionId !== action.payload.connectionId);
        },
        removePendingSent(state, action) {
            state.pendingSent = state.pendingSent.filter(p => p.connectionId !== action.payload.connectionId);
        },
        removeConnectionState(state, action) {
            state.connected = state.connected.filter(c => c.connectionId !== action.payload.connectionId);
        },
        addConnectionDirectly(state, action) {
           // from socket
           const { connectionId, user } = action.payload;
           state.connected.push({ connectionId, user, connectedAt: new Date().toISOString() });
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchNetworkState.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchNetworkState.fulfilled, (state, action) => {
                state.loading = false;
                state.connected = action.payload.data.connected || [];
                state.pendingSent = action.payload.data.pendingSent || [];
                state.pendingReceived = action.payload.data.pendingReceived || [];
            })
            .addCase(fetchNetworkState.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchSuggestedMembers.fulfilled, (state, action) => {
                state.suggested = action.payload.data || [];
            });
    },
});

export const {
    addPendingSent,
    addPendingReceived,
    acceptRequestSuccess,
    removePendingReceived,
    removePendingSent,
    removeConnectionState,
    addConnectionDirectly
} = networkSlice.actions;

export default networkSlice.reducer;
