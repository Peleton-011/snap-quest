import { Capacitor } from "@capacitor/core";
const isNative = () => Capacitor.isNativePlatform();

export default isNative;