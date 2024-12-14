class SyncPusher {
    constructor(config) {
        if (!config?.key) throw new Error("Configuration error: 'key' is required.");
        if (!config?.api) throw new Error("Configuration error: 'api' is required.");

        this.config = {
            key: config.key,
            api: config.api,
            pusherjs: config?.pusherjs || "https://js.pusher.com/8.2.0/pusher.min.js",
            cluster: config?.cluster || "ap1",
            channel: "presence-cache-" + (config?.channel || "sync"),
            method: config?.method || "POST",
            retries: config?.retries || 3,
            delay: config?.delay || 1000,
            logToConsole: config?.logToConsole || false,
        };

        this.initPusher();
    }

    log(message, type = "log") {
        if (this.config.logToConsole) {
            console[type]?.(message) || console.log(message);
        }
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
        const pusher = new Pusher(this.config.key, { cluster: this.config.cluster });
        pusher.logToConsole = this.config.logToConsole;

        const connection = pusher.connection;
        connection.bind("initialized", () => this.connection.initialized());
        connection.bind("connecting", () => this.connection.connecting());
        connection.bind("connected", () => this.connection.connected());
        connection.bind("unavailable", () => this.connection.unavailable());
        connection.bind("failed", () => this.connection.failed());
        connection.bind("disconnected", () => this.connection.disconnected());
        connection.bind("error", (error) => this.connection.error(error));
        connection.bind("state_change", (state) => this.connection.stateChange(state));

        const channel = pusher.subscribe(this.config.channel);
        channel.bind("pusher:subscription_succeeded", (members) => this.connected(members));
        channel.bind("pusher:member_added", (member) => this.joined(member));
        channel.bind("pusher:member_removed", (member) => this.left(member));
        channel.bind("pusher:subscription_error", (error) => this.error(error));
        channel.bind("pusher:cache_miss", () => this.init());
        channel.bind("sync", (data) => this.sync(data));
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

    connection = {
        initialized: () => {
            this.log("Pusher connection initialized.")
        },
        connecting: () => {
            this.log("Pusher connecting...")
        },
        connected: () => {
            this.log("Pusher connected.")
        },
        unavailable: () => {
            this.log("Pusher unavailable.")
        },
        failed: () => {
            this.log("Pusher failed.")
        },
        disconnected: () => {
            this.log("Pusher disconnected.")
        },
        error: (error) => {
            this.log(`Pusher error: ${error.message}`, "error")
        },
        stateChange: (state) => {
            this.log(`Pusher state changed: ${state}`)
        },
    }

    connected(members) {
        this.log(`Subscribed to channel: ${ this.config.channel}`);
        this.log(`${members.count} member(s) in channel.`);
        members.each(function (member) {
            this.log(`MemberId: ${member.id})`);
            this.log(`MemberInfo: ${member.info}`);
        });
        this.log(`MyId: ${members.me.id}`);
        this.log(`MyInfo: ${members.me.info}`);
    }

    joined(member) {
        this.log(`Member joined, Id: ${member.id})`);
        this.log(`Member Info: ${member.info}`);
    }

    left(member) {
        this.log(`Member left, Id: ${member.id})`);
        this.log(`Member Info: ${member.info}`);
    }

    error(error) {
        this.log(`Connection Error: ${error.error}`, "error");
    }

    init() {
        const data = [];
        this.log("Initiating cache...");
        this.push(data);
    }

    sync(data) {
        console.log("Received sync data:", JSON.stringify(data));
    }
    
    push(data) {
        const api = new URL(this.config.api);
        let options;

        if (this.config.method === "GET") {
            options = { method: "GET" };
            api.searchParams.append("channel", this.config.channel);
            api.searchParams.append("event", "sync");
            api.searchParams.append("data", encodeURIComponent(data));
        } else {
            options = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    channel: this.config.channel,
                    event: "sync",
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
}