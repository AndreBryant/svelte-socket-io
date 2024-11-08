/* eslint-disable @typescript-eslint/no-explicit-any */
export const FRAME_SIZE = 32;
export const DEER_SPRITE_ANIMATION_DATA = {
	idle: {
		slowness_factor: 20,
		// TopLeft Corners
		positions: [
			{ x: 0 * FRAME_SIZE, y: 0 * FRAME_SIZE },
			{ x: 1 * FRAME_SIZE, y: 0 * FRAME_SIZE },
			{ x: 2 * FRAME_SIZE, y: 0 * FRAME_SIZE },
			{ x: 3 * FRAME_SIZE, y: 0 * FRAME_SIZE },
			{ x: 4 * FRAME_SIZE, y: 0 * FRAME_SIZE }
		]
	},
	eat_grass: {
		slowness_factor: 12,
		positions: [
			{ x: 0 * FRAME_SIZE, y: 1 * FRAME_SIZE },
			{ x: 1 * FRAME_SIZE, y: 1 * FRAME_SIZE },
			{ x: 2 * FRAME_SIZE, y: 1 * FRAME_SIZE },
			{ x: 3 * FRAME_SIZE, y: 1 * FRAME_SIZE },
			{ x: 4 * FRAME_SIZE, y: 1 * FRAME_SIZE }
		]
	},
	walk: {
		slowness_factor: 4,
		positions: [
			{ x: 0 * FRAME_SIZE, y: 2 * FRAME_SIZE },
			{ x: 1 * FRAME_SIZE, y: 2 * FRAME_SIZE },
			{ x: 2 * FRAME_SIZE, y: 2 * FRAME_SIZE },
			{ x: 3 * FRAME_SIZE, y: 2 * FRAME_SIZE },
			{ x: 4 * FRAME_SIZE, y: 2 * FRAME_SIZE }
		]
	},
	attack: {
		slowness_factor: 4,
		positions: [
			{ x: 0 * FRAME_SIZE, y: 5 * FRAME_SIZE },
			{ x: 1 * FRAME_SIZE, y: 5 * FRAME_SIZE },
			{ x: 2 * FRAME_SIZE, y: 5 * FRAME_SIZE },
			{ x: 3 * FRAME_SIZE, y: 5 * FRAME_SIZE },
			{ x: 4 * FRAME_SIZE, y: 5 * FRAME_SIZE }
		]
	}
};

export function drawPlayer(p5: any, spriteSheet: any, x: number, y: number, player: any) {
	// Player username tag
	p5.textFont('monospace');
	p5.textSize(24);
	p5.textAlign(p5.CENTER, p5.CENTER);
	p5.fill(player.color);
	p5.text(player.name, x, y - player.radius * 1.5);

	// Add this to player class
	const isFacingLeft = player.isFacingLeft;
	const action = player.action;
	const actionData = DEER_SPRITE_ANIMATION_DATA[action];
	const slownessFactor = actionData.slowness_factor;
	const frame = p5.floor(p5.frameCount / slownessFactor) % actionData.positions.length;
	const invisible = player.invincible ? p5.frameCount % 20 < 10 : false;
	if (!invisible) {
		p5.push();
		if (player.invincible) {
			p5.tint(255, 150, 150, 180);
		}
		p5.translate(x, y);
		if (isFacingLeft) {
			p5.scale(-1, 1);
		}

		p5.fill(0, 0, 0, 50);
		p5.noStroke();

		// Player Shadow
		p5.ellipse(0, 0 + 64, player.radius * 2, 16);
		p5.imageMode(p5.CENTER);
		p5.image(
			spriteSheet,
			0,
			0,
			player.radius * 2,
			player.radius * 2,
			actionData.positions[frame].x,
			actionData.positions[frame].y,
			FRAME_SIZE,
			FRAME_SIZE
		);
		p5.pop();
	}
}
