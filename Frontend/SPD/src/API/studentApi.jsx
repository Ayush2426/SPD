// frontend/src/api/studentApi.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api'; // Ensure this matches your backend port

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const getStudents = () => api.get('/students');
export const getStudentById = (id) => api.get(`/students/${id}`);
export const createStudent = (studentData) => api.post('/students', studentData);
export const updateStudent = (id, studentData) => api.put(`/students/${id}`, studentData);
export const deleteStudent = (id) => api.delete(`/students/${id}`);
export const getStudentContestHistory = (id, days) => api.get(`/students/${id}/contest-history`, { params: { days } });
export const getStudentProblemSolvingData = (id, days) => api.get(`/students/${id}/problem-solving-data`, { params: { days } });
export const updateCronSchedule = (schedule) => api.put('/students/cron/schedule', { schedule });

export default api;
