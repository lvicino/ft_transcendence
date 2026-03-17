const fastify = require('fastify')
const jwt = require('jsonwebtoken');
const AuthService = require('./services/auth.service.js');
const authRoutes = require('./api/routes/auth.route.js');
const usersRoutes = require('./api/routes/users.route.js');
const {initDb} = require('./database/db.js');

function build(opts = {}) {
	initDb();
	const app = fastify(opts);

	app.register(require("@fastify/cookie"), {
		hook: 'onRequest', // pas besoin ?
	})
	app.decorate("authService", AuthService);
	app.decorate("requireAuth", async function (request, reply) {
		const token = request.cookies.access_token;
		if (!token) {
			return reply.code(401).send({
				error: "Unauthorized",
				message: "No active session",
			});
		}

		try {
			request.auth = jwt.verify(token, process.env.JWT_SECRET, {
				algorithms: ['HS256'],
			});
		} catch {
			return reply.code(401).send({
				error: "Unauthorized",
				message: "Invalid session",
			});
		}
	});
	app.register(authRoutes, {prefix: 'api/auth/'});
	app.register(usersRoutes, {prefix: 'api/users/'});
	return (app);
}

module.exports = build;
