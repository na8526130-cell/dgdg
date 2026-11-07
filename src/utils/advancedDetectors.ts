import {
  AdvancedDisplayInfo,
  AudioMediaInfo,
  CodecsInfo,
  NavigationTimingMetrics,
  SecurityAndPrivacyInfo,
  WebApiSupportStatus,
  WebGlLimits,
} from '../types/clientInfo';

/**
 * Measure real screen refresh rate (Hz / FPS) via requestAnimationFrame
 */
export async function measureRefreshRate(): Promise<number> {
  if (typeof window === 'undefined' || !window.requestAnimationFrame) {
    return 60;
  }

  return new Promise((resolve) => {
    let frameCount = 0;
    let startTime = 0;
    const maxFrames = 25;

    const countFrames = (timestamp: number) => {
      if (frameCount === 0) {
        startTime = timestamp;
      }
      frameCount++;

      if (frameCount >= maxFrames) {
        const totalDuration = timestamp - startTime;
        if (totalDuration > 0) {
          const fps = Math.round((frameCount / totalDuration) * 1000);
          // Standardize common Hz brackets
          if (fps >= 135 && fps <= 155) resolve(144);
          else if (fps >= 110 && fps <= 130) resolve(120);
          else if (fps >= 85 && fps <= 95) resolve(90);
          else if (fps >= 55 && fps <= 65) resolve(60);
          else resolve(fps);
        } else {
          resolve(60);
        }
      } else {
        requestAnimationFrame(countFrames);
      }
    };

    requestAnimationFrame(countFrames);
  });
}

/**
 * Detect Audio Context hardware capabilities
 */
export function detectAudioCapabilities(): AudioMediaInfo {
  if (typeof window === 'undefined') {
    return {
      sampleRate: null,
      baseLatencyMs: null,
      maxChannelCount: null,
      state: '非対応',
      audioApiSupported: false,
    };
  }

  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) {
      return {
        sampleRate: null,
        baseLatencyMs: null,
        maxChannelCount: null,
        state: 'ブラウザ非対応',
        audioApiSupported: false,
      };
    }

    const ctx = new AudioContextClass();
    const sampleRate = ctx.sampleRate || 48000;
    const baseLatencyMs = typeof ctx.baseLatency === 'number' ? Math.round(ctx.baseLatency * 1000 * 10) / 10 : null;
    const maxChannelCount = ctx.destination ? ctx.destination.maxChannelCount : 2;
    const state = ctx.state || 'suspended';

    // Close temporary context to avoid holding audio hardware
    try {
      ctx.close();
    } catch {}

    return {
      sampleRate,
      baseLatencyMs,
      maxChannelCount,
      state,
      audioApiSupported: true,
    };
  } catch {
    return {
      sampleRate: null,
      baseLatencyMs: null,
      maxChannelCount: null,
      state: '初期化拒否',
      audioApiSupported: false,
    };
  }
}

/**
 * Detect supported Video and Audio Codecs
 */
