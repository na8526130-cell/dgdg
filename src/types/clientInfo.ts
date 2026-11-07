export type ReferrerCategory = 'direct' | 'search' | 'social' | 'external' | 'internal';

export interface UtmParams {
  source?: string;
  medium?: string;
  campaign?: string;
  term?: string;
  content?: string;
}

export interface ReferrerSessionInfo {
  username?: string;
  referrer: string;
  referrerCategory: ReferrerCategory;
  referrerSourceLabel: string;
  referrerNote?: string;
  searchEngineName?: string;
  searchQuery?: string;
  utmParams: UtmParams;
  visitCount: number;
  firstVisitDate: string;
  firstVisitRelative: string;
  lastActiveTimestamp: number;
  sessionStartTime: number;
  sessionDurationSeconds: number;
}

export interface ActivityEvent {
  id: string;
  timestamp: number;
  timeFormatted: string;
  relativeTime: string;
  type: 'page_load' | 'scroll' | 'click' | 'visibility' | 'resize' | 'orientation' | 'speed_test' | 'copy' | 'idle' | 'resume';
  title: string;
  details: string;
  badge: string;
}

export interface NetworkBatteryInfo {
  effectiveType: string;
  effectiveTypeNote?: string;
  connectionType: string;
  downlinkMbps: number | null;
  rttMs: number | null;
  saveData: boolean | null;
  networkApiSupported: boolean;
  isOnline: boolean;
  batteryLevel: number | null;
  batteryCharging: boolean | null;
  batteryChargingTime: number | null;
  batteryDischargingTime: number | null;
  batterySupported: boolean;
  batteryNote?: string;
  livePingMs: number | null;
  livePingMin: number | null;
  livePingMax: number | null;
  livePingJitter: number | null;
  pingStatus: 'idle' | 'testing' | 'success' | 'error';
  pingError?: string;
}

export interface WebGlLimits {
  maxTextureSize: number;
  maxCubeMapSize: number;
  maxRenderBufferSize: number;
  maxViewportDims: string;
  maxVertexAttribs: number;
  maxVertexUniformVectors: number;
  maxFragmentUniformVectors: number;
  maxVaryingVectors: number;
  maxCombinedTextureUnits: number;
  aliasedLineWidthRange: string;
  aliasedPointSizeRange: string;
  supportedExtensions: string[];
  canvasFingerprintHash: string;
}

export interface HardwareGpuInfo {
  unmaskedRenderer: string;
  unmaskedVendor: string;
  cleanedGpuChip: string;
  gpuNote?: string;
  webglVersion: string;
  webgpuSupported: boolean;
  maxTextureSize: number;
  cpuCores: number | null;
  cpuCoresNote?: string;
  deviceMemoryGb: number | null;
  deviceMemoryNote?: string;
  physicalResolution: string;
  physicalWidth: number;
  physicalHeight: number;
  availableResolution: string;
  availWidth: number;
  availHeight: number;
  cssResolution: string;
  innerWidth: number;
  innerHeight: number;
  devicePixelRatio: number;
  colorDepth: number;
  pixelDepth: number;
  wideColorGamutP3: boolean;
  hdrSupported: boolean;
  maxTouchPoints: number;
  touchSupported: boolean;
  orientationType: string;
  orientationAngle: number;
  isLandscape: boolean;
  platform: string;
  webglLimits?: WebGlLimits;
}

export interface IpGeoInfo {
  ip: string;
  webrtcIp?: string | null;
  ipType: 'IPv4' | 'IPv6' | 'Unknown';
  country: string;
  countryCode: string;
  flagEmoji: string;
  region: string;
  city: string;
  postalCode: string;
  latitude: number | null;
  longitude: number | null;
  googleMapsUrl: string;
  isp: string;
  org: string;
  asn: string;
  domain: string;
  timezoneId: string;
  timezoneUtcOffset: string;
  isTimezoneMatch: boolean;
  deviceTimezone: string;
  dataSource: string;
  rawApiResponse?: any;
  fetchStatus: 'idle' | 'loading' | 'success' | 'error';
  errorMessage?: string;
}

export interface AudioMediaInfo {
  sampleRate: number | null;
  baseLatencyMs: number | null;
  maxChannelCount: number | null;
  state: string;
  audioApiSupported: boolean;
}

export interface CodecSupportItem {
  name: string;
  mimeType: string;
  supported: boolean;
}

export interface CodecsInfo {
  videoCodecs: CodecSupportItem[];
  audioCodecs: CodecSupportItem[];
}

export interface AdvancedDisplayInfo {
  colorGamut: 'sRGB' | 'Display P3' | 'Rec. 2020';
  dynamicRange: 'HDR' | 'SDR';
  prefersColorScheme: 'dark' | 'light' | 'no-preference';
  prefersReducedMotion: boolean;
  prefersContrast: 'more' | 'less' | 'no-preference';
  primaryPointer: 'fine (マウス/ペン)' | 'coarse (指/タッチ)' | 'none';
  hoverSupported: boolean;
  measuredFps: number | null;
}

