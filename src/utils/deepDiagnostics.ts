import {
  ClientHintsInfo,
  InstalledFontsInfo,
  MediaDevicesSummary,
  PermissionsMatrix,
  StorageEstimateInfo,
  WebRtcCandidateInfo,
} from '../types/clientInfo';

/**
 * High Entropy Client Hints (CPU architecture, bitness, exact model, platform version)
 */
export async function detectClientHints(): Promise<ClientHintsInfo> {
  if (typeof navigator === 'undefined') {
    return { supported: false };
  }

  const uad = (navigator as any).userAgentData;
  if (!uad) {
    return { supported: false };
  }

  try {
    let highEntropy: any = {};
    if (typeof uad.getHighEntropyValues === 'function') {
      highEntropy = await Promise.race([
        uad.getHighEntropyValues([
          'architecture',
          'bitness',
          'model',
          'platformVersion',
          'fullVersionList',
        ]),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 1500)),
      ]).catch(() => ({}));
    }

    return {
      supported: true,
      architecture: highEntropy.architecture || undefined,
      bitness: highEntropy.bitness ? `${highEntropy.bitness}-bit` : undefined,
      model: highEntropy.model || undefined,
      platformVersion: highEntropy.platformVersion || undefined,
      mobile: uad.mobile,
      brands: uad.brands || [],
    };
  } catch {
    return {
      supported: true,
      mobile: uad.mobile,
      brands: uad.brands || [],
    };
  }
}

/**
 * Query Permissions API Matrix without prompting the user
 */
export async function detectPermissionsMatrix(): Promise<PermissionsMatrix> {
  const result: PermissionsMatrix = {
    geolocation: 'unsupported',
    camera: 'unsupported',
    microphone: 'unsupported',
    notifications: 'unsupported',
    clipboardRead: 'unsupported',
    clipboardWrite: 'unsupported',
    persistentStorage: 'unsupported',
    screenWakeLock: 'unsupported',
  };

  if (typeof navigator === 'undefined' || !navigator.permissions || !navigator.permissions.query) {
    // Check Notification permission fallback
    if (typeof Notification !== 'undefined') {
      result.notifications = Notification.permission as any;
    }
    return result;
  }

  const queryPermission = async (name: string): Promise<any> => {
    try {
      const status = await navigator.permissions.query({ name: name as any });
      return status.state;
    } catch {
      return 'unsupported';
    }
  };

  const [geo, cam, mic, notif, clipR, clipW, persist, wake] = await Promise.all([
    queryPermission('geolocation'),
    queryPermission('camera'),
    queryPermission('microphone'),
    queryPermission('notifications'),
    queryPermission('clipboard-read'),
    queryPermission('clipboard-write'),
    queryPermission('persistent-storage'),
    queryPermission('screen-wake-lock'),
  ]);

  result.geolocation = geo;
  result.camera = cam;
  result.microphone = mic;
  result.notifications = notif !== 'unsupported' ? notif : typeof Notification !== 'undefined' ? (Notification.permission as any) : 'unsupported';
  result.clipboardRead = clipR;
  result.clipboardWrite = clipW;
  result.persistentStorage = persist;
  result.screenWakeLock = wake;

  return result;
}

/**
 * Enumerate connected hardware media devices (webcams, microphones, speakers)
 */
export async function detectMediaDevices(): Promise<MediaDevicesSummary> {
  if (
    typeof navigator === 'undefined' ||
    !navigator.mediaDevices ||
    !navigator.mediaDevices.enumerateDevices
  ) {
    return {
      supported: false,
      videoInputCount: 0,
      audioInputCount: 0,
      audioOutputCount: 0,
      totalDevices: 0,
      deviceLabels: [],
    };
  }

  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    let videoInputCount = 0;
    let audioInputCount = 0;
    let audioOutputCount = 0;
    const labels: string[] = [];

    devices.forEach((d) => {
      if (d.kind === 'videoinput') videoInputCount++;
      else if (d.kind === 'audioinput') audioInputCount++;
      else if (d.kind === 'audiooutput') audioOutputCount++;

      if (d.label) {
        labels.push(d.label);
      }
    });

    return {
      supported: true,
      videoInputCount,
      audioInputCount,
      audioOutputCount,
      totalDevices: devices.length,
      deviceLabels: labels,
    };
  } catch {
    return {
      supported: false,
      videoInputCount: 0,
      audioInputCount: 0,
      audioOutputCount: 0,
      totalDevices: 0,
      deviceLabels: [],
    };
  }
}

