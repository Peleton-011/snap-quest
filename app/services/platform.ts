const isNative = () => typeof (window as any).Capacitor !== 'undefined';

export default isNative;