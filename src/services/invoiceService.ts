import invoiceApi from '@/api/invoice/InvoiceAPI';
import thermalTicketAPI from '@/api/thermal-ticket/ThermalTicketAPI';
import { printThermalTicket } from '@/services/printService';
import type { TSaveFromAccount } from '@/api/invoice/types';

export async function handleInvoiceFlow(data: TSaveFromAccount): Promise<number> {
    await invoiceApi.saveFromAccount(data);

    const allInvoices = await invoiceApi.getAll();
    const ourInvoice = allInvoices.find(
        (inv: any) => inv.orderAccountId === data.orderAccountId
    );

    if (!ourInvoice?.invoiceId) {
        throw new Error(`No se encontró el invoiceId para orderAccountId: ${data.orderAccountId}`);
    }

    const invoiceId: number = ourInvoice.invoiceId;

    const ticketText = await thermalTicketAPI.getThermalTicket(invoiceId);

    await printThermalTicket(ticketText);

    try {
        await thermalTicketAPI.openCashDrawer();
    } catch {
    }

    return invoiceId;
}
