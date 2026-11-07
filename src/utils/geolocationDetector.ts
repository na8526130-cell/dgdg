import { DeviceGeolocationInfo } from '../types/clientInfo';

/**
 * Calculate the great-circle distance between two points on Earth using the Haversine formula
 * Returns distance in kilometers (rounded to 1 decimal place)
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's mean radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Check browser Geolocation permission status via Permissions API if available
 */
export async function checkGeolocationPermission(): Promise<
  'granted' | 'prompt' | 'denied' | 'unsupported'
> {
  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    return 'unsupported';
  }

  if (
    typeof navigator.permissions !== 'undefined' &&
    typeof navigator.permissions.query === 'function'
  ) {
    try {
      const status = await navigator.permissions.query({ name: 'geolocation' });
      return status.state as 'granted' | 'prompt' | 'denied';
    } catch {
      // Some browsers (like Safari) or older engines may throw on query('geolocation')
      return 'prompt';
    }
  }

  return 'prompt';
}

/**
 * Optional reverse geocode to get human-readable locality in Japanese
 */
async function tryReverseGeocode(lat: number, lon: number): Promise<string | undefined> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=ja`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const parts: string[] = [];
      if (data.countryName) parts.push(data.countryName);
      if (data.principalSubdivision) parts.push(data.principalSubdivision);
      if (data.city && data.city !== data.principalSubdivision) parts.push(data.city);
      if (data.locality && !parts.includes(data.locality)) parts.push(data.locality);
      return parts.length > 0 ? parts.join(' ') : undefined;
    }
  } catch {
    // Graceful fallback without breaking
  }
  return undefined;
}

/**
 * Request device geolocation using high accuracy
 */
export function requestDeviceGeolocation(
  ipLat?: number | null,
  ipLon?: number | null
): Promise<DeviceGeolocationInfo> {
  return new Promise((resolve) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      resolve({
        permissionState: 'unsupported',
        status: 'unsupported',
        latitude: null,
        longitude: null,
        accuracyMeters: null,
        altitudeMeters: null,
        altitudeAccuracyMeters: null,
        heading: null,
        speedMps: null,
        timestamp: null,
        fetchedAtFormatted: null,
        errorMessage: 'お使いのブラウザは Geolocation API に対応していません。',
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const {
          latitude,
          longitude,
          accuracy,
          altitude,
          altitudeAccuracy,
          heading,
          speed,
        } = pos.coords;
        const timestamp = pos.timestamp;
        const date = new Date(timestamp);
        const fetchedAtFormatted = `${date.getHours().toString().padStart(2, '0')}:${date
          .getMinutes()
          .toString()
          .padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
        const googleMapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;

        let distanceFromIpKm: number | null = null;
        if (typeof ipLat === 'number' && typeof ipLon === 'number') {
          distanceFromIpKm = calculateHaversineDistance(
            ipLat,
            ipLon,
            latitude,
            longitude
          );
        }

        const addressSummary = await tryReverseGeocode(latitude, longitude);

        resolve({
          permissionState: 'granted',
          status: 'success',
          latitude,
          longitude,
          accuracyMeters: Math.round(accuracy * 10) / 10,
          altitudeMeters: altitude !== null ? Math.round(altitude * 10) / 10 : null,
          altitudeAccuracyMeters:
            altitudeAccuracy !== null ? Math.round(altitudeAccuracy * 10) / 10 : null,
          heading: heading !== null ? Math.round(heading) : null,
          speedMps: speed !== null ? Math.round(speed * 10) / 10 : null,
          timestamp,
          fetchedAtFormatted,
          addressSummary,
          googleMapsUrl,
          distanceFromIpKm,
        });
      },
      (err) => {
        let errMessage = '位置情報の取得に失敗しました。';
        let state: 'denied' | 'error' = 'error';

        if (err.code === 1) {
          // PERMISSION_DENIED
          errMessage =
            '位置情報のアクセスが許可されていません（ブラウザの設定でブロックされています）。';
          state = 'denied';
        } else if (err.code === 2) {
          // POSITION_UNAVAILABLE
          errMessage =
            '現在地を取得できませんでした（端末のGPSまたはネットワーク測位が利用できません）。';
        } else if (err.code === 3) {
          // TIMEOUT
          errMessage = '位置情報の取得がタイムアウトしました。';
        }

        resolve({
          permissionState: state === 'denied' ? 'denied' : 'prompt',
          status: state,
          latitude: null,
          longitude: null,
          accuracyMeters: null,
          altitudeMeters: null,
          altitudeAccuracyMeters: null,
          heading: null,
          speedMps: null,
          timestamp: null,
          fetchedAtFormatted: null,
          errorMessage: errMessage,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 30000,
      }
    );
  });
}

/**
 * Check permission and automatically fetch location IF ALREADY GRANTED.
 * If not granted ('prompt' or 'denied'), does not trigger intrusive prompt.
 */
export async function checkAndFetchIfGranted(
  ipLat?: number | null,
  ipLon?: number | null
): Promise<DeviceGeolocationInfo> {
  const perm = await checkGeolocationPermission();

  if (perm === 'granted') {
    return await requestDeviceGeolocation(ipLat, ipLon);
  }

  return {
    permissionState: perm,
    status: perm === 'denied' ? 'denied' : perm === 'unsupported' ? 'unsupported' : 'prompt',
    latitude: null,
    longitude: null,
    accuracyMeters: null,
    altitudeMeters: null,
    altitudeAccuracyMeters: null,
    heading: null,
    speedMps: null,
    timestamp: null,
    fetchedAtFormatted: null,
    errorMessage:
      perm === 'denied'
        ? 'ブラウザ設定で位置情報のアクセスがブロックされています'
        : undefined,
  };
}
