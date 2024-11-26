import { Request, Response } from "express";
import fs from "fs";
import path from "path";

export default function GET(req: Request, res: Response) {
    const directory = path.join(__dirname, "../uploads");
    fs.readdir(directory, (err, files) => {
        if (err) {
            return res.status(500).json({ error: "Failed to read uploads directory" });
        }

        files.forEach((file) => {
            fs.unlink(path.join(directory, file), (err) => {
                if (err) {
                    console.error(`Failed to delete file: ${file}`);
                }
            });
        });

        res.json({ message: "Uploads directory cleaned up" });
    });
}
