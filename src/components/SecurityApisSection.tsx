import React, { useState } from 'react';
import {
  ShieldCheck,
  Check,
  X,
  Gauge,
  Clock,
  Layers,
  Filter,
  Search,
  Lock,
  Cpu,
  Wifi,
  EyeOff,
  Radio,
  FileCode,
} from 'lucide-react';
import {
  NavigationTimingMetrics,
  SecurityAndPrivacyInfo,
  WebApiSupportStatus,
} from '../types/clientInfo';

interface SecurityApisSectionProps {
  security: SecurityAndPrivacyInfo;
  performanceTiming: NavigationTimingMetrics;
  webApis: WebApiSupportStatus[];
}

export const SecurityApisSection: React.FC<SecurityApisSectionProps> = ({
  security,
  performanceTiming,
  webApis,
}) => {
  const [apiCategory, setApiCategory] = useState<string>('all');
  const [apiSearch, setApiSearch] = useState<string>('');

  const filteredApis = webApis.filter((api) => {
    if (apiCategory !== 'all' && api.category !== apiCategory) return false;
    if (apiSearch) {
      const q = apiSearch.toLowerCase();
      return (
        api.name.toLowerCase().includes(q) ||
        api.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const supportedCount = webApis.filter((a) => a.supported).length;

  return (
    <section id="security" className="scroll-mt-20 space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>セキュリティ・Web API・ナビゲーション性能</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            セキュリティ隔離・36種Web API対応状況・ロード性能(TTFB)
          </h2>
        </div>

        <div className="text-xs text-slate-500">
          モダンWeb API対応数: <strong className="font-mono text-cyan-600 dark:text-cyan-400">{supportedCount}</strong> / {webApis.length} 項目
        </div>
      </div>

      {/* Top 2 Columns: Security & Navigation Timing */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Security & Fingerprint Protection Card */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-500" />
            セキュリティコンテキスト & フィンガープリント耐性
          </h3>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/60">
              <span className="text-slate-500 block text-[11px] mb-1">HTTPS 安全なコンテキスト</span>
              <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1">
                {security.isSecureContext ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span>isSecureContext (安全)</span>
                  </>
                ) : (
                  <>
                    <X className="w-3.5 h-3.5 text-rose-500" />
                    <span>非暗号化 (HTTP)</span>
                  </>
                )}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/60">
              <span className="text-slate-500 block text-[11px] mb-1">CrossOrigin 隔離状態</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">
                {security.crossOriginIsolated ? '完全隔離 (High-Res可能)' : '未隔離 (標準)'}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/60">
              <span className="text-slate-500 block text-[11px] mb-1">広告ブロッカー検知</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">
                {security.adBlockDetected ? '稼働中 (検知)' : '未稼働 / 標準'}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5 truncate">{security.adBlockNote}</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/60">
              <span className="text-slate-500 block text-[11px] mb-1">シークレット/プライベート</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">
                {security.incognitoDetected ? `シークレットの可能性 (${security.incognitoConfidence})` : '通常ウィンドウ'}
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs flex items-center justify-between">
            <span className="text-slate-500">Canvas 追跡防止 (ノイズ注入保護):</span>
            <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
              {security.canvasProtectionActive ? '保護有効 (Brave/Firefox RFP等)' : '標準描画 (ノイズなし)'}
            </span>
          </div>
        </div>

        {/* Navigation & Performance Timing */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-500" />
            ナビゲーションタイミング (実測通信フェーズ)
          </h3>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
              <span className="text-slate-500">DNS 解決時間 (Lookup)</span>
              <span className="font-mono font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                {performanceTiming.dnsLookupMs !== null ? `${performanceTiming.dnsLookupMs} ms` : 'キャッシュ済 / 0ms'}
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
              <span className="text-slate-500">TCP ハンドシェイク時間</span>
              <span className="font-mono font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                {performanceTiming.tcpHandshakeMs !== null ? `${performanceTiming.tcpHandshakeMs} ms` : '再利用接続'}
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
              <span className="text-slate-500">SSL/TLS 暗号化交渉時間</span>
              <span className="font-mono font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                {performanceTiming.tlsNegotiationMs !== null ? `${performanceTiming.tlsNegotiationMs} ms` : '確立済'}
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
              <span className="text-slate-500">TTFB (初回バイト到達遅延)</span>
              <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400 tabular-nums">
                {performanceTiming.ttfbMs !== null ? `${performanceTiming.ttfbMs} ms` : '取得不可'}
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
              <span className="text-slate-500">DOMContentLoaded 完了</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                {performanceTiming.domContentLoadedMs !== null ? `${performanceTiming.domContentLoadedMs} ms` : '取得中'}
              </span>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-slate-500">JS ヒープメモリ使用量 (Chromium)</span>
              <span className="font-mono font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                {performanceTiming.jsHeapUsedMb !== null
                  ? `${performanceTiming.jsHeapUsedMb} MB / ${performanceTiming.jsHeapTotalMb} MB`
                  : '非公開 (Safari/Firefox等)'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Web APIs Support Matrix Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Radio className="w-4 h-4 text-purple-500" />
              端末センサー & モダンWeb API サポート検証マトリクス (36種)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              お使いのブラウザがネイティブに利用可能なハードウェア・通信・セキュリティAPIを網羅検証しています。
            </p>
          </div>

          <input
            type="text"
            placeholder="API名・機能検索..."
            value={apiSearch}
            onChange={(e) => setApiSearch(e.target.value)}
            className="px-2.5 py-1 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-500 w-full sm:w-48"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-1 text-xs pb-1">
          <Filter className="w-3.5 h-3.5 text-slate-400 mr-1" />
          {[
            { id: 'all', label: 'すべて' },
            { id: 'ハードウェア', label: 'ハードウェア/センサー' },
            { id: '通信', label: '通信/ネットワーク' },
            { id: 'グラフィックス', label: 'グラフィックス/メディア' },
            { id: 'システム', label: 'システム/ストレージ' },
            { id: 'セキュリティ', label: 'セキュリティ/Wasm' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setApiCategory(cat.id)}
              className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                apiCategory === cat.id
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* APIs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-[500px] overflow-y-auto pr-1">
          {filteredApis.map((api) => (
            <div
              key={api.name}
              className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/60 flex items-start justify-between gap-2"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-xs text-slate-900 dark:text-slate-100 truncate">
                    {api.name}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                  {api.description}
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                  カテゴリ: {api.category}
                </div>
              </div>

              <div className="shrink-0">
                {api.supported ? (
                  <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-semibold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    <Check className="w-3 h-3" />
                    有効
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-medium text-slate-400 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800">
                    <X className="w-3 h-3" />
                    非対応
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
