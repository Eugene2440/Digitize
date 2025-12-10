import api from './api';

export const visitorService = {
    create: async (visitorData) => {
        const response = await api.post('/visitors', visitorData);
        return response.data;
    },

    getAll: async (filters = {}) => {
        const params = new URLSearchParams(filters);
        const response = await api.get(`/visitors?${params}`);
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/visitors/${id}`);
        return response.data;
    },

    signIn: async (id, badgeNumber) => {
        const response = await api.post(`/visitors/${id}/signin`, { badge_number: badgeNumber });
        return response.data;
    },

    signOut: async (id) => {
        const response = await api.post(`/visitors/${id}/signout`);
        return response.data;
    },

    update: async (id, visitorData) => {
        const response = await api.put(`/visitors/${id}`, visitorData);
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/visitors/${id}`);
        return response.data;
    }
};
