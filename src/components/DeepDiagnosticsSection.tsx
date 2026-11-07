import React from 'react';
import {
  Shield,
  Smartphone,
  Camera,
  Mic,
  Bell,
  HardDrive,
  Type,
  Radio,
  Sliders,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Copy,
  Layers,
  MapPin,
  Laptop,
} from 'lucide-react';
import { FullClientInspectionData } from '../types/clientInfo';

interface DeepDiagnosticsSectionProps {
  data: FullClientInspectionData;
  onCopy: (text: string, label: string) => void;
}

export const DeepDiagnosticsSection: React.FC<DeepDiagnosticsSectionProps> = ({
  data,
  onCopy,
}) => {
  const { clientHints, permissions, mediaDevices, storage, fonts, webrtcInfo } = data;

  const renderPermissionBadge = (state?: string) => {
    switch (state) {
      case 'granted':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" />
            <span>許可済 (Granted)</span>
          </span>
        );
      case 'denied':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            <XCircle className="w-3 h-3" />
            <span>拒否 (Denied)</span>
          </span>
        );
      case 'prompt':
      case 'default':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <HelpCircle className="w-3 h-3" />
            <span>未要求 / プロンプト</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800">
            非対応 / 不明
          </span>
        );
    }
  };

  return (
    <section id="deep-diagnostics" className="scroll-mt-20 space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-600 dark:text-purple-400 mb-1">
            <Sliders className="w-4 h-4" />
            <span>ディープテレメトリ・デバイス権限・ストレージ・内蔵フォント</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            高度ハードウェア診断・ブラウザ権限マトリクス & 内蔵フォント指紋
          </h2>
        </div>
      </div>

      {/* Grid of Deep Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card 1: Client Hints */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-cyan-500" />
                <span>Client Hints 高精度端末モデル</span>
              </h3>
              <span className="text-[10px] font-mono font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                HIGH-ENTROPY
              </span>
            </div>

            <div className="space-y-2 font-mono text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">CPU アーキテクチャ</span>
                <span className="font-bold text-cyan-600 dark:text-cyan-400">
                  {clientHints?.architecture || '非公開 (x86/ARM推定)'}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">CPU ビット数</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {clientHints?.bitness || '64-bit'}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">端末モデル (Model)</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[150px]" title={clientHints?.model}>
                  {clientHints?.model || 'PC / デスクトップ'}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">OS プラットフォーム詳細</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  v{clientHints?.platformVersion || data.browser.osVersion}
                </span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">端末フォームファクター</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {clientHints?.mobile ? 'スマートフォン/携帯' : 'PC / デスクトップ'}
                </span>
              </div>
            </div>
          </div>
          <div className="text-[10px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
            User-Agent Client Hints API経由で取得
          </div>
        </div>

        {/* Card 2: Permissions Matrix */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-500" />
                <span>ブラウザ権限マトリクス</span>
              </h3>
              <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                PERMISSIONS API
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-300 flex items-center gap-1.5 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-cyan-500" />
                  <span>位置情報アクセス</span>
                </span>
                {renderPermissionBadge(permissions?.geolocation)}
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-300 flex items-center gap-1.5 font-medium">
                  <Camera className="w-3.5 h-3.5 text-blue-500" />
                  <span>カメラ (Webcam)</span>
                </span>
                {renderPermissionBadge(permissions?.camera)}
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-300 flex items-center gap-1.5 font-medium">
                  <Mic className="w-3.5 h-3.5 text-rose-500" />
                  <span>マイク (音声入力)</span>
                </span>
                {renderPermissionBadge(permissions?.microphone)}
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-300 flex items-center gap-1.5 font-medium">
                  <Bell className="w-3.5 h-3.5 text-amber-500" />
                  <span>プッシュ通知</span>
                </span>
                {renderPermissionBadge(permissions?.notifications)}
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-600 dark:text-slate-300 font-medium">
                  クリップボード読取
                </span>
                {renderPermissionBadge(permissions?.clipboardRead)}
              </div>
            </div>
          </div>
          <div className="text-[10px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
            ユーザーへのプロンプト表示なしで現在状態を取得
          </div>
        </div>

        {/* Card 3: Connected Media Devices */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Camera className="w-4 h-4 text-blue-500" />
                <span>接続ハードウェア機器数</span>
              </h3>
              <span className="text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                MEDIA DEVICES
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 font-mono text-center">
              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-500 block">カメラ</span>
                <span className="font-extrabold text-xl text-cyan-600 dark:text-cyan-400">
                  {mediaDevices?.videoInputCount ?? 0}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">台</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-500 block">マイク</span>
                <span className="font-extrabold text-xl text-rose-500">
                  {mediaDevices?.audioInputCount ?? 0}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">台</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-500 block">スピーカー</span>
                <span className="font-extrabold text-xl text-purple-500">
                  {mediaDevices?.audioOutputCount ?? 0}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">台</span>
              </div>
            </div>

            {mediaDevices && mediaDevices.deviceLabels.length > 0 && (
              <div className="mt-3 space-y-1">
                <span className="text-[11px] text-slate-400 font-bold block">認識されたデバイス名:</span>
                <div className="space-y-1 max-h-24 overflow-y-auto font-mono text-[10px] text-slate-600 dark:text-slate-300">
                  {mediaDevices.deviceLabels.map((lbl, idx) => (
                    <div key={idx} className="p-1.5 bg-slate-50 dark:bg-slate-950 rounded border border-slate-200 dark:border-slate-800 truncate">
                      {lbl}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="text-[10px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
            接続中の合計デバイス: {mediaDevices?.totalDevices ?? 0} 台
          </div>
        </div>

        {/* Card 4: Storage Quota & Usage */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-amber-500" />
                <span>ディスクストレージ容量見積</span>
              </h3>
              <span className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                STORAGE ESTIMATE
              </span>
            </div>

            <div className="space-y-2 font-mono text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">割当上限 (Quota)</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {storage?.quotaGb ? `${storage.quotaGb} GB (${storage.quotaMb} MB)` : '取得不可'}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">使用中データ容量</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {storage?.usageMb !== null && storage?.usageMb !== undefined ? `${storage.usageMb} MB` : '0 MB'}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">クォータ使用率</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {storage?.usagePercent !== null && storage?.usagePercent !== undefined ? `${storage.usagePercent}%` : '0.1% 未満'}
                </span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">永続化ストレージ</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {storage?.isPersisted ? '永続保持許可済' : '一時キャッシュ (通常)'}
                </span>
              </div>
            </div>
          </div>
          <div className="text-[10px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
            ブラウザ管理下のディスク割り当て容量
          </div>
        </div>

        {/* Card 5: Installed System Fonts */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Type className="w-4 h-4 text-purple-500" />
                <span>端末内蔵フォント検出</span>
              </h3>
              <span className="text-[10px] font-mono font-bold text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                {fonts?.detectedCount ?? 0} / {fonts?.totalScanned ?? 0} 検出
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500">フォント指紋ハッシュ:</span>
                <span className="font-bold text-purple-600 dark:text-purple-400">
                  {fonts?.fontFingerprintHash || 'N/A'}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pt-1">
                {fonts?.detectedFonts.map((f) => (
                  <span
                    key={f}
                    className="px-2 py-0.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded text-[10px] font-mono text-slate-700 dark:text-slate-300"
                  >
                    {f}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="text-[10px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
            Meiryo, Yu Gothic, Segoe UI, SF Pro, Hiragino等の搭載照合
          </div>
        </div>

        {/* Card 6: WebRTC & Dual Stack */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Radio className="w-4 h-4 text-cyan-500" />
                <span>WebRTC 通信 & IPv6対応</span>
              </h3>
              <span className="text-[10px] font-mono font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                STUN / ICE
              </span>
            </div>

            <div className="space-y-2 font-mono text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">IPv6 デュアルスタック</span>
                <span className="font-bold text-cyan-600 dark:text-cyan-400">
                  {webrtcInfo?.dualStackIpv6 ? '対応 (IPv6/IPv4)' : 'IPv4 のみ接続'}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">STUN 照会ステータス</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {webrtcInfo?.status || '完了'}
                </span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">ICE Candidate 種別</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {webrtcInfo?.candidateTypes.length ? webrtcInfo.candidateTypes.join(', ') : 'mDNS匿名化'}
                </span>
              </div>
            </div>
          </div>
          <div className="text-[10px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
            Google STUNサーバー経由のICE Candidate解析
          </div>
        </div>
      </div>
    </section>
  );
};
