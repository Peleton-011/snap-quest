import { Filesystem, Directory } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";

/** Convert a Blob to a base64 data string (no prefix). */
export function blobToBase64(blob: Blob): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onloadend = () => {
			const result = reader.result as string;
			// Strip the data:...;base64, prefix
			resolve(result.split(",")[1]);
		};
		reader.onerror = reject;
		reader.readAsDataURL(blob);
	});
}

/**
 * Write a blob to the device filesystem and open the native share sheet.
 * Works on iOS and Android via Capacitor.
 */
export async function saveAndShareFile(
	blob: Blob,
	fileName: string,
	mimeType: string
): Promise<void> {
	const base64Data = await blobToBase64(blob);

	const result = await Filesystem.writeFile({
		path: fileName,
		data: base64Data,
		directory: Directory.Cache,
	});

	await Share.share({
		title: fileName,
		url: result.uri,
		dialogTitle: `Share ${fileName}`,
	});
}
