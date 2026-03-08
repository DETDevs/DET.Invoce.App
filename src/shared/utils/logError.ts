import * as Sentry from "@sentry/react";

/**
 * Add a breadcrumb step — visible in Sentry when an error occurs.
 * Use this to trace the flow of critical business logic.
 *
 * Usage:
 *   logStep("handleSendOrder", "Iniciando", { mode: "llevar", items: 3 });
 *   logStep("handleSendOrder", "Payload enviado", { orderId: 456 });
 *   logStep("handleSendOrder", "API respondió OK");
 */
export function logStep(
    category: string,
    message: string,
    data?: Record<string, unknown>,
) {
    Sentry.addBreadcrumb({
        category,
        message,
        data,
        level: "info",
    });
}

/**
 * Centralized error logger.
 * Logs to console AND sends to Sentry with optional context tags.
 *
 * Usage:
 *   logError("[Order] Error al guardar:", error);
 *   logError("[Invoice] Fallo al facturar:", error, { orderId: 123, action: "invoice" });
 */
export function logError(
    message: string,
    error: unknown,
    context?: Record<string, string | number | boolean>,
) {
    console.error(message, error);

    Sentry.withScope((scope) => {
        scope.setTag("source", message);
        if (context) {
            Object.entries(context).forEach(([key, value]) => {
                scope.setTag(key, String(value));
            });
        }
        if (error instanceof Error) {
            Sentry.captureException(error);
        } else {
            Sentry.captureMessage(`${message} ${String(error)}`, "error");
        }
    });
}
