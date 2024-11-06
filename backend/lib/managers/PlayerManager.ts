/* eslint-disable @typescript-eslint/no-unused-vars */
import { Player } from '../Player';
import { MAP_HEIGHT as mh, MAP_WIDTH as mw } from '../map';

export class PlayerManager {
	private players: { [key: string]: Player } = {};
	private keyStates: { [key: string]: { [key: string]: { [key: string]: boolean } } } = {};

	addPlayer(player: Player) {
		this.players[player.id] = player;
		this.initializeKeyState(player.room, player.id);
	}

	getPlayer(playerId: string) {
		return this.players[playerId];
	}

	removePlayer(playerId: string) {
		delete this.players[playerId];
		delete this.keyStates[playerId];
	}

	updatePlayers(roomID: string) {
		const playersInRoom = this.getPlayersInRoom(roomID);

		for (const player in playersInRoom) {
			this.players[player].update();
			this.handleMovement(player);
			this.handleActions(player);
		}
	}

	handleMovement(playerId: string) {
		const player = this.players[playerId];
		const keys = this.keyStates[player.room][playerId];

		if (keys.up) {
			// console.log('key up');
			player.updateY(true, mh);
		}
		if (keys.down) {
			// console.log('key down');
			player.updateY(false, mh);
		}
		if (keys.left) {
			// console.log('key left');
			player.updateX(true, mw);
		}
		if (keys.right) {
			// console.log('key RIGHT');
			player.updateX(false, mw);
		}
		// console.log('inside handle movement', player.x, player.y);
	}

	updateKeyStates(playerId: string, roomID: string, keyStates: { [key: string]: boolean }) {
		this.keyStates[roomID][playerId] = keyStates;
	}

	handleActions(playerId: string) {
		const player = this.players[playerId];

		if (this.keyStates[player.room] && this.keyStates[player.room][playerId]) {
			const keys = this.keyStates[player.room][playerId];
			const isMoving = Object.values(keys).some((state) => state);

			player.action = isMoving ? 'walk' : 'idle';
			if (keys['attack']) this.performAttack(player);
		}
	}

	getPlayersInRoom(room: string): { [key: string]: Player } {
		return Object.fromEntries(Object.entries(this.players).filter(([_, p]) => p.room === room));
	}

	private initializeKeyState(room: string, playerId: string) {
		this.keyStates[room] = { ...this.keyStates[room] };
		this.keyStates[room][playerId] = {
			up: false,
			down: false,
			left: false,
			right: false,
			attack: false
		};
	}

	private performAttack(player: Player) {
		player.action = 'attack';
		player.actionEndTime = Date.now() + 5000;
		const targets = this.getPlayersInRoom(player.room);
		for (const target of Object.values(targets)) {
			if (target.id !== player.id && isInAttackRange(player, target) && !target.invincible) {
				target.takeDamage(player.attack);
				target.invincible = true;
				target.invincibilityEndTime = Date.now() + 2000;
			}
		}
	}
}

function isInAttackRange(attacker: Player, target: Player) {
	const attackRange = attacker.radius * 1.5;
	const distance = Math.sqrt(
		Math.pow(attacker.x - target.x, 2) + Math.pow(attacker.y - target.y, 2)
	);

	if (distance > attackRange) {
		return false;
	}
	const isFacingLeft = attacker.isFacingLeft;
	const inFront = isFacingLeft ? target.x < attacker.x : target.x > attacker.x;

	return inFront;
}
