import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getAllMentors, getMentorById } from '../../api/mentoringApi';

export const fetchMentors = createAsyncThunk('mentors/fetchAll', async (filters = {}, { rejectWithValue }) => {
  try {
    const response = await getAllMentors(filters);
    // Backend returns: { statusCode, data: { docs: [...], pagination }, message }
    const raw = response.data;
    const docs = Array.isArray(raw) ? raw : (raw?.docs || raw?.mentors || []);
    // Normalize each mentor doc for the UI
    return docs.map(m => ({
      _id: m._id,
      name: m.userId?.profile?.displayName
        || `${m.userId?.profile?.firstName || ''} ${m.userId?.profile?.lastName || ''}`.trim()
        || 'Mentor',
      avatar: m.userId?.profile?.avatar || '',
      department: m.userId?.academic?.department || '',
      email: m.userId?.email || '',
      expertise: m.expertise || [],
      categories: m.categories || [],
      bio: m.bio || '',
      hourlyRate: m.hourlyRate || 0,
      currency: m.currency || 'PKR',
      rating: m.averageRating || 0,
      totalSessions: m.totalSessions || 0,
      totalReviews: m.totalReviews || 0,
      tier: m.tier || 'bronze',
      availability: m.availability || [],
      verified: m.verified,
      isActive: m.isActive,
    }));
  } catch (error) {
    return rejectWithValue(error?.message || 'Failed to fetch mentors');
  }
});

export const fetchMentorById = createAsyncThunk('mentors/fetchById', async (mentorId, { rejectWithValue }) => {
  try {
    const response = await getMentorById(mentorId);
    return response.data;
  } catch (error) {
    return rejectWithValue(error?.message || 'Failed to fetch mentor');
  }
});

const mentorsSlice = createSlice({
  name: 'mentors',
  initialState: {
    items: [],
    currentMentor: null,
    status: 'idle',
    error: null,
    actionLoading: {},
  },
  reducers: {},
  extraReducers: (builder) => {
    // fetchMentors
    builder.addCase(fetchMentors.pending, (state) => { state.status = 'loading'; state.error = null; })
      .addCase(fetchMentors.fulfilled, (state, action) => { state.status = 'succeeded'; state.items = action.payload; })
      .addCase(fetchMentors.rejected, (state, action) => { state.status = 'failed'; state.error = action.payload; });

    // fetchMentorById
    builder.addCase(fetchMentorById.pending, (state) => { state.actionLoading.currentMentor = true; })
      .addCase(fetchMentorById.fulfilled, (state, action) => {
        state.actionLoading.currentMentor = false;
        state.currentMentor = action.payload;
      })
      .addCase(fetchMentorById.rejected, (state, action) => {
        state.actionLoading.currentMentor = false;
        state.error = action.payload;
      });
  }
});

export default mentorsSlice.reducer;

export const selectAllMentors = (state) => state.mentors?.items || [];
export const selectCurrentMentor = (state) => state.mentors?.currentMentor || null;
export const selectMentorsStatus = (state) => state.mentors?.status || 'idle';
