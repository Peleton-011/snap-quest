"use client";
import React, { useState, useEffect } from "react";
import PromptSetEditor from "./components/PromptSetEditor";
import CameraModal from "./components/CameraModal";
import db from "./services/db";
import { generatePDF } from "./services/pdfGenerator";
import { downloadImagesAsZip } from "./services/zipImages";
import { generateStoryImage, generateCarouselImages } from "./services/cardGenerator";
import { saveAndShareFile } from "./services/nativeExport";
import isNative from "./services/platform";
import { saveAs } from "file-saver";
import { PromptSet, Prompt, Tile } from "./types/types";
import MosaicGrid from "./components/MosaicGrid";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import { Button } from "@/components/ui/button";

const defaultPromptSet: PromptSet = {
	id: -1,
	name: "Select...",
};

const App: React.FC = () => {
	const [tiles, setTiles] = useState<Tile[]>([]);
	const [activeTile, setActiveTile] = useState<Tile | null>({
		id: -1,
		prompt: {
			id: -1,
			fullPrompt: { en: "pooperty", fr: "poopert" },
			shortPrompt: { en: "pooperty", fr: "poopert" },
			promptSetId: -1,
		},
		completed: false,
		image: "https://contenthub-static.grammarly.com/blog/wp-content/uploads/2023/11/Cool_Words.png",
		width: 0,
		height: 0,
	});
	const [promptSet, setPromptSet] = useState<PromptSet>(defaultPromptSet);
	const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
	const [isDownloadingImages, setIsDownloadingImages] = useState(false);
	const [isGeneratingStory, setIsGeneratingStory] = useState(false);
	const [isGeneratingCarousel, setIsGeneratingCarousel] = useState(false);
	const [language, setLanguage] = useState("en");
	const [promptSets, setPromptSets] = useState<PromptSet[]>([
		defaultPromptSet,
	]);

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
								width: size.width,
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
			} else {
				const url = URL.createObjectURL(pdfBlob);
				const link = document.createElement("a");
				link.href = url;
				link.download = "snapquest-bingo.pdf";
				link.click();
				URL.revokeObjectURL(url);
			}
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

	// Share as a single story image
	const shareStoryImage = async () => {
		try {
			setIsGeneratingStory(true);
			const storyTitle = "SnapQuest: " + promptSet.name;
			const blob = await generateStoryImage(tiles, storyTitle, language);

			if (isNative()) {
				await saveAndShareFile(blob, "snapquest-story.png", "image/png");
			} else {
				saveAs(blob, "snapquest-story.png");
			}
		} catch (error) {
			console.error("Failed to generate story image:", error);
		} finally {
			setIsGeneratingStory(false);
		}
	};

	// Share as carousel (one card per prompt)
	const shareCarousel = async () => {
		try {
			setIsGeneratingCarousel(true);
			const carouselTitle = "SnapQuest: " + promptSet.name;
			const blobs = await generateCarouselImages(tiles, carouselTitle, language);

			const JSZip = (await import("jszip")).default;
			const zip = new JSZip();
			blobs.forEach((blob, i) => {
				zip.file(`snapquest-card-${i + 1}.png`, blob);
			});
			const zipBlob = await zip.generateAsync({ type: "blob" });

			if (isNative()) {
				await saveAndShareFile(zipBlob, "snapquest-cards.zip", "application/zip");
			} else {
				saveAs(zipBlob, "snapquest-cards.zip");
			}
		} catch (error) {
			console.error("Failed to generate carousel images:", error);
		} finally {
			setIsGeneratingCarousel(false);
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
	};

	const resetGrid = async () => {
		await db.photos
			.where("promptSetId")
			.equals(Number(promptSet.id))
			.delete();
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
		<div>
			<h3 className=" title">SnapQuest</h3>

			{/* Dropdown for prompt set selection */}

			<div
				style={{
					display: "flex",
					gap: "10px",
					alignItems: "center",
				}}
			>
				<h4 className="prompt-set-title">
					{promptSet.name === "Select..."
						? "Select a Prompt Set:"
						: promptSet.name.slice(0, 1).toUpperCase() +
							promptSet.name.slice(1)}
				</h4>
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
						<option value={Number(promptSet.id)} key={promptSet.id}>
							{promptSet.name}
						</option>
					))}
				</select>
				<Button
					onClick={resetGrid}
					color="primary"
					disabled={!tiles.some((t) => !!t.image)}
					style={{ marginBottom: "1rem" }}
				>
					Clear Images
				</Button>
				<PromptSetEditor
					editSetId={undefined}
					label="+ New Set"
					onSaved={() => {
						refreshPromptSets();
						setPromptSet(defaultPromptSet);
						setTiles([]);
					}}
				/>
				{isCustomSet && (
					<PromptSetEditor
						editSetId={Number(promptSet.id)}
						label="Edit Set"
						onSaved={() => {
							refreshPromptSets();
							setPromptSet(defaultPromptSet);
							setTiles([]);
						}}
					/>
				)}
				{isCustomSet && (
					<Button
						onClick={deletePromptSet}
						color="error"
						style={{ marginBottom: "1rem" }}
					>
						Delete Set
					</Button>
				)}
			</div>

			{tiles.length > 0 && (
				<MosaicGrid
					tiles={tiles}
					onSave={(id, image, orientation) =>
						markTileCompleted(id, image, orientation)
					}
					language={language}
				/>
			)}

			{/* Fixed download buttons */}
			<div className="download-buttons">
				<Button
					color="primary"
					onClick={shareStoryImage}
					disabled={isGeneratingStory || !tiles.some((t) => t.completed)}
				>
					{isGeneratingStory ? "Generating..." : "Share Story"}
				</Button>
				<Button
					color="primary"
					onClick={shareCarousel}
					disabled={isGeneratingCarousel || !tiles.some((t) => t.completed)}
				>
					{isGeneratingCarousel ? "Generating..." : "Share Cards"}
				</Button>
				<Button
					color="primary"
					onClick={downloadPDF}
					disabled={isGeneratingPDF}
				>
					{isGeneratingPDF ? "Generating PDF..." : "Download PDF"}
				</Button>
				<Button
					color="secondary"
					onClick={downloadImages}
					disabled={isDownloadingImages}
				>
					{isDownloadingImages ? "Downloading..." : "Download Images"}
				</Button>
			</div>
		</div>
	);
};

export default App;
