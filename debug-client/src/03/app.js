const $ = id => document.getElementById(id);

let ws = null;
let isLoggedIn = false;
let currentFriendIds = new Set();
const API_BASE = 'https://localhost:8443';

function setLoggedIn(val) {
  isLoggedIn = val;
  $('btn-login').disabled = val;
  $('btn-register').disabled = val;
  $('auth-status').innerText = val ? 'Logged In' : 'Not Logged In';
  $('auth-status').style.color = val ? '#88ff88' : '#ff8888';
}

function log(msg, type = 'msg-system') {
  const div = document.createElement('div');
  div.className = `msg ${type}`;
  div.innerText = `[${new Date().toLocaleTimeString()}] ${msg}`;
  $('log').appendChild(div);
  $('log').scrollTop = $('log').scrollHeight;
}

$('btn-register').onclick = async () => {
  try {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: $('email').value,
        username: $('username').value,
        password: $('password').value
      })
    });
    if (res.ok) log('Registered successfully');
    else { const err = await res.json(); log(`Register error: ${err.message}`, 'msg-error'); }
  } catch (e) { log(`Error: ${e.message}`, 'msg-error'); }
};

$('btn-login').onclick = async () => {
  if (isLoggedIn) return;
  try {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: $('email').value,
        password: $('password').value
      })
    });
    if (res.ok) {
      log('Login successful');
      setLoggedIn(true);
      fetchFriends();
      connectWebSocket();
    } else {
      const err = await res.json();
      log(`Login error: ${err.message}`, 'msg-error');
    }
  } catch (e) { log(`Error: ${e.message}`, 'msg-error'); }
};

$('btn-oauth').onclick = () => {
  window.location.href = `${API_BASE}/api/auth/login/oauth`;
};

$('btn-logout').onclick = async () => {
  try {
    await fetch(`${API_BASE}/api/auth/logout`, { method: 'POST' });
    if (ws) { ws.onclose = null; ws.close(); ws = null; }
    setLoggedIn(false);
    $('ws-status').innerText = '● Disconnected';
    $('ws-status').style.color = '#ff5555';
    $('ui-friends-list').innerHTML = '';
    $('ui-online-users').innerHTML = 'Connect WebSocket to view.';
    currentFriendIds = new Set();
    log('Logged out', 'msg-system');
  } catch (e) { log(`Logout error: ${e.message}`, 'msg-error'); }
};

$('btn-add-friend').onclick = async () => {
  try {
    const friendId = parseInt($('friend-tag').value.trim());
    if (isNaN(friendId)) {
      log('Invalid format. Use user ID (e.g. 5)', 'msg-error');
      return;
    }
    const res = await fetch(`${API_BASE}/api/chat/friend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ friendId })
    });
    if (res.ok) { log(`Friend added successfully`); fetchFriends(); }
    else { const err = await res.json(); log(`Friend error: ${err.message}`, 'msg-error'); }
  } catch (e) { log(`Error: ${e.message}`, 'msg-error'); }
};

window.unaddFriend = async (friendId) => {
  try {
    const res = await fetch(`${API_BASE}/api/chat/friend`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ friendId })
    });
    if (res.ok) { log(`Friend removed successfully`); fetchFriends(); }
    else { const err = await res.json(); log(`Remove friend error: ${err.message}`, 'msg-error'); }
  } catch (e) { log(`Error: ${e.message}`, 'msg-error'); }
};

async function fetchFriends() {
  try {
    const res = await fetch(`${API_BASE}/api/chat/friends`);
    if (res.ok) {
      const friends = await res.json();
      currentFriendIds = new Set(friends.map(f => f.id));
      
      const html = friends.map(f => `
        <div class="list-item" style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            ${f.username}#${f.id}
            <span class="${f.online ? 'status-online' : 'status-offline'}">
              (${f.online ? 'Online' : 'Offline'})
            </span>
          </div>
          <button onclick="unaddFriend(${f.id})" style="background: #552222; border: 1px solid #ff5555; color: #fff; cursor: pointer; padding: 2px 6px;">Unfriend</button>
        </div>
      `).join('');
      $('ui-friends-list').innerHTML = html || '<div class="list-item">No friends added.</div>';
      return friends;
    }
  } catch (e) {
    console.error('Failed to update friends list UI:', e);
  }
}

$('btn-get-friends').onclick = async () => {
  const friends = await fetchFriends();
  if (friends) log(`Fetched ${friends.length} friends`);
  else log(`Failed to fetch friends`, 'msg-error');
};

function connectWebSocket() {
  if (ws) return;
  ws = new WebSocket('wss://localhost:8443/api/chat/ws');
  
  ws.onopen = () => {
    log('WebSocket connected ✔');
    $('ws-status').innerText = '● Connected';
    $('ws-status').style.color = '#88ff88';
    $('btn-disconnect').disabled = false;
  };

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.type === 'online_users') {
        const nonFriends = data.users.filter(u => !currentFriendIds.has(u.id));
        log(`Online users updated: ${data.users.length} connected (${nonFriends.length} non-friends)`, 'msg-system');
        $('ui-online-users').innerHTML = nonFriends.length
          ? nonFriends.map(u => `<div class="list-item status-online">${u.username}#${u.id} (Online)</div>`).join('')
          : '<div class="list-item" style="color:#555">No other users online.</div>';
        fetchFriends();
      } else if (data.type === 'new_message') {
        const msg = data.message;
        const kind = msg.receiver_id ? 'msg-private' : 'msg-global';
        const sender = msg.sender_username ? `${msg.sender_username}#${msg.sender_id}` : `#${msg.sender_id}`;
        const toStr = msg.receiver_id ? ` → #${msg.receiver_id}` : ` [Global]`;
        log(`${sender}${toStr}: ${msg.content}`, kind);
      }
    } catch(err) {
      log(`Raw WS Message: ${event.data}`);
    }
  };

  ws.onclose = () => {
    log('WebSocket disconnected', 'msg-error');
    ws = null;
    $('ws-status').innerText = '● Disconnected';
    $('ws-status').style.color = '#ff5555';
    $('btn-disconnect').disabled = true;
    // Auto-reconnect after 3s if still authenticated
    setTimeout(async () => {
      const res = await fetch(`${API_BASE}/api/chat/friends`).catch(() => null);
      if (res && res.ok) {
        log('Reconnecting to WebSocket...', 'msg-system');
        connectWebSocket();
      }
    }, 3000);
  };
  
  ws.onerror = () => {
    log('WebSocket error occurred', 'msg-error');
  };
}

$('btn-send').onclick = () => {
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    log('Cannot send: WebSocket not connected', 'msg-error');
    return;
  }
  const content = $('chat-msg').value;
  if (!content) return;
  
  const receiverId = $('receiver-id').value ? parseInt($('receiver-id').value) : null;
  const payload = { type: 'message', content, receiverId };
  
  ws.send(JSON.stringify(payload));
  log(`Sent message${receiverId ? ` to ${receiverId}` : ' (Global)'}`, 'msg-system');
  $('chat-msg').value = '';
};

// On page load, check if already authenticated and auto-connect
(async () => {
  try {
    const res = await fetch(`${API_BASE}/api/chat/friends`);
    if (res.ok) {
      log('Session restored — connecting to chat...', 'msg-system');
      setLoggedIn(true);
      await fetchFriends();
      connectWebSocket();
    }
  } catch(e) { /* not logged in */ }
})();
