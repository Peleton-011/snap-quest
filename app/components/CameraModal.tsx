import React, { useState } from "react";
import {
	Box,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	Typography,
} from "@mui/material";

interface Prompt {
	fullPrompt: string;
	shortPrompt: string;
}

interface Tile {
	id: number;
	prompt: Prompt;
	completed: boolean;
	image: string | null;
	width: number;
	height: number;
}

interface CameraModalProps {
	tile: Tile;
	onClose: () => void;
	onSave: (
		id: number,
		image: string | null,
		orientation: "landscape" | "portrait"
	) => void;
}

const CameraModal: React.FC<CameraModalProps> = ({ tile, onClose, onSave }) => {
	const [image, setImage] = useState<string | null>(tile.image);

	const handleCapture = async (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		const file = event.target.files?.[0];
		if (file) {
			const url = URL.createObjectURL(file);

			// Determine orientation based on image dimensions
			const img = new Image();
			img.src = url;
			img.onload = () => {
				const orientation =
					img.width > img.height ? "landscape" : "portrait";
				setImage(url);
				onSave(tile.id, url, orientation);
			};
		}
	};

	const handleDelete = () => {
		setImage(null);
	};

	const handleSave = () => {
		if (image) {
			const orientation = "landscape"; // Assume default, as orientation is calculated on capture
			onSave(tile.id, image, orientation);
		}
	};

	return (
		<Dialog open onClose={onClose}>
			<DialogContent className="modal">
				<Typography variant="h6">{tile.prompt.fullPrompt}</Typography>
				<Box mt={2}>
					{image && (
						<Box>
							<img
								src={image}
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
				{!image && (
					<Button variant="contained" component="label">
						Upload or Take a Photo
						<input
							type="file"
							accept="image/*"
							hidden
							onChange={handleCapture}
						/>
					</Button>
				)}
				<Button onClick={onClose}>Cancel</Button>
				<Button onClick={handleSave} disabled={!image}>
					Save
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default CameraModal;
