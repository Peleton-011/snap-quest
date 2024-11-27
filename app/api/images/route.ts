import { NextRequest, NextResponse } from "next/server";
import { promises as fsPromises } from "fs";
import path from "path";
import { PDFDocument } from "pdf-lib";
import multer from "multer";
import { NextApiRequest, NextApiResponse } from "next";

// Temporary storage setup using multer
const uploadDir = path.join(process.cwd(), "uploads");
const upload = multer({ dest: uploadDir });

// Middleware to handle multipart form data
const multerMiddleware = (req: any, res: any, next: any) => {
  upload.array("images", 25)(req, res, (err: any) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "File upload failed" });
    }
    next();
  });
};

// Temporary storage for file paths
let uploadedImages: string[] = [];

// Utility function to clean up files
const cleanUp = async (files: string[]) => {
  for (const file of files) {
    try {
      await fsPromises.unlink(file);
    } catch (err) {
      console.error(`Error deleting file ${file}:`, err);
    }
  }
};

// POST endpoint to upload images
export async function POST(req: NextRequest & NextApiRequest, res: NextApiResponse) {
  return new Promise((resolve) => {
    multerMiddleware(req, res, async () => {
      const files = (req as any).files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return resolve(
          NextResponse.json({ error: "No images uploaded" }, { status: 400 })
        );
      }

      // Store file paths temporarily
      uploadedImages = files.map((file) => file.path);

      resolve(
        NextResponse.json({ message: "Images uploaded successfully" })
      );
    });
  });
}

// GET endpoint to generate and return a PDF
export async function GET(req: NextRequest) {
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
    console.error(error);
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}