/**
 * Storage quota estimate & persistence status
 */
export async function detectStorageEstimate(): Promise<StorageEstimateInfo> {
  if (typeof navigator === 'undefined' || !navigator.storage || !navigator.storage.estimate) {
    return {
      supported: false,
      quotaMb: null,
      quotaGb: null,
      usageMb: null,
      usagePercent: null,
      isPersisted: null,
    };
  }

  try {
    const [estimate, persisted] = await Promise.all([
      navigator.storage.estimate().catch(() => null),
      navigator.storage.persisted ? navigator.storage.persisted().catch(() => null) : null,
    ]);

    if (!estimate || typeof estimate.quota !== 'number') {
      return {
        supported: true,
        quotaMb: null,
        quotaGb: null,
        usageMb: null,
        usagePercent: null,
        isPersisted: persisted,
      };
    }

    const quotaMb = Math.round(estimate.quota / (1024 * 1024));
    const quotaGb = Math.round((estimate.quota / (1024 * 1024 * 1024)) * 10) / 10;
    const usageMb = typeof estimate.usage === 'number' ? Math.round((estimate.usage / (1024 * 1024)) * 10) / 10 : null;
    const usagePercent =
      usageMb !== null && quotaMb > 0 ? Math.round((estimate.usage! / estimate.quota) * 1000) / 10 : null;

    return {
      supported: true,
      quotaMb,
      quotaGb,
      usageMb,
      usagePercent,
      isPersisted: persisted,
    };
  } catch {
    return {
      supported: false,
      quotaMb: null,
      quotaGb: null,
      usageMb: null,
      usagePercent: null,
      isPersisted: null,
    };
  }
}

/**
 * High-speed System Fonts Scanner via Canvas width difference
 */
export function detectInstalledFonts(): InstalledFontsInfo {
  if (typeof document === 'undefined') {
    return {
      detectedFonts: [],
      totalScanned: 0,
      detectedCount: 0,
      fontFingerprintHash: 'N/A',
    };
  }

  const candidateFonts = [
    // Japanese Windows / macOS / Mobile
    'Meiryo',
    'Yu Gothic',
    'Yu Mincho',
    'Hiragino Kaku Gothic ProN',
    'Hiragino Sans',
    'MS Gothic',
    'MS PGothic',
    'MS Mincho',
    'BIZ UDPGothic',
    'Noto Sans JP',
    'Noto Serif JP',
    // Apple
    'SF Pro',
    'SF Pro Display',
    'SF Pro Text',
    'San Francisco',
    'Apple Color Emoji',
    'Monaco',
    'Menlo',
    // Windows / Microsoft
    'Segoe UI',
    'Segoe UI Emoji',
    'Segoe UI Symbol',
    'Calibri',
    'Cambria',
    'Consolas',
    'Candara',
    // Common Cross-Platform
    'Arial',
    'Arial Black',
    'Helvetica',
    'Helvetica Neue',
    'Roboto',
    'Ubuntu',
    'Courier New',
    'Georgia',
    'Impact',
    'Lucida Grande',
    'Lucida Sans Unicode',
    'Palatino',
    'Palatino Linotype',
    'Tahoma',
    'Times New Roman',
    'Trebuchet MS',
    'Verdana',
    'Comic Sans MS',
    'Noto Color Emoji',
  ];

  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return {
        detectedFonts: [],
        totalScanned: candidateFonts.length,
        detectedCount: 0,
        fontFingerprintHash: 'unsupported',
      };
    }

    const testString = 'mmmmmmmmmmlli1234567890漢字テスト';
    const textSize = '72px';
    const baseFonts = ['monospace', 'sans-serif', 'serif'];

    const baseWidths: Record<string, number> = {};
    baseFonts.forEach((base) => {
      ctx.font = `${textSize} ${base}`;
      baseWidths[base] = ctx.measureText(testString).width;
    });

    const detectedFonts: string[] = [];

    candidateFonts.forEach((font) => {
      let detected = false;
      for (const base of baseFonts) {
        ctx.font = `${textSize} '${font}', ${base}`;
        const width = ctx.measureText(testString).width;
        if (width !== baseWidths[base]) {
          detected = true;
          break;
        }
      }
      if (detected) {
        detectedFonts.push(font);
      }
    });

    // Simple deterministic hash of detected font names
    let hash = 0;
    const combined = detectedFonts.sort().join('|');
    for (let i = 0; i < combined.length; i++) {
      hash = (hash << 5) - hash + combined.charCodeAt(i);
      hash |= 0;
    }
    const fontFingerprintHash = `FN_${Math.abs(hash).toString(16).padStart(8, '0')}`;

    return {
      detectedFonts,
      totalScanned: candidateFonts.length,
      detectedCount: detectedFonts.length,
      fontFingerprintHash,
    };
  } catch {
    return {
      detectedFonts: [],
      totalScanned: candidateFonts.length,
      detectedCount: 0,
      fontFingerprintHash: 'error',
    };
  }
}

