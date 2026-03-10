import environments from '@/config/environments';

const getDeviceLanguage = (): string => {
    try {
        const locale =
            (typeof navigator !== 'undefined' && navigator.language) || 'es';
        return locale.split('-')[0];
    } catch (e) {
        return 'es';
    }
};

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

async function doRefreshToken(): Promise<string | null> {
    const storedRefreshToken = localStorage.getItem('refreshToken');
    if (!storedRefreshToken) return null;

    try {
        const url = `${environments.BASE_API_URI}/Authentication/RefreshToken?refreshToken=${encodeURIComponent(storedRefreshToken)}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'user-language': getDeviceLanguage(),
            },
        });

        if (!response.ok) return null;

        const data = await response.json();
        if (data.token) {
            localStorage.setItem('authToken', data.token);
        }
        if (data.refreshToken) {
            localStorage.setItem('refreshToken', data.refreshToken);
        }
        return data.token || null;
    } catch {
        return null;
    }
}

async function refreshTokenIfNeeded(): Promise<string | null> {
    if (isRefreshing && refreshPromise) {
        return refreshPromise;
    }

    isRefreshing = true;
    refreshPromise = doRefreshToken().finally(() => {
        isRefreshing = false;
        refreshPromise = null;
    });

    return refreshPromise;
}

function clearAuthAndRedirect() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('auth-storage');
    localStorage.removeItem('cash-box-session');
    if (window.location.pathname !== '/login') {
        window.location.href = '/login';
    }
}

// ── Proactive token refresh ──────────────────────────────────────────
// Refreshes the JWT 5 minutes before it expires to prevent 401 errors
// during long tablet sessions.

function getTokenExpiryMs(token: string): number | null {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp) return payload.exp * 1000;
    } catch { /* malformed token */ }
    return null;
}

let proactiveRefreshTimer: ReturnType<typeof setTimeout> | null = null;

function scheduleProactiveRefresh() {
    if (proactiveRefreshTimer) clearTimeout(proactiveRefreshTimer);

    const token = localStorage.getItem('authToken');
    if (!token) return;

    const expiryMs = getTokenExpiryMs(token);
    if (!expiryMs) return;

    const REFRESH_MARGIN_MS = 5 * 60 * 1000; // 5 minutes before expiry
    const msUntilRefresh = expiryMs - Date.now() - REFRESH_MARGIN_MS;

    if (msUntilRefresh <= 0) {
        // Already close to expiry — refresh now
        refreshTokenIfNeeded().then((newToken) => {
            if (newToken) scheduleProactiveRefresh();
        });
        return;
    }

    proactiveRefreshTimer = setTimeout(async () => {
        const newToken = await refreshTokenIfNeeded();
        if (newToken) {
            scheduleProactiveRefresh(); // Reschedule for the new token
        }
    }, msUntilRefresh);
}

// Start proactive scheduling on load, and re-check on focus/online
if (typeof window !== 'undefined') {
    scheduleProactiveRefresh();
    window.addEventListener('focus', () => scheduleProactiveRefresh());
    window.addEventListener('online', () => scheduleProactiveRefresh());
}

async function apiCall<T>(url: string, options: RequestInit): Promise<T> {
    if (!url.startsWith('http')) {
        url = `${environments.BASE_API_URI}${url.startsWith('/') ? url : `/${url}`}`;
    }

    const userLanguage = getDeviceLanguage();

    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

    let response = await fetch(url, {
        ...options,
        headers: {
            ...options.headers,
            'user-language': userLanguage,
            'Accept': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
    });

    if (response.status === 401) {
        const newToken = await refreshTokenIfNeeded();
        if (newToken) {
            response = await fetch(url, {
                ...options,
                headers: {
                    ...options.headers,
                    'user-language': userLanguage,
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${newToken}`,
                },
            });
        } else {
            clearAuthAndRedirect();
            throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
        }
    }

    if (!response.ok) {
        const errorText = await response.text();
        console.error('[apiCall] Error', url, response.status, errorText);
        throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    if (response.status === 204 || response.headers.get('content-length') === '0') {
        return null as any;
    }

    const text = await response.text();
    if (!text) return null as any;

    return JSON.parse(text);
}

async function post<T>(url: string, body?: any): Promise<T> {
    const hasBody = body !== undefined;

    return apiCall(url, {
        method: 'POST',
        headers: {
            ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
        },
        ...(hasBody ? { body: JSON.stringify(body) } : {}),
    });
}

async function get<T>(url: string): Promise<T> {
    return apiCall(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    });
}

async function put<T>(url: string, body: any): Promise<T> {
    return apiCall(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
}

async function del<T>(url: string): Promise<T> {
    return apiCall(url, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
    });
}

async function getText(url: string): Promise<string> {
    if (!url.startsWith('http')) {
        url = `${environments.BASE_API_URI}${url.startsWith('/') ? url : `/${url}`}`;
    }

    const userLanguage = getDeviceLanguage();

    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

    let response = await fetch(url, {
        method: 'GET',
        headers: {
            'user-language': userLanguage,
            'Accept': 'text/plain',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
    });

    if (response.status === 401) {
        const newToken = await refreshTokenIfNeeded();
        if (newToken) {
            response = await fetch(url, {
                method: 'GET',
                headers: {
                    'user-language': userLanguage,
                    'Accept': 'text/plain',
                    'Authorization': `Bearer ${newToken}`,
                },
            });
        } else {
            clearAuthAndRedirect();
            throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
        }
    }

    if (!response.ok) {
        const errorText = await response.text();
        console.error('[apiCall] Error', url, response.status, errorText);
        throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    return response.text();
}

async function postText(url: string, body?: any): Promise<string> {
    if (!url.startsWith('http')) {
        url = `${environments.BASE_API_URI}${url.startsWith('/') ? url : `/${url}`}`;
    }

    const userLanguage = getDeviceLanguage();
    const hasBody = body !== undefined;

    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

    let response = await fetch(url, {
        method: 'POST',
        headers: {
            'user-language': userLanguage,
            'Accept': 'text/plain',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
        },
        ...(hasBody ? { body: JSON.stringify(body) } : {}),
    });

    if (response.status === 401) {
        const newToken = await refreshTokenIfNeeded();
        if (newToken) {
            response = await fetch(url, {
                method: 'POST',
                headers: {
                    'user-language': userLanguage,
                    'Accept': 'text/plain',
                    'Authorization': `Bearer ${newToken}`,
                    ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
                },
                ...(hasBody ? { body: JSON.stringify(body) } : {}),
            });
        } else {
            clearAuthAndRedirect();
            throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
        }
    }

    if (!response.ok) {
        const errorText = await response.text();
        console.error('[apiCall] Error', url, response.status, errorText);
        throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    return response.text();
}

async function postFormData<T>(url: string, formData: FormData): Promise<T> {
    return apiCall(url, {
        method: 'POST',
        body: formData,
    });
}

const api = {
    post,
    get,
    getText,
    postText,
    postFormData,
    put,
    delete: del,
};

export default api;

