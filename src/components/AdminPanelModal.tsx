import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  ShieldCheck,
  LogOut,
  Zap,
  Activity,
  FileCode,
  Download,
  Trash2,
  CheckCircle,
  Copy,
  Terminal,
  Cpu,
  Layers,
  Fingerprint,
  Users,
  Search,
  RefreshCw,
  ExternalLink,
  MapPin,
  Globe,
  Laptop,
  Eye,
  AlertTriangle,
} from 'lucide-react';
import { ActivityEvent, FullClientInspectionData } from '../types/clientInfo';
import { computeSha256 } from '../utils/adminAuth';
import { measureRealPing } from '../utils/clientDetectors';
import {
  fetchAllUserProfiles,
  deleteUserProfile,
  clearAllUserProfiles,
  StoredUserProfile,
} from '../utils/userProfilesService';
import { UserDetailModal } from './UserDetailModal';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  data: FullClientInspectionData;
  events: ActivityEvent[];
  onClearEvents: () => void;
  onCopy: (text: string, label: string) => void;
  showToast: (message: string, type?: 'success' | 'info') => void;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
  onLogout,
  data,
  events,
  onClearEvents,
  onCopy,
  showToast,
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'network' | 'logs' | 'signature'>('users');
  const [userProfiles, setUserProfiles] = useState<StoredUserProfile[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedUser, setSelectedUser] = useState<StoredUserProfile | null>(null);

  // Ping burst state
  const [isRunningPingBurst, setIsRunningPingBurst] = useState(false);
  const [pingBurstResults, setPingBurstResults] = useState<{
    samples: number[];
    min: number;
    max: number;
    avg: number;
    jitter: number;
  } | null>(null);

  // Signature state
  const [dataSignature, setDataSignature] = useState<string | null>(null);
  const [isSigning, setIsSigning] = useState(false);

  // Load all user profiles
  const loadUserProfiles = useCallback(async () => {
    setIsLoadingUsers(true);
    try {
      const list = await fetchAllUserProfiles();
      setUserProfiles(list);
    } catch {
      showToast('ユーザープロファイルの読み込みに失敗しました', 'info');
    } finally {
      setIsLoadingUsers(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (isOpen) {
      loadUserProfiles();
    }
  }, [isOpen, loadUserProfiles]);

  if (!isOpen) return null;

  // Filtered profiles
  const filteredUsers = userProfiles.filter((u) => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    return (
      u.username.toLowerCase().includes(q) ||
      u.ip.toLowerCase().includes(q) ||
      (u.ipGeo.city || '').toLowerCase().includes(q) ||
      (u.ipGeo.isp || '').toLowerCase().includes(q) ||
      (u.browser.osName || '').toLowerCase().includes(q) ||
      (u.browser.browserName || '').toLowerCase().includes(q)
    );
  });

  // Handle single user deletion
  const handleDeleteUser = async (username: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(`ユーザー「${username}」のプロファイル記録を削除しますか？`)) {
      return;
    }
    await deleteUserProfile(username);
    setUserProfiles((prev) => prev.filter((u) => u.username !== username));
    showToast(`ユーザー「${username}」の記録を削除しました`);
  };

  // Handle clear all users
  const handleClearAllUsers = async () => {
    if (!window.confirm('すべてのユーザープロファイル記録を消去しますか？この操作は取り消せません。')) {
      return;
    }
    await clearAllUserProfiles();
    setUserProfiles([]);
    showToast('全ユーザーのプロファイル記録を初期化しました');
  };

  // Export Users CSV
  const handleExportUsersCsv = () => {
    if (userProfiles.length === 0) {
      showToast('エクスポート対象のユーザーがいません', 'info');
      return;
    }
    const headers =
      'ユーザー名,訪問回数,初回接続,最終更新,パブリックIP,国,地域,市区町村,ISP,GPS緯度,GPS経度,GPS精度(m),OS,ブラウザ,端末種別,CPUアーキテクチャ,モデル,GPU,CPUコア,RAM(GB),カメラ数,マイク数,ストレージ上限(GB),検出フォント数,フォントHash,実測Ping(ms)\n';
    const rows = userProfiles
      .map((u) => {
        return [
          `"${u.username.replace(/"/g, '""')}"`,
          u.visitCount,
          `"${u.firstSeenAt}"`,
          `"${u.lastSeenAt}"`,
          `"${u.ip}"`,
          `"${u.ipGeo.country}"`,
          `"${u.ipGeo.region}"`,
          `"${u.ipGeo.city}"`,
          `"${(u.ipGeo.isp || '').replace(/"/g, '""')}"`,
          u.deviceGeo?.latitude ?? '',
          u.deviceGeo?.longitude ?? '',
          u.deviceGeo?.accuracyMeters ?? '',
          `"${u.browser.osName} ${u.browser.osVersion}"`,
          `"${u.browser.browserName} ${u.browser.browserVersion}"`,
          `"${u.browser.deviceCategory}"`,
          `"${u.clientHints?.architecture || ''}"`,
          `"${(u.clientHints?.model || '').replace(/"/g, '""')}"`,
          `"${(u.hardware.cleanedGpuChip || '').replace(/"/g, '""')}"`,
          u.hardware.cpuCores ?? '',
          u.hardware.deviceMemoryGb ?? '',
          u.mediaDevices?.videoInputCount ?? '',
          u.mediaDevices?.audioInputCount ?? '',
          u.storage?.quotaGb ?? '',
          u.fonts?.detectedCount ?? '',
          `"${u.fonts?.fontFingerprintHash || ''}"`,
          u.network.livePingMs ?? '',
        ].join(',');
      })
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `client-profiler-all-users-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('全ユーザー台帳CSVをダウンロードしました');
  };

  // Run 10-burst ping
  const handleRunPingBurst = async () => {
    setIsRunningPingBurst(true);
    setPingBurstResults(null);
    try {
      const res = await measureRealPing(8);
      setPingBurstResults({
        samples: [res.min, res.avg, res.max],
        min: res.min,
        max: res.max,
        avg: res.avg,
        jitter: res.jitter,
      });
      showToast(`連続Pingプローブ完了: 平均 ${res.avg}ms (ジッター: ${res.jitter}ms)`);
    } catch {
      showToast('Pingプローブの実行に失敗しました', 'info');
    } finally {
      setIsRunningPingBurst(false);
    }
  };

  // Generate SHA-256 Digital Signature
  const handleGenerateSignature = async () => {
    setIsSigning(true);
    try {
      const snapshot = JSON.stringify({
        inspectedAt: data.inspectedAt,
        ip: data.ipGeo.ip,
        gpu: data.hardware.cleanedGpuChip,
        cpu: data.hardware.cpuCores,
        ram: data.hardware.deviceMemoryGb,
        fingerprint: data.hardware.webglLimits?.canvasFingerprintHash,
      });
      const hash = await computeSha256(snapshot);
      setDataSignature(hash);
      showToast('診断データのSHA-256改ざん防止ハッシュを生成しました');
    } catch {
      showToast('署名生成に失敗しました', 'info');
    } finally {
      setIsSigning(false);
    }
  };

  // Export events CSV
  const handleExportEventsCsv = () => {
    if (events.length === 0) {
      showToast('エクスポート対象のイベントがありません', 'info');
      return;
    }
    const headers = 'ID,Timestamp,FormattedTime,Type,Title,Details,Badge\n';
    const rows = events
      .map(
        (e) =>
          `"${e.id}","${e.timestamp}","${e.timeFormatted}","${e.type}","${e.title.replace(/"/g, '""')}","${e.details.replace(/"/g, '""')}","${e.badge}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `client-profiler-audit-events-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('行動履歴ログCSVをダウンロードしました');
  };

  return (
    <>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-panel-title"
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150 font-sans"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div className="relative w-full max-w-5xl max-h-[92vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-900 dark:text-slate-100">
          {/* Top Gradient Bar */}
          <div className="h-1 bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600" />

          {/* Modal Header */}
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 id="admin-panel-title" className="text-base font-bold text-slate-900 dark:text-slate-100">
                    管理者コントロールセンター
                  </h3>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                    ADMIN ACTIVE
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  全ユーザー台帳・端末診断詳細照会・ネットワークプローブ・生データ監査
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-lg transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>管理者ログアウト</span>
              </button>
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg transition-colors"
                aria-label="閉じる"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Tabs Bar */}
          <div className="px-5 border-b border-slate-200 dark:border-slate-800 flex gap-4 text-xs font-semibold bg-slate-50/50 dark:bg-slate-950/30 overflow-x-auto">
            <button
              onClick={() => setActiveTab('users')}
              className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'users'
                  ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-cyan-500" />
              <span>ユーザー管理 & プロファイル一覧 ({userProfiles.length}名)</span>
            </button>
            <button
              onClick={() => setActiveTab('network')}
              className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'network'
                  ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>高度Ping & 回線プローブ</span>
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'logs'
                  ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-emerald-500" />
              <span>自端末の行動履歴ログ ({events.length}件)</span>
            </button>
            <button
              onClick={() => setActiveTab('signature')}
              className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'signature'
                  ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Fingerprint className="w-3.5 h-3.5 text-purple-500" />
              <span>改ざん防止署名 (SHA-256)</span>
            </button>
          </div>

          {/* Tab Content Area */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
            {/* Tab 1: Users Directory */}
            {activeTab === 'users' && (
              <div className="space-y-4">
                {/* Stats Summary Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800">
                    <span className="text-[11px] text-slate-500 block">登録ユーザー総数</span>
                    <span className="text-xl font-bold font-mono text-cyan-600 dark:text-cyan-400">
                      {userProfiles.length} 名
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800">
                    <span className="text-[11px] text-slate-500 block">高精度GPS測位済</span>
                    <span className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                      {userProfiles.filter((u) => u.deviceGeo?.status === 'success').length} 名
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800">
                    <span className="text-[11px] text-slate-500 block">モバイル / スマホ端末</span>
                    <span className="text-xl font-bold font-mono text-purple-600 dark:text-purple-400">
                      {userProfiles.filter((u) => u.browser?.deviceCategory === 'スマートフォン').length} 台
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800">
                    <span className="text-[11px] text-slate-500 block">リピート訪問者</span>
                    <span className="text-xl font-bold font-mono text-amber-500">
                      {userProfiles.filter((u) => u.visitCount > 1).length} 名
                    </span>
                  </div>
                </div>

                {/* Search & Actions Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="relative w-full sm:w-72">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchFilter}
                      onChange={(e) => setSearchFilter(e.target.value)}
                      placeholder="ユーザー名、IP、OS、ISPで検索..."
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-medium"
                    />
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <button
                      onClick={loadUserProfiles}
                      disabled={isLoadingUsers}
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg font-medium transition-colors"
                      title="ユーザー台帳を再読み込み"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isLoadingUsers ? 'animate-spin text-cyan-500' : ''}`} />
                      <span>更新</span>
                    </button>
                    <button
                      onClick={handleExportUsersCsv}
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-semibold transition-colors shadow-sm"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>全ユーザーCSV</span>
                    </button>
                    {userProfiles.length > 0 && (
                      <button
                        onClick={handleClearAllUsers}
                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60 rounded-lg font-medium transition-colors"
                        title="全ユーザー記録を初期化"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>台帳全消去</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* User List Table */}
                {filteredUsers.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 space-y-2">
                    <Users className="w-8 h-8 mx-auto text-slate-400" />
                    <p className="font-semibold text-slate-700 dark:text-slate-300">
                      {searchFilter ? '該当するユーザーが見つかりません' : '記録されたユーザーはまだいません'}
                    </p>
                    <p className="text-xs text-slate-400">
                      ユーザーが入場ゲートからログインすると、自動的にここに詳細診断情報が記録されます。
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredUsers.map((u) => (
                      <div
                        key={u.username}
                        onClick={() => setSelectedUser(u)}
                        className="p-4 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-cyan-500 dark:hover:border-cyan-500 transition-all cursor-pointer shadow-sm hover:shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                      >
                        {/* Column 1: Username & Basic Stats */}
                        <div className="flex items-start gap-3 min-w-[200px]">
                          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5">
                            <Users className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-slate-900 dark:text-slate-100 hover:text-cyan-500">
                                {u.username}
                              </span>
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-semibold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                                {u.visitCount}回訪問
                              </span>
                              {u.deviceGeo?.status === 'success' && (
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                  <MapPin className="w-3 h-3" />
                                  GPS済
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-2 font-mono">
                              <span>最終: {u.lastSeenAt}</span>
                            </div>
                          </div>
                        </div>

                        {/* Column 2: IP, Location & ISP */}
                        <div className="text-[11px] font-mono space-y-0.5 min-w-[220px]">
                          <div className="flex items-center gap-1.5 text-cyan-600 dark:text-cyan-400 font-bold">
                            <Globe className="w-3.5 h-3.5 shrink-0" />
                            <span>{u.ip}</span>
                            <span className="text-slate-400 font-normal">({u.ipGeo.countryCode})</span>
                          </div>
                          <div className="text-slate-600 dark:text-slate-300">
                            {u.ipGeo.flagEmoji} {u.ipGeo.region} {u.ipGeo.city}
                          </div>
                          <div className="text-slate-400 text-[10px] truncate max-w-[220px]">
                            {u.ipGeo.isp || u.ipGeo.org}
                          </div>
                          {u.deviceGeo?.status === 'success' && u.deviceGeo.distanceFromIpKm !== null && (
                            <div className="text-emerald-600 dark:text-emerald-400 text-[10px]">
                              GPS実測 (IP差: {u.deviceGeo.distanceFromIpKm}km, ±{u.deviceGeo.accuracyMeters}m)
                            </div>
                          )}
                        </div>

                        {/* Column 3: Device / OS / GPU & Deep Badges */}
                        <div className="text-[11px] font-mono space-y-0.5 min-w-[220px]">
                          <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200 font-semibold">
                            <Laptop className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                            <span>{u.browser.osName} {u.browser.osVersion}</span>
                            {u.clientHints?.architecture && (
                              <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold">
                                ({u.clientHints.architecture})
                              </span>
                            )}
                          </div>
                          <div className="text-slate-500 text-[10px]">
                            {u.browser.browserName} · {u.clientHints?.model || u.browser.deviceCategory}
                          </div>
                          <div className="text-slate-400 text-[10px] truncate max-w-[220px]" title={u.hardware.cleanedGpuChip}>
                            GPU: {u.hardware.cleanedGpuChip}
                          </div>
                          {/* Rich mini indicators */}
                          <div className="flex flex-wrap items-center gap-1 pt-0.5 text-[10px]">
                            {u.mediaDevices && (
                              <span className="px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20" title={`カメラ: ${u.mediaDevices.videoInputCount}台, マイク: ${u.mediaDevices.audioInputCount}台`}>
                                📷{u.mediaDevices.videoInputCount} 🎤{u.mediaDevices.audioInputCount}
                              </span>
                            )}
                            {u.storage?.quotaGb && (
                              <span className="px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20" title={`ストレージ上限: ${u.storage.quotaGb}GB`}>
                                💾{u.storage.quotaGb}GB
                              </span>
                            )}
                            {u.fonts?.detectedCount ? (
                              <span className="px-1.5 py-0.2 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20" title={`検出フォント: ${u.fonts.detectedCount}種類`}>
                                🔤{u.fonts.detectedCount}書体
                              </span>
                            ) : null}
                          </div>
                        </div>

                        {/* Column 4: Action Buttons */}
                        <div className="flex items-center gap-2 shrink-0 w-full md:w-auto justify-end pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
                          <button
                            onClick={() => setSelectedUser(u)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-cyan-700 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-950/40 hover:bg-cyan-100 dark:hover:bg-cyan-900/60 border border-cyan-200 dark:border-cyan-800 rounded-lg transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>詳細プロファイル</span>
                          </button>
                          <button
                            onClick={(e) => handleDeleteUser(u.username, e)}
                            className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                            title="このユーザーの記録を削除"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Network Probe */}
            {activeTab === 'network' && (
              <div className="space-y-4">
                <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      高頻度パケット連続プローブ (Burst Ping Test)
                    </h4>
                    <p className="text-slate-500 mt-0.5">
                      CDNエンドポイントへ8回連続でHTTPラウンドトリップ遅延を計測し、ジッターと遅延分散を解析します。
                    </p>
                  </div>
                  <button
                    onClick={handleRunPingBurst}
                    disabled={isRunningPingBurst}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-semibold shrink-0 disabled:opacity-50"
                  >
                    <Zap className={`w-3.5 h-3.5 ${isRunningPingBurst ? 'animate-spin' : ''}`} />
                    <span>{isRunningPingBurst ? '連続プローブ中...' : 'プローブ開始 (8回)'}</span>
                  </button>
                </div>

                {pingBurstResults && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 bg-white dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                      <span className="text-slate-500 block text-[11px]">最小遅延 (Min)</span>
                      <span className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">
                        {pingBurstResults.min} ms
                      </span>
                    </div>
                    <div className="p-3 bg-white dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                      <span className="text-slate-500 block text-[11px]">平均遅延 (Avg)</span>
                      <span className="text-lg font-bold font-mono text-cyan-600 dark:text-cyan-400">
                        {pingBurstResults.avg} ms
                      </span>
                    </div>
                    <div className="p-3 bg-white dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                      <span className="text-slate-500 block text-[11px]">最大遅延 (Max)</span>
                      <span className="text-lg font-bold font-mono text-amber-500">
                        {pingBurstResults.max} ms
                      </span>
                    </div>
                    <div className="p-3 bg-white dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                      <span className="text-slate-500 block text-[11px]">ジッター (揺らぎ)</span>
                      <span className="text-lg font-bold font-mono text-purple-500">
                        ±{pingBurstResults.jitter} ms
                      </span>
                    </div>
                  </div>
                )}

                {/* Raw Client Diagnostics snapshot */}
                <div className="space-y-2">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 block">
                    診断メタデータ & ハードウェア検証
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-[11px]">
                    <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1">
                      <div className="text-slate-500">パブリックIP & ソース</div>
                      <div className="text-cyan-600 dark:text-cyan-400 font-bold">{data.ipGeo.ip}</div>
                      <div className="text-slate-400 text-[10px]">{data.ipGeo.dataSource}</div>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1">
                      <div className="text-slate-500">GPU チップ & ベンダー</div>
                      <div className="text-slate-200 font-bold truncate">{data.hardware.cleanedGpuChip}</div>
                      <div className="text-slate-400 text-[10px] truncate">{data.hardware.unmaskedVendor}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Logs Management */}
            {activeTab === 'logs' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-xs text-slate-500">
                    記録されたリアルタイムイベント: <strong>{events.length}</strong> 件
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleExportEventsCsv}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg transition-colors font-medium"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>CSV出力</span>
                    </button>
                    <button
                      onClick={() => {
                        onClearEvents();
                        showToast('イベントログを全消去しました');
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60 rounded-lg transition-colors font-medium"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>ログ全消去</span>
                    </button>
                  </div>
                </div>

                {/* Event list */}
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {events.map((e) => (
                    <div
                      key={e.id}
                      className="p-2.5 bg-slate-50 dark:bg-slate-950/80 rounded-lg border border-slate-200/80 dark:border-slate-800 flex items-start justify-between gap-3 font-mono text-[11px]"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                            {e.badge}
                          </span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{e.title}</span>
                        </div>
                        <p className="text-slate-500 mt-1">{e.details}</p>
                      </div>
                      <span className="text-slate-400 text-[10px] shrink-0">{e.timeFormatted}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 4: Digital Integrity Signature */}
            {activeTab === 'signature' && (
              <div className="space-y-4">
                <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Fingerprint className="w-4 h-4 text-purple-500" />
                    <span>改ざん防止デジタル完全性ハッシュ (SHA-256)</span>
                  </h4>
                  <p className="text-slate-500 leading-relaxed text-xs">
                    現在の診断テレメトリ（IPアドレス、GPU識別子、CPU/メモリ、Canvasフィンガープリント、診断日時）の暗号化ハッシュを生成し、診断結果の真正性を証明します。
                  </p>
                  <div className="pt-1">
                    <button
                      onClick={handleGenerateSignature}
                      disabled={isSigning}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-lg font-semibold shadow-sm transition-all disabled:opacity-50"
                    >
                      <Fingerprint className="w-3.5 h-3.5" />
                      <span>{isSigning ? 'ハッシュ生成中...' : 'デジタル署名を生成'}</span>
                    </button>
                  </div>
                </div>

                {dataSignature && (
                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="font-semibold text-emerald-400 flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        SHA-256 チェックサム
                      </span>
                      <button
                        onClick={() => onCopy(dataSignature, 'デジタル署名ハッシュ')}
                        className="inline-flex items-center gap-1 text-cyan-400 hover:underline"
                      >
                        <Copy className="w-3 h-3" />
                        <span>コピー</span>
                      </button>
                    </div>
                    <div className="font-mono text-xs text-cyan-400 break-all select-all bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                      {dataSignature}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* User Detail Submodal */}
      <UserDetailModal
        user={selectedUser}
        isOpen={Boolean(selectedUser)}
        onClose={() => setSelectedUser(null)}
        onCopy={onCopy}
        showToast={showToast}
      />
    </>
  );
};
