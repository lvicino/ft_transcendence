class PongGame {

	//constructor (gw, gh, ballRadius, ballSpeed, playerW, playerH, playerSpeed, playerNumber)
	constructor (gameParameter) {
		const {gw, gh, ballRadius, ballSpeed, playerW, playerH, playerSpeed, playerNumber} = gameParameter;
		this.w = gw;
		this.h = gh;
		this.ballSpeed = ballSpeed
		this.ball = {radius: ballRadius};
		this.players = [];
		this.setupPlayers(playerW, playerH, playerSpeed, playerNumber);
		this.setupBall(ballSpeed);
	}

	setupPlayers(w, h, speed, number) {
		if (number % 2 != 0 || number < 2)
			throw "error"
		for (;number > 0;number -= 2) {
			this.players.push({x: 10 + w / 2, y: this.h / 2, speed: speed, h: h, w: w, team: 0});
			this.players.push({x: this.w - 10 - w / 2, y: this.h / 2, speed: speed, h: h, w: w, team: 1});
		}
	}

	setupBall(speed) {
		let angles = Math.random() * (360);
		angles = 0;
		angles = angles * Math.PI / 180;
		this.ball.dx = Math.cos(angles) * 1;
		this.ball.dy = Math.sin(angles) * 1;
		this.ball.x = this.w / 2;
		this.ball.y = this.h / 2;
		this.ball.speed = speed;
	}

	Clamping(min, max, val) {
		return (Math.max(min, Math.min(val, max)));
	}
	
	ballColision(...objs) {
		for (const obj of objs) {
			const px = this.Clamping(obj.x - obj.w / 2, obj.x + obj.w / 2, this.ball.x); 
			const py = this.Clamping(obj.y - obj.h / 2, obj.y + obj.h / 2, this.ball.y);
			const dd = (this.ball.x - px)**2 + (this.ball.y - py)**2;
			if (dd <= this.ball.radius**2)
				return (obj);
		}
		return (null);
	}

	movePlayers(playerStep, ...players) {
		for (const player of players) {
			player.y += player.move * playerStep;
			if (this.ballColision(player)) {
				this.ball.y += player.move * playerStep;
				if (this.ball.y - this.ball.radius < 0 || this.ball.y + this.ball.radius > this.h || this.ballColision(...players)) {
					this.ball.y -= player.move * playerStep;
					player.y -= player.move * playerStep;
				}
			}
			if (player.y + player.h / 2 > this.h || player.y - player.h / 2 < 0) {
				player.y -= player.move * playerStep;
			}
		}
	}

	updateBallAngle(rotation) {
		let angleRadians = Math.atan2(this.ball.dy, this.ball.dx);
		angleRadians += rotation * Math.PI / 180
		this.ball.dx = Math.cos(angleRadians);
		this.ball.dy = Math.sin(angleRadians);
	}

	setBallAngle(player) {
		let angle = this.Clamping(player.y - player.h / 2, player.y + player.h / 2, this.ball.y) - player.y
		angle = (angle / (player.h / 2) * 45);
		if (player.x > this.ball.x)
			angle = -angle + 180;
		const angleRadians = angle * Math.PI / 180;
		this.ball.dx = Math.cos(angleRadians);
		this.ball.dy = Math.sin(angleRadians);
	}

	updateBallAxis(ballStep, axis, ...players) {
		const velocityProp = `d${axis}`;
		this.ball[axis] += this.ball[velocityProp] * ballStep;
		const player = this.ballColision(...players);
		if (player) {
			this.ball[velocityProp] = -this.ball[velocityProp];
			this.ball[axis] += this.ball[velocityProp] * ballStep;
			this.setBallAngle(player);
		}
		if (axis === "y" && this.ball.y - this.ball.radius < 0 || this.ball.y + this.ball.radius > this.h) {
			this.ball.dy = -this.ball.dy;
			this.ball.y += this.ball.dy * ballStep;
		}
	}

	update(...playersMove) {
		playersMove.map((m) => {
			if (m >= 1)
				m = 1;
			if (m <= -1)
				m = -1;
		})
		if (playersMove.length != this.players.length)
			throw "nbr player != nbr move";
		let step = Math.max(this.ball.speed, this.players[0].speed);
		let playerStep = this.players[0].speed / step; // this.players[0].speed marche que si tout les joueur on la meme vitesse
		let ballStep = this.ball.speed / step;
		this.players.forEach((p, i) => {p.move = playersMove[i]});
		while (step > 0) {
			this.movePlayers(playerStep, ...this.players);
			this.updateBallAxis(ballStep, "x", ...this.players);
			this.updateBallAxis(ballStep, "y", ...this.players);
			step--;
		}
		if (this.ball.x - this.ball.radius < 0 || this.ball.x + this.ball.radius > this.w)
			this.setupBall(this.ballSpeed);

		return {
			gameWide: this.w,
			gameHeight: this.h,
			ball: {x: this.ball.x, y: this.ball.y, radius: this.ball.radius},
			players: [...this.players],
		}
	}

}

module.exports = PongGame