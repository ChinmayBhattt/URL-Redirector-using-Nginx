// backend/server.js
// A lightweight Node.js Express server running on port 3000
const express = require('express');
const app = express();
const PORT = 3000;

// Middleware to log incoming requests with headers sent by Nginx
app.use((req, res, next) => {
    const clientIp = req.headers['x-real-ip'] || req.socket.remoteAddress;
    const forwardedFor = req.headers['x-forwarded-for'] || 'none';
    console.log(`[Node.js Backend] ${new Date().toLocaleTimeString()} - ${req.method} ${req.originalUrl}`);
    console.log(`       -> Client IP (X-Real-IP): ${clientIp}`);
    console.log(`       -> X-Forwarded-For: ${forwardedFor}`);
    next();
});

// Route 1: GET /api/hello
// Returns a simple JSON greeting
app.get('/api/hello', (req, res) => {
    res.json({
        status: 'success',
        message: 'Hello from the Node.js Express backend!',
        architecture: 'Client -> Nginx (Reverse Proxy :80) -> Node.js (:3000)'
    });
});

// Route 2: GET /api/time
// Returns current server time in ISO and human-readable formats
app.get('/api/time', (req, res) => {
    const now = new Date();
    res.json({
        status: 'success',
        serverTimeUtc: now.toISOString(),
        serverTimeLocal: now.toLocaleString(),
        timestamp: now.getTime()
    });
});

// Route 3: GET /redirect?url=...
// Validates the destination URL and performs an HTTP redirect (302)
app.get('/redirect', (req, res) => {
    const targetUrl = req.query.url;

    // Validate that a URL was provided
    if (!targetUrl) {
        return res.status(400).json({
            error: 'Missing URL parameter.',
            usage: '/redirect?url=https://example.com'
        });
    }

    try {
        // Validate URL format and protocol (only allow http and https)
        const parsedUrl = new URL(targetUrl);
        if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
            return res.status(400).json({
                error: 'Invalid protocol. URL must start with http:// or https://',
                received: targetUrl
            });
        }

        console.log(`[Node.js Backend] Redirecting user to: ${parsedUrl.href}`);
        // HTTP 302 Found (Temporary Redirect)
        return res.redirect(302, parsedUrl.href);
    } catch (err) {
        return res.status(400).json({
            error: 'Invalid URL format.',
            details: err.message,
            received: targetUrl
        });
    }
});

// Start listening on port 3000
app.listen(PORT, '127.0.0.1', () => {
    console.log(`====================================================`);
    console.log(` Node.js Express Backend running on http://127.0.0.1:${PORT}`);
    console.log(` Ready to receive reverse-proxied requests from Nginx!`);
    console.log(`====================================================`);
});
