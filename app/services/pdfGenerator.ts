import { PDFDocument, PDFPage, rgb, StandardFonts } from "pdf-lib";

// Define constants for the PDF page size, margins, and sizes
const PAGE_WIDTH = 600;
const PAGE_HEIGHT = 800;
const MARGIN = 30;
const BASE_UNIT = 120; // Base unit for tile sizes

// Colors
const PRIMARY_COLOR = rgb(0.341, 0.89, 0.537);
const BACKGROUND_COLOR = rgb(0.071, 0.071, 0.071);
const FOREGROUND_COLOR = rgb(1, 1, 1);

// Define possible tile sizes based on orientation
const TILE_SIZES = {
	portrait: [
		{ width: 1, height: 1 }, // 1x1
		{ width: 1, height: 2 }, // 1x2
		{ width: 2, height: 2 }, // 2x2
	],
	landscape: [
		{ width: 1, height: 1 }, // 1x1
		{ width: 2, height: 1 }, // 2x1
		{ width: 2, height: 2 }, // 2x2
	],
};

interface Tile {
	prompt: string;
	image: string | null;
	width?: number;
	height?: number;
}

interface Position {
	x: number;
	y: number;
	width: number;
	height: number;
}

export async function generatePDF(title: string, tiles: Tile[]) {
	const pdfDoc = await PDFDocument.create();
	let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
	const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
	let currentY = PAGE_HEIGHT - MARGIN;

	// Helper function to determine image orientation
	const getImageOrientation = (
		width: number,
		height: number
	): "portrait" | "landscape" => {
		return height > width ? "portrait" : "landscape";
	};

	// Helper function to get random tile size based on orientation
	const getRandomTileSize = (orientation: "portrait" | "landscape") => {
		const sizes = TILE_SIZES[orientation];
		return sizes[Math.floor(Math.random() * sizes.length)];
	};

	// Function to draw background
	const drawBackground = (page: PDFPage) => {
		page.drawRectangle({
			x: 0,
			y: 0,
			width: PAGE_WIDTH,
			height: PAGE_HEIGHT,
			color: BACKGROUND_COLOR,
		});
	};

	// Function to add new page
	const addNewPage = () => {
		page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
		drawBackground(page);
		currentY = PAGE_HEIGHT - MARGIN;
		return page;
	};

	// Initialize the first page
	drawBackground(page);

	// Draw title
	page.drawText(title, {
		x: MARGIN,
		y: currentY,
		size: 24,
		font: boldFont,
		color: PRIMARY_COLOR,
	});
	currentY -= 50;

	// Track available spaces on the current row
	let availableWidth = PAGE_WIDTH - 2 * MARGIN;
	let xPosition = MARGIN;
	let rowHeight = 0;

	// Process each tile
	for (const tile of tiles) {
		if (!tile.image) continue;

		try {
			// Fetch and embed image
			const imageBytes = await fetch(tile.image).then((res) =>
				res.arrayBuffer()
			);
			const imageObj = tile.image.endsWith(".png")
				? await pdfDoc.embedPng(imageBytes)
				: await pdfDoc.embedJpg(imageBytes);

			const orientation = getImageOrientation(
				imageObj.width,
				imageObj.height
			);
			const tileSize = getRandomTileSize(orientation);

			// Calculate actual dimensions
			const tileWidth = tileSize.width * BASE_UNIT;
			const tileHeight = tileSize.height * BASE_UNIT;

			// Check if we need to start a new row or page
			if (xPosition + tileWidth > PAGE_WIDTH - MARGIN) {
				xPosition = MARGIN;
				currentY -= rowHeight + 20;
				rowHeight = 0;
			}

			// Check if we need a new page
			if (currentY - tileHeight < MARGIN) {
				page = addNewPage();
				xPosition = MARGIN;
				rowHeight = 0;
			}

			// Calculate image dimensions preserving aspect ratio
			const aspectRatio = imageObj.width / imageObj.height;
			let imgWidth = tileWidth - 10;
			let imgHeight = imgWidth / aspectRatio;

			if (imgHeight > tileHeight - 30) {
				imgHeight = tileHeight - 30;
				imgWidth = imgHeight * aspectRatio;
			}

			// Draw tile background
			page.drawRectangle({
				x: xPosition,
				y: currentY - tileHeight,
				width: tileWidth - 5,
				height: tileHeight - 5,
				color: rgb(0.1, 0.1, 0.1),
				borderColor: PRIMARY_COLOR,
				borderWidth: 1,
			});

			// Draw image
			page.drawImage(imageObj, {
				x: xPosition + (tileWidth - imgWidth) / 2,
				y: currentY - tileHeight + (tileHeight - imgHeight) / 2,
				width: imgWidth,
				height: imgHeight,
			});

			// Draw prompt
			const promptWidth = tileWidth - 20;
			page.drawText(tile.prompt, {
				x: xPosition + 10,
				y: currentY - tileHeight + 10,
				size: 10,
				color: FOREGROUND_COLOR,
				maxWidth: promptWidth,
				lineHeight: 12,
			});

			// Update positions
			xPosition += tileWidth;
			rowHeight = Math.max(rowHeight, tileHeight);
		} catch (error) {
			console.error(`Error processing image:`, error);
			continue;
		}
	}

	const pdfBytes = await pdfDoc.save();
	return new Blob([pdfBytes], { type: "application/pdf" });
}