export function detectMediaCodecs(): CodecsInfo {
  if (typeof document === 'undefined') {
    return { videoCodecs: [], audioCodecs: [] };
  }

  const videoEl = document.createElement('video');

  const checkVideo = (mime: string) => {
    const play = videoEl.canPlayType(mime);
    return play === 'probably' || play === 'maybe';
  };

  const videoCodecs = [
    { name: 'H.264 / AVC (High Profile)', mimeType: 'video/mp4; codecs="avc1.640028"', supported: checkVideo('video/mp4; codecs="avc1.640028"') },
    { name: 'H.265 / HEVC', mimeType: 'video/mp4; codecs="hvc1.1.6.L93.B0"', supported: checkVideo('video/mp4; codecs="hvc1.1.6.L93.B0"') },
    { name: 'AV1 (次世代オープン規格)', mimeType: 'video/mp4; codecs="av01.0.08M.08"', supported: checkVideo('video/mp4; codecs="av01.0.08M.08"') },
    { name: 'VP9 (Google / WebM)', mimeType: 'video/webm; codecs="vp9"', supported: checkVideo('video/webm; codecs="vp9"') },
    { name: 'VP8 (WebM)', mimeType: 'video/webm; codecs="vp8"', supported: checkVideo('video/webm; codecs="vp8"') },
  ];

  const audioCodecs = [
    { name: 'AAC (Advanced Audio Coding)', mimeType: 'audio/mp4; codecs="mp4a.40.2"', supported: checkVideo('audio/mp4; codecs="mp4a.40.2"') },
    { name: 'Opus (低遅延・高音質)', mimeType: 'audio/ogg; codecs="opus"', supported: checkVideo('audio/ogg; codecs="opus"') },
    { name: 'FLAC (可逆圧縮ロスレス)', mimeType: 'audio/flac', supported: checkVideo('audio/flac') },
    { name: 'MP3 (MPEG-1 Audio Layer III)', mimeType: 'audio/mpeg', supported: checkVideo('audio/mpeg') },
    { name: 'Vorbis (Ogg)', mimeType: 'audio/ogg; codecs="vorbis"', supported: checkVideo('audio/ogg; codecs="vorbis"') },
  ];

  return { videoCodecs, audioCodecs };
}

/**
 * Generate Canvas 2D Fingerprint entropy hash (for fingerprint preview and noise audit)
 */
function generateCanvasHash(): { hash: string; hasNoise: boolean } {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 50;
    const ctx = canvas.getContext('2d');
    if (!ctx) return { hash: '取得不可', hasNoise: false };

    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('ClientProfiler, 🌐 123.4', 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText('ClientProfiler, 🌐 123.4', 4, 17);

    const dataUrl1 = canvas.toDataURL();

    // Check if repeated extraction injects random noise (like Brave Shields or Firefox resistFingerprinting)
    const ctx2 = canvas.getContext('2d');
    const dataUrl2 = canvas.toDataURL();
    const hasNoise = dataUrl1 !== dataUrl2;

    // Simple hash calculation of string
    let h = 0;
    for (let i = 0; i < dataUrl1.length; i++) {
      h = (Math.imul(31, h) + dataUrl1.charCodeAt(i)) | 0;
    }
    const hashHex = `0x${(h >>> 0).toString(16).toUpperCase()}`;

    return { hash: hashHex, hasNoise };
  } catch {
    return { hash: '保護により取得不可', hasNoise: true };
  }
}

/**
 * Detect all WebGL 1.0 & 2.0 internal limits, precisions, and extensions
 */
export function detectWebGlLimits(): WebGlLimits {
  let maxTextureSize = 0;
  let maxCubeMapSize = 0;
  let maxRenderBufferSize = 0;
  let maxViewportDims = '取得不可';
  let maxVertexAttribs = 0;
  let maxVertexUniformVectors = 0;
  let maxFragmentUniformVectors = 0;
  let maxVaryingVectors = 0;
  let maxCombinedTextureUnits = 0;
  let aliasedLineWidthRange = '1 - 1';
  let aliasedPointSizeRange = '1 - 1024';
  let supportedExtensions: string[] = [];

  try {
    const canvas = document.createElement('canvas');
    const gl = (canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;

    if (gl) {
      maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE) || 0;
      maxCubeMapSize = gl.getParameter(gl.MAX_CUBE_MAP_TEXTURE_SIZE) || 0;
      maxRenderBufferSize = gl.getParameter(gl.MAX_RENDERBUFFER_SIZE) || 0;

      const viewportDims = gl.getParameter(gl.MAX_VIEWPORT_DIMS);
      if (viewportDims && viewportDims.length >= 2) {
        maxViewportDims = `${viewportDims[0]} × ${viewportDims[1]} px`;
      }

      maxVertexAttribs = gl.getParameter(gl.MAX_VERTEX_ATTRIBS) || 0;
      maxVertexUniformVectors = gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS) || 0;
      maxFragmentUniformVectors = gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS) || 0;
      maxVaryingVectors = gl.getParameter(gl.MAX_VARYING_VECTORS) || 0;
      maxCombinedTextureUnits = gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS) || 0;

      const lineWidth = gl.getParameter(gl.ALIASED_LINE_WIDTH_RANGE);
      if (lineWidth) aliasedLineWidthRange = `${lineWidth[0]} - ${lineWidth[1]}`;

      const pointSize = gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE);
      if (pointSize) aliasedPointSizeRange = `${pointSize[0]} - ${pointSize[1]}`;

      const exts = gl.getSupportedExtensions();
      if (exts) supportedExtensions = Array.from(exts);
    }
  } catch (e) {
    console.warn('WebGL limits detection failed', e);
  }

  const { hash: canvasFingerprintHash } = generateCanvasHash();

  return {
    maxTextureSize,
    maxCubeMapSize,
    maxRenderBufferSize,
    maxViewportDims,
    maxVertexAttribs,
    maxVertexUniformVectors,
    maxFragmentUniformVectors,
    maxVaryingVectors,
    maxCombinedTextureUnits,
    aliasedLineWidthRange,
    aliasedPointSizeRange,
    supportedExtensions,
    canvasFingerprintHash,
  };
}

