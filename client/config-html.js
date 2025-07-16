/**
 * Configuration loader for HTML pages (non-module script)
 * This provides access to configuration values in regular script tags
 */

class ConfigLoader {
    constructor() {
        this.config = null;
    }

    async load() {
        if (this.config) return this.config;
        
        try {
            const response = await fetch('./config.json');
            if (!response.ok) {
                throw new Error(`Failed to load config: ${response.status}`);
            }
            this.config = await response.json();
            return this.config;
        } catch (error) {
            console.error('Failed to load configuration:', error);
            // Fallback configuration
            this.config = {
                api: {
                    baseUrl: "http://localhost:3000",
                    endpoints: {
                        auth: {
                            login: "/api/auth/login",
                            logout: "/api/auth/logout"
                        }
                    }
                }
            };
            return this.config;
        }
    }

    getApiUrl(endpoint) {
        if (!this.config) {
            console.warn('Configuration not loaded yet');
            return null;
        }
        
        const baseUrl = this.config.api?.baseUrl;
        const path = endpoint.split('.').reduce((obj, key) => obj?.[key], this.config.api?.endpoints);
        
        return baseUrl && path ? baseUrl + path : null;
    }

    getCheckUsernameUrl(username) {
        const baseUrl = this.getApiUrl('auth.checkUsername');
        return baseUrl ? `${baseUrl}/${username}` : null;
    }

    getPageUrl(page) {
        if (!this.config) {
            console.warn('Configuration not loaded yet');
            return null;
        }
        
        return this.config.pages?.[page] || null;
    }
}

// Global instance for HTML pages
window.configLoader = new ConfigLoader();
