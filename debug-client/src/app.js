// Initialisation des écouteurs d'événements
document.getElementById('registerForm').addEventListener('submit', execRegister);
document.getElementById('loginForm').addEventListener('submit', execLogin);
document.getElementById('oauthButton').addEventListener('click', initOAuth);

// Références aux éléments d'affichage
const httpStatusElement = document.getElementById('httpStatus');
const jsonPayloadElement = document.getElementById('jsonPayload');
const tokenDisplayElement = document.getElementById('tokenDisplay');

/**
 * Fonction utilitaire de rendu des réponses HTTP
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
        renderResponse(0, `Erreur réseau : ${error.message}`);
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
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        renderResponse(response.status, data);

        if (response.status === 200 && data.access_token) {
            sessionStorage.setItem('access_token', data.access_token);
            tokenDisplayElement.textContent = data.access_token;
        }
    } catch (error) {
        renderResponse(0, `Erreur réseau : ${error.message}`);
    }
}

/**
 * Initie le flux OAuth 2.0 par assignation de la ressource (Redirection HTTP)
 */
function initOAuth() {
    // Redirige le contexte d'exécution du navigateur vers la route d'initialisation
    window.location.href = '/api/auth/login/oauth';
}

/**
 * Interception de la réponse d'autorisation OAuth (Phase 2 du Grant Code)
 * Exécutée séquentiellement au chargement du script.
 */
async function handleOAuthCallback() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
        try {
            // Requête asynchrone vers le backend pour l'échange de token
            const response = await fetch(`/api/auth/callback?code=${encodeURIComponent(code)}`, {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            });
            
            const data = await response.json();
            renderResponse(response.status, data);

            if (response.status === 200 && data.access_token) {
                sessionStorage.setItem('access_token', data.access_token);
                tokenDisplayElement.textContent = data.access_token;
            }

            // Purge du paramètre 'code' dans la barre d'adresse via l'API History 
            // pour empêcher la réexécution de l'appel réseau lors d'une actualisation de page (F5)
            window.history.replaceState({}, document.title, window.location.pathname);
            
        } catch (error) {
            renderResponse(0, `Erreur lors de l'échange du code OAuth : ${error.message}`);
        }
    }
}

// Exécution du processus d'interception
handleOAuthCallback();