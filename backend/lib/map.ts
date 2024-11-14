export const MAP_HEIGHT = 160;
export const MAP_WIDTH = 160;
export const INITIAL_SAFEZONE_BOUNDARY = 160;
export const TILESIZE = 32;

export enum MapTile {
	Walkable = '=',
	Wall = '#'
}

export class Map {
	width: number;
	height: number;
	tiles: string;
	tileSize: number;
	safeZoneBoundary: number;

	constructor() {
		this.width = MAP_WIDTH;
		this.height = MAP_HEIGHT;
		this.safeZoneBoundary = INITIAL_SAFEZONE_BOUNDARY + 20;
		this.tiles = '';
		this.tileSize = TILESIZE;
		this.generateMap();
	}

	private generateMap() {
		this.tiles = '';
		for (let i = 0; i < this.height; i++) {
			for (let j = 0; j < this.width; j++) {
				if (i == 0 || i == this.height - 1 || j == 0 || j == this.width - 1) {
					this.tiles += MapTile.Wall;
				} else {
					this.tiles += MapTile.Walkable;
				}
			}
		}
	}

	getMap() {
		return this.tiles;
	}

	decreaseSafeZone(): number {
		this.safeZoneBoundary -= 20;
		return this.safeZoneBoundary;
	}

	resetSafeZone() {
		this.safeZoneBoundary = INITIAL_SAFEZONE_BOUNDARY + 20;
	}
}
