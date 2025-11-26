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
    const fileInput = document.getElementById('fileInput');
    const attachBtn = document.getElementById('attachBtn');
    const filePreview = document.getElementById('filePreview');

    // State
    let currentWorkspace = null;
    let isProcessing = false;
    let selectedFiles = [];

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

    // File upload listeners
    attachBtn.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        selectedFiles = [...selectedFiles, ...files];
        renderFilePreview();
        fileInput.value = ''; // Reset input
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
        if ((!text && selectedFiles.length === 0) || !currentWorkspace || isProcessing) return;

        isProcessing = true;
        sendBtn.disabled = true;
        attachBtn.disabled = true;

        // Upload files first if any
        if (selectedFiles.length > 0) {
            addMessage(`Uploading ${selectedFiles.length} file(s)...`, 'user');

            for (const file of selectedFiles) {
                const result = await api.uploadDocument(file, currentWorkspace);
                if (!result.success) {
                    addMessage(`Failed to upload ${file.name}: ${result.error}`, 'bot', true);
                }
            }

            selectedFiles = [];
            renderFilePreview();
        }

        // Send text message if provided
        if (text) {
            addMessage(text, 'user');
            messageInput.value = '';
            messageInput.style.height = 'auto';

            const loadingId = addLoadingMessage();
            const result = await api.sendChat(text, currentWorkspace);
            removeMessage(loadingId);

            if (result.success) {
                addMessage(result.response, 'bot');
            } else {
                addMessage(`Error: ${result.error}`, 'bot', true);
            }
        }

        isProcessing = false;
        sendBtn.disabled = false;
        attachBtn.disabled = false;
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
        attachBtn.disabled = !enabled;
        if (enabled) {
            messageInput.focus();
        }
    }

    function renderFilePreview() {
        filePreview.innerHTML = '';
        selectedFiles.forEach((file, index) => {
            const chip = document.createElement('div');
            chip.className = 'file-chip';

            const fileName = document.createElement('span');
            fileName.textContent = file.name;

            const removeBtn = document.createElement('button');
            removeBtn.className = 'file-chip-remove';
            removeBtn.innerHTML = '×';
            removeBtn.onclick = () => {
                selectedFiles.splice(index, 1);
                renderFilePreview();
            };

            chip.appendChild(fileName);
            chip.appendChild(removeBtn);
            filePreview.appendChild(chip);
        });
    }

    // Mobile Hamburger Menu Toggle
    const hamburger = document.getElementById('hamburger');
    const sidebar = document.querySelector('.sidebar');

    if (hamburger) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            sidebar.classList.toggle('open');
        });
    }
});
