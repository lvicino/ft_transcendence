// ═══════════════════════════════════════════════════════════════
// Debug Dashboard — ft_transcendence  |  app.js
// ═══════════════════════════════════════════════════════════════

// ── DOM References (via data-testid for subagent compatibility) ──
const $ = (sel) => document.querySelector(sel);
const byTestId = (id) => document.querySelector(`[data-testid="${id}"]`);

const httpStatusEl = byTestId('http-status');
const jsonPayloadEl = byTestId('json-payload');
const wsStatusEl = byTestId('ws-status');
const wsPayloadEl = byTestId('ws-payload');
const wsControlsEl = byTestId('ws-controls');

let activeSocket = null;

// ── Event Listeners ─────────────────────────────────────────────
document.getElementById('registerForm').addEventListener('submit', execRegister);
document.getElementById('loginForm').addEventListener('submit', execLogin);
document.getElementById('oauthButton').addEventListener('click', initOAuth);
document.getElementById('gameForm').addEventListener('submit', execCreateGame);
document.getElementById('wsForm').addEventListener('submit', execWsConnection);

// ═══════════════════════════════════════════════════════════════
// RENDERERS
// ═══════════════════════════════════════════════════════════════

function timestamp() {
    return new Date().toLocaleTimeString('fr-FR', { hour12: false });
}

/**
 * Renders a REST response into the HTTP log panel.
 * @param {string} method  - HTTP verb (POST, GET, …)
 * @param {string} url     - Endpoint path
 * @param {number|string} statusCode - HTTP status or client label
 * @param {object|string} data - Response body
 * @param {object} [headers] - Notable response headers
 */
function renderResponse(method, url, statusCode, data, headers) {
    const ts = timestamp();
    httpStatusEl.textContent = `[${ts}]  ${method} ${url}  →  ${statusCode}`;

    let output = '';
    if (headers) {
        const notable = {};
        if (headers.get('set-cookie')) notable['Set-Cookie'] = headers.get('set-cookie');
        if (headers.get('content-type')) notable['Content-Type'] = headers.get('content-type');
        if (headers.get('location')) notable['Location'] = headers.get('location');
        if (Object.keys(notable).length > 0) {
            output += '── Response Headers ──\n' + JSON.stringify(notable, null, 2) + '\n\n';
        }
    }
    output += '── Response Body ──\n';
    output += typeof data === 'object' ? JSON.stringify(data, null, 2) : String(data);
    jsonPayloadEl.textContent = output;
}

function renderTick(data) {
    wsStatusEl.textContent = `Tick  @  ${timestamp()}`;
    wsPayloadEl.textContent = JSON.stringify(data, null, 2);
}

function renderWsEvent(label, data) {
    wsStatusEl.textContent = `[${timestamp()}]  ${label}`;
    if (data !== undefined) {
        wsPayloadEl.textContent = typeof data === 'object'
            ? JSON.stringify(data, null, 2) : String(data);
    }
}

// ═══════════════════════════════════════════════════════════════
// AUTH-API  —  Register
// ═══════════════════════════════════════════════════════════════

async function execRegister(event) {
    event.preventDefault();
    const payload = {
        email: byTestId('reg-email').value,
        username: byTestId('reg-username').value,
        password: byTestId('reg-password').value,
    };
    const method = 'POST';
    const url = '/api/auth/register';

    try {
        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        const ct = res.headers.get('content-type');
        const data = (ct && ct.includes('application/json'))
            ? await res.json()
            : (res.status === 201 ? 'Created (No Content)' : await res.text() || 'No Content');
        renderResponse(method, url, res.status, data, res.headers);
    } catch (err) {
        renderResponse(method, url, 'NETWORK_ERR', err.message);
    }
}

// ═══════════════════════════════════════════════════════════════
// AUTH-API  —  Login
// ═══════════════════════════════════════════════════════════════

async function execLogin(event) {
    event.preventDefault();
    const payload = {
        email: byTestId('log-email').value,
        password: byTestId('log-password').value,
    };
    const method = 'POST';
    const url = '/api/auth/login';

    try {
        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify(payload),
        });
        const ct = res.headers.get('content-type');
        const data = (ct && ct.includes('application/json'))
            ? await res.json()
            : await res.text() || 'No Content';
        renderResponse(method, url, res.status, data, res.headers);
    } catch (err) {
        renderResponse(method, url, 'NETWORK_ERR', err.message);
    }
}

