const PongGame = require('../domain/PongGame.js')

class GameManager {

	constructor() {
		this.games = new Map();
		this.startedGames = new Map();
	}

	createGame(user, password, gameParameter) {
		const gameid = Number(user.id);
		if (this.startedGames.has(gameid)) {
			return {
				success: false,
				error: "GAME_ALREADY_STARTED"
			};
		}
		if (this.games.has(gameid)) {
			return {
				success: false,
				error: "GAME_ALREADY_EXISTE",
				id: gameid,
				data: {
					id: gameid,
					password: this.games.get(gameid).password,
				}
			};
		}
		const game = {
			"password": password,
			"pong": new PongGame(gameParameter),
			"players": new Map(),
		}
		this.games.set(gameid, game);
		return ({
			success: true,
			data: {
				id: gameid,
				password: password,
			}
		});
	}

	joinGame(id, password, user, socket) {
		const gameId = Number(id);

		if (!this.games.has(gameId))
			return ({joined: false, reason: `No game with id '${gameId}'`});
		if (this.games.get(gameId).password !== password)
			return ({joined: false, reason: "wrong password"});
		if (this.games.get(gameId).players.has(user.id))
			return ({joined: false, reason: "dejat dans la partie"});
		if (this.games.get(gameId).players.size === 1 && user.id != gameId && !this.games.get(gameId).players.has(gameId))
			return ({joined: false, reason: "il y a de la place plus que pour le createur de la partie"});

		this.games.get(gameId).players.set(user.id, {"socket": socket, "moove": 0, "score": 0});
		if (this.games.get(gameId).players.size >= 2) {
			this.startedGames.set(gameId, this.games.get(gameId));
			this.games.delete(gameId);
			this.#startGame(gameId);
			return ({joined: true, reason: "", players: "2/2"});
		}
		return ({joined: true, reason: "", players: "1/2"});
	}

	#startGame(id) {
		
		const game = this.startedGames.get(Number(id));
		game.intervalID = setInterval(() => {
			const mooves = [...game.players.values()].map((p) => {return p.moove});
			console.log("mooves :", mooves);
			const gameState = game.pong.update(...mooves);
			const data = JSON.stringify(gameState);
			[...game.players.values()].map((p) => {p.socket.send(data)});
		}, 1000 / 60);
	}

	HandleInput(gameid, user, moove) {
		gameid = Number(gameid);
		moove = Number(moove);
		if (this.startedGames.has(gameid)) {
			for (const player of this.startedGames.get(gameid).players) {
				if (player.id == user.id)
					player.moove = moove;
			}
		}
	}

	handleDisconnect(user) {
		const gameid = Number(user.gameid);
		if (this.startedGames.has(gameid)) {
			for (const player of this.startedGames.get(gameid).players.values()) {
				if (player.id != user.id) {
					player.socket.send(JSON.stringify({type: "Game Stop", reason: 1}));
					player.socket.close();
				}
			}
			clearInterval(this.startedGames.get(gameid).intervalID);
			this.startedGames.delete(gameid);
		} else if (this.games.has(gameid)) {
			this.games.get(gameid).players.delete(user.id);
		}
	}
}

module.exports = new GameManager();