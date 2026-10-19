import { validPoint, type Point } from './nearby';
export type DeviceLocation = Point & { accuracy: number; acquiredAt: number };
export function locationErrorMessage(code?: number): string {
  return code === 1 ? 'Location is blocked. Allow location in your browser site settings, or search an area instead.' : code === 3 ? 'Finding your location took too long. Check that device location services are on and try again, or search an area.' : 'Your location is unavailable. Check your device location services, or search an area instead.';
}
export function getDevicePosition(geolocation: Pick<Geolocation, 'getCurrentPosition'>): Promise<DeviceLocation> {
  return new Promise((resolve, reject) => {
    geolocation.getCurrentPosition(position => {
      const point = { latitude: position.coords.latitude, longitude: position.coords.longitude };
      if (!validPoint(point)) { reject(new Error('Your device returned an invalid location. Please search an area instead.')); return; }
      resolve({ ...point, accuracy: position.coords.accuracy, acquiredAt: Date.now() });
    }, error => reject(new Error(locationErrorMessage(error.code))), { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 });
  });
}
