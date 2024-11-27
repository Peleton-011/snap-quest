import { PDFDocument, rgb } from "pdf-lib";

const PAGE_WIDTH = 600;
const PAGE_HEIGHT = 800;
const MARGIN = 50;
const ROW_HEIGHT = 120; // Space for one row of image and text
const IMAGE_WIDTH = 100;
const IMAGE_HEIGHT = 100;

export const generatePDF = async (title: string, tiles: { prompt: string; image: string | null }[]) => {
  const pdfDoc = await PDFDocument.create();

  let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let yPosition = PAGE_HEIGHT - MARGIN;

  page.drawText(title, {
    x: MARGIN,
    y: yPosition,
    size: 24,
    color: rgb(0, 0.53, 0.71),
  });

  yPosition -= 40; // Move down after title

  for (const tile of tiles) {
    if (yPosition < MARGIN + ROW_HEIGHT) {
      page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      yPosition = PAGE_HEIGHT - MARGIN;
    }

    page.drawText(tile.prompt, {
      x: MARGIN + IMAGE_WIDTH + 10,
      y: yPosition - IMAGE_HEIGHT / 2,
      size: 12,
      color: rgb(0, 0, 0),
    });

    if (tile.image) {
      const imageBytes = await fetch(tile.image).then((res) => res.arrayBuffer());
      const jpgImage = await pdfDoc.embedJpg(imageBytes);
      page.drawImage(jpgImage, {
        x: MARGIN,
        y: yPosition - IMAGE_HEIGHT,
        width: IMAGE_WIDTH,
        height: IMAGE_HEIGHT,
      });
    }

    yPosition -= ROW_HEIGHT; // Move down for the next row
  }

  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes], { type: "application/pdf" });
};
