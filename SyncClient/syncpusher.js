class SyncPusher {
    constructor(config) {
        if (!config?.key) throw new Error("Configuration error: 'key' is required.");
        if (!config?.api) throw new Error("Configuration error: 'api' is required.");

        this.config = {
            key: config.key,
            api: config.api,
            pusherjs: config?.pusherjs || "https://js.pusher.com/8.2.0/pusher.min.js",
            cluster: config?.cluster || "ap1",
            channel: config?.channel || "sync-channel",
            event: config?.event || "sync-event",
            method: config?.method || "POST",
            retries: config?.retries || 3,
            delay: config?.delay || 1000,
            logToConsole: config?.logToConsole || false,
        };

        this.initPusher();
    }

    initPusher() {
        if (window.Pusher) {
            this.setupPusher();
        } else {
            const pusherScript = document.createElement("script");
            pusherScript.src = this.config.pusherjs;
            pusherScript.onload = () => this.setupPusher();
            pusherScript.onerror = () => {
                this.log("Failed to load Pusher script.", "error");
                throw new Error("Pusher script could not be loaded.");
            };
            document.body.appendChild(pusherScript);
        }
    }

    setupPusher() {
        Pusher.logToConsole = this.config.logToConsole;

        const pusher = new Pusher(this.config.key, { cluster: this.config.cluster });
        const channel = pusher.subscribe(this.config.channel);
        channel.bind(this.config.event, (data) => this.sync(data));
    }

    async fetch(url, options, retries = this.config.retries, delay = this.config.delay) {
        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return await response.text();
        } catch (error) {
            if (retries > 0) {
                this.log(`Retrying... (${this.config.retries - retries + 1})`);
                await new Promise(resolve => setTimeout(resolve, delay));
                return this.fetch(url, options, retries - 1, delay);
            } else {
                this.log(`Fetch failed: ${error.message}`, "error");
                throw error;
            }
        }
    }

    push(data) {
        const api = new URL(this.config.api);
        let options;

        if (this.config.method === "GET") {
            options = { method: "GET" };
            api.searchParams.append("channel", this.config.channel);
            api.searchParams.append("event", this.config.event);
            api.searchParams.append("data", encodeURIComponent(data));
        } else {
            options = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    channel: this.config.channel,
                    event: this.config.event,
                    data: data,
                }),
            };
        }

        return this.fetch(api, options)
            .then(result => {
                this.log(`Data pushed successfully: ${result}`);
                return result;
            })
            .catch(error => {
                this.log(`Push failed: ${error.message}`, "error");
                throw error;
            });
    }

    sync(data) {
        console.log("Received sync data:", JSON.stringify(data));
    }

    log(message, type = "log") {
        if (this.config.logToConsole) {
            console[type]?.(message) || console.log(message);
        }
    }
}