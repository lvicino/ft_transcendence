document.getElementById('registerForm').addEventListener('submit', execRegister);
document.getElementById('loginForm').addEventListener('submit', execLogin);
document.getElementById('oauthButton').addEventListener('click', initOAuth);
document.getElementById('gameForm').addEventListener('submit', execCreateGame);

const httpStatusElement = document.getElementById('httpStatus');
const jsonPayloadElement = document.getElementById('jsonPayload');

/**
 * Moteur de rendu des réponses de l'API HTTP
 */
function renderResponse(statusCode, data) {
    httpStatusElement.textContent = `Code d'état HTTP : ${statusCode}`;
    jsonPayloadElement.textContent = typeof data === 'object' ? JSON.stringify(data, null, 2) : data;
}

/**
 * Exécute la requête d'inscription
 */
async function execRegister(event) {
    event.preventDefault();
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
        const contentType = response.headers.get("content-type");
        const data = (contentType && contentType.includes("application/json")) ? await response.json() : "No Content";
        renderResponse(response.status, data);
    } catch (error) {
        renderResponse(0, `Erreur d'E/S réseau : ${error.message}`);
    }
}

/**
 * Exécute la requête de connexion
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
            credentials: 'same-origin', // Autorise la réception de l'en-tête Set-Cookie
            body: JSON.stringify(payload)
        });
        const contentType = response.headers.get("content-type");
        const data = (contentType && contentType.includes("application/json")) ? await response.json() : "No Content";
        renderResponse(response.status, data);
    } catch (error) {
        renderResponse(0, `Erreur d'E/S réseau : ${error.message}`);
    }
}

/**
 * Exécute la création d'une instance de jeu
 */
async function execCreateGame(event) {
    event.preventDefault();

    let gameParameterParsed;
    const rawJsonInput = document.getElementById('gameParam').value;

    try {
        gameParameterParsed = JSON.parse(rawJsonInput);
    } catch (parseError) {
        renderResponse(0, `Erreur de sérialisation JSON locale : ${parseError.message}`);
        return;
    }

    const payload = { gameParameter: gameParameterParsed };

    try {
        const response = await fetch('/api/games/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin', // Injecte le cookie d'authentification dans la requête
            body: JSON.stringify(payload)
        });
        
        const contentType = response.headers.get("content-type");
        const data = (contentType && contentType.includes("application/json")) ? await response.json() : "No Content";
        renderResponse(response.status, data);
    } catch (error) {
        renderResponse(0, `Erreur d'E/S réseau : ${error.message}`);
    }
}

/**
 * Initie le flux de délégation OAuth 2.0 via la navigation de l'agent utilisateur
 */
function initOAuth() {
    window.location.href = '/api/auth/login/oauth';
}