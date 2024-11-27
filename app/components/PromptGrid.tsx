import React, { useState, useEffect } from "react";
import { Box, Button, Typography, Grid } from "@mui/material";
import CameraModal from "./CameraModal";
import { fetchPrompts } from "../services/api";

interface Tile {
  id: number;
  prompt: string;
  completed: boolean;
  image: string | null;
}

const PromptGrid: React.FC = () => {
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [activeTile, setActiveTile] = useState<Tile | null>(null);

  useEffect(() => {
    const loadPrompts = async () => {
      const prompts = await fetchPrompts("default");
      setTiles(
        prompts.map((prompt: string, idx: number) => ({
          id: idx,
          prompt,
          completed: false,
          image: null,
        }))
      );
    };
    loadPrompts();
  }, []);

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

export default PromptGrid;
