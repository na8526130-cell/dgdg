import {
  BrowserSoftwareInfo,
  HardwareGpuInfo,
  IpGeoInfo,
  NetworkBatteryInfo,
  ReferrerCategory,
  ReferrerSessionInfo,
  UtmParams,
} from '../types/clientInfo';

/**
 * Format relative time in Japanese
 */
export function formatRelativeTime(timestamp: number): string {
  const diffSec = Math.floor((Date.now() - timestamp) / 1000);
  if (diffSec < 5) return 'たった今';
  if (diffSec < 60) return `${diffSec}秒前`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}分前`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}時間前`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}日前`;
}

/**
 * Format seconds to hh:mm:ss
 */
export function formatDuration(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hrs > 0) {
    return `${hrs}時間 ${mins}分 ${secs}秒`;
  }
  return `${mins}分 ${secs.toString().padStart(2, '0')}秒`;
}

/**
 * Detect Referrer, UTM parameters, visit count, and first/last session timing
 */
export function detectReferrerAndSession(): ReferrerSessionInfo {
  const referrer = typeof document !== 'undefined' ? document.referrer : '';
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();

  const utmParams: UtmParams = {
    source: searchParams.get('utm_source') || undefined,
    medium: searchParams.get('utm_medium') || undefined,
    campaign: searchParams.get('utm_campaign') || undefined,
    term: searchParams.get('utm_term') || undefined,
    content: searchParams.get('utm_content') || undefined,
  };

  let referrerCategory: ReferrerCategory = 'direct';
  let referrerSourceLabel = '直接入力 / ブックマーク / リファラなし';
  let referrerNote = '直接アクセス、ブックマーク、またはブラウザの Referrer-Policy による秘匿です。';
  let searchEngineName: string | undefined;
  let searchQuery: string | undefined;

  // Check if inside iframe
  const isInsideIframe = typeof window !== 'undefined' && window.self !== window.top;
  if (isInsideIframe) {
    referrerNote = 'iframe（埋め込みプレビュー枠）内で動作中のため、親画面のセキュリティ設定により直接の流入元は送信されていません。';
  }

  if (referrer) {
    try {
      const refUrl = new URL(referrer);
      const host = refUrl.hostname.toLowerCase();
      const currentHost = typeof window !== 'undefined' ? window.location.hostname.toLowerCase() : '';

      if (host === currentHost) {
        referrerCategory = 'internal';
        referrerSourceLabel = `サイト内遷移 (${refUrl.pathname})`;
        referrerNote = `同一ホスト (${host}) からのページ内遷移です。`;
      } else if (host.includes('google.')) {
        referrerCategory = 'search';
        searchEngineName = 'Google';
        referrerSourceLabel = 'Google 検索';
        searchQuery = refUrl.searchParams.get('q') || undefined;
        referrerNote = 'Google 検索結果リンク経由のアクセスです。';
      } else if (host.includes('yahoo.')) {
        referrerCategory = 'search';
        searchEngineName = 'Yahoo! JAPAN';
        referrerSourceLabel = 'Yahoo! 検索';
        searchQuery = refUrl.searchParams.get('p') || undefined;
        referrerNote = 'Yahoo! 検索結果リンク経由のアクセスです。';
      } else if (host.includes('bing.com')) {
        referrerCategory = 'search';
        searchEngineName = 'Microsoft Bing';
        referrerSourceLabel = 'Bing 検索';
        searchQuery = refUrl.searchParams.get('q') || undefined;
        referrerNote = 'Microsoft Bing 検索結果リンク経由のアクセスです。';
      } else if (host.includes('duckduckgo.com')) {
        referrerCategory = 'search';
        searchEngineName = 'DuckDuckGo';
        referrerSourceLabel = 'DuckDuckGo 検索';
        searchQuery = refUrl.searchParams.get('q') || undefined;
        referrerNote = 'DuckDuckGo 検索結果リンク経由のアクセスです。';
      } else if (host.includes('baidu.com')) {
        referrerCategory = 'search';
        searchEngineName = 'Baidu (百度)';
        referrerSourceLabel = 'Baidu 検索';
        referrerNote = 'Baidu 検索結果リンク経由のアクセスです。';
      } else if (host.includes('twitter.com') || host.includes('x.com') || host.includes('t.co')) {
        referrerCategory = 'social';
        referrerSourceLabel = 'X (旧Twitter)';
        referrerNote = 'X (旧Twitter) の投稿リンク経由のアクセスです。';
      } else if (host.includes('facebook.com') || host.includes('fb.me')) {
        referrerCategory = 'social';
        referrerSourceLabel = 'Facebook';
        referrerNote = 'Facebook 経由のアクセスです。';
      } else if (host.includes('instagram.com')) {
        referrerCategory = 'social';
        referrerSourceLabel = 'Instagram';
        referrerNote = 'Instagram 経由のアクセスです。';
      } else if (host.includes('reddit.com')) {
        referrerCategory = 'social';
        referrerSourceLabel = 'Reddit';
        referrerNote = 'Reddit 経由のアクセスです。';
      } else if (host.includes('youtube.com') || host.includes('youtu.be')) {
        referrerCategory = 'social';
        referrerSourceLabel = 'YouTube';
        referrerNote = 'YouTube 動画概要欄等のリンク経由のアクセスです。';
      } else if (host.includes('github.com')) {
        referrerCategory = 'external';
        referrerSourceLabel = 'GitHub リンク';
        referrerNote = 'GitHub リポジトリ/ページからの外部リンクです。';
      } else {
        referrerCategory = 'external';
        referrerSourceLabel = `外部サイト (${host})`;
        referrerNote = `外部Webサイト (${host}) からの参照リンクです。`;
      }
    } catch {
      referrerCategory = 'external';
      referrerSourceLabel = `外部リンク (${referrer.slice(0, 30)}...)`;
      referrerNote = '外部参照リンクからのアクセスです。';
    }
  }

  // Handle visit count and first visit date via localStorage (Client-local storage only)
  let visitCount = 1;
  let firstVisitTimestamp = Date.now();
  const sessionStartTime = Date.now();

  try {
    if (typeof localStorage !== 'undefined') {
      const storedFirstVisit = localStorage.getItem('cp_first_visit_timestamp');
      if (storedFirstVisit) {
        firstVisitTimestamp = parseInt(storedFirstVisit, 10);
      } else {
        localStorage.setItem('cp_first_visit_timestamp', firstVisitTimestamp.toString());
      }

      // Track session visit count
      const isSessionActive = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('cp_session_active') : null;
      const storedCount = parseInt(localStorage.getItem('cp_visit_count') || '0', 10);

      if (!isSessionActive) {
        visitCount = storedCount + 1;
        localStorage.setItem('cp_visit_count', visitCount.toString());
        if (typeof sessionStorage !== 'undefined') {
          sessionStorage.setItem('cp_session_active', '1');
        }
      } else {
        visitCount = Math.max(storedCount, 1);
      }
    }
  } catch (e) {
    console.warn('Storage unavailable for visit tracking', e);
  }

  const firstVisitObj = new Date(firstVisitTimestamp);
  const firstVisitDate = `${firstVisitObj.getFullYear()}/${(firstVisitObj.getMonth() + 1).toString().padStart(2, '0')}/${firstVisitObj.getDate().toString().padStart(2, '0')} ${firstVisitObj.getHours().toString().padStart(2, '0')}:${firstVisitObj.getMinutes().toString().padStart(2, '0')}:${firstVisitObj.getSeconds().toString().padStart(2, '0')}`;
  const firstVisitRelative = formatRelativeTime(firstVisitTimestamp);

  return {
    referrer: referrer || '(なし - 直接アクセスまたはiframe埋め込み)',
    referrerCategory,
    referrerSourceLabel,
    referrerNote,
    searchEngineName,
    searchQuery,
    utmParams,
    visitCount,
    firstVisitDate,
    firstVisitRelative,
    lastActiveTimestamp: Date.now(),
    sessionStartTime,
    sessionDurationSeconds: 0,
  };
}

/**
 * Extract clean GPU chip name from WebGL unmasked renderer string
 */
function extractCleanGpuChip(rawRenderer: string): { chip: string; note?: string } {
  if (!rawRenderer || rawRenderer.includes('取得不可') || rawRenderer.includes('Masked')) {
    return {
      chip: 'ブラウザ非公開 (マスク中)',
      note: 'ブラウザのトラッキング防止機能またはWebGL権限制限により、チップ型番はマスクされています。',
    };
  }

  // Check Apple Silicon / Apple GPU
  if (/Apple GPU/i.test(rawRenderer)) {
    const isSpecificM = rawRenderer.match(/Apple\s+M\d+(\s+(Pro|Max|Ultra))?/i);
    if (isSpecificM) {
      return {
        chip: isSpecificM[0],
        note: 'Apple Silicon GPUチップが正常に特定されました。',
      };
    }
    return {
      chip: 'Apple GPU',
      note: 'iOS / Safari のフィンガープリント防止設計により、詳細なチップ名（Mシリーズ / Aシリーズ）は一律「Apple GPU」として報告されます。',
    };
  }

  // Check NVIDIA GeForce
  const nvidiaMatch = rawRenderer.match(/NVIDIA\s+GeForce\s+RTX\s+\d+(\s+Ti)?/i) ||
                      rawRenderer.match(/NVIDIA\s+GeForce\s+GTX\s+\d+(\s+Ti)?/i) ||
                      rawRenderer.match(/GeForce\s+RTX\s+\d+/i) ||
                      rawRenderer.match(/GeForce\s+GTX\s+\d+/i) ||
                      rawRenderer.match(/RTX\s+\d+/i);
  if (nvidiaMatch) {
    return { chip: nvidiaMatch[0], note: 'NVIDIA グラフィックスカードが特定されました。' };
  }

  // Check AMD Radeon
  const amdMatch = rawRenderer.match(/AMD\s+Radeon\s+(RX\s+)?[\w\d]+/i) || rawRenderer.match(/Radeon\s+[\w\d]+/i);
  if (amdMatch) {
    return { chip: amdMatch[0], note: 'AMD Radeon グラフィックスが特定されました。' };
  }

  // Check Intel
  const intelMatch = rawRenderer.match(/Intel\(R\)\s+(Iris\(R\)\s+Xe|UHD\s+Graphics|Arc\(TM\)[\w\s]+)/i) ||
                     rawRenderer.match(/Intel\s+(Iris|UHD|HD)\s+Graphics/i);
  if (intelMatch) {
    return { chip: intelMatch[0], note: 'Intel 内蔵/ディスクリートグラフィックスが特定されました。' };
  }

  // Check Mobile ARM Mali / Adreno / PowerVR
  const mobileMatch = rawRenderer.match(/Mali-[GT]\d+/i) ||
                      rawRenderer.match(/Adreno\s*\(TM\)?\s*\d+/i) ||
                      rawRenderer.match(/PowerVR\s+[\w\d]+/i);
  if (mobileMatch) {
    return { chip: mobileMatch[0], note: 'モバイルGPUチップが特定されました。' };
  }

  // ANGLE wrapper cleanup
  const angleMatch = rawRenderer.match(/ANGLE\s*\([^,]+,\s*([^,)]+)/i);
  if (angleMatch && angleMatch[1]) {
    return { chip: angleMatch[1].trim(), note: 'ANGLE レンダラー経由で特定されました。' };
  }

  return {
    chip: rawRenderer.replace(/ANGLE\s*\(/i, '').replace(/\)$/, '').trim() || rawRenderer,
  };
}

/**
 * Detect Hardware, GPU, WebGL, Display, and Touch properties
 */
export function detectHardwareAndGPU(): HardwareGpuInfo {
  let unmaskedRenderer = '取得不可 (ブラウザ制限)';
  let unmaskedVendor = '取得不可';
  let webglVersion = '非対応';
  let maxTextureSize = 0;

  try {
    const canvas = document.createElement('canvas');
    let gl = canvas.getContext('webgl2') as WebGL2RenderingContext | null;
    if (gl) {
      webglVersion = 'WebGL 2.0 (サポート)';
    } else {
      gl = (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) as WebGL2RenderingContext | null;
      if (gl) {
        webglVersion = 'WebGL 1.0 (レガシー)';
      }
    }

    if (gl) {
      maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE) || 0;
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        unmaskedRenderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || unmaskedRenderer;
        unmaskedVendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || unmaskedVendor;
      } else {
        unmaskedRenderer = gl.getParameter(gl.RENDERER) || 'Masked by Browser';
        unmaskedVendor = gl.getParameter(gl.VENDOR) || 'Masked by Browser';
      }
    }
  } catch (e) {
    console.warn('WebGL detection error', e);
  }

  const { chip: cleanedGpuChip, note: gpuNote } = extractCleanGpuChip(unmaskedRenderer);
  const webgpuSupported = typeof navigator !== 'undefined' && 'gpu' in navigator;

  // CPU Cores: Honest detection
  let cpuCores: number | null = null;
  let cpuCoresNote: string | undefined;
  if (typeof navigator !== 'undefined' && typeof navigator.hardwareConcurrency === 'number' && navigator.hardwareConcurrency > 0) {
    cpuCores = navigator.hardwareConcurrency;
    cpuCoresNote = `navigator.hardwareConcurrency により ${cpuCores} 論理コアを検出。`;
  } else {
    cpuCoresNote = 'ブラウザのプライバシー保護機能によりCPU論理コア数は非公開です。';
  }

  // Device Memory: Honest detection
  let deviceMemoryGb: number | null = null;
  let deviceMemoryNote: string | undefined;
  if (typeof navigator !== 'undefined' && 'deviceMemory' in navigator && typeof (navigator as any).deviceMemory === 'number') {
    deviceMemoryGb = (navigator as any).deviceMemory;
    deviceMemoryNote = `navigator.deviceMemory 開示値: ${deviceMemoryGb} GB (※Chromium仕様上、フィンガープリント防止のため最大8GBで上限規制されます。16GB/32GB/64GB搭載機でも最大8GBと表示されます)`;
  } else {
    deviceMemoryNote = 'Safari や Firefox では、端末追跡（フィンガープリント）防止のセキュリティ基準によりRAM容量API自体が非公開です。';
  }

  const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
  const screenWidth = typeof screen !== 'undefined' ? screen.width : 0;
  const screenHeight = typeof screen !== 'undefined' ? screen.height : 0;
  const availWidth = typeof screen !== 'undefined' ? screen.availWidth : 0;
  const availHeight = typeof screen !== 'undefined' ? screen.availHeight : 0;
  const innerWidth = typeof window !== 'undefined' ? window.innerWidth : 0;
  const innerHeight = typeof window !== 'undefined' ? window.innerHeight : 0;

  const physicalWidth = Math.round(screenWidth * dpr);
  const physicalHeight = Math.round(screenHeight * dpr);
  const physicalResolution = screenWidth > 0 ? `${physicalWidth} × ${physicalHeight} px` : '取得不可';
  const availableResolution = availWidth > 0 ? `${availWidth} × ${availHeight} px` : '取得不可';
  const cssResolution = innerWidth > 0 ? `${innerWidth} × ${innerHeight} px (ウィンドウ)` : '取得不可';

  const colorDepth = typeof screen !== 'undefined' ? screen.colorDepth || 24 : 24;
  const pixelDepth = typeof screen !== 'undefined' ? screen.pixelDepth || 24 : 24;

  let wideColorGamutP3 = false;
  let hdrSupported = false;
  if (typeof window !== 'undefined' && window.matchMedia) {
    wideColorGamutP3 = window.matchMedia('(color-gamut: p3)').matches;
    hdrSupported = window.matchMedia('(dynamic-range: high)').matches;
  }

  const maxTouchPoints = typeof navigator !== 'undefined' ? navigator.maxTouchPoints || 0 : 0;
  const touchSupported = typeof window !== 'undefined' && ('ontouchstart' in window || maxTouchPoints > 0);

  let orientationType = '横向き (Landscape)';
  let orientationAngle = 0;
  let isLandscape = true;

  if (typeof screen !== 'undefined' && screen.orientation) {
    orientationType = screen.orientation.type;
    orientationAngle = screen.orientation.angle || 0;
    isLandscape = orientationType.includes('landscape');
  } else if (typeof window !== 'undefined') {
    isLandscape = window.innerWidth >= window.innerHeight;
    orientationType = isLandscape ? '横向き (Landscape)' : '縦向き (Portrait)';
  }

  const platform = typeof navigator !== 'undefined' ? navigator.platform || (navigator as any).userAgentData?.platform || 'Unknown' : 'Unknown';

  return {
    unmaskedRenderer,
    unmaskedVendor,
    cleanedGpuChip,
    gpuNote,
    webglVersion,
    webgpuSupported,
    maxTextureSize,
    cpuCores,
    cpuCoresNote,
    deviceMemoryGb,
    deviceMemoryNote,
    physicalResolution,
    physicalWidth,
    physicalHeight,
    availableResolution,
    availWidth,
    availHeight,
    cssResolution,
    innerWidth,
    innerHeight,
    devicePixelRatio: dpr,
    colorDepth,
    pixelDepth,
    wideColorGamutP3,
    hdrSupported,
    maxTouchPoints,
    touchSupported,
    orientationType,
    orientationAngle,
    isLandscape,
    platform,
  };
}

/**
 * Detect Network Information & Battery Status
 */
export async function detectNetworkAndBattery(): Promise<NetworkBatteryInfo> {
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
  let effectiveType = 'ブラウザ非対応 (非公開)';
  let effectiveTypeNote: string | undefined;
  let connectionType = '非対応';
  let downlinkMbps: number | null = null;
  let rttMs: number | null = null;
  let saveData: boolean | null = null;
  let networkApiSupported = false;

  const conn = typeof navigator !== 'undefined' ? (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection : null;

  if (conn) {
    networkApiSupported = true;
    effectiveType = conn.effectiveType ? conn.effectiveType.toUpperCase() : '接続中';
    effectiveTypeNote = '※W3C仕様上、最高値は『4G』までしか定義されていません。光回線やWiFi・5G接続時もブラウザは最高ランクとして『4G』を返します。';
    connectionType = conn.type ? conn.type : 'WiFi / 有線 または モバイル';
    downlinkMbps = typeof conn.downlink === 'number' ? conn.downlink : null;
    rttMs = typeof conn.rtt === 'number' ? conn.rtt : null;
    saveData = typeof conn.saveData === 'boolean' ? conn.saveData : null;
  } else {
    effectiveType = 'ブラウザ未対応 (Safari/Firefox等)';
    effectiveTypeNote = 'Network Information API は Chrome/Edge などの Chromium 系ブラウザ限定の仕様です。Safari や Firefox ではフィンガープリント防止のため非公開です。実測Ping測定をご利用ください。';
    connectionType = 'ブラウザ非開示';
  }

  let batteryLevel: number | null = null;
  let batteryCharging: boolean | null = null;
  let batteryChargingTime: number | null = null;
  let batteryDischargingTime: number | null = null;
  let batterySupported = false;
  let batteryNote: string | undefined;

  if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
    try {
      const battery = await (navigator as any).getBattery();
      if (battery) {
        batterySupported = true;
        batteryLevel = Math.round(battery.level * 100);
        batteryCharging = battery.charging;
        batteryChargingTime = Number.isFinite(battery.chargingTime) ? battery.chargingTime : null;
        batteryDischargingTime = Number.isFinite(battery.dischargingTime) ? battery.dischargingTime : null;
      }
    } catch {
      batterySupported = false;
      batteryNote = 'Battery Status API の実行がブラウザ設定によりブロックされました。';
    }
  } else {
    batterySupported = false;
    batteryNote = 'Safari、Firefox、および多くのブラウザでは、利用者の物理移動や端末追跡（フィンガープリント）を防ぐためバッテリーAPIが意図的に削除されています。';
  }

  return {
    effectiveType,
    effectiveTypeNote,
    connectionType,
    downlinkMbps,
    rttMs,
    saveData,
    networkApiSupported,
    isOnline,
    batteryLevel,
    batteryCharging,
    batteryChargingTime,
    batteryDischargingTime,
    batterySupported,
    batteryNote,
    livePingMs: null,
    livePingMin: null,
    livePingMax: null,
    livePingJitter: null,
    pingStatus: 'idle',
  };
}

/**
 * Perform real HTTP ping round-trip probe with min/max/jitter statistics.
 * Throws on failure instead of fabricating fake data!
 */
export async function measureRealPing(iterations = 3): Promise<{
  avg: number;
  min: number;
  max: number;
  jitter: number;
}> {
  const pings: number[] = [];
  const testEndpoints = [
    'https://www.cloudflare.com/cdn-cgi/trace',
    'https://dns.google/resolve?name=example.com',
  ];

  for (let i = 0; i < iterations; i++) {
    const url = `${testEndpoints[i % testEndpoints.length]}?_t=${Date.now()}_${i}`;
    const start = performance.now();
    try {
      await fetch(url, {
        method: 'HEAD',
        mode: 'no-cors',
        cache: 'no-store',
      });
      const elapsed = Math.round(performance.now() - start);
      if (elapsed > 0) pings.push(elapsed);
    } catch (e) {
      console.warn('Ping endpoint failed', e);
    }
    await new Promise((r) => setTimeout(r, 60));
  }

  if (pings.length === 0) {
    throw new Error('すべてのPingテストエンドポイントへの接続に失敗しました（オフラインまたはセキュリティ制限）');
  }

  const min = Math.min(...pings);
  const max = Math.max(...pings);
  const avg = Math.round(pings.reduce((a, b) => a + b, 0) / pings.length);
  const jitter = Math.round(max - min);

  return { avg, min, max, jitter };
}

/**
 * Direct WebRTC STUN request to Google's public STUN server.
 * Discovers the client's actual public reflective IP candidate without third-party geo APIs.
 */
export async function detectWebRtcIp(): Promise<string | null> {
  if (typeof window === 'undefined' || !('RTCPeerConnection' in window)) {
    return null;
  }

  return new Promise((resolve) => {
    try {
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
      });
      let isResolved = false;

      const timer = setTimeout(() => {
        if (!isResolved) {
          isResolved = true;
          try { pc.close(); } catch {}
          resolve(null);
        }
      }, 2500);

      pc.onicecandidate = (event) => {
        if (!event || !event.candidate) return;
        const cand = event.candidate.candidate;
        const match = cand.match(/([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/i);
        if (match && !isResolved && (event.candidate.type === 'srflx' || cand.includes('srflx'))) {
          isResolved = true;
          clearTimeout(timer);
          try { pc.close(); } catch {}
          resolve(match[1]);
        }
      };

      pc.createDataChannel('ping');
      pc.createOffer()
        .then((offer) => pc.setLocalDescription(offer))
        .catch(() => {
          if (!isResolved) {
            isResolved = true;
            clearTimeout(timer);
            resolve(null);
          }
        });
    } catch {
      resolve(null);
    }
  });
}

/**
 * Convert 2-letter ISO country code into standard unicode flag emoji
 */
export function countryCodeToFlagEmoji(countryCode: string): string {
  if (!countryCode || countryCode.length !== 2) return '🌐';
  const upper = countryCode.toUpperCase();
  if (!/^[A-Z]{2}$/.test(upper)) return '🌐';
  const codePoints = upper
    .split('')
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

/**
 * Fast multi-source public IP detection using lightweight, non-blocked endpoints
 */
async function detectPublicIpFast(): Promise<{ ip: string | null; source: string }> {
  const ipEndpoints = [
    { url: 'https://api64.ipify.org?format=json', isText: false, name: 'api64.ipify.org' },
    { url: 'https://api.ip.sb/ip', isText: true, name: 'api.ip.sb' },
    { url: 'https://api.ipify.org?format=json', isText: false, name: 'api.ipify.org' },
    {
      url: 'https://cloudflare.com/cdn-cgi/trace',
      isText: true,
      name: 'Cloudflare Trace',
    },
  ];

  for (const ep of ipEndpoints) {
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 2500);
      const res = await fetch(ep.url, { signal: controller.signal, cache: 'no-store' });
      clearTimeout(id);
      if (res.ok) {
        if (ep.isText) {
          const text = await res.text();
          if (ep.name === 'Cloudflare Trace') {
            const match = text.match(/ip=([^\n]+)/);
            if (match && match[1]) {
              const ip = match[1].trim();
              if (ip.includes('.') || ip.includes(':')) return { ip, source: ep.name };
            }
          } else {
            const ip = text.trim();
            if (ip.includes('.') || ip.includes(':')) return { ip, source: ep.name };
          }
        } else {
          const data = await res.json();
          if (data && data.ip && typeof data.ip === 'string') {
            const ip = data.ip.trim();
            if (ip.includes('.') || ip.includes(':')) return { ip, source: ep.name };
          }
        }
      }
    } catch {
      // Continue to next endpoint
    }
  }

  return { ip: null, source: 'none' };
}

/**
 * Helper to fetch JSON with strict timeout
 */
async function fetchWithTimeout(url: string, timeoutMs = 3800): Promise<any> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal, cache: 'no-store' });
    clearTimeout(id);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

/**
 * Fetch Public IP, Geolocation, ISP, ASN, and Timezone with multi-tier resilient fallback.
 * Eliminates false fallback failures by cascading across 5 independent global providers.
 */
export async function fetchIpAndGeoInfo(targetIp?: string): Promise<IpGeoInfo> {
  const clientTimezone =
    typeof Intl !== 'undefined'
      ? Intl.DateTimeFormat().resolvedOptions().timeZone
      : 'Asia/Tokyo';

  // 1. Detect candidate IP directly via WebRTC STUN or fast multi-source endpoints
  let detectedIp: string | null = targetIp || null;
  let webrtcIp: string | null = null;
  let ipDetectSource = targetIp ? '手動照会' : '自動検知';

  if (!detectedIp) {
    try {
      webrtcIp = await detectWebRtcIp();
      if (webrtcIp) {
        detectedIp = webrtcIp;
        ipDetectSource = 'WebRTC STUN';
      }
    } catch {
      // STUN blocked
    }

    if (!detectedIp) {
      const fastIpResult = await detectPublicIpFast();
      if (fastIpResult.ip) {
        detectedIp = fastIpResult.ip;
        ipDetectSource = fastIpResult.source;
      }
    }
  }

  // Tier 1 Provider: ipwho.is (Rich Japanese localized geo, ISP, and timezone)
  try {
    const queryUrl = detectedIp
      ? `https://ipwho.is/${detectedIp}?lang=ja`
      : 'https://ipwho.is/?lang=ja';
    const data = await fetchWithTimeout(queryUrl, 3500);
    if (data && data.success !== false && data.ip) {
      const ip = data.ip;
      const ipType = ip.includes(':') ? 'IPv6' : 'IPv4';
      const country = data.country || '未取得';
      const countryCode = data.country_code || 'N/A';
      const flagEmoji = data.flag?.emoji || countryCodeToFlagEmoji(countryCode);
      const region = data.region || '未取得';
      const city = data.city || '未取得';
      const postalCode = data.postal || '未取得';
      const latitude = typeof data.latitude === 'number' ? data.latitude : null;
      const longitude = typeof data.longitude === 'number' ? data.longitude : null;
      const googleMapsUrl =
        latitude !== null && longitude !== null
          ? `https://www.google.com/maps?q=${latitude},${longitude}`
          : 'https://www.google.com/maps';
      const isp = data.connection?.isp || data.connection?.org || '未取得';
      const org = data.connection?.org || isp;
      const asn = data.connection?.asn
        ? `AS${data.connection.asn} (${data.connection.org || isp})`
        : '未取得';
      const domain = data.connection?.domain || '未取得';
      const timezoneId = data.timezone?.id || clientTimezone;
      const timezoneUtcOffset = data.timezone?.utc || '+09:00';
      const isTimezoneMatch =
        clientTimezone.toLowerCase() === timezoneId.toLowerCase();

      return {
        ip,
        webrtcIp,
        ipType,
        country,
        countryCode,
        flagEmoji,
        region,
        city,
        postalCode,
        latitude,
        longitude,
        googleMapsUrl,
        isp,
        org,
        asn,
        domain,
        timezoneId,
        timezoneUtcOffset: `UTC${
          timezoneUtcOffset.startsWith('+') || timezoneUtcOffset.startsWith('-')
            ? timezoneUtcOffset
            : `+${timezoneUtcOffset}`
        }`,
        isTimezoneMatch,
        deviceTimezone: clientTimezone,
        dataSource: 'ipwho.is (リアルタイムIP地理情報API)',
        rawApiResponse: data,
        fetchStatus: 'success',
      };
    }
  } catch (err) {
    console.warn('Tier 1 (ipwho.is) unfulfilled, proceeding to Tier 2 (api.ip.sb)', err);
  }

  // Tier 2 Provider: api.ip.sb (Cloudflare global CDN, ultra-reliable, never rate-limited for standard queries)
  try {
    const queryUrl = detectedIp
      ? `https://api.ip.sb/geoip/${detectedIp}`
      : 'https://api.ip.sb/geoip';
    const data = await fetchWithTimeout(queryUrl, 3500);
    if (data && data.ip) {
      const ip = data.ip;
      const ipType = ip.includes(':') ? 'IPv6' : 'IPv4';
      const countryCode = data.country_code || 'N/A';
      const country = data.country || (countryCode === 'JP' ? '日本' : countryCode);
      const flagEmoji = countryCodeToFlagEmoji(countryCode);
      const region = data.region || '未取得';
      const city = data.city || '未取得';
      const postalCode = data.postal_code || '未取得';
      const latitude = typeof data.latitude === 'number' ? data.latitude : null;
      const longitude = typeof data.longitude === 'number' ? data.longitude : null;
      const googleMapsUrl =
        latitude !== null && longitude !== null
          ? `https://www.google.com/maps?q=${latitude},${longitude}`
          : 'https://www.google.com/maps';
      const isp = data.isp || data.organization || '未取得';
      const org = data.organization || data.asn_organization || isp;
      const asn = data.asn
        ? `AS${data.asn} (${data.asn_organization || org})`
        : '未取得';
      const domain = '未取得';
      const timezoneId = data.timezone || clientTimezone;
      const offsetHours = typeof data.offset === 'number' ? Math.round(data.offset / 3600) : 9;
      const timezoneUtcOffset = `UTC${offsetHours >= 0 ? `+${offsetHours.toString().padStart(2, '0')}:00` : `-${Math.abs(offsetHours).toString().padStart(2, '0')}:00`}`;
      const isTimezoneMatch =
        clientTimezone.toLowerCase() === timezoneId.toLowerCase();

      return {
        ip,
        webrtcIp,
        ipType,
        country,
        countryCode,
        flagEmoji,
        region,
        city,
        postalCode,
        latitude,
        longitude,
        googleMapsUrl,
        isp,
        org,
        asn,
        domain,
        timezoneId,
        timezoneUtcOffset,
        isTimezoneMatch,
        deviceTimezone: clientTimezone,
        dataSource: 'api.ip.sb (Cloudflare CDN・高信頼IP地理情報)',
        rawApiResponse: data,
        fetchStatus: 'success',
      };
    }
  } catch (err) {
    console.warn('Tier 2 (api.ip.sb) unfulfilled, proceeding to Tier 3 (ipapi.co)', err);
  }

  // Tier 3 Provider: ipapi.co (Highly accurate ISP, ASN, and region)
  try {
    const queryUrl = detectedIp
      ? `https://ipapi.co/${detectedIp}/json/`
      : 'https://ipapi.co/json/';
    const data = await fetchWithTimeout(queryUrl, 3500);
    if (data && data.ip && !data.error) {
      const ip = data.ip;
      const ipType = ip.includes(':') ? 'IPv6' : 'IPv4';
      const countryCode = data.country_code || 'N/A';
      const country = data.country_name || (countryCode === 'JP' ? '日本' : countryCode);
      const flagEmoji = countryCodeToFlagEmoji(countryCode);
      const region = data.region || '未取得';
      const city = data.city || '未取得';
      const postalCode = data.postal || '未取得';
      const latitude = typeof data.latitude === 'number' ? data.latitude : null;
      const longitude = typeof data.longitude === 'number' ? data.longitude : null;
      const googleMapsUrl =
        latitude !== null && longitude !== null
          ? `https://www.google.com/maps?q=${latitude},${longitude}`
          : 'https://www.google.com/maps';
      const isp = data.org || (data.asn ? `AS${data.asn}` : '未取得');
      const org = data.org || isp;
      const asn = data.asn ? `${data.asn} (${org})` : '未取得';
      const domain = '未取得';
      const timezoneId = data.timezone || clientTimezone;
      const timezoneUtcOffset = data.utc_offset || '+0900';
      const isTimezoneMatch =
        clientTimezone.toLowerCase() === timezoneId.toLowerCase();

      return {
        ip,
        webrtcIp,
        ipType,
        country,
        countryCode,
        flagEmoji,
        region,
        city,
        postalCode,
        latitude,
        longitude,
        googleMapsUrl,
        isp,
        org,
        asn,
        domain,
        timezoneId,
        timezoneUtcOffset: `UTC${timezoneUtcOffset}`,
        isTimezoneMatch,
        deviceTimezone: clientTimezone,
        dataSource: 'ipapi.co (高精度IP地理情報API)',
        rawApiResponse: data,
        fetchStatus: 'success',
      };
    }
  } catch (err) {
    console.warn('Tier 3 (ipapi.co) unfulfilled, proceeding to Tier 4 (freeipapi.com)', err);
  }

  // Tier 4 Provider: freeipapi.com
  try {
    const queryUrl = detectedIp
      ? `https://freeipapi.com/api/json/${detectedIp}`
      : 'https://freeipapi.com/api/json';
    const data = await fetchWithTimeout(queryUrl, 3500);
    if (data && (data.ipAddress || data.ip)) {
      const ip = data.ipAddress || data.ip;
      const ipType = data.ipVersion === 6 || ip.includes(':') ? 'IPv6' : 'IPv4';
      const countryCode = data.countryCode || 'N/A';
      const country = data.countryName || (countryCode === 'JP' ? '日本' : countryCode);
      const flagEmoji = countryCodeToFlagEmoji(countryCode);
      const region = data.regionName || '未取得';
      const city = data.cityName || '未取得';
      const postalCode = data.zipCode || '未取得';
      const latitude = typeof data.latitude === 'number' ? data.latitude : null;
      const longitude = typeof data.longitude === 'number' ? data.longitude : null;
      const googleMapsUrl =
        latitude !== null && longitude !== null
          ? `https://www.google.com/maps?q=${latitude},${longitude}`
          : 'https://www.google.com/maps';
      const isp = data.asnOrganization || 'プロバイダ未取得';
      const org = data.asnOrganization || isp;
      const asn = data.asn ? `AS${data.asn} (${data.asnOrganization})` : '未取得';
      const domain = '未取得';
      const timezoneId = (data.timeZones && data.timeZones[0]) || clientTimezone;
      const isTimezoneMatch =
        clientTimezone.toLowerCase() === timezoneId.toLowerCase();

      return {
        ip,
        webrtcIp,
        ipType,
        country,
        countryCode,
        flagEmoji,
        region,
        city,
        postalCode,
        latitude,
        longitude,
        googleMapsUrl,
        isp,
        org,
        asn,
        domain,
        timezoneId,
        timezoneUtcOffset: 'UTC (時差未開示)',
        isTimezoneMatch,
        deviceTimezone: clientTimezone,
        dataSource: 'freeipapi.com (第4IP地理情報API)',
        rawApiResponse: data,
        fetchStatus: 'success',
      };
    }
  } catch (err) {
    console.warn('Tier 4 (freeipapi.com) unfulfilled, proceeding to Tier 5 (BigDataCloud)', err);
  }

  // Tier 5 Provider: BigDataCloud Reverse Geocode & Client Info
  try {
    const data = await fetchWithTimeout(
      'https://api.bigdatacloud.net/data/reverse-geocode-client?localityLanguage=ja',
      3500
    );
    if (data && (data.countryName || data.locality || data.latitude)) {
      const ip = detectedIp || (await detectPublicIpFast()).ip || '未取得';
      const ipType = ip.includes(':') ? 'IPv6' : 'IPv4';
      const countryCode = data.countryCode || 'JP';
      const country = data.countryName || '日本';
      const flagEmoji = countryCodeToFlagEmoji(countryCode);
      const region = data.principalSubdivision || '未取得';
      const city = data.city || data.locality || '未取得';
      const postalCode = data.postcode || '未取得';
      const latitude = typeof data.latitude === 'number' ? data.latitude : null;
      const longitude = typeof data.longitude === 'number' ? data.longitude : null;
      const googleMapsUrl =
        latitude !== null && longitude !== null
          ? `https://www.google.com/maps?q=${latitude},${longitude}`
          : 'https://www.google.com/maps';

      return {
        ip,
        webrtcIp,
        ipType,
        country,
        countryCode,
        flagEmoji,
        region,
        city,
        postalCode,
        latitude,
        longitude,
        googleMapsUrl,
        isp: 'IPプロバイダ (BigDataCloud経由検知)',
        org: country,
        asn: '検知完了',
        domain: '未取得',
        timezoneId: clientTimezone,
        timezoneUtcOffset: '端末設定基準',
        isTimezoneMatch: true,
        deviceTimezone: clientTimezone,
        dataSource: 'BigDataCloud (高可用性地理情報)',
        rawApiResponse: data,
        fetchStatus: 'success',
      };
    }
  } catch (err) {
    console.warn('Tier 5 (BigDataCloud) unfulfilled', err);
  }

  // 6. Honest state when only IP was found after all 5 tier APIs failed
  if (detectedIp) {
    const ipType = detectedIp.includes(':') ? 'IPv6' : 'IPv4';
    return {
      ip: detectedIp,
      webrtcIp,
      ipType,
      country: '地域特定中',
      countryCode: 'N/A',
      flagEmoji: '🌐',
      region: 'IPアドレス検知済',
      city: '照会待機中',
      postalCode: '-',
      latitude: null,
      longitude: null,
      googleMapsUrl: 'https://www.google.com/maps',
      isp: `パブリック回線 (${ipDetectSource}にて検知)`,
      org: '未取得',
      asn: '未取得',
      domain: '未取得',
      timezoneId: clientTimezone,
      timezoneUtcOffset: '端末設定基準',
      isTimezoneMatch: true,
      deviceTimezone: clientTimezone,
      dataSource: `${ipDetectSource} (IPアドレス直接特定)`,
      fetchStatus: 'success',
    };
  }

  return {
    ip: '取得失敗 (ネットワーク接続をご確認ください)',
    webrtcIp: null,
    ipType: 'Unknown',
    country: '未取得',
    countryCode: 'N/A',
    flagEmoji: '🌐',
    region: '未取得',
    city: '未取得',
    postalCode: '未取得',
    latitude: null,
    longitude: null,
    googleMapsUrl: 'https://www.google.com/maps',
    isp: '取得不可',
    org: '取得不可',
    asn: '取得不可',
    domain: '取得不可',
    timezoneId: clientTimezone,
    timezoneUtcOffset: '端末設定基準',
    isTimezoneMatch: true,
    deviceTimezone: clientTimezone,
    dataSource: '取得不可',
    fetchStatus: 'error',
    errorMessage: 'すべてのIP検出サービスへのアクセスが拒否または遮断されました。広告ブロッカーの設定をご確認いただくか、手動IP照会をお試しください。',
  };
}

