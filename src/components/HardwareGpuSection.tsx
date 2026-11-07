import React, { useState } from 'react';
import {
  Cpu,
  Monitor,
  Sparkles,
  CheckCircle2,
  XCircle,
  Copy,
  Sliders,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { HardwareGpuInfo } from '../types/clientInfo';

interface HardwareGpuSectionProps {
  hardware: HardwareGpuInfo;
  onCopy: (text: string, label: string) => void;
}

export const HardwareGpuSection: React.FC<HardwareGpuSectionProps> = ({
  hardware,
  onCopy,
}) => {
  const [showExtensions, setShowExtensions] = useState(false);
  const limits = hardware.webglLimits;

  return (
    <section id="hardware" className="scroll-mt-20 space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-600 dark:text-purple-400 mb-1">
            <Cpu className="w-4 h-4" />
            <span>ハードウェア・GPU・ディスプレイ仕様</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            グラフィックスレンダラー・CPU/RAM・WebGL制限詳細
          </h2>
        </div>

        <button
          onClick={() =>
            onCopy(
              `GPU: ${hardware.cleanedGpuChip}\nRenderer: ${hardware.unmaskedRenderer}\nVendor: ${hardware.unmaskedVendor}\nCPU: ${hardware.cpuCores !== null ? `${hardware.cpuCores} cores` : 'N/A'}\nRAM: ${hardware.deviceMemoryGb !== null ? `${hardware.deviceMemoryGb} GB` : 'N/A'}\nPhysical: ${hardware.physicalResolution} (DPR: ${hardware.devicePixelRatio}x)\nScreen: ${hardware.availableResolution}`,
              'ハードウェアスペック'
            )
          }
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm transition-colors"
        >
          <Copy className="w-3.5 h-3.5" />
          <span>スペック一括コピー</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* GPU & Graphics Details */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-500" />
              WebGL GPU レンダラー (Unmasked Chipset)
            </h3>
            <span className="text-xs font-mono text-purple-600 dark:text-purple-400 font-semibold">
              {hardware.webglVersion.split(' ')[0]}
            </span>
          </div>

          {/* Primary Chipset Hero Display */}
          <div className="bg-gradient-to-br from-slate-50 to-purple-50/30 dark:from-slate-950/80 dark:to-purple-950/20 p-4 rounded-xl border border-purple-200/50 dark:border-purple-900/30">
            <div className="text-xs font-medium text-slate-500 mb-1">特定されたGPUチップ名</div>
            <div className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 leading-snug">
              {hardware.cleanedGpuChip}
            </div>
            {hardware.gpuNote && (
              <p className="mt-1.5 text-xs text-purple-700 dark:text-purple-300">
                {hardware.gpuNote}
              </p>
            )}
            <div className="mt-3 text-xs font-mono text-slate-600 dark:text-slate-400 break-all bg-white/60 dark:bg-slate-900/60 p-2.5 rounded-lg border border-slate-200/50 dark:border-slate-800/50">
              <span className="text-slate-400 block text-[10px]">生のUNMASKED_RENDERER_WEBGL:</span>
              {hardware.unmaskedRenderer}
            </div>
          </div>

          {/* Graphics Capabilities Table */}
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/60">
              <span className="text-slate-500">GPU ベンダー (UNMASKED_VENDOR)</span>
              <span className="font-mono font-medium text-slate-900 dark:text-slate-100 text-right">
                {hardware.unmaskedVendor}
              </span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/60">
              <span className="text-slate-500">WebGL 実装バージョン</span>
              <span className="font-mono text-slate-900 dark:text-slate-100">
                {hardware.webglVersion}
              </span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/60">
              <span className="text-slate-500">次世代 WebGPU API</span>
              <span className="flex items-center gap-1 font-medium">
                {hardware.webgpuSupported ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-emerald-600 dark:text-emerald-400">サポート対応</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-slate-500">非サポート / 未有効化</span>
                  </>
                )}
              </span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/60">
              <span className="text-slate-500">最大テクスチャ解像度 (MAX_TEXTURE_SIZE)</span>
              <span className="font-mono font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                {hardware.maxTextureSize > 0 ? `${hardware.maxTextureSize} × ${hardware.maxTextureSize} px` : '取得不可'}
              </span>
            </div>

            <div className="flex items-center justify-between py-1.5">
              <span className="text-slate-500">システムプラットフォーム (navigator.platform)</span>
              <span className="font-mono text-slate-900 dark:text-slate-100">
                {hardware.platform}
              </span>
            </div>
          </div>
        </div>

        {/* CPU, Memory & Display Specifications */}
        <div className="space-y-6">
          {/* CPU & Memory Card */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-500" />
              プロセッサ (CPU) & システムメモリ (RAM)
            </h3>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200/60 dark:border-slate-800/60">
                <span className="text-slate-500 block mb-1">CPU 論理コア数</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-extrabold font-mono text-slate-900 dark:text-slate-100 tabular-nums">
                    {hardware.cpuCores !== null ? hardware.cpuCores : '非公開'}
                  </span>
                  {hardware.cpuCores !== null && (
                    <span className="text-slate-500 text-xs">スレッド / コア</span>
                  )}
                </div>
                <span className="text-[11px] text-slate-400 block mt-1">
                  {hardware.cpuCoresNote}
                </span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200/60 dark:border-slate-800/60">
                <span className="text-slate-500 block mb-1">システムメモリ (RAM)</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-extrabold font-mono text-cyan-600 dark:text-cyan-400 tabular-nums">
                    {hardware.deviceMemoryGb !== null ? `${hardware.deviceMemoryGb} GB` : '非公開'}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 block mt-1">
                  {hardware.deviceMemoryNote}
                </span>
              </div>
            </div>
          </div>

          {/* Display & Resolution Card */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Monitor className="w-4 h-4 text-blue-500" />
              画面解像度・Retina倍率・カラー深度
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-500">物理ピクセル解像度 (Physical)</span>
                <span className="font-mono font-bold text-base text-slate-900 dark:text-slate-100 tabular-nums">
                  {hardware.physicalResolution}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-500">有効画面解像度 (screen.availWidth × availHeight)</span>
                <span className="font-mono text-slate-800 dark:text-slate-200 tabular-nums">
                  {hardware.availableResolution}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-500">現在のブラウザウィンドウ解像度 (CSS)</span>
                <span className="font-mono text-slate-800 dark:text-slate-200 tabular-nums">
                  {hardware.cssResolution}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-500">Retina倍率 (devicePixelRatio)</span>
                <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400 tabular-nums">
                  {hardware.devicePixelRatio}x (高密度ディスプレイ)
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-500">カラー深度 & 広色域 / HDR</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">
                  {hardware.colorDepth}-bit ({hardware.pixelDepth} bpp) · {hardware.wideColorGamutP3 ? 'Display P3 広色域' : 'sRGB'} · {hardware.hdrSupported ? 'HDR' : 'SDR'}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-500">タッチ操作対応 (最大タッチ点数)</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">
                  {hardware.maxTouchPoints > 0 ? `${hardware.maxTouchPoints} 点マルチタッチ対応` : 'タッチ非対応 (マウス/トラックパッド)'}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-500">画面の向き (Orientation)</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">
                  {hardware.orientationType} ({hardware.orientationAngle}°)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Deep WebGL Limits & Shader Precision Detail */}
      {limits && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-purple-500" />
              WebGL 内部パラメータ制限・シェーダー精度・Canvasエントロピー
            </h3>
            <span className="text-xs font-mono text-slate-400">
              Extensions: {limits.supportedExtensions.length} 個
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg">
              <span className="text-slate-500 text-[11px] block">MAX_CUBE_MAP_TEXTURE_SIZE</span>
              <strong className="font-mono text-sm text-slate-900 dark:text-slate-100">
                {limits.maxCubeMapSize} px
              </strong>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg">
              <span className="text-slate-500 text-[11px] block">MAX_RENDERBUFFER_SIZE</span>
              <strong className="font-mono text-sm text-slate-900 dark:text-slate-100">
                {limits.maxRenderBufferSize} px
              </strong>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg">
              <span className="text-slate-500 text-[11px] block">MAX_VIEWPORT_DIMS</span>
              <strong className="font-mono text-sm text-slate-900 dark:text-slate-100">
                {limits.maxViewportDims}
              </strong>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg">
              <span className="text-slate-500 text-[11px] block">Canvas 2D ハッシュ</span>
              <strong className="font-mono text-sm text-purple-600 dark:text-purple-400">
                {limits.canvasFingerprintHash}
              </strong>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
              <span className="text-slate-500">MAX_VERTEX_ATTRIBS:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{limits.maxVertexAttribs}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
              <span className="text-slate-500">VERTEX_UNIFORMS:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{limits.maxVertexUniformVectors}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
              <span className="text-slate-500">FRAGMENT_UNIFORMS:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{limits.maxFragmentUniformVectors}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
              <span className="text-slate-500">COMBINED_TEXTURE_UNITS:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{limits.maxCombinedTextureUnits}</span>
            </div>
          </div>

          {/* Extensions accordion */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setShowExtensions(!showExtensions)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline"
            >
              <span>対応 WebGL Extensions 一覧 ({limits.supportedExtensions.length} 件)</span>
              {showExtensions ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showExtensions && (
              <div className="mt-3 flex flex-wrap gap-1.5 max-h-48 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-950/60 rounded-lg border border-slate-200 dark:border-slate-800 font-mono text-[11px]">
                {limits.supportedExtensions.map((ext) => (
                  <span
                    key={ext}
                    className="px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                  >
                    {ext}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
