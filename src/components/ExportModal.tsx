import React, { useState } from 'react';
import { X, Copy, Download, Check, FileCode, FileText } from 'lucide-react';
import { FullClientInspectionData } from '../types/clientInfo';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: FullClientInspectionData;
  onCopy: (text: string, label: string) => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  data,
  onCopy,
}) => {
  const [activeTab, setActiveTab] = useState<'json' | 'markdown'>('json');
  const [hasCopied, setHasCopied] = useState(false);

  if (!isOpen) return null;

  const jsonString = JSON.stringify(data, null, 2);

  const markdownString = `# クライアント環境・接続診断レポート
**診断日時**: ${data.inspectedAt}
**ユーザー名**: ${data.username || '未設定'}

---

## 1. ネットワーク & パブリックIP・位置情報
- **パブリックIP**: \`${data.ipGeo.ip}\` (${data.ipGeo.ipType})
- **所在地 (IP概算)**: ${data.ipGeo.flagEmoji} ${data.ipGeo.country} (${data.ipGeo.countryCode}) · ${data.ipGeo.region} ${data.ipGeo.city} (郵便番号: ${data.ipGeo.postalCode})
- **IP概算座標**: ${data.ipGeo.latitude}, ${data.ipGeo.longitude}
- **ブラウザ高精度GPS測位**: ${data.deviceGeo.status === 'success' && data.deviceGeo.latitude !== null ? `${data.deviceGeo.latitude}, ${data.deviceGeo.longitude} (測位精度: ±${data.deviceGeo.accuracyMeters}m${data.deviceGeo.addressSummary ? ` / ${data.deviceGeo.addressSummary}` : ''})` : data.deviceGeo.status === 'denied' ? 'ブラウザ設定で拒否' : '未許可'}
- **IP推定との距離差異**: ${data.deviceGeo.distanceFromIpKm !== null ? `${data.deviceGeo.distanceFromIpKm} km` : '未計算'}
- **接続ISP**: ${data.ipGeo.isp}
- **組織名 (Org)**: ${data.ipGeo.org}
- **ASN**: ${data.ipGeo.asn}
- **接続ドメイン**: ${data.ipGeo.domain}
- **タイムゾーン**: ${data.ipGeo.timezoneId} (${data.ipGeo.timezoneUtcOffset})
- **回線種別**: ${data.network.effectiveType} (${data.network.connectionType})
- **推定下り速度**: ${data.network.downlinkMbps !== null ? `${data.network.downlinkMbps} Mbps` : '非公開 (Safari等)'}
- **往復遅延 (RTT / Ping)**: ${data.network.livePingMs !== null ? `${data.network.livePingMs} ms (実測)` : data.network.rttMs !== null ? `${data.network.rttMs} ms` : '未測定'}
- **データセーバー**: ${data.network.saveData === null ? '非対応ブラウザ' : data.network.saveData ? '有効' : '無効'}
- **バッテリー**: ${data.network.batteryLevel !== null ? `${data.network.batteryLevel}%` : '非公開'} (${data.network.batteryCharging ? '充電中' : data.network.batterySupported ? 'バッテリー駆動' : '非公開'})

---

## 2. ハードウェア & GPU
- **GPU レンダラー**: \`${data.hardware.cleanedGpuChip}\`
- **生のGPU識別名**: \`${data.hardware.unmaskedRenderer}\`
- **GPU ベンダー**: ${data.hardware.unmaskedVendor}
- **WebGL バージョン**: ${data.hardware.webglVersion}
- **WebGPU サポート**: ${data.hardware.webgpuSupported ? '対応' : '非対応'}
- **CPU コア数**: ${data.hardware.cpuCores !== null ? `${data.hardware.cpuCores} コア` : '非公開'}
- **システムメモリ (RAM)**: ${data.hardware.deviceMemoryGb !== null ? `${data.hardware.deviceMemoryGb} GB` : '非公開 (Safari/Firefox等)'}
- **物理ピクセル解像度**: ${data.hardware.physicalResolution} (Retina倍率: ${data.hardware.devicePixelRatio}x)
- **有効画面解像度**: ${data.hardware.availableResolution}
- **CSS ウィンドウ解像度**: ${data.hardware.cssResolution}
- **色深度**: ${data.hardware.colorDepth}-bit (Display P3: ${data.hardware.wideColorGamutP3 ? '対応' : '非対応'})
- **タッチ操作対応**: ${data.hardware.maxTouchPoints > 0 ? `${data.hardware.maxTouchPoints} 点タッチ` : '非対応'}
- **画面の向き**: ${data.hardware.orientationType} (${data.hardware.orientationAngle}°)
- **プラットフォーム**: \`${data.hardware.platform}\`

---

## 3. 流入元 & セッション
- **流入元リファラ**: ${data.session.referrerSourceLabel}
- **リファラURL**: \`${data.session.referrer}\`
- **通算訪問回数**: 第 ${data.session.visitCount} 回目の訪問
- **初回アクセス日時**: ${data.session.firstVisitDate} (${data.session.firstVisitRelative})
- **今セッション滞在**: ${Math.floor(data.session.sessionDurationSeconds / 60)}分 ${data.session.sessionDurationSeconds % 60}秒

---

## 4. ブラウザ & ソフトウェア
- **ブラウザ**: ${data.browser.browserName} v${data.browser.browserVersion}
- **OS**: ${data.browser.osName} ${data.browser.osVersion}
- **端末区分**: ${data.browser.deviceCategory}
- **優先言語**: ${data.browser.primaryLanguageLabel} (${data.browser.primaryLanguage})
- **対応言語一覧**: ${data.browser.allLanguages.join(', ')}
- **Cookie 有効性**: ${data.browser.cookieEnabled ? '有効' : '無効'}
- **localStorage**: ${data.browser.localStorageEnabled ? '利用可' : '利用不可'}
- **内蔵PDFビューア**: ${data.browser.pdfViewerEnabled ? '対応' : '非対応'}
- **Do Not Track**: ${data.browser.doNotTrack}

---

## 5. オーディオ・メディア・表示仕様
- **画面リフレッシュレート**: ${data.display.measuredFps ?? '60'} Hz (実測)
- **色域 (Color Gamut)**: ${data.display.colorGamut}
- **明暗ダイナミックレンジ**: ${data.display.dynamicRange}
- **Web Audio サンプリングレート**: ${data.audio.sampleRate ? `${data.audio.sampleRate} Hz` : '取得不可'}
- **Audio 基本遅延**: ${data.audio.baseLatencyMs !== null ? `${data.audio.baseLatencyMs} ms` : '非公開'}
- **対応動画コーデック**: ${data.codecs.videoCodecs.filter(c => c.supported).map(c => c.name.split(' ')[0]).join(', ')}
- **対応音声コーデック**: ${data.codecs.audioCodecs.filter(c => c.supported).map(c => c.name.split(' ')[0]).join(', ')}

---

## 6. セキュリティ・性能(TTFB) & Web API
- **HTTPS isSecureContext**: ${data.security.isSecureContext ? '安全 (有効)' : '無効'}
- **広告ブロッカー検知**: ${data.security.adBlockDetected ? '検知 (稼働中)' : '未検知'}
- **プライベート/シークレット判定**: ${data.security.incognitoDetected ? 'シークレットの可能性あり' : '通常ウィンドウ'}
- **TTFB (Time to First Byte)**: ${data.performanceTiming.ttfbMs !== null ? `${data.performanceTiming.ttfbMs} ms` : 'N/A'}
- **DNS解決時間**: ${data.performanceTiming.dnsLookupMs !== null ? `${data.performanceTiming.dnsLookupMs} ms` : '0 ms (キャッシュ済)'}
- **モダンWeb API対応数**: ${data.webApis.filter(a => a.supported).length} / ${data.webApis.length} 項目

---

## 7. ディープハードウェア・権限・接続機器・ストレージ・内蔵フォント
- **Client Hints CPU**: ${data.clientHints?.architecture || '非公開'} (${data.clientHints?.bitness || '64-bit'})
- **端末モデル**: ${data.clientHints?.model || 'PC / デスクトップ'} (OS詳細ビルド: v${data.clientHints?.platformVersion || data.browser.osVersion})
- **接続メディア機器**: カメラ ${data.mediaDevices?.videoInputCount ?? 0}台, マイク ${data.mediaDevices?.audioInputCount ?? 0}台, スピーカー ${data.mediaDevices?.audioOutputCount ?? 0}台 (合計: ${data.mediaDevices?.totalDevices ?? 0}台)
- **ブラウザ権限**: 位置情報 [${data.permissions?.geolocation || '不明'}], カメラ [${data.permissions?.camera || '不明'}], マイク [${data.permissions?.microphone || '不明'}], 通知 [${data.permissions?.notifications || '不明'}]
- **ストレージ容量**: 割当上限 ${data.storage?.quotaGb ? `${data.storage.quotaGb} GB` : '取得不可'} (使用中: ${data.storage?.usageMb ?? 0} MB, 使用率: ${data.storage?.usagePercent ?? 0}%)
- **内蔵フォント検出**: ${data.fonts?.detectedCount ?? 0} / ${data.fonts?.totalScanned ?? 0} 種類 (指紋Hash: \`${data.fonts?.fontFingerprintHash || 'N/A'}\`)
- **WebRTC IPv6**: ${data.webrtcInfo?.dualStackIpv6 ? '対応 (IPv6/IPv4デュアルスタック)' : 'IPv4のみ'} (STUN候補: ${data.webrtcInfo?.candidateTypes.join(', ') || 'mDNS匿名化'})

---

## 8. 生の User-Agent
\`\`\`
${data.browser.rawUserAgent}
\`\`\`
`;

  const activeContent = activeTab === 'json' ? jsonString : markdownString;

  const handleCopyCurrent = () => {
    onCopy(activeContent, activeTab === 'json' ? 'JSONデータ' : 'Markdownレポート');
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([activeContent], {
      type: activeTab === 'json' ? 'application/json' : 'text/markdown',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `client-inspection-${Date.now()}.${activeTab === 'json' ? 'json' : 'md'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-4xl w-full flex flex-col max-h-[88vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              クライアント診断レポート出力
            </h3>
            <div className="flex items-center gap-1 p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs">
              <button
                onClick={() => setActiveTab('json')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors ${
                  activeTab === 'json'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 font-semibold shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>JSON 構造化データ</span>
              </button>
              <button
                onClick={() => setActiveTab('markdown')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors ${
                  activeTab === 'markdown'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 font-semibold shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Markdown 形式</span>
              </button>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Code Preview */}
        <div className="flex-1 p-6 overflow-y-auto bg-slate-50 dark:bg-slate-950 font-mono text-xs text-slate-800 dark:text-slate-200">
          <pre className="whitespace-pre-wrap select-all leading-relaxed">
            {activeContent}
          </pre>
        </div>

        {/* Modal Footer Controls */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
          <span className="text-xs text-slate-500">
            {activeTab === 'json' ? '開発者・APIデバッグ用の完全なJSON' : 'GitHub Issueやチケットにそのまま貼れる形式'}
          </span>

          <div className="flex items-center gap-3">
            <button
              onClick={handleCopyCurrent}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              {hasCopied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>コピー完了</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>クリップボードにコピー</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 dark:bg-cyan-500 dark:hover:bg-cyan-400 dark:text-slate-950 rounded-lg shadow-sm transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>ファイル保存 ({activeTab === 'json' ? '.json' : '.md'})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
