"use client";

import React, { useState, useEffect } from "react";
import { Box, Typography, Grid, Button } from "@mui/material";
import CameraModal from "./components/CameraModal";
import { fetchPrompts } from "./services/api";
import { generatePDF } from "./services/pdfGenerator";
import { downloadImagesAsZip } from "./services/zipImages";
import "./app.css"; // For dark theme and custom styling

interface Prompt {
	fullPrompt: string;
	shortPrompt: string;
}

interface Tile {
	id: number;
	prompt: Prompt;
	completed: boolean;
	image: string | null;
	width: number; // Mosaic dimensions
	height: number;
}

const App: React.FC = () => {
	const [tiles, setTiles] = useState<Tile[]>([]);
	const [activeTile, setActiveTile] = useState<Tile | null>(null);
	const [promptSet, setPromptSet] = useState("Select..."); // Track the selected prompt set
	const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
	const [isDownloadingImages, setIsDownloadingImages] = useState(false);

	// Load prompts dynamically from the server
	useEffect(() => {
		const loadPrompts = async () => {
			try {
				const prompts = await fetchPrompts(promptSet);
				setTiles(
					prompts.map((prompt: Prompt, idx: number) => ({
						id: idx,
						prompt,
						completed: false,
						image: null,
						width: 1, // Default mosaic size
						height: 1,
					}))
				);
			} catch (error) {
				console.error("Failed to load prompts:", error);
			}
		};
		loadPrompts();
	}, [promptSet]);

	// Open Camera Modal when a tile is clicked
	const handleTileClick = (tile: Tile) => {
		setActiveTile(tile);
	};

	// Update a tile's image and resize dynamically for the mosaic
	const updateTileImage = (
		id: number,
		image: string | null,
		orientation: "landscape" | "portrait"
	) => {
		setTiles((prevTiles) =>
			prevTiles.map((tile) => {
				if (tile.id === id) {
					const newSize = calculateMosaicSize(orientation);
					return { ...tile, completed: !!image, image, ...newSize };
				}
				return tile;
			})
		);
		setActiveTile(null);
	};

	// Generate mosaic sizes dynamically based on image orientation
	const calculateMosaicSize = (orientation: "landscape" | "portrait") => {
		if (orientation === "portrait") {
			return { width: 1, height: Math.random() > 0.5 ? 2 : 1 }; // 1x1 or 1x2
		} else {
			return { width: Math.random() > 0.5 ? 2 : 1, height: 1 }; // 1x1 or 2x1
		}
	};

	// Generate and download the PDF
	const downloadPDF = async () => {
		try {
			setIsGeneratingPDF(true);
			const pdfBlob = await generatePDF(
				"SnapQuest: " + promptSet,
				tiles.map((tile) => ({
					prompt: tile.prompt.fullPrompt,
					image: tile.image,
					width: tile.width,
					height: tile.height,
				}))
			);
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
		<Box className="dark-theme" p={4}>
			<Typography variant="h3" gutterBottom className="title">
				SnapQuest
			</Typography>

			{/* Dropdown for prompt set selection */}
			{
				<Box
					mb={2}
					style={{
						display: "flex",
						gap: "10px",
                        alignItems: "center",
					}}
				>
					{promptSet === "Select..." ? (
						<Typography>Select a Prompt Set:</Typography>
					) : (
						<Typography
							variant="h4"
							gutterBottom
							className="prompt-set-title"
						>
							{promptSet.slice(0, 1).toUpperCase() +
								promptSet.slice(1)}
						</Typography>
					)}
					<select
						value={promptSet}
						onChange={(e) => setPromptSet(e.target.value)}
						style={{
                            padding: "0.25rem",
                            marginTop: "0.25rem",
                            marginBottom: "1rem"
                        }}
					>
						<option value="select">Select...</option>
						<option value="books">Books</option>
						<option value="art">Art</option>
					</select>
				</Box>
			}

			{/* Render the mosaic grid */}
			<Grid container spacing={2} className="mosaic-grid">
				{tiles.map((tile) => (
					<Grid
						item
						key={tile.id}
						xs={tile.width * 2} // Adjust grid size dynamically
						sm={tile.width * 2}
						style={{
							aspectRatio: `${tile.width} / ${tile.height}`,
							background: tile.image
								? `url(${tile.image})`
								: "none",
							backgroundSize: "cover",
							backgroundPosition: "center",
							color: tile.image ? "white" : "inherit",
						}}
						className="mosaic-tile"
						onClick={() => handleTileClick(tile)}
					>
						{tile.image
							? ""
							: tile.prompt.shortPrompt || tile.prompt.fullPrompt}
					</Grid>
				))}
			</Grid>

			{/* Modal for capturing/uploading images */}
			{activeTile && (
				<CameraModal
					tile={activeTile}
					onClose={() => setActiveTile(null)}
					onSave={(id, image, orientation) =>
						updateTileImage(id, image, orientation)
					}
				/>
			)}

			{/* Fixed download buttons */}
			<Box className="download-buttons">
				<Button
					variant="contained"
					color="primary"
					onClick={downloadPDF}
					disabled={isGeneratingPDF}
				>
					{isGeneratingPDF ? "Generating PDF..." : "Download PDF"}
				</Button>
				<Button
					variant="contained"
					color="secondary"
					onClick={downloadImages}
					disabled={isDownloadingImages}
				>
					{isDownloadingImages ? "Downloading..." : "Download Images"}
				</Button>
			</Box>
		</Box>
	);
};

export default App;
