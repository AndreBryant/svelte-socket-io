import { Server, Socket } from 'socket.io';
import { PlayerManager } from './PlayerManager.js';
import { RoomManager } from './RoomManager.js';
import { Player, PLAYER_HIT_RADIUS } from '../Player.js';
import { getRandomColor } from '../palette.js';
import { MAP_HEIGHT, MAP_WIDTH, TILESIZE } from '../map.js';

export class GameServer {
	private io: Server;
	private playerManager = new PlayerManager();
	private roomManager = new RoomManager();

	constructor(io: Server) {
		this.io = io;
	}

	handleConnection(socket: Socket) {
		this.io.emit('rooms_updated', this.roomManager.getRooms());

		socket.on('create_room', (data) => this.handleCreateRoom(socket, data));
		socket.on('join_room', (data) => this.handleJoinRoom(socket, data));
		socket.on('disconnect', () => this.handleDisconnect(socket));
		socket.on('player_key_input', (data) => this.handleKeyInput(socket, data));

		socket.on('start_game', (data) => this.handleStartGame(socket, data));
	}

	private handleCreateRoom(socket: Socket, data: { gameID: string }) {
		this.roomManager.createRoom(data.gameID);
		this.joinRoom(socket, data.gameID, true);
	}

	private handleJoinRoom(socket: Socket, data: { username?: string; gameID: string }) {
		if (!this.roomManager.roomExists(data.gameID)) {
			socket.emit('kicked_from_room', true);
			return;
		}
		this.joinRoom(socket, data.gameID, false, data.username);
		this.io.to(data.gameID).emit('specific_room_updated', this.roomManager.getRoom(data.gameID));
	}

	private handleDisconnect(socket: Socket) {
		const player = this.playerManager.getPlayer(socket.id);
		if (!player) return;

		const gameID = player.room;

		if (player.isHost) {
			const players = this.playerManager.getPlayersInRoom(player.room);

			for (const pl in players) {
				this.playerManager.removePlayer(pl);
				this.roomManager.leaveRoom(gameID);
				this.io.to(players[pl].id).emit('kicked_from_room', true);
			}
		} else {
			this.playerManager.removePlayer(socket.id);
			this.roomManager.leaveRoom(gameID);
		}

		if (this.roomManager.getRoom(player.room)?.players === 0) {
			this.roomManager.removeRoom(player.room);
		}

		this.io.emit('rooms_updated', this.roomManager.getRooms());
		this.io.to(player.room).emit('specific_room_updated', this.roomManager.getRoom(player.room));
		console.log(socket.id + ' disconnected.');
	}

	private handleStartGame(socket: Socket, data: { gameID: string }) {
		console.log('game started');
	}

	private handleKeyInput(
		socket: Socket,
		data: { gameID: string; keyStates: { [key: string]: boolean } }
	) {
		this.playerManager.updateKeyStates(socket.id, data.gameID, data.keyStates);
		this.playerManager.handleMovement(socket.id);
		this.playerManager.handleActions(socket.id);
	}

	private broadcastPlayerUpdates(gameID: string) {
		this.playerManager.updatePlayers(gameID);
		const playersInRoom = this.playerManager.getPlayersInRoom(gameID);
		this.io.to(gameID).emit('player_updated', { players: playersInRoom });
	}

	broadcastAllPlayerUpdates() {
		const rooms = this.roomManager.getRooms();
		for (const room in rooms) {
			this.broadcastPlayerUpdates(room);
		}
	}

	private joinRoom(socket: Socket, gameID: string, isHost = false, username?: string) {
		const x = Math.floor(Math.random() * ((MAP_WIDTH - 2) * TILESIZE - PLAYER_HIT_RADIUS + 1));
		const y = Math.floor(Math.random() * ((MAP_HEIGHT - 2) * TILESIZE - PLAYER_HIT_RADIUS + 1));

		const player = new Player(
			socket.id,
			gameID,
			isHost,
			username || (isHost ? 'Host' : '(>.~) andre cute<3'),
			x,
			y,
			getRandomColor()
		);

		this.playerManager.addPlayer(player);
		this.roomManager.joinRoom(gameID);
		socket.join(gameID);

		this.io.emit('rooms_updated', this.roomManager.getRooms());
		this.io.to(gameID).emit('player_connected', this.roomManager.getRoom(gameID));
		this.io.to(gameID).emit('map_generated', {
			mapData: this.roomManager.getRoom(gameID)?.mapData.tiles,
			height: this.roomManager.getRoom(gameID)?.mapData.height,
			width: this.roomManager.getRoom(gameID)?.mapData.width,
			tileSize: this.roomManager.getRoom(gameID)?.mapData.tileSize
		});

		this.broadcastPlayerUpdates(gameID);
	}
}
