// import { Box, Button, Typography } from "@mui/material";
import { Button } from "@/components/ui/button";
import { Prompt, Tile } from "@/app/types/types";
import CameraModal from "./CameraModal";
import { useEffect, useRef, useState } from "react";

const MosaicGrid = ({
	tiles,
	onSave,
	language,
}: {
	tiles: Tile[];
	onSave: (
		id: number,
		image: Blob | null,
		orientation: "landscape" | "portrait",
	) => void;
	language: string;
}) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const [cols, setCols] = useState(3);
	const MIN_CELL_SIZE = 200;

	useEffect(() => {
		const el = containerRef.current;
		if (!el) return;
		const observer = new ResizeObserver(([entry]) => {
			const w = entry.contentRect.width;
			setCols(Math.max(1, Math.floor((w - 20) / MIN_CELL_SIZE)));
		});
		observer.observe(el);
		return () => {
			observer.disconnect();
		};
	}, []);

	return (
		<div
			style={{
				display: "grid",
				gridTemplateColumns: `repeat(auto-fill, minmax(${MIN_CELL_SIZE}px, 1fr))`,
				gridAutoRows: MIN_CELL_SIZE + "px",
				gridAutoFlow: "dense",
				// padding: "10px",
			}}
		>
			{tiles.map((tile) => (
				<CameraModal
					key={tile.id}
					tile={tile}
					onSave={onSave}
					language={language}
                    cellSize={MIN_CELL_SIZE}
				/>
			))}
		</div>
	);
};

/* 
<div
					
				>
					<Button
						style={{
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
							
						}}
						onClick={() => onTileClick(tile)}
					>
						{!tile.image ? (
							<p color="textPrimary">
								{tile.prompt.shortPrompt[language]}
							</p>
						) : null}
					</Button>
					{tile.completed && (
						<p
							style={{
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
						</p>
					)}
				</div>
*/

export default MosaicGrid;
