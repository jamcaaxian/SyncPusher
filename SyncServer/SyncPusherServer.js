const { config } = require('./SyncPusherConfig.js');

console.language = {
    'en-US': {
        'check': 'Checking dependencies...',
        'installed': 'Dependencies installed',
        'installing': 'Installing missing dependencies...',
        'invalidData': 'Invalid request data',
        'pusherError': 'Pusher error',
        'startingServer': 'Starting server...',
        'httpsStarted': 'HTTPS server started at: ',
        'httpRedirectStarted': 'HTTP redirection started, all HTTP traffic redirected to HTTPS',
        'dependenciesCheckCompleted': 'Dependencies check completed, no missing dependencies',
        'execError': 'Execution error',
        'stderrError': 'Standard error',
        'serverStartError': 'Error starting the server',
    },
    'zh-CN': {
        'check': '检查依赖是否已安装...',
        'installed': '依赖已安装',
        'installing': '安装缺失的依赖...',
        'invalidData': '无效的请求数据',
        'pusherError': 'Pusher 错误',
        'startingServer': '启动服务器...',
        'httpsStarted': 'HTTPS 服务器已启动: ',
        'httpRedirectStarted': '重定向服务器已启动，所有 HTTP 流量已重定向到 HTTPS',
        'dependenciesCheckCompleted': '依赖检查完成，无缺失依赖',
        'execError': '执行错误',
        'stderrError': '标准错误',
        'serverStartError': '启动服务器时出错',
        'loadingCert': '加载 SSL 证书...',
        'serverStarted': '服务器已启动',
    },
};

const { exec } = require('child_process');
const fs = require('fs');

function checkAndInstallDependencies() {
    return new Promise((resolve, reject) => {
        console.log(console.language[config.language]['check']);
        try {
            require.resolve('express');
            require.resolve('pusher');
            console.log(console.language[config.language]['dependenciesCheckCompleted']);
            resolve();
        } catch (e) {
            console.log(console.language[config.language]['installing']);
            const command = 'npm install express pusher';
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    reject(`${console.language[config.language]['execError']}: ${error.message}`);
                    return;
                }
                if (stderr) {
                    reject(`${console.language[config.language]['stderrError']}: ${stderr}`);
                    return;
                }
                console.log(console.language[config.language]['installed']);
                resolve();
            });
        }
    });
}

async function startServer() {
    try {
        console.log(console.language[config.language]['startingServer']);
        await checkAndInstallDependencies();

        const http = require('http');
        const https = require('https');
        const express = require('express');
        const Pusher = require('pusher');

        const pusher = new Pusher(config.pusher);
        const app = express();

        function push(channel, event, data, res) {
            if (!channel || !event || !data ) {
                res.status(400).send(console.language[config.language]['invalidData']);
                return;
            }
            pusher.trigger(channel, event, data)
                .then(() => res.status(200).send('Data sent to Pusher'))
                .catch((err) => {
                    console.error(console.language[config.language]['pusherError'], err);
                    res.status(500).send(console.language[config.language]['pusherError']);
                });
        }

        app.post(config.APIPath, express.json(), (req, res) => {
            const { channel, event, data } = req.body;
            push(channel, event, data, res);
        });

        app.get(config.APIPath, (req, res) => {
            const { channel, event, data } = req.query;
            push(channel, event, data, res);
        });

        console.log(console.language[config.language]['loadingCert']);
        const options = {
            key: fs.readFileSync(config.SSL.key),
            cert: fs.readFileSync(config.SSL.cert),
        };

        if (config.SSL.ca && config.SSL.ca !== '') {
            options.ca = fs.readFileSync(config.SSL.ca);
        }

        console.log(`${console.language[config.language]['httpsStarted']} ${config.SSL.httpsPort}`);
        https.createServer(options, app).listen(config.SSL.httpsPort, () => {
            console.log(`${console.language[config.language]['httpsStarted']} ${config.SSL.httpsPort}`);
        });

        if (config.SSL.redirection) {
            console.log(console.language[config.language]['httpRedirectStarted']);
            http.createServer((req, res) => {
                res.writeHead(301, { Location: `https://${req.headers.host}${req.url}` });
                res.end();
            }).listen(config.httpPort, () => {
                console.log(console.language[config.language]['httpRedirectStarted']);
            });
        }

    } catch (error) {
        console.error(console.language[config.language]['serverStartError'], error);
    }
}

startServer();