/**
 * Detect Advanced Display and Media Queries
 */
export function detectAdvancedDisplay(measuredFps: number | null): AdvancedDisplayInfo {
  if (typeof window === 'undefined') {
    return {
      colorGamut: 'sRGB',
      dynamicRange: 'SDR',
      prefersColorScheme: 'dark',
      prefersReducedMotion: false,
      prefersContrast: 'no-preference',
      primaryPointer: 'fine (マウス/ペン)',
      hoverSupported: true,
      measuredFps,
    };
  }

  let colorGamut: 'sRGB' | 'Display P3' | 'Rec. 2020' = 'sRGB';
  if (window.matchMedia('(color-gamut: rec2020)').matches) {
    colorGamut = 'Rec. 2020';
  } else if (window.matchMedia('(color-gamut: p3)').matches) {
    colorGamut = 'Display P3';
  }

  const dynamicRange = window.matchMedia('(dynamic-range: high)').matches ? 'HDR' : 'SDR';

  let prefersColorScheme: 'dark' | 'light' | 'no-preference' = 'no-preference';
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) prefersColorScheme = 'dark';
  else if (window.matchMedia('(prefers-color-scheme: light)').matches) prefersColorScheme = 'light';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let prefersContrast: 'more' | 'less' | 'no-preference' = 'no-preference';
  if (window.matchMedia('(prefers-contrast: more)').matches) prefersContrast = 'more';
  else if (window.matchMedia('(prefers-contrast: less)').matches) prefersContrast = 'less';

  let primaryPointer: 'fine (マウス/ペン)' | 'coarse (指/タッチ)' | 'none' = 'fine (マウス/ペン)';
  if (window.matchMedia('(pointer: coarse)').matches) primaryPointer = 'coarse (指/タッチ)';
  else if (window.matchMedia('(pointer: none)').matches) primaryPointer = 'none';

  const hoverSupported = window.matchMedia('(hover: hover)').matches;

  return {
    colorGamut,
    dynamicRange,
    prefersColorScheme,
    prefersReducedMotion,
    prefersContrast,
    primaryPointer,
    hoverSupported,
    measuredFps,
  };
}

/**
 * Measure Performance & Navigation Timing API metrics
 */
