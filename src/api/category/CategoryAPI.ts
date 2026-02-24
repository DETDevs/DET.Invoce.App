import api from '../api';
import type { TCategory } from './types';

async function get(categoryCode?: string) {
    const params = categoryCode ? `?CategoryCode=${categoryCode}` : '';
    return api.get<TCategory[]>(`/Category/Get${params}`);
}

async function getAll() {
    return api.get<TCategory[]>('/Category/Get');
}

const categoryApi = {
    get,
    getAll,
};

export default categoryApi;
