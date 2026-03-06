export async function printThermalTicket(ticketText: string): Promise<boolean> {
    try {
        const htmlContent = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Ticket de Impresión</title>
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
            font-size: 13px;
            font-weight: bold;
            line-height: 1.5;
            width: 80mm;
            padding: 3mm;
            white-space: pre;
            word-wrap: break-word;
            -webkit-font-smoothing: none;
            -moz-osx-font-smoothing: unset;
            text-rendering: geometricPrecision;
            color: #000;
            letter-spacing: 0.3px;
        }
        @media print {
            body {
                width: 80mm;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
        }
    </style>
</head>
<body>
${ticketText.replace(/</g, '&lt;').replace(/>/g, '&gt;')}
</body>
</html>`;

        
        const iframe = document.createElement('iframe');
        iframe.style.position = 'fixed';
        iframe.style.right = '0';
        iframe.style.bottom = '0';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = 'none';
        iframe.style.opacity = '0';
        document.body.appendChild(iframe);

        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (!iframeDoc || !iframe.contentWindow) {
            document.body.removeChild(iframe);
            console.warn('[printService] Could not access iframe');
            return false;
        }

        iframeDoc.open();
        iframeDoc.write(htmlContent);
        iframeDoc.close();

        
        await new Promise<void>((resolve) => {
            setTimeout(() => {
                iframe.contentWindow!.print();
                resolve();
            }, 350);
        });

        
        setTimeout(() => {
            if (iframe.parentNode) {
                document.body.removeChild(iframe);
            }
        }, 2000);

        return true;
    } catch {
        return false;
    }
}

