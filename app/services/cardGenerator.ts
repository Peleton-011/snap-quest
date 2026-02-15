import { Tile } from "@/app/types/types";

// ── Theme constants (matching app theme) ──────────────────────────
const BG_COLOR = "#121212";
const SURFACE_COLOR = "#1e1e1e";
const PRIMARY_COLOR = "#57e389";
const TEXT_COLOR = "#ffffff";
const TEXT_SECONDARY = "#b3b3b3";

// ── Canvas sizes ──────────────────────────────────────────────────
// Single card: Instagram portrait (4:5)
const CARD_W = 1080;
const CARD_H = 1350;

// Story image: Instagram story (9:16)
const STORY_W = 1080;
const STORY_H = 1920;

// ── Helpers ───────────────────────────────────────────────────────

/** Load an image from a blob URL and return an HTMLImageElement. */
function loadImage(src: string): Promise<HTMLImageElement> {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.crossOrigin = "anonymous";
		img.onload = () => resolve(img);
		img.onerror = reject;
		img.src = src;
	});
}

/** Draw rounded rectangle (for card backgrounds). */
function roundRect(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	w: number,
	h: number,
	r: number
) {
	ctx.beginPath();
	ctx.moveTo(x + r, y);
	ctx.lineTo(x + w - r, y);
	ctx.quadraticCurveTo(x + w, y, x + w, y + r);
	ctx.lineTo(x + w, y + h - r);
	ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
	ctx.lineTo(x + r, y + h);
	ctx.quadraticCurveTo(x, y + h, x, y + h - r);
	ctx.lineTo(x, y + r);
	ctx.quadraticCurveTo(x, y, x + r, y);
	ctx.closePath();
}

/**
 * Draw an image into a box, covering it (like CSS object-fit: cover).
 * Clips to the box area with optional rounded corners.
 */
function drawImageCover(
	ctx: CanvasRenderingContext2D,
	img: HTMLImageElement,
	x: number,
	y: number,
	boxW: number,
	boxH: number,
	radius = 0
) {
	const imgRatio = img.width / img.height;
	const boxRatio = boxW / boxH;

	let sx = 0,
		sy = 0,
		sw = img.width,
		sh = img.height;

	if (imgRatio > boxRatio) {
		// Image is wider than box — crop sides
		sw = img.height * boxRatio;
		sx = (img.width - sw) / 2;
	} else {
		// Image is taller — crop top/bottom
		sh = img.width / boxRatio;
		sy = (img.height - sh) / 2;
	}

	ctx.save();
	if (radius > 0) {
		roundRect(ctx, x, y, boxW, boxH, radius);
		ctx.clip();
	}
	ctx.drawImage(img, sx, sy, sw, sh, x, y, boxW, boxH);
	ctx.restore();
}

/**
 * Word-wrap text and draw it. Returns the total height used.
 */
function drawWrappedText(
	ctx: CanvasRenderingContext2D,
	text: string,
	x: number,
	y: number,
	maxWidth: number,
	lineHeight: number
): number {
	const words = text.split(" ");
	let line = "";
	let curY = y;

	for (const word of words) {
		const testLine = line ? `${line} ${word}` : word;
		const metrics = ctx.measureText(testLine);
		if (metrics.width > maxWidth && line) {
			ctx.fillText(line, x, curY);
			line = word;
			curY += lineHeight;
		} else {
			line = testLine;
		}
	}
	ctx.fillText(line, x, curY);
	return curY - y + lineHeight;
}

/** Convert a canvas to a PNG Blob. */
function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
	return new Promise((resolve, reject) => {
		canvas.toBlob(
			(blob) => {
				if (blob) resolve(blob);
				else reject(new Error("Canvas toBlob returned null"));
			},
			"image/png",
			1.0
		);
	});
}

// ── Public API ────────────────────────────────────────────────────

/**
 * Generate a single styled card image for one tile.
 *
 * Layout (1080x1350):
 *   ┌──────────────────────┐
 *   │  SnapQuest: SetName  │  ← title bar with green accent
 *   │                      │
 *   │   ┌──────────────┐   │
 *   │   │              │   │
 *   │   │    PHOTO     │   │
 *   │   │              │   │
 *   │   └──────────────┘   │
 *   │                      │
 *   │  "Prompt text here"  │  ← prompt in white
 *   │                      │
 *   │         SnapQuest    │  ← subtle branding
 *   └──────────────────────┘
 */
export async function generateCardImage(
	tile: Tile,
	title: string,
	language: string
): Promise<Blob> {
	const canvas = document.createElement("canvas");
	canvas.width = CARD_W;
	canvas.height = CARD_H;
	const ctx = canvas.getContext("2d")!;

	const pad = 60;

	// Background
	ctx.fillStyle = BG_COLOR;
	ctx.fillRect(0, 0, CARD_W, CARD_H);

	// Green accent bar at top
	ctx.fillStyle = PRIMARY_COLOR;
	ctx.fillRect(0, 0, CARD_W, 6);

	// Title
	let y = 60;
	ctx.fillStyle = PRIMARY_COLOR;
	ctx.font = "bold 36px Helvetica, Arial, sans-serif";
	ctx.fillText(title, pad, y);
	y += 50;

	// Photo
	if (tile.image) {
		const img = await loadImage(tile.image);
		const photoX = pad;
		const photoW = CARD_W - pad * 2;
		const photoMaxH = 850;

		// Determine actual height based on aspect ratio, capped
		const imgRatio = img.width / img.height;
		let photoH = photoW / imgRatio;
		if (photoH > photoMaxH) photoH = photoMaxH;

		drawImageCover(ctx, img, photoX, y, photoW, photoH, 16);
		y += photoH + 40;
	}

	// Prompt text
	ctx.fillStyle = TEXT_COLOR;
	ctx.font = "32px Helvetica, Arial, sans-serif";
	const promptText =
		tile.prompt.fullPrompt[language] ||
		tile.prompt.fullPrompt["en"] ||
		"";
	const textHeight = drawWrappedText(
		ctx,
		`"${promptText}"`,
		pad,
		y,
		CARD_W - pad * 2,
		42
	);
	y += textHeight + 20;

	// Bottom branding
	ctx.fillStyle = TEXT_SECONDARY;
	ctx.font = "24px Helvetica, Arial, sans-serif";
	ctx.fillText("SnapQuest", pad, CARD_H - 40);

	// Small green dot before branding
	ctx.fillStyle = PRIMARY_COLOR;
	ctx.beginPath();
	ctx.arc(pad - 16, CARD_H - 47, 5, 0, Math.PI * 2);
	ctx.fill();

	return canvasToBlob(canvas);
}

