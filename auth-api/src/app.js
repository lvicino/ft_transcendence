const fastify = require('fastify')
const AuthService = require('./services/auth.service.js');
const authRoutes = require('./api/routes/auth.route.js');
const {initDb} = require('./database/db.js');

function build(opts = {}) {
	initDb();
	const app = fastify(opts);

	app.register(require("@fastify/cookie"), {
		hook: 'onRequest', // pas besoin ?
	})
	app.decorate("authService", AuthService);
	app.register(authRoutes, {prefix: 'api/auth/'});
	return (app);
}

module.exports = build;