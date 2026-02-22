const { scryptSync, randomBytes, timingSafeEqual } =  require('node:crypto');
const UserRepository = require('../repositories/user.repository.js');

async function register(email, username, plainTextPassword) {
	const salt = randomBytes(16).toString('hex');
	const password_hash = scryptSync(plainTextPassword, salt, 64);
	return (await UserRepository.create(email, username, `${salt}:${password_hash.toString('hex')}`, false));
}

async function login(email, plainTextPassword) {
	const user = await UserRepository.findByEmail(email);
	if (user.length === 0 && user.oauth === false)
		return (null);
	const [salt, hash] = user[0].password_hash.split(':');
	if (timingSafeEqual(Buffer.from(hash, 'hex'), scryptSync(plainTextPassword, salt, 64)))
		return ({"id": user[0].id});
	else
		return (null);
}

module.exports = {register, login};