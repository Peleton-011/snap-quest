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
	const GAP = 13;

	useEffect(() => {
		const el = containerRef.current;
		if (!el) return;
		const observer = new ResizeObserver(([entry]) => {
			const containerWidth = entry.contentRect.width;
			const cellColumns = Math.max(
				1,
				Math.floor((containerWidth - 2 * GAP) / MIN_CELL_SIZE),
			);
			setCols(cellColumns);
			setCellSize(
				(containerWidth - GAP * (cellColumns -1)) / cellColumns,
			);
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
				gridTemplateColumns: `repeat(auto-fill, minmax(${cellSize}px, 1fr))`,
				gridAutoRows: cellSize + "px",
				gridAutoFlow: "dense",
				// padding: "10px",
				rowGap: GAP + "px",
				columnGap: GAP + "px",
				margin: GAP + "px",
			}}
		>
			{tiles.map((tile) => (
				<CameraModal
					key={tile.id}
					tile={tile}
					onSave={onSave}
					language={language}
					cellSize={cellSize}
                    cellColumns={cols}
					gap={GAP}
				/>
			))}
		</div>
	);
};

export default MosaicGrid;
