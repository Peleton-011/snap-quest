import { PDFDocument, rgb } from "pdf-lib";

// Define constants for the PDF page size, margins, and minimum row height
const PAGE_WIDTH = 600;
const PAGE_HEIGHT = 800;
const MARGIN = 50;
const MIN_ROW_HEIGHT = 150; // Minimum height for each row (space for image and prompt)

// Define theme colors based on the app's dark theme
const PRIMARY_COLOR = rgb(0.341, 0.89, 0.537); // #57e389 (Primary color)
const BACKGROUND_COLOR = rgb(0.071, 0.071, 0.071); // #121212 (Dark background color)
const FOREGROUND_COLOR = rgb(1, 1, 1); // #ffffff (Primary text color)

// Store image positions for each row
let rowImages: { x: number; width: number; imageHeight: number }[] = [];

export async function generatePDF(
	title: string,
	tiles: { prompt: string; image: string | null }[]
) {
	const pdfDoc = await PDFDocument.create();
	let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
	let yPosition = PAGE_HEIGHT - MARGIN;

	// Function to draw the background
	const drawBackground = (page: any) => {
		page.drawRectangle({
			x: 0,
			y: 0,
			width: PAGE_WIDTH,
			height: PAGE_HEIGHT,
			color: BACKGROUND_COLOR, // Set background color to match dark theme
		});
	};

	// Function to draw images and prompts
	const drawImages = async (page: any) => {
		let xPosition = MARGIN;
		let rowHeight = 0; // Start with zero height for the row

		for (let i = 0; i < tiles.length; i++) {
			const tile = tiles[i];
			const image = tile.image;
			const prompt = tile.prompt;

			if (image) {
				// Fetch and embed image
				const imageBytes = await fetch(image).then((res) =>
					res.arrayBuffer()
				);
				const imageObj = await pdfDoc.embedJpg(imageBytes);
				const { width, height } = imageObj;
				const aspectRatio = width / height;

				// Set maximum dimensions for the image
				const maxWidth = PAGE_WIDTH - 2 * MARGIN;
				const maxHeight = PAGE_HEIGHT - 2 * MARGIN;

				// Calculate scaled dimensions
				let imgWidth = width;
				let imgHeight = height;

				// Check for width constraint
				if (imgWidth > maxWidth) {
					imgWidth = maxWidth;
					imgHeight = imgWidth / aspectRatio;
				}

				// Check for height constraint (after width adjustment)
				if (imgHeight > maxHeight) {
					imgHeight = maxHeight;
					imgWidth = imgHeight * aspectRatio;
				}

				// Check if the image fits in the current row
				if (xPosition + imgWidth + MARGIN > PAGE_WIDTH) {
					// Move to the next row if the image doesn't fit
					xPosition = MARGIN;
					yPosition -= rowHeight; // Move the yPosition down by the row height
					rowHeight = 0; // Reset row height for the new row
				}

				// Draw the image
				page.drawImage(imageObj, {
					x: xPosition,
					y: yPosition - imgHeight, // Adjust Y position to place image within row
					width: imgWidth,
					height: imgHeight,
				});

				// Draw the prompt below the image
				page.drawText(prompt, {
					x: xPosition,
					y: yPosition - imgHeight - 15, // Position prompt below the image
					size: 12,
					color: FOREGROUND_COLOR, // Use the foreground color for the prompt
					maxWidth: imgWidth, // Ensure the prompt fits below the image
					lineHeight: 14, // Adjust prompt spacing
				});

				// Update the row height to the tallest image in the row
				rowHeight = Math.max(rowHeight, imgHeight + 30); // 30 for text space

				// Update the xPosition for the next image
				xPosition += imgWidth + MARGIN;
			}
		}

		// After all images, update yPosition to prepare for the next row
		yPosition -= rowHeight;
	};

	drawBackground(page);

	// Add title to the PDF with the foreground color
	page.drawText(title, {
		x: MARGIN,
		y: yPosition,
		size: 24,
		color: PRIMARY_COLOR, // Use the primary theme color for title
	});

	yPosition -= 40; // Move down after title

	// Call the drawImages function to draw the images and prompts
	await drawImages(page);

	// Finalize the PDF
	const pdfBytes = await pdfDoc.save();
	return new Blob([pdfBytes], { type: "application/pdf" });
}
