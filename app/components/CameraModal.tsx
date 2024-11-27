import React, { useState } from "react";
import {
	Box,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	Typography,
} from "@mui/material";

interface CameraModalProps {
	tile: { id: number; prompt: string; image: string | null };
	onClose: () => void;
	onSave: (id: number, image: string | null) => void;
}

const CameraModal: React.FC<CameraModalProps> = ({ tile, onClose, onSave }) => {
	const [image, setImage] = useState<string | null>(tile.image);

	const handleCapture = async (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		const file = event.target.files?.[0];
		if (file) {
			const url = URL.createObjectURL(file);
			setImage(url);
		}
	};

	const handleDelete = () => {
		setImage(null);
	};

	const handleDownload = () => {
		if (image) {
			const link = document.createElement("a");
			link.href = image;
			link.download = `tile-${tile.id}.jpg`;
			link.click();
		}
	};

	const handleSave = () => {
		onSave(tile.id, image);
	};

	return (
		<Dialog open onClose={onClose}>
			<DialogContent>
				<Typography variant="h6">{tile.prompt}</Typography>
				<Box mt={2}>
					{image ? (
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
								<Button
									variant="outlined"
									color="primary"
									onClick={handleDownload}
								>
									Download Image
								</Button>
							</Box>
						</Box>
					) : (
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
				</Box>
			</DialogContent>
			<DialogActions>
				<Button onClick={onClose}>Cancel</Button>
				<Button onClick={handleSave} disabled={!image}>
					Save
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default CameraModal;
