<script lang="ts">
	// INITIAL HOME BACKGROUND
	// NOT USED ANYMORE, I changed it to HomeBackground3.svelte
	import P5 from '$lib/components/P5.svelte';
	import { palette } from '$lib/utils/palette';
	import { Ball } from '$lib/utils/ball';

	let balls: any[] = [];
	let qt = 100;

	function setup(p5: any) {
		p5.createCanvas(p5.windowWidth, p5.windowHeight);

		for (let i = 0; i < qt; i++) {
			const radius = p5.random(10, 80);

			balls.push(
				new Ball(
					p5.random(radius, p5.windowWidth - radius),
					p5.random(radius, p5.windowHeight - radius),
					radius,
					p5.random(Object.values(palette.primary)),
					p5
				)
			);
		}
	}

	function draw(p5: any) {
		p5.background(255);
		p5.stroke(0);

		p5.fill(palette.primary.yellow);

		p5.ellipse(p5.windowWidth / 2, p5.windowHeight / 2, 300, 300);

		for (const ball of balls) {
			ball.update(p5);
			ball.show(p5);
		}
	}

	function windowResized(p5: any) {
		p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
	}
</script>

<P5 {draw} {setup} {windowResized} />
