# SyncPusher - NodeJS

## Project Introduction

SyncPusher is an open source NodeJS application that can help you use Pusher to synchronize data between different pages and different clients

### Features:

- **Easy to use**: The front end only needs to use 2 functions, and at least only 2 lines of JS code need to be created to see the data synchronization effect

- **Lightweight and compact**: The back end only needs 3 files, which is very small in size and occupies very little memory during operation, suitable for running in various server environments

- **Easy to configure**: Just read this tutorial quickly, and after understanding the usage, there are detailed comments for each place where you need to fill in the configuration

- **Strong compatibility**: Compatible with mainstream browsers and major operating systems, and supports the choice of using POST or GET to transmit data

- **High security**: Supports the back end to use HTTPS protocol to transmit data, and supports HTTP forwarding to HTTPS to ensure data security

- **Multiple languages**: Supports configuring different languages ​​in the back end to display the server running status in the console, More languages ​​will be supported later

## Installation tutorial

1. **Install NodeJS**

Make sure that the NodeJS environment has been installed in your server system. Please search for the installation method yourself

2. **Get the server code**

You can clone the project code through Git in the server:
```CLI (CMD | PowerShell | Bash)
git clone https://github.com/jamcaaxian/SyncPusher.git # Clone the project code
cd SyncServer # Enter the project directory
```

You can also [manually download the compressed package](https://github.com/jamcaaxian/SyncPusher/archive/master.zip) and unzip it to the server

If it is the first time to configure NodeJS, you need to initialize the project first. Execute in the directory where `SyncPusherServer.js` is located:
```CLI (CMD | PowerShell | Bash)
npm init -y # Automatically generate package.json file
```

3. **Get Pusher key**

3.1 Go to [Pusher official website](https://pusher.com/) to log in or register an account
3.2 Go to [Apps page](https://dashboard.pusher.com/apps) to create a new app
3.3 Click `Create app` and fill in `Name your app`, other options are default, click `Create app`
3.4 Click the newly created app, enter `App Keys` to see the key, the information on this page will be needed for later configuration

4. **Configure server parameters**
Open the `SyncPusherConfig.js` file in the editor and fill in the following parameters according to your own situation:
```SyncPusherConfig.js
language: 'en-US', // Options: 'en-US', 'zh-CN', etc.
APIPath: '/syncpusher', // The URL path of the API endpoint
pusher: {
	appId: '', // Pusher > Home > Channels > [App Name] > App Keys > app_id
	key: '', // Pusher > Home > Channels > [App Name] > App Keys > key
	secret: '', // Pusher > Home > Channels > [App Name] > App Keys > secret
	cluster: '', // Pusher > Home > Channels > [App Name] > App Keys > cluster
	useTLS: true, // Use Long-term Support Version of Pusher
},
httpPort: 80, // HTTP Port
SSL: {
	useSSL: false, // Use SSL: true, false
	httpsPort: 443, // HTTPS Port
	redirection: true, // Redirect HTTP traffic to HTTPS: true, false
	key: '', // SSL key file path
	cert: '', // SSL certificate file path
	ca: '', // (Optional) CA file path
},
```

The language `language` parameter defaults to English. If you need to switch to Chinese, please modify the `language` parameter value to `zh-CN`
The API path `APIPath` defaults to `/syncpusher`. The client needs to connect to the server through this path when sending data
The content in the object `pusher` is required. At this time, return to the `App Keys` page just opened and copy the corresponding information
HTTPS is not enabled by default. If you need to enable it, please set the `useSSL` parameter to `true` and configure the SSL certificate yourself

5. **Start the service**

You can start the service through the command line:
```CLI (CMD | PowerShell | Bash)
node SyncPusherServer.js
```

You can also start the service by running `server.bat`

6. **Server configuration completed**

At this point, the server configuration is complete. You can visit it in the browser
`http(s)://<your server IP or domain name>:<service port>/<API path>?channel=test&event=test&message=test`
to test whether the service is running normally

For example: (Synchronous chat room case)
```browser
https://www.example.com:8080/chat?channel=test&event=test&message=test
```

## Quick start

### Front-end use

Need to have a certain understanding of HTML, JavaScript, and be familiar with the browser's development tools

1. Import SyncPusher

Introduce the SyncPusher JS file in `<head></head>` or `<body></body>`:

Can be imported through CDN:
```html
<!-- Performance optimized version -->
<script src="https://cdn.jsdelivr.net/gh/jamcaaxian/SyncPusher@latest/SyncClient/syncpusher.min.js"></script>
```
```html
<!-- Development version -->
<script src="https://cdn.jsdelivr.net/gh/jamcaaxian/SyncPusher@latest/SyncClient/syncpusher.js"></script>
```

You can also [manually download](https://github.com/jamcaaxian/SyncPusher/releases) and import

2. Initialize SyncPusher (using default configuration)

Create a new SyncPusher object: (variable name can be customized)
```javascript
const dataSyncPusher = new SyncPusher({
	key: "Pusher public key (app_key)",
	api: "API address (http(s)://<server IP or domain name>:<service port>/<API path>)",
});
```

For example: (Synchronous chat room example)
```javascript
const chat = new SyncPusher({
	key: "0a1b2c3d4e5f6g7h8i9j",
	api: "https://www.example.com:8080/chat",
});
```

3. Custom data synchronization logic

Customize the data synchronization logic by writing the sync function, which will be called after the front end receives the data:
```javascript
dataSyncPusher.sync = (data) => {
	// Custom data synchronization logic
	console.log(data);
};
```

For example: (Synchronous chat room case)
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

4. Push data updates to the server

Push data updates to the server by calling the `push` method:
```javascript
dataSyncPusher.push("test");
```

For example: (Synchronous chat room example)
```javascript
let messages = ["Hello, world!", "How are you?"];
chat.push(messages);
```

### Complete example code (Synchronous chat room example)

The code is in sample.html, [Click to view the complete example code](https://github.com/jamcaaxian/SyncPusher/sample.html)
The server of the code is fictitious, so it cannot be run directly. You can modify it according to your own situation and run the test

## Architecture principle

The architecture of SyncPusher is simple and clear:

1. **Front-end push data**

- Use Fetch API to send data to the server.

- Support POST and GET methods to meet different needs.

2. **Server broadcasts data**

- After receiving the data, the server calls Pusher's API to broadcast the data to all subscribed clients.

3. **Front-end receives broadcast**

- The front-end receives data through Pusher's subscription channel and triggers a custom `sync` method to process the data.

Through the above process, SyncPusher realizes data synchronization between front-ends and can meet a variety of real-time interaction needs.