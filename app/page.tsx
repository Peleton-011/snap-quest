"use client";

import React, { useState, useEffect } from "react";
import { Box, Button, Typography, Grid } from "@mui/material";
import CameraModal from "./components/CameraModal";
import { fetchPrompts } from "./services/api";
import { generatePDF } from "./services/pdfGenerator";
import { downloadImagesAsZip } from "./services/zipImages";

interface Tile {
	id: number;
	prompt: string;
	completed: boolean;
	image: string | null;
}

const App: React.FC = () => {
	const [tiles, setTiles] = useState<Tile[]>([]);
	const [activeTile, setActiveTile] = useState<Tile | null>(null);
	const [promptSet, setPromptSet] = useState("select"); // Track the selected prompt set
	const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
	const [isDownloadingImages, setIsDownloadingImages] = useState(false);

	// Load prompts dynamically from the server
	useEffect(() => {
		const loadPrompts = async () => {
			try {
				const prompts = await fetchPrompts(promptSet);
				setTiles(
					prompts.map((prompt: string, idx: number) => ({
						id: idx,
						prompt,
						completed: false,
						image: null,
					}))
				);
			} catch (error) {
				console.error("Failed to load prompts:", error);
			}
		};
		loadPrompts();
	}, [promptSet]);

	// Mark a tile as completed and save its image
	const markTileCompleted = (id: number, image: string) => {
		setTiles((prevTiles) =>
			prevTiles.map((tile) =>
				tile.id === id ? { ...tile, completed: true, image } : tile
			)
		);
		setActiveTile(null);
	};

	// Generate and download the PDF
	const downloadPDF = async () => {
		try {
			setIsGeneratingPDF(true);
			const pdfBlob = await generatePDF("SnapQuest: " + promptSet, tiles);
			const url = URL.createObjectURL(pdfBlob);
			const link = document.createElement("a");
			link.href = url;
			link.download = "snapquest-bingo.pdf";
			link.click();
			URL.revokeObjectURL(url);
		} catch (error) {
			console.error("Failed to generate PDF:", error);
		} finally {
			setIsGeneratingPDF(false);
		}
	};

	// Download all images as a zip file
	const downloadImages = async () => {
		try {
			setIsDownloadingImages(true);
			await downloadImagesAsZip(tiles);
		} catch (error) {
			console.error("Failed to download images:", error);
		} finally {
			setIsDownloadingImages(false);
		}
	};

	return (
		<Box p={4}>
			<Typography variant="h4" gutterBottom>
				SnapQuest: Scavenger Hunt Bingo
			</Typography>

			{/* Dropdown for prompt set selection */}
			<Box mb={2}>
				<Typography>Select a Prompt Set:</Typography>
				<select
					value={promptSet}
					onChange={(e) => setPromptSet(e.target.value)}
				>
					<option value="select">Select...</option>
					<option value="books">Books</option>
					<option value="art">Art</option>
				</select>
			</Box>

			{/* Render the grid of prompts */}
			<Grid container spacing={2}>
				{tiles.map((tile) => (
					<Grid item xs={4} key={tile.id}>
						<Button
							fullWidth
							variant={tile.completed ? "contained" : "outlined"}
							color={tile.completed ? "success" : "primary"}
							onClick={() => setActiveTile(tile)}
						>
							{tile.prompt}
						</Button>
					</Grid>
				))}
			</Grid>

			{/* Modal for capturing/uploading images */}
			{activeTile && (
				<CameraModal
					tile={activeTile}
					onClose={() => setActiveTile(null)}
					onSave={markTileCompleted}
				/>
			)}

			{/* Download Buttons */}
			<Box mt={4} textAlign="center">
				<Button
					variant="contained"
					color="primary"
					onClick={downloadPDF}
					disabled={
						isGeneratingPDF ||
						tiles.every((tile) => !tile.completed)
					}
					style={{ marginRight: "10px" }}
				>
					{isGeneratingPDF
						? "Generating PDF..."
						: "Download Bingo PDF"}
				</Button>
				<Button
					variant="contained"
					color="secondary"
					onClick={downloadImages}
					disabled={
						isDownloadingImages ||
						tiles.every((tile) => !tile.image)
					}
				>
					{isDownloadingImages
						? "Downloading Images..."
						: "Download Images"}
				</Button>
			</Box>
		</Box>
	);
};

export default App;
