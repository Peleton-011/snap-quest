import { PDFDocument, rgb } from "pdf-lib";

// Define constants for the PDF page size, margins, and minimum row height
const PAGE_WIDTH = 600;
const PAGE_HEIGHT = 800;
const MARGIN = 50;
const MIN_ROW_HEIGHT = 150; // Minimum height for each row (space for image and prompt)

export const generatePDF = async (title: string, tiles: { prompt: string; image: string | null }[]) => {
    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    let yPosition = PAGE_HEIGHT - MARGIN;

    // Add title to the PDF
    page.drawText(title, {
        x: MARGIN,
        y: yPosition,
        size: 24,
        color: rgb(0, 0.53, 0.71),
    });

    yPosition -= 40; // Move down after title

    let imagesInRow = 0; // Track the number of images on the current row
    const imagesPerRow = 2; // We want 2 images per row, you can adjust this to 3 or 4

    for (const tile of tiles) {
        if (yPosition < MIN_ROW_HEIGHT + MARGIN) {
            // If there's not enough space for the next image, add a new page
            page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
            yPosition = PAGE_HEIGHT - MARGIN;
        }

        // Draw the image and its prompt below
        if (tile.image) {
            // Fetch the image and embed it in the PDF
            const imageBytes = await fetch(tile.image).then((res) => res.arrayBuffer());
            const jpgImage = await pdfDoc.embedJpg(imageBytes);

            // Calculate the image size and scale it to fit within the PDF page
            const { width, height } = jpgImage;
            const aspectRatio = width / height;

            let imgWidth = Math.min((PAGE_WIDTH - 2 * MARGIN) / imagesPerRow, width); // Adjust image width for the row
            let imgHeight = imgWidth / aspectRatio;

            // If the image height exceeds the row height, scale it to fit
            if (imgHeight > MIN_ROW_HEIGHT) {
                imgHeight = MIN_ROW_HEIGHT;
                imgWidth = imgHeight * aspectRatio;
            }

            // Calculate xPosition for centering images in the row
            const xPosition = MARGIN + (imagesInRow * (imgWidth + 10));

            // Draw the image
            page.drawImage(jpgImage, {
                x: xPosition,
                y: yPosition - imgHeight, // Position the image above the prompt
                width: imgWidth,
                height: imgHeight,
            });

            // Draw the prompt below the image
            page.drawText(tile.prompt, {
                x: xPosition,
                y: yPosition - imgHeight - 15, // Position prompt below the image
                size: 10,
                color: rgb(0, 0, 0),
                maxWidth: imgWidth, // Ensure the prompt fits below the image
                lineHeight: 12, // Adjust prompt spacing
            });

            // Update yPosition for the next row (move down after image and prompt)
            yPosition -= imgHeight + 30; // Include space for prompt

            imagesInRow++; // Increase the image count in the current row
        } else {
            // If no image, just move down the position
            yPosition -= MIN_ROW_HEIGHT;
        }

        // Start a new row after 2 images (you can change this to 3 or 4 if you prefer)
        if (imagesInRow >= imagesPerRow) {
            imagesInRow = 0;
            yPosition -= MIN_ROW_HEIGHT; // Add space between rows
        }
    }

    const pdfBytes = await pdfDoc.save();
    return new Blob([pdfBytes], { type: "application/pdf" });
};