// ═══════════════════════════════════════════════════════════════
// AUTH-API  —  OAuth 42
// ═══════════════════════════════════════════════════════════════

function initOAuth() {
    window.location.href = '/api/auth/login/oauth';
}

// ═══════════════════════════════════════════════════════════════
// GAME-API  —  Create Game
// ═══════════════════════════════════════════════════════════════

async function execCreateGame(event) {
    event.preventDefault();
    let gameParameterParsed;
    try {
        gameParameterParsed = JSON.parse(byTestId('game-param').value);
    } catch (parseError) {
        return renderResponse('POST', '/api/games/', 'JSON_ERR', `Erreur JSON locale : ${parseError.message}`);
    }

    const method = 'POST';
    const url = '/api/games/';

    try {
        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify({ gameParameter: gameParameterParsed }),
        });
        const ct = res.headers.get('content-type');
        const data = (ct && ct.includes('application/json'))
            ? await res.json()
            : await res.text() || 'No Content';
        renderResponse(method, url, res.status, data, res.headers);
    } catch (err) {
        renderResponse(method, url, 'NETWORK_ERR', `Erreur réseau : ${err.message}`);
    }
}

// ═══════════════════════════════════════════════════════════════
// GAME-API  —  WebSocket Tunnel
// ═══════════════════════════════════════════════════════════════

function execWsConnection(event) {
    event.preventDefault();

    if (activeSocket && activeSocket.readyState !== WebSocket.CLOSED) {
        renderResponse('WS', '/api/games/ws', 'BUSY', 'Un tunnel est déjà actif ou en cours de négociation.');
        return;
    }

    const gameId = byTestId('ws-game-id').value;
    const password = byTestId('ws-password').value;
    const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUri = `${proto}//${window.location.host}/api/games/ws`;

    renderWsEvent('CONNECTING…', `URI: ${wsUri}`);

    try {
        activeSocket = new WebSocket(wsUri);

        activeSocket.onopen = () => {
            renderWsEvent('OPEN  (101 Switching Protocols)');
            wsControlsEl.classList.add('active');
            document.getElementById('wsConnectBtn').disabled = true;

            const initPayload = { gameid: gameId };
            if (password) initPayload.password = password;
            activeSocket.send(JSON.stringify(initPayload));
            renderWsEvent('SENT init payload', initPayload);
        };

        activeSocket.onmessage = (msgEvent) => {
            try {
                const data = JSON.parse(msgEvent.data);
                if (data.ball) {
                    renderTick(data);
                } else if (data.type === 'Game Stop') {
                    renderWsEvent(`GAME STOP — reason: ${data.reason}`, data);
                } else if (data.type === 'error') {
                    renderWsEvent(`ERROR — ${data.message}`, data);
                } else {
                    renderWsEvent('MESSAGE', data);
                }
            } catch (e) {
                renderWsEvent('RAW MESSAGE', msgEvent.data);
            }
        };

        activeSocket.onclose = (closeEvent) => {
            renderWsEvent(`CLOSED [${closeEvent.code}]`, `Raison: ${closeEvent.reason || 'aucune'}`);
            wsControlsEl.classList.remove('active');
            document.getElementById('wsConnectBtn').disabled = false;
            activeSocket = null;
        };

        activeSocket.onerror = () => {
            renderWsEvent('ERROR', 'Erreur critique sur la couche transport.');
        };

    } catch (err) {
        renderWsEvent('FATAL', `Échec d'instanciation WebSocket: ${err.message}`);
    }
}

// ═══════════════════════════════════════════════════════════════
// WS Input Controls
// ═══════════════════════════════════════════════════════════════

function sendWsInput(mooveValue) {
    if (activeSocket && activeSocket.readyState === WebSocket.OPEN) {
        const payload = { type: 'input', moove: mooveValue };
        activeSocket.send(JSON.stringify(payload));
    }
}

function closeWs() {
    if (activeSocket) {
        activeSocket.close(1000, 'Déconnexion initiée par le client de debug');
    }
}