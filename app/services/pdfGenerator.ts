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
	const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
	let yPosition = PAGE_HEIGHT - MARGIN;

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

		for (let tile of tiles) {
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

				// Limit the image size to fit within max dimensions
				const maxDimension = 250;
				let imgWidth = width;
				let imgHeight = height;

				if (imgWidth > maxDimension) {
					imgWidth = maxDimension;
					imgHeight = imgWidth / aspectRatio;
				}

				if (imgHeight > maxDimension) {
					imgHeight = maxDimension;
					imgWidth = imgHeight * aspectRatio;
				}

				const totalHeight = imgHeight + 30; // Image height + space for prompt

				// Check if there's space for the image and prompt
				if (yPosition - totalHeight < MARGIN) {
					addNewPage();
					xPosition = MARGIN;
					rowHeight = 0;
				}

				// Check if the image fits horizontally
				if (xPosition + imgWidth + MARGIN > PAGE_WIDTH) {
					xPosition = MARGIN;
					yPosition -= rowHeight; // Move yPosition down by the row height
					rowHeight = 0;

					// Check again if there's enough vertical space
					if (yPosition - totalHeight < MARGIN) {
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
					y: yPosition - imgHeight - 15,
					size: 12,
					color: FOREGROUND_COLOR,
					maxWidth: imgWidth,
					lineHeight: 14,
				});

				// Update rowHeight and xPosition
				rowHeight = Math.max(rowHeight, totalHeight);
				xPosition += imgWidth + MARGIN;
			}
		}

		yPosition -= rowHeight; // Final adjustment after all rows
	};

	// Draw the background for the first page
	drawBackground(page);

	// Add the title to the first page
	page.drawText(title, {
		x: MARGIN,
		y: yPosition,
		size: 24,
		color: PRIMARY_COLOR,
		font: boldFont,
	});

	yPosition -= 40; // Space after the title

	// Draw images and prompts
	await drawImages();

	// Finalize the PDF
	const pdfBytes = await pdfDoc.save();
	return new Blob([pdfBytes], { type: "application/pdf" });
}
