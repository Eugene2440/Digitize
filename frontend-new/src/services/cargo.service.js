import api from './api';

export const cargoService = {
    create: async (cargoData) => {
        const response = await api.post('/cargo', cargoData);
        return response.data;
    },

    getAll: async (filters = {}) => {
        const params = new URLSearchParams(filters);
        const response = await api.get(`/cargo?${params}`);
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/cargo/${id}`);
        return response.data;
    },

    update: async (id, cargoData) => {
        const response = await api.put(`/cargo/${id}`, cargoData);
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/cargo/${id}`);
        return response.data;
    }
};
