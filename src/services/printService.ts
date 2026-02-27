export async function printThermalTicket(ticketText: string): Promise<boolean> {
    return new Promise((resolve) => {
        try {
            const existingFrame = document.getElementById('thermal-print-frame');
            if (existingFrame) existingFrame.remove();

            const iframe = document.createElement('iframe');
            iframe.id = 'thermal-print-frame';
            iframe.style.position = 'fixed';
            iframe.style.top = '-10000px';
            iframe.style.left = '-10000px';
            iframe.style.width = '0';
            iframe.style.height = '0';
            iframe.style.border = 'none';
            document.body.appendChild(iframe);

            const doc = iframe.contentDocument || iframe.contentWindow?.document;
            if (!doc) {
                iframe.remove();
                resolve(false);
                return;
            }

            const htmlContent = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Ticket</title>
    <style>
        @page {
            size: 80mm auto;
            margin: 0;
        }
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Courier New', 'Consolas', monospace;
            font-size: 12px;
            line-height: 1.4;
            width: 80mm;
            padding: 2mm;
            white-space: pre;
            word-wrap: break-word;
        }
        @media print {
            body {
                width: 80mm;
            }
        }
    </style>
</head>
<body>${ticketText.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</body>
</html>`;

            doc.open();
            doc.write(htmlContent);
            doc.close();

            iframe.onload = () => {
                try {
                    iframe.contentWindow?.focus();
                    iframe.contentWindow?.print();
                } catch (_) {
                }

                setTimeout(() => {
                    iframe.remove();
                    resolve(true);
                }, 1000);
            };
        } catch {
            resolve(false);
        }
    });
}
