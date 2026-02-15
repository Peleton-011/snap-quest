"use client";

import React, { useState, useEffect } from "react";
import PromptSetEditor from "./components/PromptSetEditor";
import { Box, Typography, Grid, Button } from "@mui/material";
import CameraModal from "./components/CameraModal";
import db from "./services/db";
import { generatePDF } from "./services/pdfGenerator";
import { downloadImagesAsZip } from "./services/zipImages";
import "./app.css";
import { ThemeProvider } from "@mui/material/styles";
import theme from "./theme";
import { PromptSet, Prompt, Tile } from "./types/types";
import MosaicGrid from "./components/MosaicGrid";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import isNative from "./services/platform";

const defaultPromptSet: PromptSet = {
	id: -1,
	name: "Select...",
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
	const [showEditor, setShowEditor] = useState(false);
	const [editSetId, setEditSetId] = useState<number | undefined>(undefined);
	const [isCustomSet, setIsCustomSet] = useState(false);

	const refreshPromptSets = async () => {
		const data = await db.promptSets.toArray();
		setPromptSets([defaultPromptSet, ...data]);
	};

	// Fetch prompt sets from the server
	useEffect(() => {
		refreshPromptSets();
	}, []);

	// Load prompts dynamically from the server
	useEffect(() => {
		const loadPrompts = async () => {
			try {
				if (!promptSet.id) return;
				const record = await db.promptSets.get(Number(promptSet.id));
				setIsCustomSet(record ? !record.isDefault : false);

				const prompts = await db.prompts
					.where("promptSetId")
					.equals(Number(promptSet.id))
					.toArray();

				const photos = await db.photos
					.where("promptSetId")
					.equals(Number(promptSet.id))
					.toArray();

				const photoMap = new Map(
					photos.map((p) => [p.promptId, p.image]),
				);

				setTiles(
					await Promise.all(
						prompts.map(async (prompt: Prompt) => {
							const blob = photoMap.get(prompt.id!);
							let blobUrl = null;
							let size = { width: 1, height: 1 };

							if (blob) {
								blobUrl = URL.createObjectURL(blob);
								const orientation =
									await determineImageOrientation(blobUrl);
								size = calculateMosaicSize(orientation);
							}

							return {
								id: prompt.id!,
								prompt,
								completed: !!blob,
								image: blobUrl,
								width: size.width, // Default mosaic size
								height: size.height,
							};
						}),
					),
				);
			} catch (error) {
				console.error("Failed to load prompts:", error);
			}
		};
		loadPrompts();
	}, [promptSet]);

	// Generate mosaic sizes dynamically based on image orientation
	const calculateMosaicSize = (orientation: "landscape" | "portrait") => {
		const getValidSizes = (orientation: string) => {
			const sizes = [];

			// Add square options (1x1, 2x2)
			sizes.push({ width: 1, height: 1 });
			sizes.push({ width: 1, height: 1 });
			sizes.push({ width: 1, height: 1 });
			sizes.push({ width: 2, height: 2 });

			if (orientation === "portrait") {
				console.log("portrait");
				// Add vertical rectangles (1x2)
				sizes.push({ width: 1, height: 2 });
				sizes.push({ width: 1, height: 2 });
				sizes.push({ width: 2, height: 3 });
			} else if (orientation === "landscape") {
				console.log("landscape");
				// Add horizontal rectangles (2x1)
				sizes.push({ width: 2, height: 1 });
				sizes.push({ width: 2, height: 1 });
				sizes.push({ width: 3, height: 2 });
			}

			return sizes;
		};

		// Randomly select a valid size for a tile
		const getRandomSize = (orientation: string) => {
			const sizes = getValidSizes(orientation);
			return sizes[Math.floor(Math.random() * sizes.length)];
		};

		return getRandomSize(orientation);
	};

	function blobToBase64(blob: Blob): Promise<string> {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onloadend = () => {
				const result = reader.result as string;
				resolve(result.split(",")[1]); // strip data:...;base64, prefix
			};
			reader.onerror = reject;
			reader.readAsDataURL(blob);
		});
	}

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
				})),
			);

			if (isNative()) {
				const base64 = await blobToBase64(pdfBlob);
				const fileResult = await Filesystem.writeFile({
					path: "snapquest-bingo.pdf",
					data: base64,
					directory: Directory.Cache,
				});
				await Share.share({
					title: "Share your snaps!",
					url: fileResult.uri,
				});
			}
			// In PC
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

	const determineImageOrientation = (
		imageUrl: string,
	): Promise<"portrait" | "landscape"> => {
		return new Promise((resolve) => {
			const img = new Image();
			img.onload = () => {
				resolve(img.height > img.width ? "portrait" : "landscape");
			};
			img.src = imageUrl;
		});
	};

	const markTileCompleted = async (
		id: number,
		imageBlob: Blob | null,
		orientation: "landscape" | "portrait",
	) => {
		const promptId = tiles.find((t) => t.id === id)?.prompt.id!;
		if (!imageBlob) {
			setTiles((prevTiles) =>
				prevTiles.map((tile) =>
					tile.id === id
						? { ...tile, completed: false, image: null }
						: tile,
				),
			);
			await db.photos.where("promptId").equals(promptId).delete();

			return;
		}

		const newSize = calculateMosaicSize(orientation);

		await db.photos.where("promptId").equals(promptId).delete();
		await db.photos.add({
			promptId,
			promptSetId: Number(promptSet.id),
			image: imageBlob,
		});
		const blobUrl = URL.createObjectURL(imageBlob);

		setTiles((prevTiles) =>
			prevTiles.map((tile) =>
				tile.id === id
					? {
							...tile,
							completed: true,
							image: blobUrl,
							width: newSize.width,
							height: newSize.height,
							orientation,
						}
					: tile,
			),
		);
		setActiveTile(null);
	};

	const resetGrid = async () => {
		await db.photos
			.where("promptSetId")
			.equals(Number(promptSet.id))
			.delete(); // "bulkDelete")bulkDelete(tiles.map((t) => t.id));
		setTiles((prevTiles) =>
			prevTiles.map((tile) => ({
				...tile,
				completed: false,
				image: null,
				width: 0,
				height: 0,
				orientation: "landscape",
			})),
		);
	};

	const deletePromptSet = async () => {
		const setId = Number(promptSet.id);
		await db.photos.where("promptSetId").equals(setId).delete();
		await db.prompts.where("promptSetId").equals(setId).delete();
		await db.promptSets.delete(setId);

		const data = await db.promptSets.toArray();
		setPromptSets([defaultPromptSet, ...data]);
		setPromptSet(defaultPromptSet);
		setTiles([]);
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
										promptSet.id === Number(e.target.value),
								) || promptSets[0],
							)
						}
						style={{
							padding: "0.25rem",
							marginTop: "0.25rem",
							marginBottom: "1rem",
						}}
					>
						{promptSets.map((promptSet) => (
							<option
								value={Number(promptSet.id)}
								key={promptSet.id}
							>
								{promptSet.name}
							</option>
						))}
					</select>
					<Button
						onClick={resetGrid}
						variant="outlined"
						color="primary"
						disabled={!tiles.some((t) => !!t.image)}
						style={{ marginBottom: "1rem" }}
					>
						Clear Images
					</Button>
					<Button
						variant="contained"
						onClick={() => {
							setEditSetId(undefined);
							setShowEditor(true);
						}}
						style={{ marginBottom: "1rem" }}
					>
						+ New Set
					</Button>
					{isCustomSet && (
						<Button
							variant="contained"
							onClick={() => {
								setEditSetId(Number(promptSet.id));
								setShowEditor(true);
							}}
							style={{ marginBottom: "1rem" }}
						>
							Edit Set
						</Button>
					)}
					{isCustomSet && (
						<Button
							onClick={deletePromptSet}
							variant="contained"
							color="error"
							style={{ marginBottom: "1rem" }}
						>
							Delete Set
						</Button>
					)}
				</Box>

				{tiles.length > 0 && (
					<MosaicGrid
						tiles={tiles}
						onTileClick={(tile) => setActiveTile(tile)}
						language={language}
					/>
				)}

				{/* Modal for capturing/uploading images */}
				{activeTile && (
					<CameraModal
						tile={activeTile}
						onClose={() => setActiveTile(null)}
						onSave={(id, image, orientation) =>
							markTileCompleted(id, image, orientation)
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
				{showEditor && (
					<PromptSetEditor
						editSetId={editSetId}
						onClose={() => setShowEditor(false)}
						onSaved={() => {
							refreshPromptSets();
							setPromptSet(defaultPromptSet);
							setTiles([]);
						}}
					/>
				)}
			</Box>
		</ThemeProvider>
	);
};

export default App;
