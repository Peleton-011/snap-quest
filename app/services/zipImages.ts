import JSZip from "jszip";
import { saveAs } from "file-saver";
import {Prompt, Tile} from "@/app/types/types"
import { saveAndShareFile } from "./nativeExport";
import isNative from "./platform";

export const downloadImagesAsZip = async (tiles: Tile[]) => {
	const zip = new JSZip();

	for (const [index, tile] of tiles.entries()) {
		if (tile.image) {
			const imageBlob = await fetch(tile.image).then((res) => res.blob());
			zip.file(`image-${index + 1}.jpg`, imageBlob);
		}
	}

	const zipBlob = await zip.generateAsync({ type: "blob" });

	if (isNative()) {
		await saveAndShareFile(zipBlob, "snapquest-images.zip", "application/zip");
	} else {
		saveAs(zipBlob, "snapquest-images.zip");
	}
};
