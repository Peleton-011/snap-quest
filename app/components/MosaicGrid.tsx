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
    const [cellSize, setCellSize] = useState(0);
	const MIN_CELL_SIZE = 200;
    const GAP = 10;

	useEffect(() => {
		const el = containerRef.current;
        console.log(el)
		if (!el) return;
		const observer = new ResizeObserver(([entry]) => {
			const w = entry.contentRect.width;
			const c = Math.max(1, Math.floor(w / MIN_CELL_SIZE));
            setCols(c);
            setCellSize((w - GAP * (c - 1)) / c);

            console.log(c, w, cellSize);
		});
		observer.observe(el);
		return () => {
			observer.disconnect();
		};
	}, []);

	return (
		<div
            ref={containerRef}
			style={{
				display: "grid",
				gridTemplateColumns: `repeat(auto-fill, minmax(${MIN_CELL_SIZE}px, 1fr))`,
				gridAutoRows: cellSize + "px",
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
					cellSize={cellSize}
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
