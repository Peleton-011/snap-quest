import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import fs from "fs";

const app = express();
app.use(cors());
app.use(express.json());

// Set up multer for image uploads
const upload = multer({ dest: "uploads/" });

// Static folder for uploaded images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Endpoint to fetch prompt sets
const promptSets = {
    default: [
        "Find a book with a title that describes us",
        "A book with the weirdest cover",
        "A book you think I’d love",
    ],
    bookstore: [
        "Find a cookbook",
        "A book with a red cover",
        "A book published before 2000",
    ],
};

app.get("/prompts/:set", (req, res) => {
    const set = req.params.set;
    res.json(promptSets[set] || promptSets.default);
});

// Endpoint to handle image uploads
app.post("/upload", upload.single("photo"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }

    // Return the file URL for frontend to display
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ url: fileUrl });
});

// Clean up uploaded files (optional for production)
app.get("/cleanup", (req, res) => {
    const directory = path.join(__dirname, "uploads");
    fs.readdir(directory, (err, files) => {
        if (err) throw err;

        for (const file of files) {
            fs.unlink(path.join(directory, file), (err) => {
                if (err) throw err;
            });
        }
        res.send("Uploads cleaned up");
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));