export function detectNavigationTiming(): NavigationTimingMetrics {
  if (typeof window === 'undefined' || !window.performance) {
    return {
      dnsLookupMs: null,
      tcpHandshakeMs: null,
      tlsNegotiationMs: null,
      ttfbMs: null,
      domContentLoadedMs: null,
      pageCompleteLoadMs: null,
      jsHeapUsedMb: null,
      jsHeapTotalMb: null,
    };
  }

  let dnsLookupMs: number | null = null;
  let tcpHandshakeMs: number | null = null;
  let tlsNegotiationMs: number | null = null;
  let ttfbMs: number | null = null;
  let domContentLoadedMs: number | null = null;
  let pageCompleteLoadMs: number | null = null;

  try {
    const navEntries = performance.getEntriesByType('navigation');
    if (navEntries && navEntries.length > 0) {
      const nav = navEntries[0] as PerformanceNavigationTiming;
      dnsLookupMs = nav.domainLookupEnd > 0 && nav.domainLookupStart > 0 ? Math.round(nav.domainLookupEnd - nav.domainLookupStart) : null;
      tcpHandshakeMs = nav.connectEnd > 0 && nav.connectStart > 0 ? Math.round(nav.connectEnd - nav.connectStart) : null;
      tlsNegotiationMs = nav.secureConnectionStart > 0 && nav.connectEnd > 0 ? Math.round(nav.connectEnd - nav.secureConnectionStart) : null;
      ttfbMs = nav.responseStart > 0 && nav.requestStart > 0 ? Math.round(nav.responseStart - nav.requestStart) : null;
      domContentLoadedMs = nav.domContentLoadedEventEnd > 0 ? Math.round(nav.domContentLoadedEventEnd) : null;
      pageCompleteLoadMs = nav.loadEventEnd > 0 ? Math.round(nav.loadEventEnd) : null;
    }
  } catch (e) {
    console.warn('Navigation timing extraction error', e);
  }

  // Memory (Chromium specific)
  let jsHeapUsedMb: number | null = null;
  let jsHeapTotalMb: number | null = null;
  const memory = (performance as any).memory;
  if (memory && typeof memory.usedJSHeapSize === 'number') {
    jsHeapUsedMb = Math.round((memory.usedJSHeapSize / (1024 * 1024)) * 10) / 10;
    jsHeapTotalMb = Math.round((memory.totalJSHeapSize / (1024 * 1024)) * 10) / 10;
  }

  return {
    dnsLookupMs,
    tcpHandshakeMs,
    tlsNegotiationMs,
    ttfbMs,
    domContentLoadedMs,
    pageCompleteLoadMs,
    jsHeapUsedMb,
    jsHeapTotalMb,
  };
}

/**
 * Detect AdBlocker, Incognito mode, and Privacy Security settings
 */
export async function detectSecurityAndPrivacy(): Promise<SecurityAndPrivacyInfo> {
  let isSecureContext = typeof window !== 'undefined' ? Boolean(window.isSecureContext) : false;
  let crossOriginIsolated = typeof window !== 'undefined' ? Boolean(window.crossOriginIsolated) : false;

  // Cookie, LocalStorage, SessionStorage, IndexedDB
  const cookieEnabled = typeof navigator !== 'undefined' ? navigator.cookieEnabled : false;
  let localStorageWorking = false;
  try {
    localStorage.setItem('__sec_test__', '1');
    localStorage.removeItem('__sec_test__');
    localStorageWorking = true;
  } catch {}

  let sessionStorageWorking = false;
  try {
    sessionStorage.setItem('__sec_test__', '1');
    sessionStorage.removeItem('__sec_test__');
    sessionStorageWorking = true;
  } catch {}

  const indexedDbWorking = typeof window !== 'undefined' && 'indexedDB' in window && window.indexedDB !== null;

  // AdBlocker test (attempts to fetch a known tracker URL or test a dummy ad element)
  let adBlockDetected = false;
  let adBlockNote = '広告ブロッカーは未検知です';
  try {
    const dummyDiv = document.createElement('div');
    dummyDiv.className = 'adsbox pub_300x250 pub_300x250m pub_728x90 text-ad textAd text_ad text_ads';
    dummyDiv.style.position = 'absolute';
    dummyDiv.style.left = '-9999px';
    document.body.appendChild(dummyDiv);
    if (dummyDiv.offsetHeight === 0 || dummyDiv.clientHeight === 0 || getComputedStyle(dummyDiv).display === 'none') {
      adBlockDetected = true;
      adBlockNote = 'uBlock Origin / AdGuard 等の要素ブロックルールにより検知されました';
    }
    document.body.removeChild(dummyDiv);
  } catch {}

  // Incognito detection test via storage quota check
  let incognitoDetected = false;
  let incognitoConfidence: '高' | '中' | '低' | '通常モード' = '通常モード';

  if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.estimate) {
    try {
      const { quota } = await navigator.storage.estimate();
      if (quota && quota < 120000000) {
        // Under 120MB quota in certain browsers indicates private window
        incognitoDetected = true;
        incognitoConfidence = '中';
      }
    } catch {}
  }

  const { hasNoise: canvasProtectionActive } = generateCanvasHash();

  return {
    adBlockDetected,
    adBlockNote,
    incognitoDetected,
    incognitoConfidence,
    isSecureContext,
    crossOriginIsolated,
    cookieEnabled,
    localStorageWorking,
    sessionStorageWorking,
    indexedDbWorking,
    canvasProtectionActive,
  };
}

