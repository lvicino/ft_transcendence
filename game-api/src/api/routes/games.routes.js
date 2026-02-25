
module.exports = async function (fastify, opts) {

	fastify.post('/', { onRequest: [fastify.authenticate] }, async (request, reply) => {
		console.log("request.user:", request.user);
		console.log("parameter: ", request.body.gameParameter);
		const result = fastify.gameManager.createGame(request.user, crypto.randomUUID(), request.body.gameParameter);

		if (result.success) {
			reply.code(201).send({...result.data});
		} else {
			reply.code(409).send({error: result.error});
		}
	})
}