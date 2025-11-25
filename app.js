document.addEventListener('DOMContentLoaded', () => {
    // UI Elements
    const baseUrlInput = document.getElementById('baseUrl');
    const apiKeyInput = document.getElementById('apiKey');
    const connectBtn = document.getElementById('connectBtn');
    const connectionStatus = document.getElementById('connectionStatus');
    const workspaceSection = document.getElementById('workspaceSection');
    const workspaceSelect = document.getElementById('workspaceSelect');
    const chatTitle = document.getElementById('chatTitle');
    const messagesContainer = document.getElementById('messagesContainer');
    const messageInput = document.getElementById('messageInput');
    const sendBtn = document.getElementById('sendBtn');

    // State
    let currentWorkspace = null;
    let isProcessing = false;

    // Initialize
    loadSettings();

    // Event Listeners
    connectBtn.addEventListener('click', handleConnect);
    workspaceSelect.addEventListener('change', handleWorkspaceChange);
    sendBtn.addEventListener('click', sendMessage);
    messageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // Auto-resize textarea
    messageInput.addEventListener('input', function () {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
        if (this.value === '') {
            this.style.height = 'auto';
        }
    });

    function loadSettings() {
        const settings = Config.getSettings();
        baseUrlInput.value = settings.baseUrl;
        apiKeyInput.value = settings.apiKey;

        if (settings.apiKey) {
            // Auto-connect if credentials exist
            handleConnect();
        }
    }

    async function handleConnect() {
        const baseUrl = baseUrlInput.value.trim();
        const apiKey = apiKeyInput.value.trim();

        if (!baseUrl || !apiKey) {
            showStatus('Please enter both Base URL and API Key', 'error');
            return;
        }

        // Save settings immediately when user attempts to connect
        Config.saveSettings(baseUrl, apiKey);

        setLoading(true, 'Connecting...');
        api.setCredentials(baseUrl, apiKey);

        const result = await api.checkConnection();

        if (result.success) {
            showStatus('Connected', 'connected');
            populateWorkspaces(result.workspaces);
            workspaceSection.classList.remove('hidden');
        } else {
            showStatus(`Connection failed: ${result.error}`, 'error');
            workspaceSection.classList.add('hidden');
        }
        setLoading(false);
    }

    function populateWorkspaces(workspaces) {
        workspaceSelect.innerHTML = '<option value="" disabled selected>Select a workspace</option>';

        workspaces.forEach(ws => {
            const option = document.createElement('option');
            option.value = ws.slug;
            option.textContent = ws.name;
            workspaceSelect.appendChild(option);
        });

        // Restore last workspace if available
        const lastWorkspace = Config.getLastWorkspace();
        if (lastWorkspace && workspaces.find(w => w.slug === lastWorkspace)) {
            workspaceSelect.value = lastWorkspace;
            handleWorkspaceChange({ target: { value: lastWorkspace } });
        }
    }

    function handleWorkspaceChange(e) {
        const slug = e.target.value;
        currentWorkspace = slug;
        Config.saveWorkspace(slug);

        const workspaceName = workspaceSelect.options[workspaceSelect.selectedIndex].text;
        chatTitle.textContent = workspaceName;

        enableChat(true);

        // Clear welcome message if it's the only thing
        if (messagesContainer.querySelector('.welcome-message')) {
            messagesContainer.innerHTML = '';
        }
    }

    async function sendMessage() {
        const text = messageInput.value.trim();
        if (!text || !currentWorkspace || isProcessing) return;

        // Add user message
        addMessage(text, 'user');
        messageInput.value = '';
        messageInput.style.height = 'auto';

        isProcessing = true;
        sendBtn.disabled = true;

        // Add loading indicator
        const loadingId = addLoadingMessage();

        const result = await api.sendChat(text, currentWorkspace);

        // Remove loading indicator
        removeMessage(loadingId);

        if (result.success) {
            addMessage(result.response, 'bot');
        } else {
            addMessage(`Error: ${result.error}`, 'bot', true);
        }

        isProcessing = false;
        sendBtn.disabled = false;
        messageInput.focus();
    }

    function addMessage(text, role, isError = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}`;

        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';

        if (role === 'bot' && !isError) {
            // Parse Markdown for bot messages
            contentDiv.innerHTML = DOMPurify.sanitize(marked.parse(text));
        } else {
            contentDiv.textContent = text;
        }

        if (isError) {
            contentDiv.style.color = 'var(--danger-color)';
        }

        messageDiv.appendChild(contentDiv);
        messagesContainer.appendChild(messageDiv);
        scrollToBottom();
    }

    function addLoadingMessage() {
        const id = 'loading-' + Date.now();
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message bot';
        messageDiv.id = id;

        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.innerHTML = '<span class="typing-indicator">Thinking...</span>';

        messageDiv.appendChild(contentDiv);
        messagesContainer.appendChild(messageDiv);
        scrollToBottom();
        return id;
    }

    function removeMessage(id) {
        const el = document.getElementById(id);
        if (el) el.remove();
    }

    function scrollToBottom() {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function showStatus(message, type) {
        connectionStatus.textContent = message;
        connectionStatus.className = `status ${type}`;
    }

    function setLoading(isLoading, text) {
        if (isLoading) {
            connectBtn.textContent = text || 'Loading...';
            connectBtn.disabled = true;
        } else {
            connectBtn.textContent = 'Connect';
            connectBtn.disabled = false;
        }
    }

    function enableChat(enabled) {
        messageInput.disabled = !enabled;
        sendBtn.disabled = !enabled;
        if (enabled) {
            messageInput.focus();
        }
    }

    // Mobile Menu Toggle
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const sidebar = document.querySelector('.sidebar');

    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });
    }
});
