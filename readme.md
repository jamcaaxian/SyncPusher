# SyncPusher - NodeJS

## Project Introduction

SyncPusher is an open-source NodeJS application that helps you use Pusher to achieve data synchronization between different pages and clients.

### Features:

- **Easy to Use**: The front end requires only 3 functions, and you can achieve data synchronization with as few as 2 lines of JS code.
- **Lightweight**: The backend only requires 2 files, with a very small size and minimal memory usage during runtime, making it suitable for various server environments.
- **Simple Configuration**: After reading this tutorial and understanding how to use it, every configuration point comes with detailed comments.
- **High Compatibility**: Compatible with mainstream browsers and major operating systems, supports both POST and GET data transmission methods.
- **High Security**: Supports HTTPS data transmission on the backend, and HTTP redirection to HTTPS, ensuring data security.
- **Multi-language Support**: The backend can be configured to display server status in different languages on the console, with more languages to be supported in the future.

## Installation Guide

1. **Install NodeJS**

   Please ensure that NodeJS is installed on your server. Search for the installation method based on your system.

2. **Get Server Code**

   You can clone the project code to your server using Git:
   ```CLI (CMD | PowerShell | Bash)
   git clone https://github.com/jamcaaxian/SyncPusher.git # Clone the project code
   cd SyncServer # Enter the project directory
   ```

   Alternatively, you can [download the zip](https://github.com/jamcaaxian/SyncPusher/archive/master.zip) and extract it to your server.

   If it's your first time setting up NodeJS, initialize the project by running:
   ```CLI (CMD | PowerShell | Bash)
   node init -y # Automatically generate package.json file
   ```

3. **Get Pusher Keys**

   3.1 Go to [Pusher's website](https://pusher.com/), log in or register.
   3.2 Go to the [Apps page](https://dashboard.pusher.com/apps) to create a new app.
   3.3 Click `Create app`, fill in `Name your app`, leave other options as default, and click `Create app`.
   3.4 Click the newly created app to go to `App Keys`, where you can find the required keys. You'll need them for configuration later.

4. **Configure Server Parameters**

   Open the `SyncPusherServer.js` file in an editor and find the `config` object. Fill in the following parameters according to your situation:
   ```SyncPusherServer.js
   language: 'en-US', // Optional: 'en-US', 'zh-CN'
   APIPath: '/syncpusher', // The API URL path
   pusher: {
       appId: '', // App ID: Get from Pusher > Home > Channels > [Your App] > App Keys > app_id
       key: '', // Public key: Get from Pusher > Home > Channels > [Your App] > App Keys > key
       secret: '', // Secret key: Get from Pusher > Home > Channels > [Your App] > App Keys > secret
       cluster: '', // Cluster: Get from Pusher > Home > Channels > [Your App] > App Keys > cluster
       useTLS: true, // Whether to use Long Term Support version: true, false
   },
   httpPort: 80, // HTTP port
   SSL: {
       useSSL: false, // Whether to enable HTTPS: true, false
       httpsPort: 443, // HTTPS port
       redirection: true, // Whether to redirect HTTP to HTTPS: true, false
       key: '', // SSL key file path
       cert: '', // SSL certificate file path
       ca: '', // (Optional) CA certificate file path
   },
   ```

   The `language` parameter defaults to English. To switch to Chinese, change the `language` value to `zh-CN`.  
   The `APIPath` defaults to `/syncpusher`, and the client will need to connect to this path to send data to the server.  
   The `pusher` object must be filled in, so go back to the `App Keys` page and copy the corresponding information.  
   By default, HTTPS is not enabled. To enable it, set the `useSSL` parameter to `true` and configure your SSL certificates.

5. **Start the Server**

   You can start the server using the command line:
   ```CLI (CMD | PowerShell | Bash)
   node SyncPusherServer.js
   ```

   Alternatively, you can start the server by running `server.bat`.

6. **Server Configuration Completed**

   Once the server is configured, you can test it by visiting:
   ```browser
   http(s)://<your server IP or domain>:<server port>/<API path>?channel=test&event=test&message=test
   ```
   For example, (synchronizing a chatroom):
   ```browser
   https://www.example.com:8080/chat?channel=test&event=test&message=test
   ```

## Quick Start

### Frontend Usage

   Basic knowledge of HTML, JavaScript, and browser developer tools is required.

1. **Include SyncPusher**

   Include the SyncPusher JS file in the `<head></head>` or `<body></body>` section:

   You can include it via CDN:
   ```html
   <!-- Optimized performance version -->
   <script src="https://cdn.jsdelivr.net/gh/jamcaaxian/SyncPusher@latest/SyncClient/syncpusher.min.js"></script>
   ```
   ```html
   <!-- Development version -->
   <script src="https://cdn.jsdelivr.net/gh/jamcaaxian/SyncPusher@latest/SyncClient/syncpusher.js"></script>
   ```

   Alternatively, you can [download it](https://github.com/jamcaaxian/SyncPusher/releases) and include it manually.

2. **Initialize SyncPusher (using default configuration)**

   Create a new SyncPusher object (you can customize the variable name):
   ```javascript
   const dataSyncPusher = new SyncPusher({
       key: "Pusher public key (app_key)",
       api: "API address (http(s)://<server IP or domain>:<server port>/<API path>)",
   });
   ```

   For example, (synchronizing a chatroom):
   ```javascript
   const chat = new SyncPusher({
       key: "0a1b2c3d4e5f6g7h8i9j",
       api: "https://www.example.com:8080/chat",
   });
   ```

3. **Customize Data Synchronization Logic**

   Write a sync function to customize the data synchronization logic, which will be called when the frontend receives data:
   ```javascript
   dataSyncPusher.sync = (data) => {
       // Custom data synchronization logic
       console.log(data);
   };
   ```

   For example, (synchronizing a chatroom):
   ```javascript
   chat.sync = (messages) => {
       const chatFrame = document.getElementById("chat-frame");
       messages.forEach((message) => {
           const newMessage = document.createElement("div");
           newMessage.innerText = message;
           chatFrame.appendChild(newMessage);
       });
   };
   ```

4. **Push Data Updates to Server**

   Use the `push` method to send data updates to the server:
   ```javascript
   dataSyncPusher.push("test");
   ```

   For example, (synchronizing a chatroom):
   ```javascript
   let messages = ["Hello, world!", "How are you?"];
   chat.push(messages);
   ```

### Complete Example Code (Chatroom Synchronization Example)

The code is available in `sample.html`. [Click here to view the complete example](https://github.com/jamcaaxian/SyncPusher/sample.html). The server is fictional, so it can't be run directly. You can modify it according to your own setup and test it.

## Architecture Principles

SyncPusher's architecture is simple:

1. **Frontend Pushes Data**

   - The frontend uses the Fetch API to send data to the server.
   - Supports both POST and GET methods to accommodate different needs.

2. **Server Broadcasts Data**

   - Once the server receives the data, it uses Pusher's API to broadcast the data to all subscribed clients.

3. **Frontend Receives Broadcasted Data**

   - The frontend subscribes to a Pusher channel and calls the custom `sync` method to handle the received data.

Through this process, SyncPusher achieves data synchronization between frontends, enabling various real-time interactive features.