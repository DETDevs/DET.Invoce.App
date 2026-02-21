import api from '../api';

const PRINTER_NAME = import.meta.env.VITE_PRINTER_NAME || '';

class ThermalTicketAPI {
    private readonly baseEndpoint = '/ThermalTicket';

    async getThermalTicket(invoiceId: number): Promise<string> {
        const response = await api.getText(
            `${this.baseEndpoint}/GetThermalTicket?invoiceId=${invoiceId}`
        );
        return response;
    }

    async openCashDrawer(printerName?: string): Promise<string> {
        const name = printerName || PRINTER_NAME;
        if (!name) {
            console.warn('[ThermalTicketAPI] No printer name configured. Set VITE_PRINTER_NAME in .env');
            return 'No printer name configured';
        }
        const response = await api.post<any>(
            `${this.baseEndpoint}/OpenCashDrawer`,
            { printerName: name }
        );
        return response;
    }
}

export const thermalTicketAPI = new ThermalTicketAPI();
export default thermalTicketAPI;

