import React from 'react';
import {
  Globe,
  Wifi,
  Cpu,
  Monitor,
  Clock,
  Battery,
  BatteryCharging,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Navigation,
} from 'lucide-react';
import { FullClientInspectionData } from '../types/clientInfo';
import { formatDuration } from '../utils/clientDetectors';

interface OverviewSectionProps {
  data: FullClientInspectionData;
  onSelectTab: (tabId: string) => void;
  onTriggerPing: () => void;
  onRequestDeviceLocation: () => void;
  isPinging: boolean;
  isRequestingGeo: boolean;
}

export const OverviewSection: React.FC<OverviewSectionProps> = ({
  data,
  onSelectTab,
  onTriggerPing,
  onRequestDeviceLocation,
  isPinging,
  isRequestingGeo,
}) => {
  const { ipGeo, deviceGeo, network, hardware, session, browser } = data;

  return (
    <section id="overview" className="scroll-mt-20">
      {/* Title & Introduction */}
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
            <span>リアルタイム クライアント テレメトリ</span>
            <span aria-hidden="true">·</span>
            <span>診断ID: {session.sessionStartTime.toString().slice(-6)}</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-mono">100% REAL DATA</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            クライアント環境・接続詳細診断
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 max-w-3xl">
            架空の固定値や推定値を一切排除し、お使いのブラウザAPIおよびネットワークから直接取得した実データのみを表示しています。
          </p>
        </div>

        {/* Quick Session Counter */}
        <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-900 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
          {data.username && (
            <>
              <div className="flex flex-col">
                <span className="text-[11px] text-slate-500">診断ユーザー</span>
                <span className="text-sm font-bold font-mono text-cyan-600 dark:text-cyan-400 truncate max-w-[120px]" title={data.username}>
                  {data.username}
                </span>
              </div>
              <div className="h-7 w-[1px] bg-slate-200 dark:border-slate-800" />
            </>
          )}
          <div className="flex flex-col">
            <span className="text-[11px] text-slate-500">訪問カウント</span>
            <span className="text-base font-bold font-mono text-slate-900 dark:text-slate-100 tabular-nums">
              第 {session.visitCount} 回目
            </span>
          </div>
          <div className="h-7 w-[1px] bg-slate-200 dark:border-slate-800" />
          <div className="flex flex-col">
            <span className="text-[11px] text-slate-500">セッション滞在</span>
            <span className="text-base font-semibold font-mono text-cyan-600 dark:text-cyan-400 tabular-nums">
              {formatDuration(session.sessionDurationSeconds)}
            </span>
          </div>
        </div>
      </div>

      {/* 6 Key Telemetry Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Card 1: IP & Geolocation */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-cyan-500" />
                パブリックIP & 位置情報
              </span>
              <span className="text-base">{ipGeo.flagEmoji}</span>
            </div>
            <div className="text-xl font-bold font-mono tracking-tight text-slate-900 dark:text-slate-100 break-all tabular-nums">
              {ipGeo.ip}
            </div>
            <div className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 space-y-0.5">
              <div>
                {ipGeo.country !== '未取得' && ipGeo.country !== '取得失敗 (API通信制限)'
                  ? `${ipGeo.country} · ${ipGeo.region} ${ipGeo.city}`
                  : '位置情報: 未取得または広告ブロッカー遮断'}
              </div>
              <div className="truncate text-slate-500">
                {ipGeo.isp} {ipGeo.asn !== '未取得' ? `(${ipGeo.asn.split(' ')[0]})` : ''}
              </div>
            </div>

            {/* Device GPS Telemetry Row in Overview */}
            <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[11px]">
              <span className="text-slate-500 flex items-center gap-1 shrink-0">
                <Navigation className="w-3 h-3 text-cyan-500" />
                <span>GPS測位:</span>
              </span>
              <div className="text-right truncate ml-2">
                {deviceGeo.status === 'success' && deviceGeo.latitude !== null && deviceGeo.longitude !== null ? (
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold truncate block">
                    {deviceGeo.latitude.toFixed(4)}, {deviceGeo.longitude.toFixed(4)} (±{deviceGeo.accuracyMeters}m)
                  </span>
                ) : deviceGeo.status === 'requesting' || isRequestingGeo ? (
                  <span className="text-cyan-600 dark:text-cyan-400 font-mono animate-pulse">
                    測位中...
                  </span>
                ) : deviceGeo.status === 'denied' ? (
                  <span className="text-rose-500 font-mono">ブラウザ設定で拒否</span>
                ) : (
                  <button
                    onClick={onRequestDeviceLocation}
                    className="text-cyan-600 dark:text-cyan-400 hover:underline font-medium"
                  >
                    位置情報を取得
                  </button>
                )}
              </div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-mono text-[11px]">
              ソース: {ipGeo.dataSource.split(' ')[0]}
            </span>
            <a
              href="#network"
              onClick={() => onSelectTab('network')}
              className="inline-flex items-center gap-0.5 text-cyan-600 dark:text-cyan-400 font-medium hover:underline"
            >
              詳細 <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Card 2: Network & Speed */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Wifi className="w-4 h-4 text-emerald-500" />
                回線種別 & 通信品質
              </span>
              <button
                onClick={onTriggerPing}
                disabled={isPinging}
                className="text-[11px] font-medium text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
              >
                <Zap className={`w-3 h-3 ${isPinging ? 'animate-spin' : ''}`} />
                {isPinging ? '測定中...' : 'Ping測定'}
              </button>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100">
                {network.effectiveType}
              </span>
              <span className="text-xs text-slate-500">({network.connectionType})</span>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg">
                <div className="text-[11px] text-slate-500">推定下り速度</div>
                <div className="font-mono font-bold text-slate-800 dark:text-slate-200 tabular-nums">
                  {network.downlinkMbps !== null ? `${network.downlinkMbps} Mbps` : '非公開 (Safari等)'}
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg">
                <div className="text-[11px] text-slate-500">RTT (往復遅延)</div>
                <div className="font-mono font-bold text-slate-800 dark:text-slate-200 tabular-nums">
                  {network.livePingMs !== null
                    ? `${network.livePingMs} ms (実測)`
                    : network.rttMs !== null
                    ? `${network.rttMs} ms`
                    : '未測定 (Ping実行可)'}
                </div>
              </div>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              データセーバー: {network.saveData === null ? '非対応' : network.saveData ? '有効' : '無効'}
            </span>
            <a
              href="#network"
              onClick={() => onSelectTab('network')}
              className="inline-flex items-center gap-0.5 text-cyan-600 dark:text-cyan-400 font-medium hover:underline"
            >
              詳細 <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Card 3: GPU & Chipset */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-purple-500" />
                GPU レンダラー / チップセット
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                {hardware.webglVersion.split(' ')[0]}
              </span>
            </div>
            <div className="text-lg font-bold text-slate-900 dark:text-slate-100 leading-snug">
              {hardware.cleanedGpuChip}
            </div>
            <div className="mt-1 text-xs text-slate-500 font-mono truncate">
              {hardware.unmaskedVendor}
            </div>
            <div className="mt-2 text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2">
              <span>
                CPU: <strong className="font-mono">{hardware.cpuCores !== null ? `${hardware.cpuCores} コア` : '非公開'}</strong>
              </span>
              <span aria-hidden="true">·</span>
              <span>
                RAM: <strong className="font-mono">{hardware.deviceMemoryGb !== null ? `${hardware.deviceMemoryGb} GB` : '非公開'}</strong>
              </span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              WebGPU: {hardware.webgpuSupported ? '対応' : '非対応'}
            </span>
            <a
              href="#hardware"
              onClick={() => onSelectTab('hardware')}
              className="inline-flex items-center gap-0.5 text-cyan-600 dark:text-cyan-400 font-medium hover:underline"
            >
              詳細 <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Card 4: Display & Screen */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Monitor className="w-4 h-4 text-blue-500" />
                ディスプレイ & 解像度
              </span>
              <span className="text-[11px] font-mono font-bold text-cyan-600 dark:text-cyan-400">
                {hardware.devicePixelRatio}x DPR
              </span>
            </div>
            <div className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100 tabular-nums">
              {hardware.physicalResolution}
            </div>
            <div className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 space-y-0.5">
              <div>有効画面: <span className="font-mono">{hardware.availableResolution}</span></div>
              <div>色深度: <span className="font-mono">{hardware.colorDepth}-bit</span> · {hardware.wideColorGamutP3 ? 'P3広色域' : 'sRGB'} · {hardware.hdrSupported ? 'HDR' : 'SDR'}</div>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              {hardware.isLandscape ? '横向き' : '縦向き'} · タッチ {hardware.maxTouchPoints} 点
            </span>
            <a
              href="#hardware"
              onClick={() => onSelectTab('hardware')}
              className="inline-flex items-center gap-0.5 text-cyan-600 dark:text-cyan-400 font-medium hover:underline"
            >
              詳細 <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Card 5: OS & Browser */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-500" />
                OS & ブラウザ
              </span>
              <span className="text-xs font-medium text-slate-500">
                {browser.deviceCategory}
              </span>
            </div>
            <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {browser.browserName} <span className="font-mono text-sm font-normal text-slate-500">v{browser.browserVersion.split('.')[0]}</span>
            </div>
            <div className="mt-1 text-xs text-slate-600 dark:text-slate-400">
              {browser.osName} {browser.osVersion}
            </div>
            <div className="mt-2 text-xs text-slate-500">
              言語: {browser.primaryLanguageLabel} ({browser.primaryLanguage})
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              DNT: {browser.doNotTrack.startsWith('有効') ? '有効' : '未設定'} · PDFビューア: {browser.pdfViewerEnabled ? '搭載' : '外部'}
            </span>
            <a
              href="#browser"
              onClick={() => onSelectTab('browser')}
              className="inline-flex items-center gap-0.5 text-cyan-600 dark:text-cyan-400 font-medium hover:underline"
            >
              詳細 <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Card 6: Referrer & Battery */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-rose-500" />
                流入経路 & 電源状態
              </span>
              <span className="text-xs text-slate-500">
                {session.referrerCategory === 'direct' ? '直接/秘匿' : session.referrerCategory === 'search' ? '検索経由' : '外部リンク'}
              </span>
            </div>
            <div className="text-base font-bold text-slate-900 dark:text-slate-100 truncate">
              {session.referrerSourceLabel}
            </div>
            <div className="mt-2 flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                {network.batteryCharging ? (
                  <BatteryCharging className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Battery className="w-4 h-4 text-slate-400" />
                )}
                <span className="text-sm font-bold font-mono text-slate-800 dark:text-slate-200">
                  {network.batteryLevel !== null ? `${network.batteryLevel}%` : '非公開 (Safari/非対応)'}
                </span>
              </div>
              <span className="text-xs text-slate-500">
                {network.batteryCharging ? '充電中' : network.batterySupported ? 'バッテリー稼働' : '非公開'}
              </span>
            </div>
            <div className="mt-2 text-xs text-slate-500">
              初回訪問: {session.firstVisitDate}
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              第 {session.visitCount} 回目のセッション
            </span>
            <a
              href="#referrer"
              onClick={() => onSelectTab('referrer')}
              className="inline-flex items-center gap-0.5 text-cyan-600 dark:text-cyan-400 font-medium hover:underline"
            >
              詳細 <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
