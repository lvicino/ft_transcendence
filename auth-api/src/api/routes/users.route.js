module.exports = async function (fastify, opts) {
	fastify.get('/:id', async (request, reply) => {
		const user = await fastify.authService.getById(request.params.id);
		if (!user) {
			return reply.code(404).send({
				error: "USER_NOT_FOUND",
			});
		}

		return reply.code(200).send({
			user: {
				id: user.id,
				login: user.username,
				avatar: null,
				status: "online",
			},
			stats: {
				wins: 0,
				losses: 0,
				winrate: 0,
				rating: 1000,
				gamesPlayed: 0,
			},
			recentMatches: [],
		});
	});

	fastify.patch('/me', { onRequest: [fastify.requireAuth] }, async (request, reply) => {
		const username = request.body?.username?.trim();
		if (!username) {
			return reply.code(400).send({
				error: "USERNAME_REQUIRED",
			});
		}
		if (username.length < 2 || username.length > 24) {
			return reply.code(400).send({
				error: "USERNAME_LENGTH_INVALID",
			});
		}

		try {
			const user = await fastify.authService.updateUsername(request.auth.id, username);
			if (!user) {
				return reply.code(404).send({
					error: "USER_NOT_FOUND",
				});
			}
			return reply.code(200).send(user);
		} catch (error) {
			if (error.message.includes('users_username_key')) {
				return reply.code(409).send({
					error: "USERNAME_ALREADY_TAKEN",
				});
			}
			throw error;
		}
	});
}
