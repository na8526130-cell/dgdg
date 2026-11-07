import React from 'react';
import {
  Shield,
  Copy,
  CheckCircle2,
  XCircle,
  FileText,
  Languages,
  HardDrive,
  Laptop,
  Check,
} from 'lucide-react';
import { BrowserSoftwareInfo } from '../types/clientInfo';

interface BrowserSoftwareSectionProps {
  browser: BrowserSoftwareInfo;
  onCopy: (text: string, label: string) => void;
}

export const BrowserSoftwareSection: React.FC<BrowserSoftwareSectionProps> = ({
  browser,
  onCopy,
}) => {
  return (
    <section id="browser" className="scroll-mt-20 space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-600 dark:text-amber-400 mb-1">
            <Shield className="w-4 h-4" />
            <span>ブラウザ・OS・プライバシー & ストレージ機能</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            ソフトウェア環境・セキュリティ設定・User-Agent
          </h2>
        </div>

        <button
          onClick={() => onCopy(browser.rawUserAgent, 'User-Agent 文字列')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm transition-colors"
        >
          <Copy className="w-3.5 h-3.5" />
          <span>User-Agent コピー</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Browser, OS, Device & Languages */}
        <div className="space-y-6">
          {/* OS & Browser Profile Card */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Laptop className="w-4 h-4 text-amber-500" />
              OS・ブラウザ・端末カテゴリ
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-500">ブラウザ名 & バージョン</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <span>{browser.browserName}</span>
                  <span className="font-mono text-cyan-600 dark:text-cyan-400 font-semibold">
                    v{browser.browserVersion}
                  </span>
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-500">オペレーティングシステム (OS)</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  {browser.osName} <span className="font-mono text-slate-500 font-normal">({browser.osVersion})</span>
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-500">端末カテゴリ (Device Type)</span>
                <span className="font-medium text-slate-900 dark:text-slate-100 px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-mono">
                  {browser.deviceCategory}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-500">内蔵PDFビューア対応</span>
                <span className="flex items-center gap-1.5 font-medium">
                  {browser.pdfViewerEnabled ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-emerald-600 dark:text-emerald-400">対応 (ブラウザ内蔵表示可能)</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-slate-500">非対応 / 外部ダウンローダー</span>
                    </>
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-500">ベンダー識別子 (navigator.vendor)</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">
                  {browser.vendor || '(空白 / Google Inc.)'}
                </span>
              </div>
            </div>
          </div>

          {/* Languages & Locales Card */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Languages className="w-4 h-4 text-blue-500" />
              言語・ロケール設定
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-500">優先言語 (navigator.language)</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 font-mono">
                  {browser.primaryLanguageLabel} ({browser.primaryLanguage})
                </span>
              </div>

              <div className="py-1.5">
                <span className="text-slate-500 block mb-1.5">
                  全言語リスト (navigator.languages 優先度順)
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {browser.allLanguages.map((lang, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded font-mono text-[11px] text-slate-800 dark:text-slate-200"
                    >
                      {idx + 1}. {lang}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Storage & Privacy + Raw User-Agent */}
        <div className="space-y-6">
          {/* Storage & Privacy Integrity */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-emerald-500" />
              ストレージ & プライバシー保護機能の有効性
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200/60 dark:border-slate-800/60">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-slate-500">Cookie 有効性</span>
                  {browser.cookieEnabled ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-rose-500" />
                  )}
                </div>
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  {browser.cookieEnabled ? '有効 (利用可能)' : '無効 / ブロック'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200/60 dark:border-slate-800/60">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-slate-500">ローカルストレージ</span>
                  {browser.localStorageEnabled ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-rose-500" />
                  )}
                </div>
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  {browser.localStorageEnabled ? 'localStorage 読書可' : '使用不可'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200/60 dark:border-slate-800/60">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-slate-500">セッションストレージ</span>
                  {browser.sessionStorageEnabled ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-rose-500" />
                  )}
                </div>
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  {browser.sessionStorageEnabled ? 'sessionStorage 読書可' : '使用不可'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200/60 dark:border-slate-800/60">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-slate-500">IndexedDB</span>
                  {browser.indexedDbEnabled ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-rose-500" />
                  )}
                </div>
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  {browser.indexedDbEnabled ? 'IndexedDB サポート' : '非対応'}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-2 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-500">Do Not Track (DNT)</span>
                <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
                  {browser.doNotTrack}
                </span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500">Global Privacy Control (GPC)</span>
                <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
                  {browser.globalPrivacyControl === true
                    ? '有効 (プライバシー保護宣言)'
                    : '未設定 / 無効'}
                </span>
              </div>
            </div>
          </div>

          {/* Raw User-Agent Box with One-Click Copy */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-500" />
                生の User-Agent 文字列 (生UA)
              </h3>
              <button
                onClick={() => onCopy(browser.rawUserAgent, 'User-Agent 文字列')}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-950/40 rounded transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>ワンクリックコピー</span>
              </button>
            </div>

            <div className="relative p-3.5 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-800 dark:text-slate-200 break-all select-all leading-relaxed">
              {browser.rawUserAgent}
            </div>

            <p className="text-[11px] text-slate-500">
              User-Agent Client Hints により、最新のChromiumブラウザでは主要バージョンのみを通知しフィンガープリントを削減する設計になっています。
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
