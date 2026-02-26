
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
                    throw new Error("impossible de rejoindere la partie: "+ state.reason);
                }
                socket.send(JSON.stringify({type:"info", message: "Partie rejoin avec succes", player: state.players}));
            } catch (err) {
                socket.send(JSON.stringify({type:"error", message: err.message}));
                socket.close();
            }
            socket.on('message', (message) => {
                try {
                    const data = JSON.parse(message);
                    console.log(data);
                    if (data.type === "input") {
                        fastify.gameManager.HandleInput(user.gameid, user, data.moove);
                    }
                } catch (error) {
                    socket.send(JSON.stringify({type:"error", message: error.message}));
                }
            });
        });

        setTimeout(() => {
            if (!user)
                socket.close(4001, 'Authentication Timeout');
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