
module.exports = async function (fastify) {

    fastify.get('/ws', { websocket: true, onRequest: [fastify.authenticate]}, (socket, req) => {
        console.log('Utilisateur connecte');
        let user = null;

        socket.once('message', (message) => {
            try {
                const data = JSON.parse(message);
                //const decoded = fastify.jwt.verify(data.token);
                //user = {...decoded, gameid: data.gameid};
                user = {...req.user, gameid: data.gameid};
                const state = fastify.gameManager.joinGame(data.gameid, data.password, user, socket);
                if (!state.joined) {
                    throw new Error("GAME_JOIN_FAILED");
                }
                socket.send(JSON.stringify({type:"info", code: "GAME_JOIN_SUCCESS", player: state.players}));
            } catch (err) {
                socket.send(JSON.stringify({type:"error", code: err.message}));
				user = null; // pour ne pas appler handleDisconnect() on close.
                socket.close();
            }
            socket.on('message', (message) => {
                try {
                    const data = JSON.parse(message);
                    console.log(data);
                    if (data.type === "input") {
                        console.log("data.moove: ", data.moove);
                        fastify.gameManager.HandleInput(user.gameid, user, data.moove);
                    }
                } catch (error) {
                    socket.send(JSON.stringify({type:"error", code: error.message}));
                }
            });
        });

        setTimeout(() => {
            if (!user)
                socket.close(4001, 'WS_AUTH_TIMEOUT');
        }, 500);

        socket.on('close', () => {
            console.log(`Connexion fermée pour l'utilisateur`);
            if (user)
                fastify.gameManager.handleDisconnect(user);
        });

        socket.on('error', (err) => {
            console.error('Erreur WebSocket :', err);
        });
    })

}