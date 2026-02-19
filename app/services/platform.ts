const isNative = () => (window as any).Capacitor?.isNativePlatform?.() === true;

export default isNative;