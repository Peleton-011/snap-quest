import JSZip from "jszip";
import { saveAs } from "file-saver";
import {Prompt, Tile} from "@/app/types/types"

export const downloadImagesAsZip = async (tiles: Tile[]) => {
	const zip = new JSZip();

	for (const [index, tile] of tiles.entries()) {
		if (tile.image) {
			const imageBlob = await fetch(tile.image).then((res) => res.blob());
			zip.file(`image-${index + 1}.jpg`, imageBlob);
		}
	}

	const zipBlob = await zip.generateAsync({ type: "blob" });
	saveAs(zipBlob, "snapquest-images.zip");
};
