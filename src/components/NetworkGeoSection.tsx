import React, { useState } from 'react';
import {
  Globe,
  ExternalLink,
  Copy,
  Zap,
  MapPin,
  Server,
  Activity,
  BatteryCharging,
  Battery,
  ShieldAlert,
  Search,
  CheckCircle,
  HelpCircle,
  Navigation,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { DeviceGeolocationInfo, IpGeoInfo, NetworkBatteryInfo } from '../types/clientInfo';

interface NetworkGeoSectionProps {
  ipGeo: IpGeoInfo;
  deviceGeo: DeviceGeolocationInfo;
  network: NetworkBatteryInfo;
  onCopy: (text: string, label: string) => void;
  onTriggerPing: () => void;
  onLookupIp: (ip: string) => void;
  onRequestDeviceLocation: () => void;
  isPinging: boolean;
  isLookingUp: boolean;
  isRequestingGeo: boolean;
}

export const NetworkGeoSection: React.FC<NetworkGeoSectionProps> = ({
  ipGeo,
  deviceGeo,
  network,
  onCopy,
  onTriggerPing,
  onLookupIp,
  onRequestDeviceLocation,
  isPinging,
  isLookingUp,
  isRequestingGeo,
}) => {
  const [manualIpInput, setManualIpInput] = useState('');
  const [showRawJson, setShowRawJson] = useState(false);

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualIpInput.trim()) {
      onLookupIp(manualIpInput.trim());
    }
  };

  return (
    <section id="network" className="scroll-mt-20 space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-600 dark:text-cyan-400 mb-1">
            <Globe className="w-4 h-4" />
            <span>ネットワーク・IP地理情報 & 通信品質</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            パブリックIP・プロバイダ(ISP)・実測回線品質
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onTriggerPing}
            disabled={isPinging}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm transition-colors"
          >
            <Zap className={`w-3.5 h-3.5 text-amber-500 ${isPinging ? 'animate-spin' : ''}`} />
            <span>{isPinging ? '実測Ping測定中...' : '実測Pingプローブ実行'}</span>
          </button>
        </div>
      </div>

      {/* Manual IP Verification & Transparency Bar */}
      <div className="bg-slate-100 dark:bg-slate-900/90 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 shrink-0">
            <Search className="w-3.5 h-3.5 text-cyan-500" />
            IP手動再検証 / 任意IP照会:
          </span>
          <form onSubmit={handleManualSearch} className="flex items-center gap-2 flex-1 md:w-72">
            <input
              type="text"
              placeholder="例: 133.242.0.1 または 自身のIP"
              value={manualIpInput}
              onChange={(e) => setManualIpInput(e.target.value)}
              className="px-2.5 py-1 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-500 w-full"
            />
            <button
              type="submit"
              disabled={isLookingUp}
              className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded-md font-medium shrink-0 disabled:opacity-50"
            >
              {isLookingUp ? '照会中...' : '照会'}
            </button>
          </form>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <span className="text-slate-500 font-mono text-[11px] truncate">
            ソース: <strong className="text-slate-700 dark:text-slate-300">{ipGeo.dataSource}</strong>
          </span>
          <button
            onClick={() => onLookupIp('')}
            disabled={isLookingUp}
            className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/10 border border-cyan-500/30 rounded transition-colors"
            title="最新のIPおよび地理情報を再照会"
          >
            <RefreshCw className={`w-3 h-3 ${isLookingUp ? 'animate-spin' : ''}`} />
            <span>再取得</span>
          </button>
          {ipGeo.rawApiResponse && (
            <button
              onClick={() => setShowRawJson(!showRawJson)}
              className="px-2 py-0.5 text-[11px] text-cyan-600 dark:text-cyan-400 hover:underline border border-cyan-500/30 rounded"
            >
              {showRawJson ? '生API閉じる' : '生APIデータ確認'}
            </button>
          )}
        </div>
      </div>

      {showRawJson && ipGeo.rawApiResponse && (
        <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-emerald-400 overflow-x-auto max-h-60">
          <pre>{JSON.stringify(ipGeo.rawApiResponse, null, 2)}</pre>
        </div>
      )}

      {/* Adblocker / Fallback warning banner if Geo API was blocked */}
      {ipGeo.errorMessage && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-xl flex items-start gap-3 text-xs text-amber-900 dark:text-amber-200">
          <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block mb-0.5">位置情報・プロバイダAPIの通信状況:</span>
            {ipGeo.errorMessage}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: IP & Geolocation Card + Device GPS Geolocation Card */}
        <div className="space-y-6">
          {/* Card 1: IP Geolocation */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{ipGeo.flagEmoji}</span>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {ipGeo.country} {ipGeo.countryCode !== 'N/A' ? `(${ipGeo.countryCode})` : ''}
                  </h3>
                  <span className="text-xs text-slate-500 font-mono">
                    {ipGeo.ipType} アドレス (IP概算位置)
                  </span>
                </div>
              </div>

              <button
                onClick={() => onCopy(ipGeo.ip, 'パブリックIPアドレス')}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors"
                title="IPアドレスをコピー"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>IPコピー</span>
              </button>
            </div>

            {/* Large IP Display */}
            <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800/80">
              <div className="text-xs font-medium text-slate-500 mb-1">
                検出されたパブリックIPアドレス (グローバルIP)
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight text-cyan-600 dark:text-cyan-400 break-all select-all">
                {ipGeo.ip}
              </div>
              {ipGeo.webrtcIp && (
                <div className="mt-2 text-[11px] text-slate-500 font-mono flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>WebRTC STUN 経由でも同一IP ({ipGeo.webrtcIp}) が直接検証されました</span>
                </div>
              )}
            </div>

            {/* Location Breakdown Table */}
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-500">国名 / 国コード</span>
                <span className="font-medium text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <span>{ipGeo.country}</span>
                  {ipGeo.countryCode !== 'N/A' && (
                    <span className="font-mono text-slate-400">({ipGeo.countryCode})</span>
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-500">都道府県 / 地域 (Region)</span>
                <span className="font-medium text-slate-900 dark:text-slate-100 font-mono">
                  {ipGeo.region}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-500">市区町村 (City)</span>
                <span className="font-medium text-slate-900 dark:text-slate-100 font-mono">
                  {ipGeo.city}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-500">郵便番号 (Postal / ZIP)</span>
                <span className="font-medium text-slate-900 dark:text-slate-100 font-mono">
                  {ipGeo.postalCode}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-500">IP緯度・経度 (概算座標)</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-slate-900 dark:text-slate-100 tabular-nums">
                    {ipGeo.latitude !== null
                      ? `${ipGeo.latitude.toFixed(4)}, ${ipGeo.longitude?.toFixed(4)}`
                      : 'API未開示'}
                  </span>
                  {ipGeo.latitude !== null && (
                    <a
                      href={ipGeo.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-cyan-600 dark:text-cyan-400 hover:underline"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>Googleマップ</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-500">タイムゾーン & UTC時差</span>
                <div className="text-right">
                  <span className="font-mono font-medium text-slate-900 dark:text-slate-100">
                    {ipGeo.timezoneId} ({ipGeo.timezoneUtcOffset})
                  </span>
                  <div className="text-[11px] text-slate-400">
                    端末設定 ({ipGeo.deviceTimezone}) との整合: {ipGeo.isTimezoneMatch ? '一致' : '不一致 (VPN/Proxyの可能性)'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: High-Accuracy Device Geolocation (GPS / Browser Geolocation API) */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Navigation className="w-4 h-4 text-cyan-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  ブラウザ位置情報 (GPS / 端末測位)
                </h3>
              </div>
              <div>
                {deviceGeo.status === 'success' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <CheckCircle className="w-3 h-3" />
                    許可済み (高精度測位)
                  </span>
                )}
                {deviceGeo.status === 'requesting' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 animate-pulse">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    位置取得中...
                  </span>
                )}
                {deviceGeo.status === 'denied' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                    <ShieldAlert className="w-3 h-3" />
                    位置情報 拒否
                  </span>
                )}
                {(deviceGeo.status === 'prompt' || deviceGeo.status === 'idle') && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    <MapPin className="w-3 h-3" />
                    未許可 (待機中)
                  </span>
                )}
                {deviceGeo.status === 'unsupported' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-500/10 text-slate-500 border border-slate-500/20">
                    非対応ブラウザ
                  </span>
                )}
              </div>
            </div>

            {/* When successfully acquired */}
            {deviceGeo.status === 'success' && deviceGeo.latitude !== null && deviceGeo.longitude !== null ? (
              <div className="space-y-4">
                {/* Coordinates Banner */}
                <div className="bg-slate-50 dark:bg-slate-950/60 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[11px] font-medium text-slate-500">
                      端末GPS / 測位座標 (高精度実測)
                    </div>
                    <div className="text-lg sm:text-xl font-bold font-mono text-cyan-600 dark:text-cyan-400 select-all">
                      {deviceGeo.latitude.toFixed(6)}, {deviceGeo.longitude.toFixed(6)}
                    </div>
                    {deviceGeo.addressSummary && (
                      <div className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-cyan-500 shrink-0" />
                        <span>{deviceGeo.addressSummary}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-1.5 shrink-0">
                    <button
                      onClick={() => onCopy(`${deviceGeo.latitude},${deviceGeo.longitude}`, 'GPS測位座標')}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-md transition-colors"
                      title="座標をコピー"
                    >
                      <Copy className="w-3 h-3" />
                      <span>座標コピー</span>
                    </button>
                    {deviceGeo.googleMapsUrl && (
                      <a
                        href={deviceGeo.googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs bg-cyan-600 hover:bg-cyan-500 text-white rounded-md transition-colors"
                      >
                        <MapPin className="w-3 h-3" />
                        <span>マップ</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Accuracy & Details Table */}
                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                    <span className="text-slate-500">測位精度 (推定誤差範囲)</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <span>±{deviceGeo.accuracyMeters} m 以内</span>
                      <span className="text-[10px] text-slate-400 font-normal">
                        ({deviceGeo.accuracyMeters && deviceGeo.accuracyMeters < 50 ? '高精度GPS' : 'Wi-Fi/基地局測位'})
                      </span>
                    </span>
                  </div>

                  {deviceGeo.distanceFromIpKm !== null && (
                    <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                      <span className="text-slate-500">IP推定位置との距離差</span>
                      <div className="text-right">
                        <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400">
                          {deviceGeo.distanceFromIpKm} km
                        </span>
                        <div className="text-[10px] text-slate-400">
                          プロバイダ収容局と端末実位置の直線差異
                        </div>
                      </div>
                    </div>
                  )}

                  {deviceGeo.altitudeMeters !== null && (
                    <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                      <span className="text-slate-500">高度 (標高)</span>
                      <span className="font-mono text-slate-800 dark:text-slate-200">
                        {deviceGeo.altitudeMeters} m
                        {deviceGeo.altitudeAccuracyMeters !== null && (
                          <span className="text-slate-400 text-[10px] ml-1">
                            (誤差 ±{deviceGeo.altitudeAccuracyMeters}m)
                          </span>
                        )}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                    <span className="text-slate-500">移動速度 / 方角</span>
                    <span className="font-mono text-slate-800 dark:text-slate-200">
                      {deviceGeo.speedMps !== null ? `${deviceGeo.speedMps} m/s` : '静止中'}
                      {deviceGeo.heading !== null ? ` / 方角: ${deviceGeo.heading}°` : ''}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1.5">
                    <span className="text-slate-500">最終測位時刻</span>
                    <span className="font-mono text-slate-600 dark:text-slate-400">
                      {deviceGeo.fetchedAtFormatted}
                    </span>
                  </div>
                </div>

                {/* Refresh location button */}
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={onRequestDeviceLocation}
                    disabled={isRequestingGeo}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-cyan-700 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-950/40 hover:bg-cyan-100 dark:hover:bg-cyan-900/60 border border-cyan-200 dark:border-cyan-800 rounded-lg transition-colors"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRequestingGeo ? 'animate-spin' : ''}`} />
                    <span>{isRequestingGeo ? '再測位中...' : '現在地を再測位'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {deviceGeo.status === 'denied' ? (
                  <div className="p-3.5 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-xl text-xs space-y-1.5 text-rose-900 dark:text-rose-200">
                    <div className="font-semibold flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0" />
                      <span>位置情報のアクセスが拒否されています</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                      ブラウザまたはOSのプライバシー設定により、現在地へのアクセスがブロックされています。
                      ブラウザのアドレスバー左側のアイコン（鍵アイコンやサイト設定）から「位置情報」を「許可」に変更後、再試行ボタンを押してください。
                    </p>
                    <div className="pt-1">
                      <button
                        onClick={onRequestDeviceLocation}
                        disabled={isRequestingGeo}
                        className="px-3 py-1 text-xs bg-rose-600 hover:bg-rose-500 text-white rounded-md font-medium"
                      >
                        再試行する
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs space-y-3">
                    <div className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                      位置情報がブラウザで許可されている場合は自動的に高精度GPS測位が開始されます。
                      未許可の場合は下のボタンを押してブラウザの許可ダイアログを承認することで、IP概算よりも正確な緯度経度・測位精度・推定距離を即座に測定できます。
                    </div>
                    <button
                      onClick={onRequestDeviceLocation}
                      disabled={isRequestingGeo}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-all disabled:opacity-50"
                    >
                      {isRequestingGeo ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>位置情報を取得中 (ブラウザのダイアログを確認)...</span>
                        </>
                      ) : (
                        <>
                          <Navigation className="w-4 h-4" />
                          <span>位置情報を許可して高精度GPS測位を実行</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: ISP, ASN & Connection Quality Card */}
        <div className="space-y-6">
          {/* ISP & ASN Information */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Server className="w-4 h-4 text-purple-500" />
              プロバイダ (ISP) & 自律システム番号 (ASN)
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-start justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-500 shrink-0">接続ISP (プロバイダ)</span>
                <span className="font-medium text-slate-900 dark:text-slate-100 text-right">
                  {ipGeo.isp}
                </span>
              </div>

              <div className="flex items-start justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-500 shrink-0">組織名 (Org)</span>
                <span className="font-medium text-slate-900 dark:text-slate-100 text-right">
                  {ipGeo.org}
                </span>
              </div>

              <div className="flex items-start justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-500 shrink-0">ASN (自律システム番号)</span>
                <span className="font-mono font-semibold text-cyan-600 dark:text-cyan-400 text-right">
                  {ipGeo.asn}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-500">ホスト名 / 接続ドメイン</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">
                  {ipGeo.domain}
                </span>
              </div>
            </div>
          </div>

          {/* Connection Speed & Telemetry Card */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-500" />
                回線通信品質 & バッテリーステータス
              </h3>
              <span className="text-[11px] text-slate-500">
                {network.networkApiSupported ? 'Network Information API 有効' : 'Network API 非対応ブラウザ'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg">
                <span className="text-slate-500 block text-[11px] mb-1">回線種別</span>
                <span className="text-base font-bold font-mono text-slate-900 dark:text-slate-100 truncate block">
                  {network.effectiveType}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5 truncate">{network.connectionType}</span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg">
                <span className="text-slate-500 block text-[11px] mb-1">推定下り速度</span>
                <span className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {network.downlinkMbps !== null ? `${network.downlinkMbps}` : '非対応'}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  {network.downlinkMbps !== null ? 'Mbps (Downlink)' : 'Safari/Firefox等'}
                </span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg">
                <span className="text-slate-500 block text-[11px] mb-1">往復遅延 (RTT)</span>
                <span className="text-base font-bold font-mono text-cyan-600 dark:text-cyan-400 tabular-nums">
                  {network.livePingMs !== null
                    ? `${network.livePingMs}`
                    : network.rttMs !== null
                    ? `${network.rttMs}`
                    : '未測定'}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  {network.livePingMs !== null ? 'ms (実測プローブ)' : network.rttMs !== null ? 'ms (推定RTT)' : 'Pingで実測可能'}
                </span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg">
                <span className="text-slate-500 block text-[11px] mb-1">バッテリー残量</span>
                <div className="flex items-center gap-1.5">
                  {network.batteryCharging ? (
                    <BatteryCharging className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Battery className="w-4 h-4 text-slate-400" />
                  )}
                  <span className="text-base font-bold font-mono text-slate-900 dark:text-slate-100 tabular-nums">
                    {network.batteryLevel !== null ? `${network.batteryLevel}%` : '非公開'}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  {network.batteryCharging ? '充電中' : network.batterySupported ? '稼働中' : '非対応/制限'}
                </span>
              </div>
            </div>

            {/* Note regarding Chromium W3C EffectiveType spec */}
            {network.effectiveTypeNote && (
              <div className="p-2.5 bg-slate-50 dark:bg-slate-950/60 rounded-lg border border-slate-200/80 dark:border-slate-800/80 text-[11px] text-slate-500 flex items-start gap-2">
                <HelpCircle className="w-3.5 h-3.5 text-cyan-500 shrink-0 mt-0.5" />
                <span>{network.effectiveTypeNote}</span>
              </div>
            )}

            {/* Real-time Ping Gauge Summary */}
            {network.livePingMs !== null && (
              <div className="bg-slate-50 dark:bg-slate-950/60 p-3.5 rounded-lg border border-slate-200/80 dark:border-slate-800/80 text-xs">
                <div className="flex items-center justify-between text-slate-500 mb-1">
                  <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-semibold">
                    <Activity className="w-3.5 h-3.5 text-cyan-500" />
                    実測HTTP Pingプローブ結果 (Cloudflare / Google DNS CDN 実測)
                  </span>
                  <span className="font-mono text-[11px]">3回実測平均</span>
                </div>
                <div className="grid grid-cols-4 gap-2 pt-1 font-mono text-center">
                  <div>
                    <span className="text-[10px] text-slate-400 block">平均遅延</span>
                    <strong className="text-sm text-cyan-600 dark:text-cyan-400">{network.livePingMs}ms</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">最小</span>
                    <strong className="text-sm text-emerald-600 dark:text-emerald-400">{network.livePingMin}ms</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">最大</span>
                    <strong className="text-sm text-amber-600 dark:text-amber-400">{network.livePingMax}ms</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">ジッター</span>
                    <strong className="text-sm text-slate-700 dark:text-slate-300">{network.livePingJitter}ms</strong>
                  </div>
                </div>
              </div>
            )}

            {network.batteryNote && (
              <p className="text-[11px] text-slate-400">
                {network.batteryNote}
              </p>
            )}

            <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800">
              <span>
                データセーバー: <strong className="text-slate-700 dark:text-slate-300">{network.saveData === null ? '非対応ブラウザ' : network.saveData ? '節約モード (ON)' : '標準 (OFF)'}</strong>
              </span>
              <span>
                ネットワーク接続: <strong className="text-emerald-600 dark:text-emerald-400">{network.isOnline ? 'オンライン' : 'オフライン'}</strong>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
