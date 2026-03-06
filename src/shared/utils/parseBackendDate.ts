/**
 * The backend sends dates in UTC but WITHOUT a timezone indicator
 * e.g. "03/05/2026 15:14:41" or "2026-03-05T15:14:41"
 *
 * JavaScript's new Date() interprets these as LOCAL time, which causes
 * times to display wrong (off by the timezone offset, e.g. -6h for Nicaragua).
 *
 * This utility appends 'Z' (UTC marker) so JS parses them correctly.
 */
export function parseBackendDate(dateStr: string | null | undefined): Date {
    if (!dateStr) return new Date();
    // Already has timezone info - parse as-is
    if (dateStr.endsWith('Z') || dateStr.includes('+') || /T.*[+-]\d{2}:?\d{2}$/.test(dateStr)) {
        return new Date(dateStr);
    }
    // Append 'Z' to treat as UTC
    const withZ = new Date(dateStr + 'Z');
    return isNaN(withZ.getTime()) ? new Date(dateStr) : withZ;
}
