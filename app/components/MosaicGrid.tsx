// import { Box, Button, Typography } from "@mui/material";
import { Prompt, Tile } from "@/app/types/types";

const MosaicGrid = ({
	tiles,
	onTileClick,
	language,
}: {
	tiles: Tile[];
	onTileClick: (tile: Tile) => void;
	language: string;
}) => {
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

	return (
		<Box
			sx={{
				display: "grid",
				gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
				gap: "20px",
				gridAutoRows: "150px",
				gridAutoFlow: "dense",
				padding: "20px",
			}}
		>
			{tiles.map((tile) => (
				<Box
					key={tile.id}
					sx={{
						...getTileStyle(tile),
						position: "relative",
						overflow: "hidden",
					}}
				>
					<Button
						fullWidth
						sx={{
							height: "100%",
							backgroundImage: tile.image
								? `url(${tile.image})`
								: "none",
							backgroundSize: "cover",
							backgroundPosition: "center",
							border: "1px solid",
							borderColor: tile.completed
								? "success.main"
								: "primary.main",
							"&:hover": {
								opacity: 0.9,
							},
						}}
						onClick={() => onTileClick(tile)}
					>
						{!tile.image ? (
							<Typography variant="body2" color="textPrimary">
								{tile.prompt.shortPrompt[language]}
							</Typography>
						) : null}
					</Button>
					{tile.completed && (
						<Typography
							variant="caption"
							sx={{
								position: "absolute",
								bottom: 0,
								left: 0,
								right: 0,
								backgroundColor: "rgba(0, 0, 0, 0.6)",
								color: "white",
								padding: "4px",
								textAlign: "center",
							}}
						>
							{tile.prompt.shortPrompt[language]}
						</Typography>
					)}
				</Box>
			))}
		</Box>
	);
};

export default MosaicGrid;
