import { NextRequest, NextResponse } from "next/server";
import formidable, { Fields, Files } from "formidable";
import { promises as fsPromises } from "fs";
import path from "path";

// Ensure the uploads directory exists
const ensureUploadDir = async () => {
  const uploadDir = path.join(process.cwd(), "uploads");
  try {
    await fsPromises.mkdir(uploadDir, { recursive: true });
  } catch (err) {
    console.error("Error ensuring upload directory:", err);
  }
  return uploadDir;
};

// Parse multipart form data using formidable
const parseForm = async (req: NextRequest): Promise<{ fields: Fields; files: Files }> => {
  const uploadDir = await ensureUploadDir();

  const form = formidable({
    multiples: true, // Allow multiple files
    uploadDir, // Directory to save uploaded files
    keepExtensions: true, // Keep file extensions
  });

  return new Promise((resolve, reject) => {
    form.parse(req as any, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
};

// POST endpoint to handle uploads
export async function POST(req: NextRequest) {
  try {
    const { files } = await parseForm(req);

    if (!files.images) {
      return NextResponse.json({ error: "No images uploaded" }, { status: 400 });
    }

    const uploadedFiles = Array.isArray(files.images)
      ? files.images
      : [files.images];

    // Collect file metadata
    const fileDetails = uploadedFiles.map((file) => ({
      filename: file.originalFilename,
      filepath: file.filepath,
    }));

    return NextResponse.json({
      message: "Images uploaded successfully",
      files: fileDetails,
    });
  } catch (error) {
    console.error("Error during file upload:", error);
    return NextResponse.json({ error: "File upload failed" }, { status: 500 });
  }
}

// Config to disable Next.js body parsing for this route
export const config = {
  api: {
    bodyParser: false,
  },
};
