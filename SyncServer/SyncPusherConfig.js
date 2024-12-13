export const config = {
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
};