export interface NavigationTimingMetrics {
  dnsLookupMs: number | null;
  tcpHandshakeMs: number | null;
  tlsNegotiationMs: number | null;
  ttfbMs: number | null;
  domContentLoadedMs: number | null;
  pageCompleteLoadMs: number | null;
  jsHeapUsedMb: number | null;
  jsHeapTotalMb: number | null;
}

export interface SecurityAndPrivacyInfo {
  adBlockDetected: boolean;
  adBlockNote: string;
  incognitoDetected: boolean;
  incognitoConfidence: '高' | '中' | '低' | '通常モード';
  isSecureContext: boolean;
  crossOriginIsolated: boolean;
  cookieEnabled: boolean;
  localStorageWorking: boolean;
  sessionStorageWorking: boolean;
  indexedDbWorking: boolean;
  canvasProtectionActive: boolean;
}

export interface WebApiSupportStatus {
  name: string;
  category: 'ハードウェア' | '通信' | 'グラフィックス' | 'システム' | 'セキュリティ';
  supported: boolean;
  description: string;
}

export interface BrowserSoftwareInfo {
  browserName: string;
  browserVersion: string;
  osName: string;
  osVersion: string;
  deviceCategory: 'スマートフォン' | 'タブレット' | 'デスクトップPC' | 'スマートデバイス / その他';
  primaryLanguage: string;
  primaryLanguageLabel: string;
  allLanguages: string[];
  cookieEnabled: boolean;
  localStorageEnabled: boolean;
  sessionStorageEnabled: boolean;
  indexedDbEnabled: boolean;
  pdfViewerEnabled: boolean;
  doNotTrack: string;
  globalPrivacyControl: boolean | null;
  rawUserAgent: string;
  appVersion: string;
  vendor: string;
}

export interface DeviceGeolocationInfo {
  permissionState: 'granted' | 'prompt' | 'denied' | 'unsupported' | 'unknown';
  status: 'idle' | 'checking' | 'prompt' | 'requesting' | 'success' | 'denied' | 'error' | 'unsupported';
  latitude: number | null;
  longitude: number | null;
  accuracyMeters: number | null;
  altitudeMeters: number | null;
  altitudeAccuracyMeters: number | null;
  heading: number | null;
  speedMps: number | null;
  timestamp: number | null;
  fetchedAtFormatted: string | null;
  addressSummary?: string;
  errorMessage?: string;
  googleMapsUrl?: string;
  distanceFromIpKm?: number | null;
}

export interface ClientHintsInfo {
  supported: boolean;
  architecture?: string;
  bitness?: string;
  model?: string;
  platformVersion?: string;
  mobile?: boolean;
  brands?: Array<{ brand: string; version: string }>;
}

export interface PermissionsMatrix {
  geolocation: 'granted' | 'prompt' | 'denied' | 'unsupported';
  camera: 'granted' | 'prompt' | 'denied' | 'unsupported';
  microphone: 'granted' | 'prompt' | 'denied' | 'unsupported';
  notifications: 'granted' | 'default' | 'denied' | 'unsupported';
  clipboardRead: 'granted' | 'prompt' | 'denied' | 'unsupported';
  clipboardWrite: 'granted' | 'prompt' | 'denied' | 'unsupported';
  persistentStorage: 'granted' | 'prompt' | 'denied' | 'unsupported';
  screenWakeLock: 'granted' | 'prompt' | 'denied' | 'unsupported';
}

export interface MediaDevicesSummary {
  supported: boolean;
  videoInputCount: number;
  audioInputCount: number;
  audioOutputCount: number;
  totalDevices: number;
  deviceLabels: string[];
}

export interface StorageEstimateInfo {
  supported: boolean;
  quotaMb: number | null;
  quotaGb: number | null;
  usageMb: number | null;
  usagePercent: number | null;
  isPersisted: boolean | null;
}

export interface InstalledFontsInfo {
  detectedFonts: string[];
  totalScanned: number;
  detectedCount: number;
  fontFingerprintHash: string;
}

export interface WebRtcCandidateInfo {
  supported: boolean;
  localIps: string[];
  candidateTypes: string[];
  dualStackIpv6: boolean;
  status: string;
}

export interface FullClientInspectionData {
  username?: string;
  session: ReferrerSessionInfo;
  network: NetworkBatteryInfo;
  hardware: HardwareGpuInfo;
  ipGeo: IpGeoInfo;
  deviceGeo: DeviceGeolocationInfo;
  browser: BrowserSoftwareInfo;
  audio: AudioMediaInfo;
  codecs: CodecsInfo;
  display: AdvancedDisplayInfo;
  performanceTiming: NavigationTimingMetrics;
  security: SecurityAndPrivacyInfo;
  webApis: WebApiSupportStatus[];
  clientHints?: ClientHintsInfo;
  permissions?: PermissionsMatrix;
  mediaDevices?: MediaDevicesSummary;
  storage?: StorageEstimateInfo;
  fonts?: InstalledFontsInfo;
  webrtcInfo?: WebRtcCandidateInfo;
  inspectedAt: string;
}

