import { ActivityEvent, FullClientInspectionData } from '../types/clientInfo';

export interface StoredUserProfile {
  username: string;
  firstSeenAt: string;
  lastSeenAt: string;
  lastUpdated: number;
  serverDetectedIp?: string;
  visitCount: number;
  sessionDurationSeconds: number;
  ip: string;
  ipGeo: {
    ip: string;
    ipType: string;
    country: string;
    countryCode: string;
    flagEmoji: string;
    region: string;
    city: string;
    postalCode: string;
    latitude: number | null;
    longitude: number | null;
    isp: string;
    org: string;
    asn: string;
    domain: string;
    timezoneId: string;
  };
  deviceGeo?: {
    status: string;
    latitude: number | null;
    longitude: number | null;
    accuracyMeters: number | null;
    distanceFromIpKm: number | null;
    addressSummary?: string;
    googleMapsUrl?: string;
  };
  browser: {
    browserName: string;
    browserVersion: string;
    osName: string;
    osVersion: string;
    deviceCategory: string;
    primaryLanguage: string;
    rawUserAgent: string;
  };
  hardware: {
    cleanedGpuChip: string;
    unmaskedRenderer: string;
    unmaskedVendor: string;
    cpuCores: number | null;
    deviceMemoryGb: number | null;
    physicalResolution: string;
    cssResolution: string;
    platform: string;
  };
  network: {
    effectiveType: string;
    downlinkMbps: number | null;
    rttMs: number | null;
    livePingMs: number | null;
    isOnline: boolean;
  };
  eventsCount: number;
  recentEvents: ActivityEvent[];
  fullDataSnapshot?: FullClientInspectionData;
}

const LOCAL_STORAGE_KEY = 'cp_all_user_profiles_cache';

// Helper to get local cache
export function getLocalProfilesCache(): Record<string, StoredUserProfile> {
  if (typeof localStorage === 'undefined') return {};
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

// Helper to save local cache
function saveLocalProfilesCache(cache: Record<string, StoredUserProfile>) {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cache));
  } catch (err) {
    console.warn('Could not save user profiles to localStorage', err);
  }
}

/**
 * Report / Sync current user's inspection data to backend and local storage
 */
export async function syncUserProfile(
  username: string,
  data: FullClientInspectionData,
  events: ActivityEvent[]
): Promise<void> {
  const trimmed = username.trim();
  if (!trimmed) return;

  const now = Date.now();
  const localCache = getLocalProfilesCache();
  const existing = localCache[trimmed];

  const profile: StoredUserProfile = {
    username: trimmed,
    firstSeenAt: existing?.firstSeenAt || new Date().toLocaleString('ja-JP'),
    lastSeenAt: new Date().toLocaleString('ja-JP'),
    lastUpdated: now,
    visitCount: (existing?.visitCount || 0) + 1,
    sessionDurationSeconds: data.session.sessionDurationSeconds,
    ip: data.ipGeo.ip,
    ipGeo: {
      ip: data.ipGeo.ip,
      ipType: data.ipGeo.ipType,
      country: data.ipGeo.country,
      countryCode: data.ipGeo.countryCode,
      flagEmoji: data.ipGeo.flagEmoji,
      region: data.ipGeo.region,
      city: data.ipGeo.city,
      postalCode: data.ipGeo.postalCode,
      latitude: data.ipGeo.latitude,
      longitude: data.ipGeo.longitude,
      isp: data.ipGeo.isp,
      org: data.ipGeo.org,
      asn: data.ipGeo.asn,
      domain: data.ipGeo.domain,
      timezoneId: data.ipGeo.timezoneId,
    },
    deviceGeo: data.deviceGeo
      ? {
          status: data.deviceGeo.status,
          latitude: data.deviceGeo.latitude,
          longitude: data.deviceGeo.longitude,
          accuracyMeters: data.deviceGeo.accuracyMeters,
          distanceFromIpKm: data.deviceGeo.distanceFromIpKm ?? null,
          addressSummary: data.deviceGeo.addressSummary,
          googleMapsUrl: data.deviceGeo.googleMapsUrl,
        }
      : undefined,
    browser: {
      browserName: data.browser.browserName,
      browserVersion: data.browser.browserVersion,
      osName: data.browser.osName,
      osVersion: data.browser.osVersion,
      deviceCategory: data.browser.deviceCategory,
      primaryLanguage: data.browser.primaryLanguage,
      rawUserAgent: data.browser.rawUserAgent,
    },
    hardware: {
      cleanedGpuChip: data.hardware.cleanedGpuChip,
      unmaskedRenderer: data.hardware.unmaskedRenderer,
      unmaskedVendor: data.hardware.unmaskedVendor,
      cpuCores: data.hardware.cpuCores,
      deviceMemoryGb: data.hardware.deviceMemoryGb,
      physicalResolution: data.hardware.physicalResolution,
      cssResolution: data.hardware.cssResolution,
      platform: data.hardware.platform,
    },
    network: {
      effectiveType: data.network.effectiveType,
      downlinkMbps: data.network.downlinkMbps,
      rttMs: data.network.rttMs,
      livePingMs: data.network.livePingMs,
      isOnline: data.network.isOnline,
    },
    eventsCount: events.length,
    recentEvents: events.slice(0, 50),
    fullDataSnapshot: data,
  };

  // 1. Update local cache
  localCache[trimmed] = profile;
  saveLocalProfilesCache(localCache);

  // 2. Sync to Express server API
  try {
    await fetch('/api/profiles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: trimmed,
        data,
        events: events.slice(0, 50),
      }),
    });
  } catch (err) {
    // Graceful fallback to local cache
    console.debug('Failed to sync profile to server API, using local storage cache', err);
  }
}

/**
 * Fetch all registered user profiles (merging backend + local cache)
 */
export async function fetchAllUserProfiles(): Promise<StoredUserProfile[]> {
  const localCache = getLocalProfilesCache();
  let serverList: StoredUserProfile[] = [];

  try {
    const res = await fetch('/api/profiles');
    if (res.ok) {
      const data = await res.json();
      if (data.profiles && Array.isArray(data.profiles)) {
        serverList = data.profiles;
      }
    }
  } catch (err) {
    console.debug('Failed to fetch profiles from server, falling back to local storage', err);
  }

  // Merge map
  const map = new Map<string, StoredUserProfile>();

  // Add local cache items first
  Object.values(localCache).forEach((p) => {
    map.set(p.username, p);
  });

  // Overwrite/update with server items (or keep newest)
  serverList.forEach((p) => {
    const existing = map.get(p.username);
    if (!existing || (p.lastUpdated || 0) >= (existing.lastUpdated || 0)) {
      map.set(p.username, p);
    }
  });

  // Return sorted by last updated descending
  return Array.from(map.values()).sort(
    (a, b) => (b.lastUpdated || 0) - (a.lastUpdated || 0)
  );
}

/**
 * Delete a user profile from server and local cache
 */
export async function deleteUserProfile(username: string): Promise<boolean> {
  const localCache = getLocalProfilesCache();
  delete localCache[username];
  saveLocalProfilesCache(localCache);

  try {
    await fetch(`/api/profiles/${encodeURIComponent(username)}`, {
      method: 'DELETE',
    });
    return true;
  } catch {
    return true;
  }
}

/**
 * Clear all user profiles from server and local cache
 */
export async function clearAllUserProfiles(): Promise<boolean> {
  saveLocalProfilesCache({});

  try {
    await fetch('/api/profiles', {
      method: 'DELETE',
    });
    return true;
  } catch {
    return true;
  }
}
