import React, { useState } from 'react';
import {
  X,
  User,
  Globe,
  MapPin,
  ExternalLink,
  Laptop,
  Cpu,
  Monitor,
  Wifi,
  Clock,
  Activity,
  FileCode,
  Copy,
  Download,
  Calendar,
  Layers,
  Shield,
  Sparkles,
} from 'lucide-react';
import { StoredUserProfile } from '../utils/userProfilesService';

interface UserDetailModalProps {
  user: StoredUserProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onCopy: (text: string, label: string) => void;
  showToast: (message: string, type?: 'success' | 'info') => void;
}

export const UserDetailModal: React.FC<UserDetailModalProps> = ({
  user,
  isOpen,
  onClose,
  onCopy,
  showToast,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'json'>('overview');

  if (!isOpen || !user) return null;

  const handleExportUserJson = () => {
    const json = JSON.stringify(user, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `user-profile-${user.username}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`${user.username} の診断プロファイルをJSON出力しました`);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150 font-sans"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-900 dark:text-slate-100">
        {/* Accent Bar */}
        <div className="h-1 bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600" />

        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-600 dark:text-cyan-400 shrink-0">
              <User className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {user.username}
                </h3>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                  第 {user.visitCount} 回訪問
                </span>
                {user.deviceGeo?.status === 'success' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <MapPin className="w-3 h-3" />
                    GPS高精度測位済
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                <span>最終更新: {user.lastSeenAt}</span>
                <span>·</span>
                <span>初回接続: {user.firstSeenAt}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportUserJson}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-cyan-700 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-950/40 hover:bg-cyan-100 dark:hover:bg-cyan-900/60 border border-cyan-200 dark:border-cyan-800 rounded-lg transition-colors"
              title="このユーザーの全プロファイルをJSON出力"
            >
              <Download className="w-3.5 h-3.5" />
              <span>JSON保存</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg transition-colors"
              aria-label="閉じる"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="px-5 border-b border-slate-200 dark:border-slate-800 flex gap-4 text-xs font-semibold bg-slate-50/50 dark:bg-slate-950/30">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'overview'
                ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>環境・ネットワーク・端末概要</span>
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'events'
                ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>行動ログ履歴 ({user.recentEvents?.length || 0}件)</span>
          </button>
          <button
            onClick={() => setActiveTab('json')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'json'
                ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>完全生データ (Raw JSON)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* Grid 1: IP & Location */}
              <div className="bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-slate-100">
                    <Globe className="w-4 h-4 text-cyan-500" />
                    <span>IPアドレス & 接続プロバイダ・所在地</span>
                  </div>
                  <span className="font-mono text-cyan-600 dark:text-cyan-400 font-bold text-sm">
                    {user.ip}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-[11px]">
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500 block text-[10px]">所在地 (国・地域)</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1 mt-0.5">
                      <span>{user.ipGeo.flagEmoji}</span>
                      <span>{user.ipGeo.country}</span>
                      <span className="text-slate-400">({user.ipGeo.countryCode})</span>
                    </span>
                    <span className="text-slate-500 text-[10px] block mt-0.5">
                      {user.ipGeo.region} {user.ipGeo.city} (〒{user.ipGeo.postalCode})
                    </span>
                  </div>

                  <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500 block text-[10px]">接続プロバイダ (ISP)</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100 truncate block mt-0.5">
                      {user.ipGeo.isp || '取得中'}
                    </span>
                    <span className="text-slate-500 text-[10px] block mt-0.5">
                      {user.ipGeo.asn} · {user.ipGeo.org}
                    </span>
                  </div>

                  <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500 block text-[10px]">タイムゾーン & 回線</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100 block mt-0.5">
                      {user.ipGeo.timezoneId}
                    </span>
                    <span className="text-slate-500 text-[10px] block mt-0.5">
                      {user.network.effectiveType} · 下り {user.network.downlinkMbps ?? '-'} Mbps
                    </span>
                  </div>
                </div>

                {/* GPS High Accuracy Section if permitted */}
                {user.deviceGeo && user.deviceGeo.status === 'success' && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-400">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>ブラウザ許可 高精度GPS測位データ</span>
                      </div>
                      <div className="font-mono text-[11px] text-slate-700 dark:text-slate-300">
                        緯度: {user.deviceGeo.latitude?.toFixed(5)}, 経度: {user.deviceGeo.longitude?.toFixed(5)} (精度: ±{user.deviceGeo.accuracyMeters}m)
                        {user.deviceGeo.distanceFromIpKm !== null && (
                          <span className="ml-2 text-cyan-600 dark:text-cyan-400 font-semibold">
                            IP推定位置との差: {user.deviceGeo.distanceFromIpKm} km
                          </span>
                        )}
                      </div>
                    </div>
                    {user.deviceGeo.latitude && user.deviceGeo.longitude && (
                      <a
                        href={`https://www.google.com/maps?q=${user.deviceGeo.latitude},${user.deviceGeo.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 rounded border border-emerald-300 dark:border-emerald-800 shrink-0"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Googleマップで開く</span>
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* Grid 2: Hardware & Software */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Hardware */}
                <div className="bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-2">
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-purple-500" />
                    <span>ハードウェア & GPU</span>
                  </h4>
                  <div className="space-y-1.5 font-mono text-[11px]">
                    <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                      <span className="text-slate-500">GPU レンダラー</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[200px]" title={user.hardware.cleanedGpuChip}>
                        {user.hardware.cleanedGpuChip}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                      <span className="text-slate-500">CPU コア数</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {user.hardware.cpuCores ? `${user.hardware.cpuCores} コア` : '非公開'}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                      <span className="text-slate-500">システムRAM</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {user.hardware.deviceMemoryGb ? `${user.hardware.deviceMemoryGb} GB` : '非公開'}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                      <span className="text-slate-500">物理解像度</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {user.hardware.physicalResolution}
                      </span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">プラットフォーム</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {user.hardware.platform}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Software / OS / Browser */}
                <div className="bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-2">
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Laptop className="w-4 h-4 text-cyan-500" />
                    <span>OS・ブラウザ & 端末種別</span>
                  </h4>
                  <div className="space-y-1.5 font-mono text-[11px]">
                    <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                      <span className="text-slate-500">オペレーティングシステム</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {user.browser.osName} {user.browser.osVersion}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                      <span className="text-slate-500">ブラウザ</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {user.browser.browserName} {user.browser.browserVersion}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                      <span className="text-slate-500">端末区分</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {user.browser.deviceCategory}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                      <span className="text-slate-500">優先言語</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {user.browser.primaryLanguage}
                      </span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">実測Ping</span>
                      <span className="font-bold text-cyan-600 dark:text-cyan-400">
                        {user.network.livePingMs !== null ? `${user.network.livePingMs} ms` : '未測定'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Raw User Agent Box */}
              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-slate-500">User-Agent 文字列</span>
                  <button
                    onClick={() => onCopy(user.browser.rawUserAgent, 'User-Agent')}
                    className="text-[11px] text-cyan-500 hover:underline inline-flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    <span>コピー</span>
                  </button>
                </div>
                <div className="font-mono text-[10px] text-slate-600 dark:text-slate-400 break-all select-all">
                  {user.browser.rawUserAgent}
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Activity Events */}
          {activeTab === 'events' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-200 dark:border-slate-800">
                <span>
                  記録された行動イベント: <strong>{user.recentEvents?.length || 0}</strong> 件
                </span>
                <button
                  onClick={() => {
                    const text = (user.recentEvents || [])
                      .map((e) => `[${e.timeFormatted}] (${e.badge}) ${e.title}: ${e.details}`)
                      .join('\n');
                    onCopy(text, `${user.username}の行動ログ`);
                  }}
                  className="inline-flex items-center gap-1 text-cyan-500 hover:underline"
                >
                  <Copy className="w-3 h-3" />
                  <span>ログをテキストコピー</span>
                </button>
              </div>

              {(!user.recentEvents || user.recentEvents.length === 0) ? (
                <div className="py-8 text-center text-slate-400">
                  行動ログはまだ記録されていません。
                </div>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {user.recentEvents.map((e) => (
                    <div
                      key={e.id}
                      className="p-2.5 bg-slate-50 dark:bg-slate-950/80 rounded-lg border border-slate-200 dark:border-slate-800 flex items-start justify-between gap-3 font-mono text-[11px]"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                            {e.badge}
                          </span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {e.title}
                          </span>
                        </div>
                        <p className="text-slate-500 mt-1">{e.details}</p>
                      </div>
                      <span className="text-slate-400 text-[10px] shrink-0">{e.timeFormatted}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Raw JSON */}
          {activeTab === 'json' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  {user.username} の完全な構造化テレメトリJSON
                </span>
                <button
                  onClick={() => onCopy(JSON.stringify(user, null, 2), `${user.username}のJSONデータ`)}
                  className="inline-flex items-center gap-1 text-xs text-cyan-500 hover:underline"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>JSONをクリップボードにコピー</span>
                </button>
              </div>
              <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[11px] text-cyan-300 overflow-x-auto max-h-96 select-all">
                {JSON.stringify(user, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
