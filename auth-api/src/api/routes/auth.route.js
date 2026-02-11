const jwt = require('jsonwebtoken');

const monSecret = process.env.JWT_SECRET;

function genererToken(user) {
  const payload = {
    id: user.id,
  };

  const token = jwt.sign(payload, monSecret, {
    expiresIn: '5h',
    algorithm: 'HS256'
  });

  return token;
}

module.exports = async function (fastify, opts) {
	fastify.post('/register', async (request, reply) => {
		const { email, password } = request.body;
		try {
			await fastify.authService.register(email, password);
			return reply.code(201).send();
		} catch (error) {
			if (error.message.includes('UNIQUE')) {
				return reply.code(409).send({ 
					error: "Conflict", 
					message: "Cet email est déjà enregistré." 
				});
			}
			console.log("error register: ", error.message);
        	throw error;
		}
	})

	fastify.post('/login', async (request, reply) => {
		const { email, password } = request.body;
		const user = await fastify.authService.login(email, password);
		if (!user)
			return reply.code(401).send({ 
							error: "Unauthorized", 
							message: "Identifiants invalides" 
						});
		else {
			const access_token = genererToken(user);
			return {access_token};
		}
	});
}