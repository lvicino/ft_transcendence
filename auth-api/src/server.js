const build = require('./app')

const devMode = process.env.NODE_ENV === "development"

console.log("devMode: ", devMode);

const app = build({
    logger: {
        level: devMode ? 'debug' : 'info',
    }
})

const start = async () => {
    try {
        await app.listen({ port: 3000, host: '0.0.0.0' });
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
}

start()