/**
 * Generate a story-style image with all completed tiles.
 *
 * Layout (1080x1920):
 *   ┌──────────────────────┐
 *   │  SnapQuest: SetName  │
 *   │                      │
 *   │ ┌────┐ ┌────┐ ┌────┐│  ← photos in grid
 *   │ │    │ │    │ │    ││
 *   │ │    │ │    │ │    ││
 *   │ └────┘ └────┘ └────┘│
 *   │  txt    txt    txt   │
 *   │                      │
 *   │ ┌────┐ ┌────┐ ┌────┐│
 *   │ │    │ │    │ │    ││
 *   │ └────┘ └────┘ └────┘│
 *   │  txt    txt    txt   │
 *   │                      │
 *   │         SnapQuest    │
 *   └──────────────────────┘
 */
export async function generateStoryImage(
	tiles: Tile[],
	title: string,
	language: string
): Promise<Blob> {
	const completedTiles = tiles.filter((t) => t.completed && t.image);

	// Decide grid layout based on count
	const count = completedTiles.length;
	let cols: number;
	if (count <= 2) cols = 1;
	else if (count <= 6) cols = 2;
	else cols = 3;

	const rows = Math.ceil(count / cols);

	const pad = 50;
	const gap = 16;
	const titleAreaH = 120;
	const brandingH = 80;
	const promptTextH = 60; // space under each row for prompt text

	// Calculate available space for photos
	const gridW = STORY_W - pad * 2;
	const cellW = (gridW - gap * (cols - 1)) / cols;

	// Calculate how much vertical space we have for each row
	const availableH =
		STORY_H - titleAreaH - brandingH - pad - rows * promptTextH - gap * (rows - 1);
	const cellH = Math.min(cellW * 1.2, availableH / rows);

	const canvas = document.createElement("canvas");
	canvas.width = STORY_W;
	canvas.height = STORY_H;
	const ctx = canvas.getContext("2d")!;

	// Background
	ctx.fillStyle = BG_COLOR;
	ctx.fillRect(0, 0, STORY_W, STORY_H);

	// Green accent bar at top
	ctx.fillStyle = PRIMARY_COLOR;
	ctx.fillRect(0, 0, STORY_W, 6);

	// Title
	ctx.fillStyle = PRIMARY_COLOR;
	ctx.font = "bold 42px Helvetica, Arial, sans-serif";
	ctx.fillText(title, pad, 70);

	// Grid
	let y = titleAreaH;

	for (let row = 0; row < rows; row++) {
		for (let col = 0; col < cols; col++) {
			const idx = row * cols + col;
			if (idx >= count) break;

			const tile = completedTiles[idx];
			const x = pad + col * (cellW + gap);

			// Card surface behind photo
			ctx.fillStyle = SURFACE_COLOR;
			roundRect(ctx, x, y, cellW, cellH, 12);
			ctx.fill();

			// Photo
			if (tile.image) {
				const img = await loadImage(tile.image);
				drawImageCover(ctx, img, x, y, cellW, cellH, 12);
			}

			// Prompt text below photo
			const promptText =
				tile.prompt.fullPrompt[language] ||
				tile.prompt.fullPrompt["en"] ||
				"";
			ctx.fillStyle = TEXT_SECONDARY;
			ctx.font = "20px Helvetica, Arial, sans-serif";

			// Truncate if needed
			const maxTextW = cellW;
			let displayText = promptText;
			while (
				ctx.measureText(displayText).width > maxTextW &&
				displayText.length > 0
			) {
				displayText = displayText.slice(0, -1);
			}
			if (displayText.length < promptText.length) {
				displayText = displayText.slice(0, -1) + "…";
			}

			ctx.fillText(displayText, x, y + cellH + 28);
		}
		y += cellH + promptTextH + gap;
	}

	// Bottom branding
	ctx.fillStyle = TEXT_SECONDARY;
	ctx.font = "28px Helvetica, Arial, sans-serif";
	ctx.fillText("SnapQuest", pad, STORY_H - 40);
	ctx.fillStyle = PRIMARY_COLOR;
	ctx.beginPath();
	ctx.arc(pad - 18, STORY_H - 48, 6, 0, Math.PI * 2);
	ctx.fill();

	return canvasToBlob(canvas);
}

/**
 * Generate all card images as an array of blobs (one per completed tile).
 * Useful for carousel-style sharing.
 */
export async function generateCarouselImages(
	tiles: Tile[],
	title: string,
	language: string
): Promise<Blob[]> {
	const completedTiles = tiles.filter((t) => t.completed && t.image);
	const blobs: Blob[] = [];

	for (const tile of completedTiles) {
		const blob = await generateCardImage(tile, title, language);
		blobs.push(blob);
	}

	return blobs;
}
