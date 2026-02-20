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

async function apiCall<T>(url: string, options: RequestInit): Promise<T> {
    if (!url.startsWith('http')) {
        url = `${environments.BASE_API_URI}${url.startsWith('/') ? url : `/${url}`
            }`;
    }

    const userLanguage = getDeviceLanguage();

    const response = await fetch(url, {
        ...options,
        headers: {
            ...options.headers,
            'user-language': userLanguage,
            'Accept': 'application/json',
        },
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('[apiCall] Error', url, response.status, errorText);
        throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    return result;
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

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'user-language': userLanguage,
            'Accept': 'text/plain',
        },
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('[apiCall] Error', url, response.status, errorText);
        throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    return response.text();
}

async function getWithBody<T>(url: string, body: any): Promise<T> {
    return apiCall(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
}

const api = {
    post,
    get,
    getWithBody,
    getText,
    put,
    delete: del,
};

export default api;
