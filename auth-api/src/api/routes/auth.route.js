const jwt = require('jsonwebtoken');
const axios = require('axios');

const JWT_SECRET = process.env.JWT_SECRET;
const API_UID = process.env.API_UID;
const API_SECRET = process.env.API_SECRET;
const API_REDIRECT_URI = process.env.API_REDIRECT_URI 
const FRONTEND_URL = process.env.FRONTEND_URL 
const isProduction = process.env.NODE_ENV === 'production';

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

function authCookieOptions() {
	return {
		path: "/",
		httpOnly: true,
		secure: isProduction,
		sameSite: "lax",
		maxAge: 3600,
	};
}

module.exports = async function (fastify, opts) {
	fastify.post('/register', async (request, reply) => {
		const { email, username, password } = request.body;
		try {
			await fastify.authService.register(email, username, password);
			return reply.code(201).send();
		} catch (error) {
			if (error.message.includes('users_email_key')) {
				return reply.code(409).send({ 
					error: "Conflict", 
					message: "Cet email est déjà enregistré." 
				});
			} else if (error.message.includes('users_username_key')) {
				return reply.code(409).send({ 
					error: "Conflict", 
					message: "Cet username est déjà utilisé." 
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
			reply.setCookie("access_token", access_token, authCookieOptions());
			return reply.code(200).send({
				message: "Login successful"
			});
		}
	});

	fastify.get('/session', async (request, reply) => {
		const token = request.cookies.access_token;
		if (!token) {
			return reply.code(401).send({
				error: "Unauthorized",
				message: "No active session",
			});
		}

		try {
			const payload = jwt.verify(token, JWT_SECRET, {
				algorithms: ['HS256'],
			});
			const user = await fastify.authService.getById(payload.id);
			if (!user) {
				return reply.code(404).send({
					error: "Not Found",
					message: "User not found",
				});
			}
			return reply.code(200).send({ user });
		} catch (error) {
			return reply.code(401).send({
				error: "Unauthorized",
				message: "Invalid session",
			});
		}
	});

	fastify.post('/logout', async (request, reply) => {
		reply.clearCookie("access_token", authCookieOptions());
		return reply.code(204).send();
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
			reply.setCookie("access_token", access_token, authCookieOptions());
			return reply.redirect(FRONTEND_URL)
		} catch (error) {
			request.log.error(error);
			return reply.code(500).send("Authentication failed");
		}
	});
}
