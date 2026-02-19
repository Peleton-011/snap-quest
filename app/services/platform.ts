import { Capacitor } from "@capacitor/core";

let res: boolean | undefined;
function isNative() {
	if (res !== undefined) return res;

	res = Capacitor.isNativePlatform();
	return res;
}

export default isNative;
