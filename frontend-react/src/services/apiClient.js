const BASE_URL = import.meta.env.VITE_API_URL || '';

class ApiClient {
    static async request(endpoint, options = {}) {
        // Remove trailing slash from BASE_URL if present, and ensure endpoint starts with /
        const cleanBaseUrl = BASE_URL.replace(/\/$/, '');
        const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
        const url = `${cleanBaseUrl}${cleanEndpoint}`;

        const token = localStorage.getItem('access_token');
        const defaultOptions = {
            credentials: 'include', // Essential for session cookies
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
                ...options.headers
            }
        };

        const config = { ...defaultOptions, ...options };

        try {
            const response = await fetch(url, config);

            // Handle 401 explicitly if needed, but usually we just let it fail
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
            }

            // Some endpoints might return empty body (e.g. logout)
            const text = await response.text();
            const data = text ? JSON.parse(text) : {};

            return { success: true, data };
        } catch (error) {
            console.error(`[API] Error: ${endpoint}`, error);
            // Return consistent error structure
            return { success: false, error: error.message };
        }
    }

    static get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }

    static post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    static put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    static delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }
}

export default ApiClient;
