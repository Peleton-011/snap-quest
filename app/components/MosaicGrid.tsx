import { useRef, useState, useEffect } from "react";
import { Tile } from "@/app/types/types";
import CameraModal from "./CameraModal";

const MIN_CELL = 250;
const GAP = 20;

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
	const [cellSize, setCellSize] = useState(MIN_CELL);

	useEffect(() => {
		const el = containerRef.current;
		if (!el) return;
		const observer = new ResizeObserver(([entry]) => {
			const w = entry.contentRect.width;
			const c = Math.max(1, Math.floor(w / MIN_CELL));
			setCols(c);
			// Actual cell width: total width minus gaps, divided by columns
			setCellSize((w - GAP * (c - 1)) / c);
		});
		observer.observe(el);
		return () => observer.disconnect();
	}, []);

	return (
		<div
			ref={containerRef}
			style={{
				display: "grid",
				gridTemplateColumns: `repeat(${cols}, 1fr)`,
				gap: `${GAP}px`,
				gridAutoRows: `${cellSize}px`,
				gridAutoFlow: "dense",
				padding: "20px",
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
