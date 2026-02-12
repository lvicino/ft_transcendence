const fastify = require('fastify')
const fastifyWebsocket = require('@fastify/websocket');
const gameManager = require('./services/GameManager');
const gameRoutes = require('./api/routes/games.routes.js');
const wsRoutes = require('./api/routes/ws.routes.js');

function build(opts = {}) {
	const app = fastify(opts);

	app.register(fastifyWebsocket);

	app.register(require('@fastify/jwt'), {
		secret: process.env.JWT_SECRET,
	});
	app.decorate("authenticate", async function (request, reply) {
		try {
			await request.jwtVerify();
		} catch (err) {
			reply.send(err);
		}
	});

	app.decorate('gameManager', gameManager);
	app.register(gameRoutes, {prefix: 'api/games'});
	app.register(wsRoutes);

	return (app);
}

module.exports = build;