import { NextRequest, NextResponse } from "next/server";
import { promises as fsPromises } from "fs";
import path from "path";
import { PDFDocument } from "pdf-lib";
import formidable from "formidable";

// Directory to temporarily store uploaded images
const uploadDir = path.join(process.cwd(), "uploads");

// Ensure the directory exists
const ensureUploadDir = async () => {
  try {
    await fsPromises.mkdir(uploadDir, { recursive: true });
  } catch (err) {
    console.error("Error ensuring upload directory exists:", err);
  }
};

// Temporary storage for uploaded file paths
let uploadedImages: string[] = [];

// Utility to clean up files
const cleanUp = async (files: string[]) => {
  for (const file of files) {
    try {
      await fsPromises.unlink(file);
    } catch (err) {
      console.error(`Error deleting file ${file}:`, err);
    }
  }
};

// POST endpoint: Handle file upload
export async function POST(req: NextRequest) {
  await ensureUploadDir();

  const form = formidable({
    multiples: true,
    uploadDir: uploadDir,
    keepExtensions: true,
  });

  try {
    const { files } = await new Promise<{ fields: formidable.Fields; files: formidable.Files }>(
      (resolve, reject) => {
        form.parse(req.body as any, (err, fields, files) => {
          if (err) reject(err);
          else resolve({ fields, files });
        });
      }
    );

    if (!files || Object.keys(files).length === 0) {
      return NextResponse.json({ error: "No images uploaded" }, { status: 400 });
    }

    // Safely map file paths
    const fileArray = Array.isArray(files.images) ? files.images : [files.images];
    uploadedImages = fileArray
      .filter((file): file is formidable.File => Boolean(file && "filepath" in file)) // Type guard to ensure `file` is `formidable.File`
      .map((file) => file.filepath);

    return NextResponse.json({ message: "Images uploaded successfully" });
  } catch (error) {
    console.error("Error handling file upload:", error);
    return NextResponse.json({ error: "File upload failed" }, { status: 500 });
  }
}

// GET endpoint: Generate PDF from uploaded images
export async function GET() {
  if (uploadedImages.length === 0) {
    return NextResponse.json({ error: "No images available for PDF" }, { status: 400 });
  }

  try {
    const pdfDoc = await PDFDocument.create();

    for (const imagePath of uploadedImages) {
      const imageBytes = await fsPromises.readFile(imagePath);
      const image = await pdfDoc.embedJpg(imageBytes); // Use embedPng for PNG images
      const page = pdfDoc.addPage([image.width, image.height]);
      page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
    }

    const pdfBytes = await pdfDoc.save();

    // Clean up uploaded images
    await cleanUp(uploadedImages);
    uploadedImages = [];

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="images.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}
