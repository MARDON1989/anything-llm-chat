const Config = {
    STORAGE_KEYS: {
        BASE_URL: 'anything_llm_base_url',
        API_KEY: 'anything_llm_api_key',
        LAST_WORKSPACE: 'anything_llm_last_workspace'
    },

    saveSettings(baseUrl, apiKey) {
        localStorage.setItem(this.STORAGE_KEYS.BASE_URL, baseUrl);
        localStorage.setItem(this.STORAGE_KEYS.API_KEY, apiKey);
    },

    getSettings() {
        return {
            baseUrl: localStorage.getItem(this.STORAGE_KEYS.BASE_URL) || 'http://localhost:3001/api/v1',
            apiKey: localStorage.getItem(this.STORAGE_KEYS.API_KEY) || ''
        };
    },

    saveWorkspace(slug) {
        localStorage.setItem(this.STORAGE_KEYS.LAST_WORKSPACE, slug);
    },

    getLastWorkspace() {
        return localStorage.getItem(this.STORAGE_KEYS.LAST_WORKSPACE);
    }
};
