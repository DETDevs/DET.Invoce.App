import api from '../api';

async function get(categoryCode?: string) {
    const params = categoryCode ? `?CategoryCode=${categoryCode}` : '';
    return api.get<any>(`/Category/Get${params}`);
}

const categoryApi = {
    get,
};

export default categoryApi;
