import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function GET(req: NextRequest) {
  try {
    // Adjust the directory path to your upload folder
    const directory = path.join(process.cwd(), "uploads");

    // Read the files in the directory
    const files = await fs.readdir(directory);

    // Delete each file in the directory
    await Promise.all(
      files.map(async (file) => {
        const filePath = path.join(directory, file);
        try {
          await fs.unlink(filePath);
          console.log(`Deleted file: ${file}`);
        } catch (err) {
          console.error(`Failed to delete file: ${file}`, err);
        }
      })
    );

    return NextResponse.json({ message: "Uploads directory cleaned up" });
  } catch (err) {
    console.error("Error cleaning uploads directory:", err);
    return NextResponse.json(
      { error: "Failed to clean uploads directory" },
      { status: 500 }
    );
  }
}
