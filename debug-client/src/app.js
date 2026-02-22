// Initialisation des écouteurs d'événements sur le DOM
document.getElementById('registerForm').addEventListener('submit', execRegister);
document.getElementById('loginForm').addEventListener('submit', execLogin);

// Références aux éléments d'affichage
const httpStatusElement = document.getElementById('httpStatus');
const jsonPayloadElement = document.getElementById('jsonPayload');
const tokenDisplayElement = document.getElementById('tokenDisplay');

/**
 * Fonction utilitaire pour mettre à jour l'interface avec la réponse HTTP
 * @param {number} statusCode - Le code d'état HTTP retourné
 * @param {object|string} data - La charge utile JSON ou le texte brut
 */
function renderResponse(statusCode, data) {
    httpStatusElement.textContent = `Code d'état HTTP : ${statusCode}`;
    jsonPayloadElement.textContent = typeof data === 'object' ? JSON.stringify(data, null, 2) : data;
}

/**
 * Exécute la requête d'inscription (Modifiée pour inclure username)
 */
async function execRegister(event) {
    event.preventDefault(); // Bloque la soumission native du formulaire
    
    const payload = {
        email: document.getElementById('regEmail').value,
        username: document.getElementById('regUsername').value,
        password: document.getElementById('regPassword').value
    };

    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        // Résolution du corps de la réponse selon le type de contenu
        const contentType = response.headers.get("content-type");
        let data = "No Content";
        if (contentType && contentType.includes("application/json")) {
            data = await response.json();
        }

        renderResponse(response.status, data);
    } catch (error) {
        renderResponse(0, `Erreur réseau ou d'exécution Fetch : ${error.message}`);
    }
}

/**
 * Exécute la requête de connexion et gère le JWT (Inchangée)
 */
async function execLogin(event) {
    event.preventDefault();
    
    const payload = {
        email: document.getElementById('logEmail').value,
        password: document.getElementById('logPassword').value
    };

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        renderResponse(response.status, data);

        // Validation du code 200 et extraction du JWT
        if (response.status === 200 && data.access_token) {
            // Stockage local persistant durant la session du navigateur
            sessionStorage.setItem('access_token', data.access_token);
            tokenDisplayElement.textContent = data.access_token;
        }
    } catch (error) {
        renderResponse(0, `Erreur réseau ou d'exécution Fetch : ${error.message}`);
    }
}