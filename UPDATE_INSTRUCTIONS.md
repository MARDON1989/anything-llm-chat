# Update Instructions for Chatbot App V1.1

These instructions guide you through updating the Chatbot App running in a Proxmox LXC container.

## Prerequisites

*   Access to the Proxmox LXC container (via SSH or Proxmox Console).
*   The latest version of the Chatbot App files (v1.1).

## Option 1: Update via Git (Recommended)

If you cloned the repository directly inside the container:

1.  **SSH into your container:**
    ```bash
    ssh username@your-container-ip
    ```

2.  **Navigate to the web root:**
    (Common locations: `/var/www/html`, `/var/www/chatbot`, or `/opt/chatbot`)
    ```bash
    cd /var/www/html
    ```
    *(Adjust the path if you installed it somewhere else)*

3.  **Pull the latest changes:**
    ```bash
    git pull origin main
    ```

4.  **Clear Browser Cache:**
    Since this is a client-side app, you may need to clear your browser cache or hard refresh (Ctrl+F5) to see the changes.

## Option 2: Manual Update (SCP/SFTP)

If you are uploading files manually from your local machine:

1.  **Identify the web root directory** on your container (e.g., `/var/www/html`).

2.  **Upload the new files** from your local machine to the container. Run this command from your project folder:
    ```bash
    scp index.html style.css app.js api.js config.js logo.png root@your-container-ip:/var/www/html/
    ```

3.  **Verify Permissions:**
    Ensure the web server can read the files:
    ```bash
    ssh root@your-container-ip
    chown -R www-data:www-data /var/www/html
    ```

## Option 3: Update via Proxmox Console

1.  Open the Proxmox Web Interface.
2.  Select your Chatbot LXC container.
3.  Go to **Console**.
4.  Navigate to the directory and use `git pull` to fetch the new files.

## Post-Update Checks

1.  Open the Chatbot in your browser.
2.  Verify the version badge or check for new features (e.g., Hamburger menu on mobile).
3.  If issues persist, check the browser console (F12) for errors.
