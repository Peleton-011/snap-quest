import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ImageCard from "@/components/ui/image-card-btn";
import defaultImg from "../assets/defaultImg.svg";

import { Tile } from "@/app/types/types";

import { Camera, CameraResultType } from "@capacitor/camera";
import isNative from "../services/platform";

interface CameraModalProps {
	tile: Tile;
	onSave: (
		id: number,
		image: Blob | null,
		orientation: "landscape" | "portrait",
	) => void;
	language: string;
	cellSize: number;
}

const CameraModal: React.FC<CameraModalProps> = ({
	tile,
	onSave,
	language,
	cellSize,
}) => {
	const [preview, setPreview] = useState<string | null>(tile.image);

	// Calculate grid layout properties for a tile
	const getTileStyle = (tile: Tile) => {
		if (!tile.image) {
			return {
				gridColumn: "span 1",
				gridRow: "span 1",
			};
		}

		return {
			gridColumn: `span ${tile.width || 1}`,
			gridRow: `span ${tile.height || 1}`,
			transition: "all 0.3s ease-in-out",
		};
	};

	const determineOrientation = (src: string): "landscape" | "portrait" => {
		// Determine orientation based on image dimensions
		const img = new Image();
		img.src = src;
		let orientation: "landscape" | "portrait" = "landscape";
		img.onload = () => {
			orientation = img.width > img.height ? "landscape" : "portrait";
		};
		return orientation;
	};
	const handleCapture = async (
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		const file = event.target.files?.[0];
		if (file) {
			const url = URL.createObjectURL(file);

			setPreview(url);
			onSave(tile.id, file, determineOrientation(url));
		}
	};

	const handleNativeCapture = async () => {
		// This is base64 unfortunately
		const photo = await Camera.getPhoto({
			resultType: CameraResultType.DataUrl,
			quality: 90,
		});

		if (!photo || !photo.dataUrl) return;

		await fetch(photo.dataUrl)
			.then((res) => res.blob())
			.then((blob) => {
				setPreview(photo.webPath ?? null);

				onSave(
					tile.id,
					blob,
					determineOrientation(photo.webPath ?? ""),
				);
			});
	};

	const handleDelete = () => {
		setPreview(null);
		onSave(tile.id, null, "landscape");
	};

	return (
		<Dialog>
			<form
				method="dialog"
				style={{
					...getTileStyle(tile),
					position: "relative",
					// padding: "10px",
				}}
			>
				<DialogTrigger
					asChild
					style={{
						// padding: "10px",
					}}
				>
					<ImageCard
						variant="button"
						height={String(tile.height || 1)}
						width={String(tile.width || 1)}
						caption={tile.prompt.shortPrompt[language]}
						imageUrl={preview || defaultImg.src}
                        cellSize={cellSize}
					></ImageCard>
					{/* <Button asChild>
						<ImageCard
							caption={label}
							imageUrl={preview || ""}
						></ImageCard>
					</Button> */}
				</DialogTrigger>
				<DialogContent className="modal">
					<DialogHeader>
						<DialogTitle>
							{tile.prompt.fullPrompt[language]}
						</DialogTitle>
					</DialogHeader>
					<div>
						{preview && (
							<div>
								<img
									src={preview}
									alt="Preview"
									style={{
										width: "100%",
										borderRadius: "4px",
									}}
								/>
								<div>
									<Button
										color="secondary"
										onClick={handleDelete}
									>
										Delete Image
									</Button>
								</div>
							</div>
						)}
					</div>
					<DialogFooter className="modal">
						{!preview && (
							<div>
								{isNative() ? (
									<Button onClick={handleNativeCapture}>
										Upload or Take a Photo
									</Button>
								) : (
									<Button>
										<Label htmlFor="file">
											Upload or Take a Photo
										</Label>
										<input
											id="file"
											type="file"
											accept="image/*"
											hidden
											onChange={handleCapture}
										/>
									</Button>
								)}
							</div>
						)}{" "}
						<DialogClose asChild>
							<Button>Close</Button>
						</DialogClose>
					</DialogFooter>
				</DialogContent>
			</form>
		</Dialog>
	);
};

export default CameraModal;
