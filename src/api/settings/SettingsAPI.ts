import api from '../api';

export interface TSettingsSave {
    currencyId?: number;
    currencyCode: string;
    currencyName?: string;
    symbol?: string;
    isBase?: boolean;
    rate: number;
    rateDate?: string;
}

async function saveCurrent(data: TSettingsSave) {
    return api.post<any>('/Settings/SaveCurrent', data);
}

async function getCurrent(currencyCode?: string) {
    const query = currencyCode ? `?currencyCode=${currencyCode}` : '';
    return api.get<any>(`/Settings/GetCurrent${query}`);
}

const settingsApi = {
    saveCurrent,
    getCurrent,
};

export default settingsApi;
