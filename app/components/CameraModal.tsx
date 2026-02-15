import React, { useState } from "react";
import {
	Box,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	Typography,
} from "@mui/material";

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
			<DialogContent className="modal">
				<Typography variant="h6">
					{tile.prompt.fullPrompt[language]}
				</Typography>
				<Box mt={2}>
					{preview && (
						<Box>
							<img
								src={preview}
								alt="Preview"
								style={{ width: "100%", borderRadius: "4px" }}
							/>
							<Box
								display="flex"
								justifyContent="space-between"
								mt={2}
							>
								<Button
									variant="outlined"
									color="secondary"
									onClick={handleDelete}
								>
									Delete Image
								</Button>
							</Box>
						</Box>
					)}
				</Box>
			</DialogContent>
			<DialogActions className="modal">
				{!preview && (
					<Button variant="contained" component="label">
						Upload or Take a Photo
						{isNative() ? (
							<Button onClick={handleNativeCapture}>Close</Button>
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
			</DialogActions>
		</Dialog>
	);
};

export default CameraModal;
