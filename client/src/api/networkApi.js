import api from './axios';

/**
 * Academic Network API — Real backend calls
 * Fetches real user profiles from the backend search endpoint.
 * Connection requests are stored per-user in localStorage until a
 * dedicated backend connections model is built.
 */

// Helper to get the current user's connection storage key
const getConnectionsKey = () => {
    try {
        const authState = JSON.parse(localStorage.getItem('authState') || '{}');
        const userId = authState?.user?._id || authState?.user?.id;
        return userId ? `cc_connections_${userId}` : null;
    } catch {
        return null;
    }
};

const loadConnections = () => {
    const key = getConnectionsKey();
    if (!key) return {};
    try {
        return JSON.parse(localStorage.getItem(key) || '{}');
    } catch {
        return {};
    }
};

const saveConnections = (connections) => {
    const key = getConnectionsKey();
    if (!key) return;
    localStorage.setItem(key, JSON.stringify(connections));
};

// Fetch all user profiles for the academic network directory
export const getNetworkProfiles = async (params = {}) => {
    try {
        // Fetch with no limit to get all users
        const response = await api.get('/users/search', { params: { ...params, limit: 0 } });
        const payload = response.data?.data;
        const docs = payload?.docs || payload?.users || [];

        // Load persisted connection statuses for current user
        const connections = loadConnections();

        // Normalize each user into the profile shape the UI expects
        return docs.map(user => {
            const id = user._id;
            return {
                id,
                name: user.profile?.displayName
                    || `${user.profile?.firstName || ''} ${user.profile?.lastName || ''}`.trim()
                    || user.email?.split('@')[0]
                    || 'User',
                email: user.email || '',
                department: user.academic?.department || '',
                bio: user.profile?.bio || '',
                role: (user.roles || []).includes('mentor') ? 'Mentor'
                    : (user.roles || []).includes('society_head') ? 'Society Head'
                        : (user.roles || []).includes('admin') ? 'Faculty'
                            : 'Student',
                year: user.academic?.semester ? `Semester ${user.academic.semester}` : '',
                avatar: user.profile?.avatar || '',
                isOnline: false,
                academicInterests: user.interests || user.academic?.interests || [],
                societies: (user.societies || []).map(s => typeof s === 'string' ? s : s._id),
                connectionStatus: connections[id] || 'none',
            };
        });
    } catch (error) {
        console.error('[NetworkApi] Failed to fetch profiles:', error);
        throw error.response?.data || error;
    }
};

// Send a connection request — persists to per-user localStorage
export const sendConnectionRequest = async (profileId) => {
    const connections = loadConnections();
    connections[profileId] = 'pending';
    saveConnections(connections);
    return { success: true, profileId };
};

// Accept a connection (upgrade from pending to connected)
export const acceptConnection = async (profileId) => {
    const connections = loadConnections();
    connections[profileId] = 'connected';
    saveConnections(connections);
    return { success: true, profileId };
};
