import invoiceApi from '@/api/invoice/InvoiceAPI';
import thermalTicketAPI from '@/api/thermal-ticket/ThermalTicketAPI';
import { printThermalTicket } from '@/services/printService';
import type { TSaveFromAccount } from '@/api/invoice/types';

const LOG_TAG = '[🧾 InvoiceService]';

export async function handleInvoiceFlow(data: TSaveFromAccount): Promise<number> {
    console.log(`${LOG_TAG} ========================================`);
    console.log(`${LOG_TAG} Iniciando flujo de facturación...`);
    console.log(`${LOG_TAG} OrderAccountId: ${data.orderAccountId}, Método: ${data.paymentmethod}`);

    console.log(`${LOG_TAG} ⏳ Paso 1/5: Facturando cuenta en el servidor...`);
    const invoiceNumber = await invoiceApi.saveFromAccount(data);
    console.log(`${LOG_TAG} ✅ Paso 1/5: Factura creada. Número: ${invoiceNumber}`);

    console.log(`${LOG_TAG} ⏳ Paso 2/5: Buscando invoiceId numérico...`);
    const allInvoices = await invoiceApi.getAll();
    const ourInvoice = allInvoices.find(
        (inv: any) => inv.orderAccountId === data.orderAccountId
    );

    if (!ourInvoice?.invoiceId) {
        throw new Error(`No se encontró el invoiceId para orderAccountId: ${data.orderAccountId}`);
    }

    const invoiceId: number = ourInvoice.invoiceId;
    console.log(`${LOG_TAG} ✅ Paso 2/5: InvoiceId encontrado: ${invoiceId}`);

    console.log(`${LOG_TAG} ⏳ Paso 3/5: Obteniendo ticket térmico...`);
    const ticketText = await thermalTicketAPI.getThermalTicket(invoiceId);
    console.log(`${LOG_TAG} ✅ Paso 3/5: Ticket obtenido (${ticketText.length} caracteres)`);

    console.log(`${LOG_TAG} ⏳ Paso 4/5: Imprimiendo ticket...`);
    const printed = await printThermalTicket(ticketText);
    console.log(`${LOG_TAG} ${printed ? '✅' : '⚠️'} Paso 4/5: Impresión ${printed ? 'completada' : 'cancelada/fallida'}`);

    console.log(`${LOG_TAG} ⏳ Paso 5/5: Abriendo gaveta de efectivo...`);
    try {
        await thermalTicketAPI.openCashDrawer();
        console.log(`${LOG_TAG} ✅ Paso 5/5: Gaveta abierta`);
    } catch (drawerError) {
        console.warn(`${LOG_TAG} ⚠️ Paso 5/5: No se pudo abrir la gaveta:`, drawerError);
    }

    console.log(`${LOG_TAG} ✅ Flujo de facturación completado`);
    console.log(`${LOG_TAG} ========================================`);

    return invoiceId;
}

