import api from '../api';

async function get() {
    return api.get<any>('/RestaurantTable/Get');
}

async function saveTableTotal(tables: number) {
    return api.post<any>(`/RestaurantTable/SaveTableTotal?tables=${tables}`, {});
}

const restaurantTableApi = {
    get,
    saveTableTotal,
};

export default restaurantTableApi;
