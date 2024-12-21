"use client";

import React, { useState, useEffect } from "react";
import { Box, Typography, Grid, Button } from "@mui/material";
import CameraModal from "./components/CameraModal";
import { fetchPrompts } from "./services/api";
import { generatePDF } from "./services/pdfGenerator";
import { downloadImagesAsZip } from "./services/zipImages";
import "./app.css";
import { ThemeProvider } from "@mui/material/styles";
import theme from "./theme";
import { PromptSet, Prompt, Tile } from "./types/types";

const defaultPromptSet: PromptSet = {
	name: "Select...",
	prompts: [],
};

const App: React.FC = () => {
	const [tiles, setTiles] = useState<Tile[]>([]);
	const [activeTile, setActiveTile] = useState<Tile | null>(null);
	const [promptSet, setPromptSet] = useState<PromptSet>(defaultPromptSet); // Track the selected prompt set
	const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
	const [isDownloadingImages, setIsDownloadingImages] = useState(false);
	const [language, setLanguage] = useState("en");
	const [promptSets, setPromptSets] = useState<PromptSet[]>([
		defaultPromptSet,
	]);

	// Fetch prompt sets from the server
	useEffect(() => {
		const fetchPromptSets = async () => {
			try {
				const response = await fetch("/api/promptSets");
				const data = await response.json();
				setPromptSets([defaultPromptSet, ...data]);
			} catch (error) {
				console.error("Failed to fetch prompt sets:", error);
			}
		};
		fetchPromptSets();
	}, []);

	// Load prompts dynamically from the server
	useEffect(() => {
		const loadPrompts = async () => {
			try {
				if (!promptSet._id) return;
				const { prompts } = await fetchPrompts(promptSet._id);

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

	const markTileCompleted = (id: number, image: string | null) => {
		setTiles((prevTiles) =>
			prevTiles.map((tile) =>
				tile.id === id ? { ...tile, completed: !!image, image } : tile
			)
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
				"SnapQuest: " + promptSet.name,
				tiles.map((tile) => ({
					prompt: tile.prompt.fullPrompt[language],
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
		<ThemeProvider theme={theme}>
			<Box p={4}>
				<Typography variant="h3" gutterBottom className=" title">
					SnapQuest
				</Typography>

				{/* Dropdown for prompt set selection */}

				<Box
					mb={2}
					style={{
						display: "flex",
						gap: "10px",
						alignItems: "center",
					}}
				>
					<Typography
						variant="h4"
						gutterBottom
						className="prompt-set-title"
					>
						{promptSet.name === "Select..."
							? "Select a Prompt Set:"
							: promptSet.name.slice(0, 1).toUpperCase() +
							  promptSet.name.slice(1)}
					</Typography>
					<select
						value={promptSet.name}
						onChange={(e) =>
							setPromptSet(
								promptSets.find(
									(promptSet) =>
										promptSet._id === e.target.value
								) || promptSets[0]
							)
						}
						style={{
							padding: "0.25rem",
							marginTop: "0.25rem",
							marginBottom: "1rem",
						}}
					>
						{promptSets.map((promptSet) => (
							<option value={promptSet._id} key={promptSet._id}>
								{promptSet.name}
							</option>
						))}
					</select>
				</Box>

				{tiles.length > 0 && (
					<Grid
						container
						spacing={2}
						sx={{
							display: "grid",
							gridTemplateColumns:
								"repeat(auto-fit, minmax(150px, 1fr))",
							gap: "20px",
						}}
					>
						{tiles.map((tile) => (
							<Box
								key={tile.id}
								sx={{
									display: "flex",
									flexDirection: "column",
									alignItems: "center",
								}}
							>
								{/* Button or Image */}
								<Button
									fullWidth
									variant={
										tile.completed
											? "contained"
											: "outlined"
									}
									color={
										tile.completed ? "success" : "primary"
									}
									onClick={() => setActiveTile(tile)}
									sx={{
										height: "150px", // Adjust to fit the layout
										backgroundImage: tile.image
											? `url(${tile.image})`
											: "none",
										backgroundSize: "cover",
										backgroundPosition: "center",
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										color: tile.image ? "white" : "inherit",
									}}
								>
									{!tile.image
										? tile.prompt.shortPrompt[language]
										: null}
								</Button>

								{/* Prompt below the button/image */}
								{tile.completed && (
									<Typography
										variant="body2"
										sx={{
											marginTop: "10px",
											textAlign: "center",
											wordBreak: "break-word",
											maxWidth: "100%",
											color: "#6c757d",
										}}
									>
										{tile.prompt.shortPrompt[language]}
									</Typography>
								)}
							</Box>
						))}
					</Grid>
				)}

				{/* Modal for capturing/uploading images */}
				{activeTile && (
					<CameraModal
						tile={activeTile}
						onClose={() => setActiveTile(null)}
						onSave={(id, image, orientation) =>
							markTileCompleted(id, image)
						}
						language={language}
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
						{isDownloadingImages
							? "Downloading..."
							: "Download Images"}
					</Button>
				</Box>
			</Box>
		</ThemeProvider>
	);
};

export default App;
