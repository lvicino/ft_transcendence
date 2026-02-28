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

// ── Pong Canvas References ──
const pongCanvas = document.getElementById('pongCanvas');
const pongCtx = pongCanvas.getContext('2d');
const canvasOverlay = document.getElementById('canvasOverlay');
const pongFpsEl = document.getElementById('pongFps');
const pongInfoEl = document.getElementById('pongInfo');

let activeSocket = null;

// ── Pong Renderer State ──
let gameWorld = { w: 100, h: 100 };  // default, updated from gameParameter
let lastFrame = null;
let frameCount = 0;
let fpsTimer = 0;
let displayFps = 0;
let pongActive = false;

// ── Event Listeners ─────────────────────────────────────────────
document.getElementById('registerForm').addEventListener('submit', execRegister);
document.getElementById('loginForm').addEventListener('submit', execLogin);
document.getElementById('oauthButton').addEventListener('click', initOAuth);
document.getElementById('gameForm').addEventListener('submit', execCreateGame);
document.getElementById('wsForm').addEventListener('submit', execWsConnection);

// ═══════════════════════════════════════════════════════════════
// RENDERERS — REST & WS Text
// ═══════════════════════════════════════════════════════════════

function timestamp() {
    return new Date().toLocaleTimeString('fr-FR', { hour12: false });
}

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

    // ── Feed the Pong canvas ──
    renderPongFrame(data);
}

function renderWsEvent(label, data) {
    wsStatusEl.textContent = `[${timestamp()}]  ${label}`;
    if (data !== undefined) {
        wsPayloadEl.textContent = typeof data === 'object'
            ? JSON.stringify(data, null, 2) : String(data);
    }
}

// ═══════════════════════════════════════════════════════════════
// PONG CANVAS RENDERER
// ═══════════════════════════════════════════════════════════════

function initPongCanvas() {
    // Resize canvas to fit its wrapper
    const wrapper = pongCanvas.parentElement;
    const maxW = wrapper.clientWidth - 4;
    const maxH = wrapper.clientHeight - 4;

    // Maintain aspect ratio of game world
    const ratio = gameWorld.w / gameWorld.h;
    let cw, ch;
    if (maxW / maxH > ratio) {
        ch = maxH;
        cw = ch * ratio;
    } else {
        cw = maxW;
        ch = cw / ratio;
    }

    pongCanvas.width = Math.floor(cw);
    pongCanvas.height = Math.floor(ch);
    pongCanvas.style.width = pongCanvas.width + 'px';
    pongCanvas.style.height = pongCanvas.height + 'px';
}

function renderPongFrame(state) {
    if (!state || !state.ball || !state.players) return;

    // First frame: show canvas, hide overlay
    if (!pongActive) {
        pongActive = true;
        canvasOverlay.classList.add('hidden');
        initPongCanvas();
    }

    const ctx = pongCtx;
    const cw = pongCanvas.width;
    const ch = pongCanvas.height;
    const sx = cw / gameWorld.w;   // scale x
    const sy = ch / gameWorld.h;   // scale y

    // ── Clear ──
    ctx.fillStyle = '#0d1117';
    ctx.fillRect(0, 0, cw, ch);

    // ── Center line (dashed) ──
    ctx.strokeStyle = '#21262d';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 6]);
    ctx.beginPath();
    ctx.moveTo(cw / 2, 0);
    ctx.lineTo(cw / 2, ch);
    ctx.stroke();
    ctx.setLineDash([]);

    // ── Players ──
    state.players.forEach((p, i) => {
        const pw = p.w * sx;
        const ph = p.h * sy;
        const px = p.x * sx - pw / 2;
        const py = p.y * sy - ph / 2;

        // Team 0 = left (cyan), Team 1 = right (magenta)
        ctx.fillStyle = p.team === 0 ? '#58a6ff' : '#f778ba';

        // Glow effect
        ctx.shadowColor = p.team === 0 ? '#58a6ff' : '#f778ba';
        ctx.shadowBlur = 8;
        ctx.fillRect(px, py, pw, ph);
        ctx.shadowBlur = 0;
    });

    // ── Ball ──
    const bx = state.ball.x * sx;
    const by = state.ball.y * sy;
    const br = state.ball.radius * Math.min(sx, sy);

    ctx.fillStyle = '#f0883e';
    ctx.shadowColor = '#f0883e';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(bx, by, Math.max(br, 2), 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // ── Border ──
    ctx.strokeStyle = '#30363d';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, cw, ch);

    // ── FPS Counter ──
    frameCount++;
    const now = performance.now();
    if (now - fpsTimer >= 1000) {
        displayFps = frameCount;
        frameCount = 0;
        fpsTimer = now;
    }
    pongFpsEl.textContent = `${displayFps} FPS`;
    pongInfoEl.textContent = `${state.players.length} joueurs  |  balle @ (${state.ball.x.toFixed(1)}, ${state.ball.y.toFixed(1)})`;
}

function resetPongCanvas() {
    pongActive = false;
    canvasOverlay.classList.remove('hidden');
    pongFpsEl.textContent = '—';
    pongInfoEl.textContent = 'Idle';
    frameCount = 0;
    displayFps = 0;

    // Clear to black
    pongCtx.fillStyle = '#0d1117';
    pongCtx.fillRect(0, 0, pongCanvas.width, pongCanvas.height);
}

// Initialize canvas size on load
window.addEventListener('resize', () => { if (pongActive) initPongCanvas(); });
initPongCanvas();

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

    // Capture game world dimensions for the canvas renderer
    if (gameParameterParsed.gw && gameParameterParsed.gh) {
        gameWorld.w = gameParameterParsed.gw;
        gameWorld.h = gameParameterParsed.gh;
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
    pongInfoEl.textContent = 'Connexion…';

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
            pongInfoEl.textContent = 'En attente de l\'adversaire…';
        };

        activeSocket.onmessage = (msgEvent) => {
            try {
                const data = JSON.parse(msgEvent.data);
                if (data.ball) {
                    renderTick(data);
                } else if (data.type === 'Game Stop') {
                    renderWsEvent(`GAME STOP — reason: ${data.reason}`, data);
                    resetPongCanvas();
                } else if (data.type === 'error') {
                    renderWsEvent(`ERROR — ${data.message}`, data);
                } else {
                    renderWsEvent('MESSAGE', data);
                    if (data.type === 'info') {
                        pongInfoEl.textContent = `${data.player || ''} — ${data.message || ''}`;
                    }
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
            resetPongCanvas();
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