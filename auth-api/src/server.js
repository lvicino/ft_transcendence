const build = require('./app')
const fs = require('node:fs');

const devMode = process.env.NODE_ENV === "development"

console.log("devMode: ", devMode);

const app = build({
    logger: {
    	level: devMode ? 'debug' : 'info',
    },
    https: {
		key: fs.readFileSync(process.env.NODE_SSL_KEY_PATH),
		cert: fs.readFileSync(process.env.NODE_SSL_CERT_PATH),
    }
})

const start = async () => {
	try {
        await app.listen({ port: 443, host: '0.0.0.0' });
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
}

start()