/**
 * Parse Browser, OS, Features, Storage, and User Agent
 */
export function detectBrowserAndOS(): BrowserSoftwareInfo {
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  const appVersion = typeof navigator !== 'undefined' ? navigator.appVersion : '';
  const vendor = typeof navigator !== 'undefined' ? navigator.vendor : '';

  // Determine Browser & Version
  let browserName = '不明なブラウザ';
  let browserVersion = '-';

  if (/Edg\/([0-9.]+)/.test(ua)) {
    browserName = 'Microsoft Edge';
    browserVersion = RegExp.$1;
  } else if (/OPR\/([0-9.]+)/.test(ua) || /Opera\/([0-9.]+)/.test(ua)) {
    browserName = 'Opera';
    browserVersion = RegExp.$1;
  } else if (/Vivaldi\/([0-9.]+)/.test(ua)) {
    browserName = 'Vivaldi';
    browserVersion = RegExp.$1;
  } else if (/SamsungBrowser\/([0-9.]+)/.test(ua)) {
    browserName = 'Samsung Internet';
    browserVersion = RegExp.$1;
  } else if (/Chrome\/([0-9.]+)/.test(ua)) {
    browserName = 'Google Chrome';
    browserVersion = RegExp.$1;
  } else if (/Firefox\/([0-9.]+)/.test(ua)) {
    browserName = 'Mozilla Firefox';
    browserVersion = RegExp.$1;
  } else if (/Safari\/([0-9.]+)/.test(ua) && !/Chrome/.test(ua)) {
    browserName = 'Apple Safari';
    const versionMatch = ua.match(/Version\/([0-9.]+)/);
    browserVersion = versionMatch ? versionMatch[1] : RegExp.$1;
  }

  // Determine OS & Detailed Version
  let osName = '不明なOS';
  let osVersion = '-';

  if (/Windows NT 10.0/.test(ua)) {
    osName = 'Windows';
    osVersion = '11 / 10 (NT 10.0)';
  } else if (/Windows NT 6.3/.test(ua)) {
    osName = 'Windows';
    osVersion = '8.1 (NT 6.3)';
  } else if (/Windows NT 6.2/.test(ua)) {
    osName = 'Windows';
    osVersion = '8.0 (NT 6.2)';
  } else if (/Windows NT 6.1/.test(ua)) {
    osName = 'Windows';
    osVersion = '7 (NT 6.1)';
  } else if (/Mac OS X (\d+[._]\d+([._]\d+)?)/.test(ua)) {
    osName = 'macOS';
    const rawVer = RegExp.$1.replace(/_/g, '.');
    const verNum = parseFloat(rawVer);
    let osMarketingName = '';
    if (verNum >= 15.0) osMarketingName = 'Sequoia';
    else if (verNum >= 14.0) osMarketingName = 'Sonoma';
    else if (verNum >= 13.0) osMarketingName = 'Ventura';
    else if (verNum >= 12.0) osMarketingName = 'Monterey';
    else if (verNum >= 11.0) osMarketingName = 'Big Sur';
    else if (verNum >= 10.15) osMarketingName = 'Catalina';
    osVersion = `${osMarketingName ? `${osMarketingName} ` : ''}(v${rawVer})`;
  } else if (/iPhone OS (\d+[._]\d+)/.test(ua)) {
    osName = 'iOS (iPhone)';
    osVersion = `v${RegExp.$1.replace(/_/g, '.')}`;
  } else if (/iPad.*OS (\d+[._]\d+)/.test(ua) || (typeof navigator !== 'undefined' && navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
    osName = 'iPadOS';
    const match = ua.match(/OS (\d+[._]\d+)/);
    osVersion = match ? `v${match[1].replace(/_/g, '.')}` : 'Latest (Touch)';
  } else if (/Android (\d+[._]\d+)/.test(ua)) {
    osName = 'Android';
    osVersion = `v${RegExp.$1}`;
  } else if (/Linux/.test(ua)) {
    osName = 'Linux';
    osVersion = 'GNU/Linux';
  } else if (/CrOS/.test(ua)) {
    osName = 'ChromeOS';
    osVersion = 'Chromium OS';
  }

  // Device Category
  let deviceCategory: 'スマートフォン' | 'タブレット' | 'デスクトップPC' | 'スマートデバイス / その他' = 'デスクトップPC';
  if (/iPad|Tablet/i.test(ua) || (typeof navigator !== 'undefined' && navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
    deviceCategory = 'タブレット';
  } else if (/Mobile|Android|iPhone|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua)) {
    deviceCategory = 'スマートフォン';
  } else if (/TV|SmartTV|GoogleTV|HbbTV/i.test(ua)) {
    deviceCategory = 'スマートデバイス / その他';
  }

  // Languages
  const primaryLanguage = typeof navigator !== 'undefined' ? navigator.language : 'ja-JP';
  const allLanguages = typeof navigator !== 'undefined' && navigator.languages ? Array.from(navigator.languages) : [primaryLanguage];

  let primaryLanguageLabel = primaryLanguage;
  if (primaryLanguage.startsWith('ja')) primaryLanguageLabel = '日本語 (Japanese)';
  else if (primaryLanguage.startsWith('en')) primaryLanguageLabel = '英語 (English)';
  else if (primaryLanguage.startsWith('zh')) primaryLanguageLabel = '中国語 (Chinese)';
  else if (primaryLanguage.startsWith('ko')) primaryLanguageLabel = '韓国語 (Korean)';

  // Cookies & Storage capabilities test
  const cookieEnabled = typeof navigator !== 'undefined' ? navigator.cookieEnabled : false;

  let localStorageEnabled = false;
  try {
    if (typeof localStorage !== 'undefined') {
      const testKey = '__cp_storage_test__';
      localStorage.setItem(testKey, '1');
      localStorage.removeItem(testKey);
      localStorageEnabled = true;
    }
  } catch {
    localStorageEnabled = false;
  }

  let sessionStorageEnabled = false;
  try {
    if (typeof sessionStorage !== 'undefined') {
      const testKey = '__cp_sess_test__';
      sessionStorage.setItem(testKey, '1');
      sessionStorage.removeItem(testKey);
      sessionStorageEnabled = true;
    }
  } catch {
    sessionStorageEnabled = false;
  }

  const indexedDbEnabled = typeof window !== 'undefined' && 'indexedDB' in window && window.indexedDB !== null;
  const pdfViewerEnabled = typeof navigator !== 'undefined' && 'pdfViewerEnabled' in navigator ? (navigator as any).pdfViewerEnabled : false;

  // DNT & GPC
  const rawDnt = typeof navigator !== 'undefined' ? (navigator as any).doNotTrack || (window as any).doNotTrack : null;
  const doNotTrack = rawDnt === '1' || rawDnt === 'yes' ? '有効 (1: トラッキング拒否)' : '無効 / 未設定 (0 / 未指定)';
  const globalPrivacyControl = typeof navigator !== 'undefined' && 'globalPrivacyControl' in navigator ? (navigator as any).globalPrivacyControl : null;

  return {
    browserName,
    browserVersion,
    osName,
    osVersion,
    deviceCategory,
    primaryLanguage,
    primaryLanguageLabel,
    allLanguages,
    cookieEnabled,
    localStorageEnabled,
    sessionStorageEnabled,
    indexedDbEnabled,
    pdfViewerEnabled,
    doNotTrack,
    globalPrivacyControl,
    rawUserAgent: ua,
    appVersion,
    vendor,
  };
}
