const jwt = require('jsonwebtoken');
const axios = require('axios');

const JWT_SECRET = process.env.JWT_SECRET;
const API_UID = process.env.API_UID;
const API_SECRET = process.env.API_SECRET;
const API_REDIRECT_URI = process.env.API_REDIRECT_URI 

function genererToken(user) {
  const payload = {
    id: user.id,
  };

  const token = jwt.sign(payload, JWT_SECRET, {
    expiresIn: '5h',
    algorithm: 'HS256'
  });

  return token;
}

module.exports = async function (fastify, opts) {
	fastify.post('/register', async (request, reply) => {
		const { email, username, password } = request.body;
		try {
			await fastify.authService.register(email, username, password);
			return reply.code(201).send();
		} catch (error) {
			if (error.message.includes('UNIQUE')) {
				return reply.code(409).send({ 
					error: "Conflict", 
					message: "Cet email ou username est déjà enregistré." 
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

	fastify.get('/login/oauth', async (request, reply) => {
		const authorizeUrl = `https://api.intra.42.fr/oauth/authorize?client_id=${API_UID}&redirect_uri=${API_REDIRECT_URI}&response_type=code`;
		return reply.redirect(authorizeUrl);
	});

	fastify.get('/callback', async (request, reply) => {
		const { code } = request.query;

		if (!code) return reply.code(400).send("No code provided");

		try {
			const tokenResponse = await axios.post('https://api.intra.42.fr/oauth/token', {
				grant_type: 'authorization_code',
				client_id: API_UID,
				client_secret: API_SECRET,
				code: code,
				redirect_uri: API_REDIRECT_URI
			});

			const accessToken = tokenResponse.data.access_token;

			const userResponse = await axios.get('https://api.intra.42.fr/v2/me', {
				headers: { Authorization: `Bearer ${accessToken}` }
			});

			const user = await fastify.authService.oauth(userResponse.data.email);

			const access_token = genererToken(user);
			const frontendUrl = API_REDIRECT_URI.replace('/auth/callback', '');
			return {access_token};

		} catch (error) {
			request.log.error(error);
			return reply.code(500).send("Authentication failed");
		}
	});
}