import api from './api';

export const fitnessService = {
    // Members
    getAllMembers: async () => {
        const response = await api.get('/fitness/members');
        return response.data;
    },

    getMemberById: async (id) => {
        const response = await api.get(`/fitness/members/${id}`);
        return response.data;
    },

    createMember: async (data) => {
        const response = await api.post('/fitness/members', data);
        return response.data;
    },

    updateMember: async (id, data) => {
        const response = await api.put(`/fitness/members/${id}`, data);
        return response.data;
    },

    deleteMember: async (id) => {
        const response = await api.delete(`/fitness/members/${id}`);
        return response.data;
    },

    // Attendance
    getAllAttendance: async (params = {}) => {
        const response = await api.get('/fitness/attendance', { params });
        return response.data;
    },

    checkIn: async (data) => {
        const response = await api.post('/fitness/checkin', data);
        return response.data;
    },

    checkOut: async (data) => {
        const response = await api.post('/fitness/checkout', data);
        return response.data;
    },

    deleteAttendance: async (id) => {
        const response = await api.delete(`/fitness/attendance/${id}`);
        return response.data;
    }
};
