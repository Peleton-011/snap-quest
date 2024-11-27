"use client";
import React, { useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import CameraModal from "./components/CameraModal";
import axios from "axios";

interface Tile {
	id: number;
	prompt: string;
	completed: boolean;
	image: string | null;
}

const promptSet = [
	"Find a book with a title that describes us",
	"A book with the weirdest cover",
	"A book you think I’d love",
	"Find a mystery book",
	"Find a book over 500 pages",
];

const App: React.FC = () => {
	const [tiles, setTiles] = useState<Tile[]>(
		promptSet.map((prompt, idx) => ({
			id: idx,
			prompt,
			completed: false,
			image: null,
		}))
	);
	const [activeTile, setActiveTile] = useState<Tile | null>(null);

	const markTileCompleted = (id: number, image: string) => {
		setTiles((prevTiles) =>
			prevTiles.map((tile) =>
				tile.id === id ? { ...tile, completed: true, image } : tile
			)
		);
		setActiveTile(null);
	};

	const [images, setImages] = useState<File[]>([]);
	const [previewUrls, setPreviewUrls] = useState<string[]>([]);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files ? Array.from(e.target.files) : [];
		setImages(files);
		const urls = files.map((file) => URL.createObjectURL(file));
		setPreviewUrls(urls);
	};

	const handleUpload = async () => {
		try {
			const formData = new FormData();
			images.forEach((image) => formData.append("images", image));

			const response = await fetch("/api/images", {
				method: "POST",
				body: formData,
			});

			if (!response.ok) {
				const errorText = await response.text();
				console.error("Upload failed:", errorText);
				throw new Error(errorText);
			}

			console.log("Images uploaded successfully!");
		} catch (error) {
			console.error("Error uploading images:", error);
		}
	};

	const downloadPDF = async () => {
		try {
			const response = await axios.get("/api/images", {
				responseType: "blob",
			});
			const pdfBlob = new Blob([response.data], {
				type: "application/pdf",
			});
			const url = URL.createObjectURL(pdfBlob);
			const link = document.createElement("a");
			link.href = url;
			link.download = "images.pdf";
			link.click();
			URL.revokeObjectURL(url);
		} catch (error) {
			console.error("Failed to download PDF:", error);
		}
	};

	return (
		<>
			<div>
				<h1>Upload and Download Images as PDF</h1>
				<input type="file" multiple onChange={handleFileChange} />
				<button onClick={handleUpload}>Upload Images</button>
				<button onClick={downloadPDF}>Download PDF</button>
				<div>
					{previewUrls.map((url, index) => (
						<img
							key={index}
							src={url}
							alt={`Preview ${index}`}
							width="100"
						/>
					))}
				</div>
			</div>
			<Box p={4}>
				<Typography variant="h4" gutterBottom>
					SnapQuest: Bingo
				</Typography>
				<Grid container spacing={2}>
					{tiles.map((tile) => (
						<Grid item xs={4} key={tile.id}>
							<Button
								fullWidth
								variant={
									tile.completed ? "contained" : "outlined"
								}
								color={tile.completed ? "success" : "primary"}
								onClick={() => setActiveTile(tile)}
							>
								{tile.prompt}
							</Button>
						</Grid>
					))}
				</Grid>
				{activeTile && (
					<CameraModal
						tile={activeTile}
						onClose={() => setActiveTile(null)}
						onSave={markTileCompleted}
					/>
				)}
			</Box>
		</>
	);
};

export default App;
