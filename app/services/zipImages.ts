import JSZip from "jszip";
import { saveAs } from "file-saver";

export const downloadImagesAsZip = async (tiles: { prompt: string; image: string | null }[]) => {
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
