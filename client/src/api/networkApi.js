import api from './axios';

/**
 * Academic Network API — Real backend calls
 * Replaces the mock academicNetworkApi that used localStorage.
 */

// Fetch all user profiles for the academic network directory
export const getNetworkProfiles = async (params = {}) => {
    try {
        const response = await api.get('/users/search', { params });
        // Backend returns: { statusCode, data: { docs: [...], pagination }, message }
        const payload = response.data?.data;
        const docs = payload?.docs || payload?.users || [];

        // Normalize each user into the profile shape the UI expects
        return docs.map(user => ({
            id: user._id,
            name: user.profile?.displayName
                || `${user.profile?.firstName || ''} ${user.profile?.lastName || ''}`.trim()
                || user.email?.split('@')[0]
                || 'User',
            email: user.email || '',
            department: user.academic?.department || '',
            bio: user.profile?.bio || '',
            role: (user.roles || []).includes('mentor') ? 'Mentor'
                : (user.roles || []).includes('society_head') ? 'Faculty'
                    : 'Student',
            year: user.academic?.semester ? `Semester ${user.academic.semester}` : '',
            avatar: user.profile?.avatar || '',
            isOnline: false,
            academicInterests: user.interests || user.academic?.interests || [],
            societies: (user.societies || []).map(s => typeof s === 'string' ? s : s._id),
            connectionStatus: 'none', // Default — real connection tracking can be added later
        }));
    } catch (error) {
        console.error('[NetworkApi] Failed to fetch profiles:', error);
        throw error.response?.data || error;
    }
};

// Send a connection request (placeholder — backend route can be added later)
export const sendConnectionRequest = async (profileId) => {
    // For now, return immediate success since the backend connection model 
    // may not exist yet. This can be wired to a real endpoint later.
    return { success: true, profileId };
};
