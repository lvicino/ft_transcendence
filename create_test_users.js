import https from 'https';

const agent = new https.Agent({ rejectUnauthorized: false });
const API_BASE = 'https://localhost:8443';

async function createUser(email, username, password) {
  try {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, username, password }),
      dispatcher: new (require('undici').Agent)({
        connect: { rejectUnauthorized: false }
      })
    });
    console.log(`Created ${username}: ${res.status}`);
  } catch (err) {
    if (err.message.includes('fetch is not defined') || err.message.includes('undici')) {
        // Fallback for older nodes without native fetch or undici using standard https
        const data = JSON.stringify({ email, username, password });
        const req = https.request({
            hostname: 'localhost',
            port: 8443,
            path: '/api/auth/register',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            },
            rejectUnauthorized: false
        }, (res) => {
            console.log(`Created ${username}: ${res.statusCode}`);
        });
        req.on('error', (e) => console.error(e));
        req.write(data);
        req.end();
    } else {
        console.error(`Error creating ${username}:`, err);
    }
  }
}

async function run() {
  await createUser('user1@test.com', 'user1', 'pwd123');
  await new Promise(r => setTimeout(r, 500));
  await createUser('user2@test.com', 'user2', 'pwd123');
  await new Promise(r => setTimeout(r, 500));
  await createUser('user3@test.com', 'user3', 'pwd123');
}

run();
