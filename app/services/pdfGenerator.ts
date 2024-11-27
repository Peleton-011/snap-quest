import { PDFDocument, rgb } from "pdf-lib";

export const generatePDF = async (tiles: { prompt: string; image: string | null }[]) => {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 800]);

  page.drawText("SnapQuest Bingo", { x: 50, y: 750, size: 24, color: rgb(0, 0.53, 0.71) });

  let y = 700;
  for (const tile of tiles) {
    page.drawText(tile.prompt, { x: 50, y, size: 12 });

    if (tile.image) {
      const imageBytes = await fetch(tile.image).then((res) => res.arrayBuffer());
      const jpgImage = await pdfDoc.embedJpg(imageBytes);
      page.drawImage(jpgImage, { x: 50, y: y - 60, width: 100, height: 100 });
    }

    y -= 120;
    if (y < 100) {
      y = 700;
      pdfDoc.addPage([600, 800]);
    }
  }

  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes], { type: "application/pdf" });
};
