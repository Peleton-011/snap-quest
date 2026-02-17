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

import { Tile } from "@/app/types/types";

import { Camera, CameraResultType } from "@capacitor/camera";
import isNative from "../services/platform";

interface CameraModalProps {
	tile: Tile;
	onClose: () => void;
	onSave: (
		id: number,
		image: Blob | null,
		orientation: "landscape" | "portrait",
	) => void;
	language: string;
}

const CameraModal: React.FC<CameraModalProps> = ({
	tile,
	onClose,
	onSave,
	language,
}) => {
	const [preview, setPreview] = useState<string | null>(tile.image);

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
		<Dialog open onClose={onClose}>
			<DialogTrigger asChild>
				<Button>{label}</Button>
			</DialogTrigger>
			<DialogContent className="modal">
				<h6>
					{tile.prompt.fullPrompt[language]}
				</h6>
				<div >
					{preview && (
						<div>
							<img
								src={preview}
								alt="Preview"
								style={{ width: "100%", borderRadius: "4px" }}
							/>
							<div
							>
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
						<Button  >
							Upload or Take a Photo
							{isNative() ? (
								<Button onClick={handleNativeCapture}>
									Close
								</Button>
							) : (
								<input
									type="file"
									accept="image/*"
									hidden
									onChange={handleCapture}
								/>
							)}
						</Button>
					)}{" "}
					<Button onClick={onClose}>Close</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default CameraModal;
