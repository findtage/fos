/**
 * Configuration manager for the client-side application
 * Loads configuration from config.json and provides easy access to config values
 */

class ConfigManager {
    constructor() {
        this.config = null;
        this.loaded = false;
    }

    /**
     * Load configuration from config.json
     * @returns {Promise<Object>} The loaded configuration
     */
    async load() {
        if (this.loaded) {
            return this.config;
        }

        try {
            const response = await fetch('./config.json');
            if (!response.ok) {
                throw new Error(`Failed to load config: ${response.status}`);
            }
            this.config = await response.json();
            this.loaded = true;
            console.log('✅ Configuration loaded successfully');
            return this.config;
        } catch (error) {
            console.error('❌ Failed to load configuration:', error);
            // Fallback to default configuration
            this.config = this.getDefaultConfig();
            this.loaded = true;
            return this.config;
        }
    }

    /**
     * Get a configuration value by path (dot notation)
     * @param {string} path - The configuration path (e.g., 'api.baseUrl')
     * @param {*} defaultValue - Default value if path doesn't exist
     * @returns {*} The configuration value
     */
    get(path, defaultValue = null) {
        if (!this.loaded) {
            console.warn('Configuration not loaded yet. Use await config.load() first.');
            return defaultValue;
        }

        const keys = path.split('.');
        let current = this.config;

        for (const key of keys) {
            if (current && typeof current === 'object' && key in current) {
                current = current[key];
            } else {
                return defaultValue;
            }
        }

        return current;
    }

    /**
     * Get the full API URL for an endpoint
     * @param {string} endpoint - The endpoint path (e.g., 'auth.login')
     * @returns {string} Full URL
     */
    getApiUrl(endpoint) {
        const baseUrl = this.get('api.baseUrl');
        const endpointPath = this.get(`api.endpoints.${endpoint}`);
        
        if (!baseUrl || !endpointPath) {
            console.warn(`API configuration missing for: ${endpoint}`);
            return null;
        }

        return baseUrl + endpointPath;
    }

    /**
     * Get WebSocket URL
     * @param {boolean} useAlternative - Whether to use alternative URL
     * @returns {string} WebSocket URL
     */
    getWebSocketUrl(useAlternative = false) {
        const key = useAlternative ? 'websocket.alternativeUrl' : 'websocket.url';
        return this.get(key);
    }

    /**
     * Get game canvas dimensions
     * @returns {Object} {width, height}
     */
    getCanvasDimensions() {
        return {
            width: this.get('game.canvas.width', 800),
            height: this.get('game.canvas.height', 520)
        };
    }

    /**
     * Get UI configuration
     * @param {string} section - UI section (e.g., 'fonts.default')
     * @returns {*} UI configuration
     */
    getUI(section) {
        return this.get(`game.ui.${section}`);
    }

    /**
     * Get player default position for a scene
     * @param {string} sceneName - The scene name
     * @returns {Object} {x, y} position
     */
    getPlayerDefaultPosition(sceneName) {
        const scenePos = this.get(`game.scenes.defaultPlayerPositions.${sceneName}`);
        if (scenePos) {
            return scenePos;
        }
        // Fallback to global default
        return this.get('game.player.defaultPositions', { x: 400, y: 400 });
    }

    /**
     * Get inventory configuration
     * @param {string} section - Inventory section
     * @returns {*} Inventory configuration
     */
    getInventory(section) {
        return this.get(`game.inventory.${section}`);
    }

    /**
     * Get menu button configuration
     * @returns {Array} Button configurations
     */
    getMenuButtons() {
        return this.get('game.menu.buttons', []);
    }

    /**
     * Get asset path
     * @param {string} type - Asset type (ui, backgrounds, sounds, avatars)
     * @returns {string} Asset path
     */
    getAssetPath(type) {
        return this.get(`assets.paths.${type}`, '../assets/');
    }

    /**
     * Get connection configuration
     * @param {string} setting - Connection setting
     * @returns {*} Connection configuration
     */
    getConnection(setting) {
        return this.get(`connection.${setting}`);
    }

    /**
     * Get page URL
     * @param {string} page - The page name (e.g., 'login', 'signup', 'game')
     * @returns {string} Page URL
     */
    getPageUrl(page) {
        return this.get(`pages.${page}`);
    }

    /**
     * Fallback default configuration
     * @returns {Object} Default configuration
     */
    getDefaultConfig() {
        return {
            api: {
                baseUrl: "http://localhost:3000",
                endpoints: {
                    auth: {
                        login: "/api/auth/login",
                        logout: "/api/auth/logout",
                        me: "/api/user/me"
                    },
                    user: {
                        update: "/api/user/update",
                        ping: "/api/ping"
                    }
                }
            },
            websocket: {
                url: "ws://localhost:3000"
            },
            game: {
                canvas: {
                    width: 800,
                    height: 520
                },
                ui: {
                    depths: {
                        base: 16535
                    },
                    fonts: {
                        default: {
                            family: "Arial",
                            size: "14px"
                        }
                    }
                },
                player: {
                    defaultPositions: {
                        x: 400,
                        y: 400
                    }
                }
            }
        };
    }
}

// Create a singleton instance
const config = new ConfigManager();

export default config;