/**
 * Comprehensive list of 40+ Modern Web APIs and Device Sensor support
 */
export function detectWebApis(): WebApiSupportStatus[] {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return [];

  const list: WebApiSupportStatus[] = [
    // ハードウェア・デバイス
    { name: 'Geolocation API (GPS/位置測位)', category: 'ハードウェア', supported: 'geolocation' in navigator, description: 'GPSやWi-Fi/基地局による高精度な現在地測位' },
    { name: 'Web Bluetooth API', category: 'ハードウェア', supported: 'bluetooth' in navigator, description: '近隣のBLE機器との直接無線通信' },
    { name: 'Web USB API', category: 'ハードウェア', supported: 'usb' in navigator, description: 'USB機器への直接低レベルアクセス' },
    { name: 'Web Serial API', category: 'ハードウェア', supported: 'serial' in navigator, description: 'シリアルポート/マイコン等との直接シリアル通信' },
    { name: 'Web HID API', category: 'ハードウェア', supported: 'hid' in navigator, description: 'ヒューマンインターフェース機器(ゲームパッド/専用キーボード)' },
    { name: 'Web NFC API', category: 'ハードウェア', supported: 'NDEFReader' in window, description: 'NFCタグの読み書き(Android Chrome等)' },
    { name: 'Gamepad API', category: 'ハードウェア', supported: 'getGamepads' in navigator, description: 'コントローラーのボタン・スティック入力検出' },
    { name: 'DeviceOrientation (ジャイロ)', category: 'ハードウェア', supported: 'DeviceOrientationEvent' in window, description: '端末の3軸傾き・方位センサー' },
    { name: 'DeviceMotion (加速度)', category: 'ハードウェア', supported: 'DeviceMotionEvent' in window, description: '加速度・角速度センサー' },
    { name: 'Vibration API (バイブレーション)', category: 'ハードウェア', supported: 'vibrate' in navigator, description: '端末振動フィードバック' },
    { name: 'Screen Wake Lock API', category: 'ハードウェア', supported: 'wakeLock' in navigator, description: '画面のスリープ・減光を防止する機能' },

    // 通信 & ネットワーク
    { name: 'WebSockets API', category: '通信', supported: 'WebSocket' in window, description: 'サーバーとの低遅延双方向リアルタイム通信' },
    { name: 'WebRTC API', category: '通信', supported: 'RTCPeerConnection' in window, description: 'P2Pオーディオ・ビデオ・データチャネル通信' },
    { name: 'WebTransport API', category: '通信', supported: 'WebTransport' in window, description: 'HTTP/3(QUIC)ベースの低遅延通信プロトコル' },
    { name: 'Beacon API', category: '通信', supported: 'sendBeacon' in navigator, description: 'ページ離脱時の非同期テレメトリ送信' },
    { name: 'Server-Sent Events (SSE)', category: '通信', supported: 'EventSource' in window, description: 'サーバーからの単方向ストリーミング通信' },
    { name: 'Fetch API', category: '通信', supported: 'fetch' in window, description: 'モダンな非同期HTTPリクエスト規格' },

    // グラフィックス & メディア
    { name: 'WebGL 2.0', category: 'グラフィックス', supported: (() => { try { return Boolean(document.createElement('canvas').getContext('webgl2')); } catch { return false; } })(), description: 'モダン3DグラフィックスAPI (OpenGL ES 3.0準拠)' },
    { name: 'WebGPU API', category: 'グラフィックス', supported: 'gpu' in navigator, description: 'Metal / Vulkan / D3D12 に直結する次世代GPU計算規格' },
    { name: 'Canvas 2D Context', category: 'グラフィックス', supported: (() => { try { return Boolean(document.createElement('canvas').getContext('2d')); } catch { return false; } })(), description: 'ビットマップ描画・グラフィックス生成' },
    { name: 'OffscreenCanvas API', category: 'グラフィックス', supported: 'OffscreenCanvas' in window, description: 'Web Workerバックグラウンドスレッドでの高速描画' },
    { name: 'Media Source Extensions (MSE)', category: 'グラフィックス', supported: 'MediaSource' in window, description: '適応型ビットレートストリーミング (HLS / DASH)' },
    { name: 'Web Audio API', category: 'グラフィックス', supported: 'AudioContext' in window || 'webkitAudioContext' in window, description: '高度な音声合成・DSP・リアルタイム空間音響' },
    { name: 'Picture-in-Picture API', category: 'グラフィックス', supported: 'pictureInPictureEnabled' in document, description: '動画のミニプレイヤー常時最前面表示' },

    // システム & ストレージ
    { name: 'Service Worker API', category: 'システム', supported: 'serviceWorker' in navigator, description: 'オフラインキャッシュ・PWAバックグラウンド制御' },
    { name: 'Web Workers API', category: 'システム', supported: 'Worker' in window, description: 'UIをブロックしないマルチスレッド並列処理' },
    { name: 'SharedWorker API', category: 'システム', supported: 'SharedWorker' in window, description: '複数タブ間で共有されるバックグラウンドワーカー' },
    { name: 'IndexedDB API', category: 'システム', supported: 'indexedDB' in window, description: 'クライアントサイド構造化NoSQLデータベース' },
    { name: 'Cache Storage API', category: 'システム', supported: 'caches' in window, description: 'HTTPリクエスト/レスポンスの永続キャッシュ' },
    { name: 'File System Access API', category: 'システム', supported: 'showOpenFilePicker' in window, description: 'ローカルファイル/ディレクトリの直接読み書き' },
    { name: 'Web Share API', category: 'システム', supported: 'share' in navigator, description: 'OSネイティブ共有ダイアログの呼び出し' },
    { name: 'Clipboard API (Async)', category: 'システム', supported: 'clipboard' in navigator, description: '非同期クリップボード読み書き' },

    // セキュリティ & 認証
    { name: 'Web Authentication (WebAuthn)', category: 'セキュリティ', supported: 'credentials' in navigator && Boolean(window.PublicKeyCredential), description: 'Passkey・指紋認証・FIDO2生体ログイン' },
    { name: 'Web Crypto API', category: 'セキュリティ', supported: 'crypto' in window && Boolean(window.crypto.subtle), description: 'SHA-256/AES-GCM/RSA高速暗号化計算' },
    { name: 'Permissions API', category: 'セキュリティ', supported: 'permissions' in navigator, description: '各種ハードウェア権限状態の安全な照会' },
    { name: 'WebAssembly (Wasm)', category: 'セキュリティ', supported: 'WebAssembly' in window, description: 'C/C++/Rust等のバイナリ超高速ネイティブ実行' },
    { name: 'Wasm SIMD', category: 'セキュリティ', supported: (() => { try { return WebAssembly.validate(new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 1, 5, 1, 96, 0, 1, 123, 3, 2, 1, 0, 10, 10, 1, 8, 0, 65, 0, 253, 15, 26, 11])); } catch { return false; } })(), description: 'CPUベクトル並列演算 (128-bit SIMD)' },
  ];

  return list;
}
