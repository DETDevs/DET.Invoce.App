import invoiceApi from '@/api/invoice/InvoiceAPI';
import thermalTicketAPI from '@/api/thermal-ticket/ThermalTicketAPI';
import { printThermalTicket } from '@/services/printService';
import type { TSaveFromAccount } from '@/api/invoice/types';

const LOG_TAG = '[🧾 InvoiceService]';

export async function handleInvoiceFlow(data: TSaveFromAccount): Promise<number> {
    console.log(`${LOG_TAG} ========================================`);
    console.log(`${LOG_TAG} Iniciando flujo de facturación...`);
    console.log(`${LOG_TAG} OrderAccountId: ${data.orderAccountId}, Método: ${data.paymentmethod}`);

    console.log(`${LOG_TAG} ⏳ Paso 1/3: Facturando cuenta en el servidor...`);
    const invoiceId = await invoiceApi.saveFromAccount(data);
    console.log(`${LOG_TAG} ✅ Paso 1/3: Factura creada. ID: ${invoiceId}`);

    console.log(`${LOG_TAG} ⏳ Paso 2/3: Obteniendo ticket térmico...`);
    const ticketText = await thermalTicketAPI.getThermalTicket(invoiceId);
    console.log(`${LOG_TAG} ✅ Paso 2/3: Ticket obtenido (${ticketText.length} caracteres)`);

    console.log(`${LOG_TAG} ⏳ Paso 3/3: Imprimiendo ticket...`);
    const printed = await printThermalTicket(ticketText);
    console.log(`${LOG_TAG} ${printed ? '✅' : '⚠️'} Paso 3/3: Impresión ${printed ? 'completada' : 'cancelada/fallida'}`);

    console.log(`${LOG_TAG} ✅ Flujo de facturación completado`);
    console.log(`${LOG_TAG} ========================================`);

    return invoiceId;
}
