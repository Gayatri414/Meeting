import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const stored = localStorage.getItem('meetai_user');
  if (stored) {
    try {
      const user = JSON.parse(stored);
      if (user?.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
      }
    } catch {}
  }
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && !window.location.pathname.includes('/login')) {
      localStorage.removeItem('meetai_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ─── Auth ────────────────────────────────────────────────────────────────────
export const signupUser = async (email, password) => {
  const res = await api.post('/auth/signup', { email, password });
  return res.data;
};

export const loginUser = async (email, password) => {
  const res = await api.post('/auth/login', { email, password });
  return res.data;
};

export const getProfile = async () => {
  const res = await api.get('/auth/profile');
  return res.data;
};

export const updateProfile = async (data) => {
  const res = await api.put('/auth/profile', data);
  return res.data;
};

// ─── Meetings ────────────────────────────────────────────────────────────────
export const analyzeMeeting = async (transcript, extra = {}) => {
  const res = await api.post('/meeting/analyze', { transcript, ...extra });
  return res.data;
};

export const getAllMeetings = async (params = {}) => {
  const res = await api.get('/meeting/all', { params });
  // Support both old array format and new paginated format
  if (Array.isArray(res.data)) return res.data;
  return res.data.meetings || [];
};

export const getMeetingById = async (id) => {
  const res = await api.get(`/meeting/${id}`);
  return res.data;
};

export const deleteMeeting = async (id) => {
  const res = await api.delete(`/meeting/${id}`);
  return res.data;
};

export const togglePinMeeting = async (id) => {
  const res = await api.patch(`/meeting/${id}/pin`);
  return res.data;
};

export const updateTaskStatus = async (meetingId, taskIndex, data) => {
  const res = await api.patch(`/meeting/${meetingId}/tasks/${taskIndex}`, data);
  return res.data;
};

export const transcribeAudioFile = async (file) => {
  const formData = new FormData();
  formData.append('audio', file);
  
  // Use the 'api' instance which already has the correct BASE_URL and auth interceptor
  const res = await api.post('/meeting/transcribe-audio', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
};

export const exportMeetingPDF = async (id) => {
  const res = await api.get(`/meeting/${id}/export`);
  return res.data;
};

export const syncMeetingTasks = async (meetingId, target, taskIndices, credentials) => {
  const res = await api.post(`/meeting/${meetingId}/sync`, { target, taskIndices, credentials });
  return res.data;
};

// ─── Chat ────────────────────────────────────────────────────────────────────
export const sendChatMessage = async (message, history, meetingId) => {
  const res = await api.post('/chat', { message, history, meetingId });
  return res.data;
};

// ─── Screenshot ──────────────────────────────────────────────────────────────
export const analyzeScreenshot = async (image, context = '') => {
  const res = await api.post('/screenshot/analyze', { image, context });
  return res.data;
};
export const exportToNotion = async (meetingId, notionToken, databaseId) => {
  const res = await api.post(`/notion/export/${meetingId}`, { notionToken, databaseId });
  return res.data;
};

// ─── Scheduled Meetings ───────────────────────────────────────────────────────
export const scheduleMeeting = async (data) => {
  const res = await api.post('/scheduled', data);
  return res.data;
};

export const getScheduledMeetings = async (params = {}) => {
  const res = await api.get('/scheduled', { params });
  return res.data;
};

export const updateScheduledStatus = async (id, status) => {
  const res = await api.patch(`/scheduled/${id}/status`, { status });
  return res.data;
};

export const deleteScheduledMeeting = async (id) => {
  const res = await api.delete(`/scheduled/${id}`);
  return res.data;
};

// ─── Topics ───────────────────────────────────────────────────────────────────
export const getTopics = async () => {
  const res = await api.get('/scheduled/topics');
  return res.data;
};

export const resolveTopic = async (id) => {
  const res = await api.patch(`/scheduled/topics/${id}/resolve`);
  return res.data;
};

export default api;
