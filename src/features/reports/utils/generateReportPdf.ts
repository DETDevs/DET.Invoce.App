import { toPng } from "html-to-image";
import { logError } from "@/shared/utils/logError";
import { jsPDF } from "jspdf";
import toast from "react-hot-toast";

const REPORT_LABELS: Record<string, string> = {
    sales: "Ventas",
    products: "Productos",
    cash: "Flujo_de_Caja",
    orders: "Ordenes",
    cashClose: "Cierre_de_Caja",
};

export const generateReportPdf = async (
    elementId: string,
    reportType: string,
) => {
    const element = document.getElementById(elementId);
    if (!element) {
        toast.error("No se encontró el contenido del reporte.");
        return;
    }

    const toastId = toast.loading("Generando PDF...");

    try {
        const dataUrl = await toPng(element, {
            quality: 1,
            pixelRatio: 3,
            backgroundColor: "#FDFBF7",
        });

        const img = new Image();
        img.src = dataUrl;
        await new Promise<void>((resolve, reject) => {
            img.onload = () => resolve();
            img.onerror = reject;
        });

        const imgWidth = img.naturalWidth;
        const imgHeight = img.naturalHeight;

        const pdf = new jsPDF("landscape", "mm", "a4");
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        const margin = 10;
        const usableWidth = pageWidth - margin * 2;
        const usableHeight = pageHeight - margin * 2;

        const scale = usableWidth / imgWidth;
        const totalMmHeight = imgHeight * scale;

        if (totalMmHeight <= usableHeight) {
            pdf.addImage(dataUrl, "PNG", margin, margin, usableWidth, totalMmHeight);
        } else {
            let yPixelOffset = 0;
            let pageIndex = 0;
            const slicePixelHeight = usableHeight / scale;

            while (yPixelOffset < imgHeight) {
                if (pageIndex > 0) pdf.addPage();

                const currentSlice = Math.min(slicePixelHeight, imgHeight - yPixelOffset);
                const sliceCanvas = document.createElement("canvas");
                sliceCanvas.width = imgWidth;
                sliceCanvas.height = currentSlice;
                const ctx = sliceCanvas.getContext("2d")!;
                ctx.drawImage(
                    img,
                    0, yPixelOffset, imgWidth, currentSlice,
                    0, 0, imgWidth, currentSlice,
                );

                const sliceData = sliceCanvas.toDataURL("image/png");
                const sliceMmHeight = currentSlice * scale;
                pdf.addImage(sliceData, "PNG", margin, margin, usableWidth, sliceMmHeight);

                yPixelOffset += currentSlice;
                pageIndex++;
            }
        }

        const label = REPORT_LABELS[reportType] ?? reportType;
        const dateStr = new Date().toISOString().split("T")[0];
        pdf.save(`Reporte_${label}_${dateStr}.pdf`);

        toast.success("PDF descargado correctamente", { id: toastId });
    } catch (error) {
        logError("[Reports] Error generating PDF", error, { action: "generatePdf" });
        toast.error("Error al generar el PDF", { id: toastId });
    }
};
