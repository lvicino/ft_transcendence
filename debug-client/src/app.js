// Initialisation des écouteurs d'événements DOM
document.getElementById('registerForm').addEventListener('submit', execRegister);
document.getElementById('loginForm').addEventListener('submit', execLogin);
document.getElementById('oauthButton').addEventListener('click', initOAuth); // Restauration
document.getElementById('gameForm').addEventListener('submit', execCreateGame);
document.getElementById('wsForm').addEventListener('submit', execWsConnection);

const httpStatusElement = document.getElementById('httpStatus');
const jsonPayloadElement = document.getElementById('jsonPayload');
const wsTickStatusElement = document.getElementById('wsTickStatus');
const wsPayloadElement = document.getElementById('wsPayload');

let activeSocket = null;

/**
 * Moteurs de rendu des flux
 */
function renderResponse(statusCode, data) {
    httpStatusElement.textContent = `Code/Statut : ${statusCode}`;
    jsonPayloadElement.textContent = typeof data === 'object' ? JSON.stringify(data, null, 2) : data;
}

function renderTick(data) {
    wsTickStatusElement.textContent = `Tick reçu à : ${new Date().toISOString()}`;
    wsPayloadElement.textContent = JSON.stringify(data, null, 2);
}

/**
 * Initialisation du flux OAuth 2.0
 */
function initOAuth() {
    // Déclenche une requête GET bloquante (navigation) vers le point de terminaison d'initialisation Fastify
    window.location.href = '/api/auth/login/oauth';
}

/**
 * Exécution de l'inscription locale
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
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
        });
        const contentType = response.headers.get("content-type");
        const data = (contentType && contentType.includes("application/json")) ? await response.json() : "No Content";
        renderResponse(response.status, data);
    } catch (error) { renderResponse(0, error.message); }
}

/**
 * Exécution de la connexion locale (Requiert l'émission d'un Set-Cookie par le serveur)
 */
async function execLogin(event) {
    event.preventDefault();
    const payload = { email: document.getElementById('logEmail').value, password: document.getElementById('logPassword').value };
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin', body: JSON.stringify(payload)
        });
        const contentType = response.headers.get("content-type");
        const data = (contentType && contentType.includes("application/json")) ? await response.json() : "No Content";
        renderResponse(response.status, data);
    } catch (error) { renderResponse(0, error.message); }
}

/**
 * Exécution de la création d'une instance de jeu
 */
async function execCreateGame(event) {
    event.preventDefault();
    let gameParameterParsed;
    try {
        gameParameterParsed = JSON.parse(document.getElementById('gameParam').value);
    } catch (parseError) {
        return renderResponse(0, `Erreur JSON locale : ${parseError.message}`);
    }

    try {
        const response = await fetch('/api/games/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin', // Propagation stricte du cookie d'authentification
            body: JSON.stringify({ gameParameter: gameParameterParsed })
        });
        const contentType = response.headers.get("content-type");
        const data = (contentType && contentType.includes("application/json")) ? await response.json() : "No Content";
        renderResponse(response.status, data);
    } catch (error) {
        renderResponse(0, `Erreur réseau : ${error.message}`);
    }
}

/**
 * Négociation et instanciation du tunnel WebSocket
 */
function execWsConnection(event) {
    event.preventDefault();

    if (activeSocket && activeSocket.readyState !== WebSocket.CLOSED) {
        renderResponse('WS Client', 'Un tunnel est déjà actif ou en cours de négociation.');
        return;
    }

    const gameId = document.getElementById('wsGameId').value;
    const password = document.getElementById('wsPassword').value;
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUri = `${wsProtocol}//${window.location.host}/api/games/ws`;

    try {
        activeSocket = new WebSocket(wsUri);

        activeSocket.onopen = () => {
            renderResponse('WS 101', 'Switching Protocols réussi. Exécution de la charge utile d\'initialisation.');
            document.getElementById('wsControls').style.display = 'block';
            document.getElementById('wsConnectBtn').disabled = true;

            const initPayload = { gameid: gameId };
            if (password) initPayload.password = password;
            activeSocket.send(JSON.stringify(initPayload));
        };

        activeSocket.onmessage = (messageEvent) => {
            const data = JSON.parse(messageEvent.data);
            if (data.ball) {
                renderTick(data);
            } else if (data.type === 'Game Stop') {
                renderResponse('WS Trame de contrôle', `Arrêt du serveur. Raison: ${data.reason}`);
            } else if (data.type === 'error') {
                renderResponse('WS Exception', `Erreur du serveur: ${data.message}`);
            } else {
                renderResponse('WS Trame inconnue', data);
            }
        };

        activeSocket.onclose = (closeEvent) => {
            renderResponse(`WS Close [${closeEvent.code}]`, `Fermeture du tunnel. Raison fournie: ${closeEvent.reason || 'Aucune'}`);
            document.getElementById('wsControls').style.display = 'none';
            document.getElementById('wsConnectBtn').disabled = false;
            wsTickStatusElement.textContent = 'Désactivé (Tunnel fermé)';
            activeSocket = null;
        };

        activeSocket.onerror = (errorEvent) => {
            renderResponse('WS Error', 'Erreur critique au niveau de la couche de transport.');
        };

    } catch (err) {
        renderResponse('Client Error', `Échec d'instanciation de l'objet WebSocket: ${err.message}`);
    }
}

/**
 * Transmission sérialisée de la commande d'entrée (Vecteur)
 */
function sendWsInput(mooveValue) {
    if (activeSocket && activeSocket.readyState === WebSocket.OPEN) {
        const payload = { type: 'input', moove: mooveValue };
        activeSocket.send(JSON.stringify(payload));
    }
}

/**
 * Clôture du descripteur de socket
 */
function closeWs() {
    if (activeSocket) {
        activeSocket.close(1000, "Initiative de déconnexion du client frontal");
    }
}