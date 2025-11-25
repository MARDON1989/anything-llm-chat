class AnythingLLMAPI {
    constructor() {
        this.baseUrl = '';
        this.apiKey = '';
    }

    setCredentials(baseUrl, apiKey) {
        // Remove trailing slash if present
        this.baseUrl = baseUrl.replace(/\/$/, '');
        this.apiKey = apiKey;
    }

    async checkConnection() {
        try {
            // Try to fetch workspaces as a connection test
            // The endpoint is typically /workspaces or /v1/workspaces depending on version
            // Based on research, /api/v1/workspaces is common for the API
            const response = await fetch(`${this.baseUrl}/workspaces`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                    'accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return { success: true, workspaces: data.workspaces || [] };
        } catch (error) {
            console.error('Connection failed:', error);
            return { success: false, error: error.message };
        }
    }

    async sendChat(message, workspaceSlug, mode = 'chat') {
        try {
            const response = await fetch(`${this.baseUrl}/workspace/${workspaceSlug}/chat`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                    'accept': 'application/json'
                },
                body: JSON.stringify({
                    message: message,
                    mode: mode
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return { success: true, response: data.textResponse };
        } catch (error) {
            console.error('Chat failed:', error);
            return { success: false, error: error.message };
        }
    }
}

const api = new AnythingLLMAPI();
