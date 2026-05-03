import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Subjects
export const createSubject = (data) => api.post('/subjects', data);
export const getSubjects = () => api.get('/subjects');
export const getSubject = (id) => api.get(`/subjects/${id}`);

// Syllabus
export const uploadSyllabus = (subjectId, file) => {
  const formData = new FormData();
  formData.append('subject_id', subjectId);
  formData.append('file', file);
  return api.post('/syllabus/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
export const getSyllabus = (subjectId) => api.get(`/syllabus/${subjectId}`);

// Papers
export const uploadPaper = (subjectId, year, file) => {
  const formData = new FormData();
  formData.append('subject_id', subjectId);
  formData.append('year', year);
  formData.append('file', file);
  return api.post('/papers/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const uploadMultiplePapers = (subjectId, files, years) => {
  const formData = new FormData();
  formData.append('subject_id', subjectId);
  formData.append('years', years.join(','));
  files.forEach((file) => {
    formData.append('files', file);
  });
  return api.post('/papers/upload-multiple', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const getPapers = (subjectId) => api.get(`/papers/${subjectId}`);
export const getPaperDetails = (paperId) => api.get(`/papers/${paperId}/details`);

// Analysis
export const getTopicRankings = (subjectId) => api.get(`/analysis/topic-rankings/${subjectId}`);
export const getSyllabusMapping = (subjectId) => api.get(`/analysis/syllabus-mapping/${subjectId}`);
export const getTopicPredictions = (subjectId) => api.get(`/analysis/predictions/${subjectId}`);
export const getAnalyticsSummary = (subjectId) => api.get(`/analysis/summary/${subjectId}`);

// Study Planner
export const generateStudyPlan = (subjectId, data) => api.post('/study-plan/generate', { 
  subject_id: subjectId, 
  duration_days: data.days_available || data.duration_days,
  daily_hours: data.hours_per_day || data.daily_hours
});
export const getStudyPlan = (subjectId) => api.get(`/study-plan/${subjectId}`);
export const getStudyPlans = (subjectId) => api.get(`/study-plan/${subjectId}`);
export const getWeakAreas = (subjectId) => api.get(`/analysis/weak-areas/${subjectId}`);

// Practice Questions
export const getPracticeQuestions = (subjectId) => api.get(`/practice/${subjectId}`);
export const generatePracticeQuestions = (subjectId, data) => api.post('/practice/generate', null, {
  params: {
    subject_id: subjectId,
    topic: data?.topic,
    difficulty: data?.difficulty || 'medium',
    count: data?.count || 10
  }
});
export const getSimilarQuestions = (questionId, count = 3) => 
  api.get(`/practice/similar/${questionId}?count=${count}`);

// Dashboard
export const getDashboardData = (subjectId) => api.get(`/dashboard/${subjectId}`);

export default api;