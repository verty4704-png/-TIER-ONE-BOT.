const fs = require('fs');
const path = require('path');

class ConfigManager {
    static load() {
        const configPath = path.join(__dirname, '../../config.js');
        try {
            const config = require(configPath);
            this.validate(config);
            return config;
        } catch (error) {
            console.error('[ConfigManager] Failed to load config:', error.message);
            process.exit(1);
        }
    }

    static validate(config) {
        if (!config.server) throw new Error('Missing server configuration');
        if (!config.server.host || !config.server.port) throw new Error('Server host and port are required');
    }
}

module.exports = ConfigManager;
