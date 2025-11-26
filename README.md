# Anything LLM Chatbot

A modern, responsive web-based chat interface for Anything LLM with document upload support for RAG (Retrieval-Augmented Generation).

![Version](https://img.shields.io/badge/version-1.1-red)
![License](https://img.shields.io/badge/license-MIT-blue)

## Features

- 🎨 **Modern UI**: Sleek dark theme with red accent colors
- 📱 **Mobile Responsive**: Fully optimized for mobile devices with hamburger menu
- 📎 **Document Upload**: Upload documents directly for RAG capabilities
- 💾 **Persistent Settings**: API credentials and workspace selection saved locally
- 🔒 **Secure**: Client-side only, your API key stays in your browser

## Screenshots

### Desktop View
Clean, professional interface for desktop users.

### Mobile View
Optimized touch-friendly interface with collapsible sidebar.

## Prerequisites

- A running instance of [Anything LLM](https://github.com/Mintplex-Labs/anything-llm)
- An API Key from your Anything LLM instance

## Quick Start

### Option 1: Open Locally
Simply open `index.html` in your web browser.

### Option 2: Serve with Python
```bash
python3 -m http.server 8080
```
Then visit `http://localhost:8080`

### Option 3: Deploy to Proxmox
See [deployment.md](docs/deployment.md) for detailed Proxmox LXC deployment instructions.

## Usage

1. **Connect**: Enter your Anything LLM Base URL and API Key
2. **Select Workspace**: Choose from your available workspaces
3. **Chat**: Start asking questions!
4. **Upload Documents**: Click the paperclip icon to upload documents for RAG

## Supported Document Types

- PDF (`.pdf`)
- Text (`.txt`)
- Markdown (`.md`)
- Word Documents (`.doc`, `.docx`)

## Configuration

The application stores the following in browser localStorage:
- Base URL
- API Key (encrypted in browser storage)
- Last selected workspace

## Development

### Project Structure
```
.
├── index.html          # Main HTML file
├── style.css           # Styles and responsive design
├── app.js              # Main application logic
├── api.js              # Anything LLM API integration
├── config.js           # Configuration management
└── logo.png            # Application logo
```

### Tech Stack
- Vanilla JavaScript (no frameworks)
- CSS3 with CSS Variables
- [Marked.js](https://marked.js.org/) for Markdown rendering
- [DOMPurify](https://github.com/cure53/DOMPurify) for XSS protection

## Deployment

See the [Deployment Guide](docs/deployment.md) for various deployment options including:
- Local network serving
- GitHub Pages
- Netlify/Vercel
- Docker
- Proxmox LXC

## Troubleshooting

### CORS Issues
If you encounter CORS errors, ensure your Anything LLM instance allows requests from your web app's origin. You may need to configure a reverse proxy.

### Connection Failed
- Verify your Base URL is correct (usually `http://localhost:3001/api/v1`)
- Check that your API Key is valid
- Ensure Anything LLM is running

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project however you'd like!

## Credits

Built for use with [Anything LLM](https://anythingllm.com/) by Mintplex Labs.

## Version History

### v1.1 (Current)
- Added mobile responsiveness with hamburger menu
- Implemented document upload for RAG
- Improved touch-friendly UI

### v1.0
- Initial release
- Basic chat functionality
- Workspace selection
- Persistent settings
