const { scryptSync, randomBytes, timingSafeEqual } =  require('node:crypto');
const UserRepository = require('../repositories/user.repository.js');
const crypto = require('crypto')

async function register(email, username, plainTextPassword) {
	const salt = randomBytes(16).toString('hex');
	const password_hash = scryptSync(plainTextPassword, salt, 64);
	return (await UserRepository.create(email, username, `${salt}:${password_hash.toString('hex')}`, false));
}

async function login(email, plainTextPassword) {
	const user = await UserRepository.findByEmail(email);
	if (user.length === 0 || user[0].oauth === false)
		return (null);
	const [salt, hash] = user[0].password_hash.split(':');
	if (timingSafeEqual(Buffer.from(hash, 'hex'), scryptSync(plainTextPassword, salt, 64)))
		return ({"id": user[0].id});
	else
		return (null);
}

async function oauth(email) {
	const user = await UserRepository.findByEmail(email);
	if (user.length === 0) {
		const newUser = await UserRepository.create(email, crypto.randomUUID(), null, true);
		return ({"id": newUser[0].id});
	}
	else if (user[0].oauth === true) {
		return ({"id": user[0].id});
	}
	return (null);
}

module.exports = {register, login, oauth};