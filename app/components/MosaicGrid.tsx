// import { Box, Button, Typography } from "@mui/material";
import { Button } from "@/components/ui/button";
import { Prompt, Tile } from "@/app/types/types";
import CameraModal from "./CameraModal";

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


	return (
		<div
			style={{
				display: "grid",
				gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
				gap: "20px",
				gridAutoRows: "250px",
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
