import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

// Define constants for the PDF page size, margins, and minimum row height
const PAGE_WIDTH = 600;
const PAGE_HEIGHT = 800;
const MARGIN = 50;
const MIN_ROW_HEIGHT = 150; // Minimum height for each row (space for image and prompt)

// Define theme colors based on the app's dark theme
const PRIMARY_COLOR = rgb(0.341, 0.89, 0.537); // #57e389 (Primary color)
const BACKGROUND_COLOR = rgb(0.071, 0.071, 0.071); // #121212 (Dark background color)
const FOREGROUND_COLOR = rgb(1, 1, 1); // #ffffff (Primary text color)

export async function generatePDF(
	title: string,
	tiles: { prompt: string; image: string | null }[]
) {
	const pdfDoc = await PDFDocument.create();
	let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
	let yPosition = PAGE_HEIGHT - MARGIN;
	const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

	// Function to draw the background on a page
	const drawBackground = (page: any) => {
		page.drawRectangle({
			x: 0,
			y: 0,
			width: PAGE_WIDTH,
			height: PAGE_HEIGHT,
			color: BACKGROUND_COLOR,
		});
	};

	// Function to add a new page and reset `yPosition`
	const addNewPage = () => {
		page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
		drawBackground(page);
		yPosition = PAGE_HEIGHT - MARGIN;
	};

	// Function to draw images and prompts
	const drawImages = async () => {
		let xPosition = MARGIN;
		let rowHeight = 0;

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
				const maxDimension = 250; // Max width or height is limited
				let imgWidth = width;
				let imgHeight = height;

				// Check if the width exceeds the max dimension
				if (imgWidth > maxDimension) {
					imgWidth = maxDimension;
					imgHeight = imgWidth / aspectRatio;
				}

				// Check if the height exceeds the max dimension
				if (imgHeight > maxDimension) {
					imgHeight = maxDimension;
					imgWidth = imgHeight * aspectRatio;
				}

				// If the row's yPosition doesn't have enough space for the current image, add a new page
				if (yPosition - imgHeight - 30 < MARGIN) {
					addNewPage();
					xPosition = MARGIN; // Reset xPosition for the new page
					rowHeight = 0; // Reset row height for the new page
				}

				// Check if the image fits in the current row
				if (xPosition + imgWidth + MARGIN > PAGE_WIDTH) {
					// Move to the next row if the image doesn't fit
					xPosition = MARGIN;
					yPosition -= rowHeight; // Move the yPosition down by the row height
					rowHeight = 0;

					// If there's no space for a new row, add a new page
					if (yPosition - imgHeight - 30 < MARGIN) {
						addNewPage();
						xPosition = MARGIN;
					}
				}

				// Draw the image
				page.drawImage(imageObj, {
					x: xPosition,
					y: yPosition - imgHeight,
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

	// Draw the background for the first page
	drawBackground(page);

	// Add title to the first page
	page.drawText(title, {
		x: MARGIN,
		y: yPosition,
		size: 24,
		color: PRIMARY_COLOR, // Use the primary theme color for title
		font: boldFont,
	});

	yPosition -= 40; // Move down after title

	// Draw all images and prompts
	await drawImages();

	// Finalize the PDF
	const pdfBytes = await pdfDoc.save();
	return new Blob([pdfBytes], { type: "application/pdf" });
}
