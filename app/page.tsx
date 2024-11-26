"use client";
import React, { useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import Grid from "@mui/material/Grid"; 
import CameraModal from "./components/CameraModal";

interface Tile {
    id: number;
    prompt: string;
    completed: boolean;
    image: string | null;
}

const promptSet = [
    "Find a book with a title that describes us",
    "A book with the weirdest cover",
    "A book you think I’d love",
    "Find a mystery book",
    "Find a book over 500 pages",
];

const App: React.FC = () => {
    const [tiles, setTiles] = useState<Tile[]>(
        promptSet.map((prompt, idx) => ({
            id: idx,
            prompt,
            completed: false,
            image: null,
        }))
    );
    const [activeTile, setActiveTile] = useState<Tile | null>(null);

    const markTileCompleted = (id: number, image: string) => {
        setTiles((prevTiles) =>
            prevTiles.map((tile) =>
                tile.id === id ? { ...tile, completed: true, image } : tile
            )
        );
        setActiveTile(null);
    };

    return (
        <Box p={4}>
            <Typography variant="h4" gutterBottom>
                SnapQuest: Bingo
            </Typography>
            <Grid container spacing={2}>
                {tiles.map((tile) => (
                    <Grid item xs={4} key={tile.id}>
                        <Button
                            fullWidth
                            variant={tile.completed ? "contained" : "outlined"}
                            color={tile.completed ? "success" : "primary"}
                            onClick={() => setActiveTile(tile)}
                        >
                            {tile.prompt}
                        </Button>
                    </Grid>
                ))}
            </Grid>
            {activeTile && (
                <CameraModal
                    tile={activeTile}
                    onClose={() => setActiveTile(null)}
                    onSave={markTileCompleted}
                />
            )}
        </Box>
    );
};

export default App;
