const fastify = require('fastify')
const {initDb} = require('./database/db.js');
const chatRoutes = require('./api/routes/chat.route.js');

function build(opts = {}) {
	initDb();
	const app = fastify(opts);

	app.register(require("@fastify/cookie"), {
		hook: 'onRequest',
	})
	app.register(require("@fastify/websocket"), {
		options: { maxPayload: 1048576 }
	})
	
	app.register(chatRoutes, {prefix: 'api/chat/'});
	return (app);
}

module.exports = build;
