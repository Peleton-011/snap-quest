import { Request, Response } from "express";
import multer from "multer";
import path from "path";

// Multer setup for file uploads
import { upload } from "../utils/multerConfig";

export async function POST(req: Request, res: Response) {
	upload.single("photo")(req, res, (err) => {
		if (err) {
			return res.status(400).json({ error: "File upload failed" });
		}

		const file = req.file;
		if (!file) {
			return res.status(400).json({ error: "No file uploaded" });
		}

		// Return uploaded file path
		const fileUrl = `/uploads/${file.filename}`;
		res.json({ url: fileUrl });
	});
}
