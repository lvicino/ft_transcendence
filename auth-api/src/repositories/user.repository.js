const {sql} = require('../database/db.js');

async function create(email, username, passwordHash, oauth) {
  const newUser = {
      email: email,
	  username: username,
      password_hash: passwordHash,
	  oauth: oauth
  }
  return await sql`
    INSERT INTO users ${sql(newUser)}
    RETURNING id, email, username, oauth
  `
}

async function findByEmail(email) {
  return await sql`
  SELECT * 
  FROM users 
  WHERE email = ${email}
  `
}

module.exports = {create, findByEmail};