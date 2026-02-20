import api from '../api';

class ThermalTicketAPI {
    private readonly baseEndpoint = '/ThermalTicket';

    async getThermalTicket(invoiceId: number): Promise<string> {
        const response = await api.getText(
            `${this.baseEndpoint}/GetThermalTicket?invoiceId=${invoiceId}`
        );
        return response;
    }
}

export const thermalTicketAPI = new ThermalTicketAPI();
export default thermalTicketAPI;
