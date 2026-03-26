const {sql} = require('../database/db.js');

async function ensureUserExists(id, username) {
  await sql`
    INSERT INTO users (id, username)
    VALUES (${id}, ${username})
    ON CONFLICT (id) DO UPDATE SET username = ${username}
  `;
}

async function userExists(id) {
  const result = await sql`
    SELECT id FROM users WHERE id = ${id}
  `;
  return result.length > 0;
}

async function addFriend(userId, friendId) {
  await sql`
    INSERT INTO friends (user_id, friend_id)
    VALUES (${userId}, ${friendId})
    ON CONFLICT (user_id, friend_id) DO NOTHING
  `;
}

async function getFriends(userId) {
  return await sql`
    SELECT u.id, u.username
    FROM friends f
    JOIN users u ON f.friend_id = u.id
    WHERE f.user_id = ${userId}
  `;
}

async function removeFriend(userId, friendId) {
  await sql`
    DELETE FROM friends
    WHERE user_id = ${userId} AND friend_id = ${friendId}
  `;
}

module.exports = {
  ensureUserExists,
  userExists,
  addFriend,
  getFriends,
  removeFriend
};