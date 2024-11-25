import React, { useState } from "react";
import { Box, Button, Dialog, DialogActions, DialogContent, Typography } from "@mui/material";

interface CameraModalProps {
    tile: { id: number; prompt: string };
    onClose: () => void;
    onSave: (id: number, image: string) => void;
}

const CameraModal: React.FC<CameraModalProps> = ({ tile, onClose, onSave }) => {
    const [image, setImage] = useState<string | null>(null);

    const handleCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => setImage(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleSave = () => {
        if (image) {
            onSave(tile.id, image);
        }
    };

    return (
        <Dialog open onClose={onClose}>
            <DialogContent>
                <Typography variant="h6">{tile.prompt}</Typography>
                <Box mt={2}>
                    {image ? (
                        <img src={image} alt="Captured" style={{ width: "100%" }} />
                    ) : (
                        <Button variant="contained" component="label">
                            Upload or Take a Photo
                            <input type="file" accept="image/*" hidden onChange={handleCapture} />
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
