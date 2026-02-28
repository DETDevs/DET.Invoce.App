import type { CashCloseReportData } from "@/features/reports/types";

const fmtCompact = (n: number) =>
  `C$ ${n.toLocaleString("es-NI", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const fmtDateTime = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleString("es-NI", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

interface PrintableReceiptProps {
  data: CashCloseReportData;
  businessName: string;
  dateStr: string;
  timeStr: string;
}

export const PrintableReceipt = ({
  data,
  businessName,
  dateStr,
  timeStr,
}: PrintableReceiptProps) => (
  <div
    id="cash-close-print-area"
    className="hidden"
    style={{ fontFamily: "system-ui, sans-serif" }}
  >
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        borderBottom: "2px solid #593D31",
        paddingBottom: "12px",
        marginBottom: "16px",
      }}
    >
      <div>
        <h1
          style={{
            fontSize: "20px",
            fontWeight: 800,
            color: "#593D31",
            margin: 0,
          }}
        >
          CIERRE DE CAJA
        </h1>
        <p style={{ fontSize: "12px", color: "#666", margin: "4px 0 0 0" }}>
          Reporte de operaciones del período
        </p>
      </div>
      <div style={{ textAlign: "right" }}>
        <p
          style={{
            fontSize: "14px",
            fontWeight: 700,
            color: "#2D2D2D",
            margin: 0,
          }}
        >
          {businessName}
        </p>
        <p style={{ fontSize: "11px", color: "#666", margin: "2px 0 0 0" }}>
          {dateStr}
        </p>
        <p style={{ fontSize: "11px", color: "#666", margin: "2px 0 0 0" }}>
          Generado a las {timeStr}
        </p>
      </div>
    </div>

    <h2
      style={{
        fontSize: "13px",
        fontWeight: 700,
        textTransform: "uppercase",
        color: "#593D31",
        letterSpacing: "0.5px",
        margin: "0 0 8px 0",
      }}
    >
      Resumen Financiero
    </h2>
    <table
      style={{
        width: "100%",
        borderCollapse: "collapse",
        marginBottom: "20px",
      }}
    >
      <tbody>
        <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
          <td style={{ padding: "6px 0", color: "#666", fontSize: "12px" }}>
            Fondo Inicial
          </td>
          <td
            style={{
              padding: "6px 0",
              textAlign: "right",
              fontWeight: 600,
              fontSize: "12px",
            }}
          >
            {fmtCompact(data.initialAmount)}
          </td>
        </tr>
        <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
          <td style={{ padding: "6px 0", color: "#666", fontSize: "12px" }}>
            Ventas ({data.invoiceCount} facturas)
          </td>
          <td
            style={{
              padding: "6px 0",
              textAlign: "right",
              fontWeight: 600,
              color: "#16a34a",
              fontSize: "12px",
            }}
          >
            + {fmtCompact(data.salesTotal)}
          </td>
        </tr>
        <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
          <td style={{ padding: "6px 0", color: "#666", fontSize: "12px" }}>
            Otros Ingresos
          </td>
          <td
            style={{
              padding: "6px 0",
              textAlign: "right",
              fontWeight: 600,
              color: "#16a34a",
              fontSize: "12px",
            }}
          >
            + {fmtCompact(data.cashInTotal)}
          </td>
        </tr>
        <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
          <td style={{ padding: "6px 0", color: "#666", fontSize: "12px" }}>
            Egresos
          </td>
          <td
            style={{
              padding: "6px 0",
              textAlign: "right",
              fontWeight: 600,
              color: "#dc2626",
              fontSize: "12px",
            }}
          >
            - {fmtCompact(data.cashOutTotal)}
          </td>
        </tr>
        <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
          <td style={{ padding: "6px 0", color: "#666", fontSize: "12px" }}>
            Devoluciones ({data.returnsCount})
          </td>
          <td
            style={{
              padding: "6px 0",
              textAlign: "right",
              fontWeight: 600,
              color: "#d97706",
              fontSize: "12px",
            }}
          >
            - {fmtCompact(data.returnsTotal)}
          </td>
        </tr>
        <tr style={{ borderTop: "2px solid #593D31" }}>
          <td
            style={{
              padding: "10px 0",
              fontWeight: 800,
              fontSize: "14px",
              color: "#593D31",
            }}
          >
            TOTAL ESPERADO EN CAJA
          </td>
          <td
            style={{
              padding: "10px 0",
              textAlign: "right",
              fontWeight: 800,
              fontSize: "14px",
              color: "#593D31",
            }}
          >
            {fmtCompact(data.expectedTotal)}
          </td>
        </tr>
      </tbody>
    </table>

    {data.paymentBreakdown.length > 0 && (
      <>
        <h2
          style={{
            fontSize: "13px",
            fontWeight: 700,
            textTransform: "uppercase",
            color: "#593D31",
            letterSpacing: "0.5px",
            margin: "0 0 8px 0",
          }}
        >
          Métodos de Pago
        </h2>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginBottom: "20px",
          }}
        >
          <thead>
            <tr style={{ borderBottom: "1px solid #d1d5db" }}>
              <th
                style={{
                  padding: "4px 0",
                  textAlign: "left",
                  fontSize: "10px",
                  fontWeight: 600,
                  color: "#9ca3af",
                  textTransform: "uppercase",
                }}
              >
                Método
              </th>
              <th
                style={{
                  padding: "4px 0",
                  textAlign: "center",
                  fontSize: "10px",
                  fontWeight: 600,
                  color: "#9ca3af",
                  textTransform: "uppercase",
                }}
              >
                Operaciones
              </th>
              <th
                style={{
                  padding: "4px 0",
                  textAlign: "right",
                  fontSize: "10px",
                  fontWeight: 600,
                  color: "#9ca3af",
                  textTransform: "uppercase",
                }}
              >
                Monto
              </th>
            </tr>
          </thead>
          <tbody>
            {data.paymentBreakdown.map((p) => (
              <tr key={p.method} style={{ borderBottom: "1px solid #e5e7eb" }}>
                <td
                  style={{
                    padding: "5px 0",
                    fontSize: "12px",
                    fontWeight: 500,
                  }}
                >
                  {p.method}
                </td>
                <td
                  style={{
                    padding: "5px 0",
                    fontSize: "12px",
                    textAlign: "center",
                    color: "#666",
                  }}
                >
                  {p.count}
                </td>
                <td
                  style={{
                    padding: "5px 0",
                    fontSize: "12px",
                    textAlign: "right",
                    fontWeight: 600,
                  }}
                >
                  {fmtCompact(p.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </>
    )}

    {data.movementLines.length > 0 && (
      <>
        <h2
          style={{
            fontSize: "13px",
            fontWeight: 700,
            textTransform: "uppercase",
            color: "#593D31",
            letterSpacing: "0.5px",
            margin: "0 0 8px 0",
          }}
        >
          Detalle de Movimientos ({data.movementLines.length})
        </h2>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginBottom: "20px",
          }}
        >
          <thead>
            <tr style={{ borderBottom: "1px solid #d1d5db" }}>
              <th
                style={{
                  padding: "4px 0",
                  textAlign: "left",
                  fontSize: "10px",
                  fontWeight: 600,
                  color: "#9ca3af",
                  textTransform: "uppercase",
                  width: "80px",
                }}
              >
                Fecha/Hora
              </th>
              <th
                style={{
                  padding: "4px 0",
                  textAlign: "left",
                  fontSize: "10px",
                  fontWeight: 600,
                  color: "#9ca3af",
                  textTransform: "uppercase",
                }}
              >
                Descripción
              </th>
              <th
                style={{
                  padding: "4px 0",
                  textAlign: "right",
                  fontSize: "10px",
                  fontWeight: 600,
                  color: "#9ca3af",
                  textTransform: "uppercase",
                  width: "120px",
                }}
              >
                Monto
              </th>
            </tr>
          </thead>
          <tbody>
            {data.movementLines.map((line, idx) => {
              const isPositive =
                line.type === "venta" || line.type === "ingreso";
              return (
                <tr key={idx} style={{ borderBottom: "1px solid #f3f4f6" }}>
                  <td
                    style={{
                      padding: "4px 0",
                      fontSize: "11px",
                      color: "#666",
                      fontFamily: "monospace",
                    }}
                  >
                    {fmtDateTime(line.time)}
                  </td>
                  <td
                    style={{
                      padding: "4px 0",
                      fontSize: "11px",
                      color: "#444",
                    }}
                  >
                    {line.description}
                  </td>
                  <td
                    style={{
                      padding: "4px 0",
                      fontSize: "11px",
                      textAlign: "right",
                      fontWeight: 600,
                      color: isPositive ? "#16a34a" : "#dc2626",
                    }}
                  >
                    {isPositive ? "+" : "-"}
                    {fmtCompact(line.amount)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </>
    )}

    <div
      style={{
        borderTop: "1px solid #d1d5db",
        paddingTop: "8px",
        display: "flex",
        justifyContent: "space-between",
        fontSize: "10px",
        color: "#9ca3af",
      }}
    >
      <span>{businessName} — Cierre de Caja</span>
      <span>
        {dateStr}, {timeStr}
      </span>
    </div>
  </div>
);