/**
 * Detect WebRTC Candidate details & Dual Stack IPv6
 */
export async function detectWebRtcCandidate(): Promise<WebRtcCandidateInfo> {
  if (typeof window === 'undefined' || !(window.RTCPeerConnection || (window as any).webkitRTCPeerConnection)) {
    return {
      supported: false,
      localIps: [],
      candidateTypes: [],
      dualStackIpv6: false,
      status: 'ブラウザ非対応 (RTCPeerConnectionなし)',
    };
  }

  return new Promise((resolve) => {
    try {
      const RTCPC = window.RTCPeerConnection || (window as any).webkitRTCPeerConnection;
      const pc = new RTCPC({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
      });

      const localIps = new Set<string>();
      const candidateTypes = new Set<string>();
      let hasIpv6 = false;

      pc.createDataChannel('');
      pc.createOffer()
        .then((offer) => pc.setLocalDescription(offer))
        .catch(() => {});

      let finished = false;
      const finish = () => {
        if (finished) return;
        finished = true;
        try {
          pc.close();
        } catch {}
        resolve({
          supported: true,
          localIps: Array.from(localIps),
          candidateTypes: Array.from(candidateTypes),
          dualStackIpv6: hasIpv6,
          status: localIps.size > 0 ? '検知完了' : 'mDNS匿名化マスク済み (プライバシー保護)',
        });
      };

      pc.onicecandidate = (event) => {
        if (!event || !event.candidate) {
          finish();
          return;
        }
        const cand = event.candidate.candidate;
        if (cand.includes('typ host')) candidateTypes.add('host (ローカル端末)');
        if (cand.includes('typ srflx')) candidateTypes.add('srflx (STUN外部反射)');
        if (cand.includes('typ relay')) candidateTypes.add('relay (TURN中継)');

        // Extract IP or mDNS address
        const parts = cand.split(' ');
        if (parts.length > 4) {
          const addr = parts[4];
          if (addr.includes(':')) {
            hasIpv6 = true;
          }
          if (
            /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(addr) ||
            addr.endsWith('.local') ||
            addr.includes(':')
          ) {
            localIps.add(addr);
          }
        }
      };

      // Timeout after 2.5s
      setTimeout(finish, 2500);
    } catch {
      resolve({
        supported: false,
        localIps: [],
        candidateTypes: [],
        dualStackIpv6: false,
        status: 'セキュリティ制約により取得スキップ',
      });
    }
  });
}
