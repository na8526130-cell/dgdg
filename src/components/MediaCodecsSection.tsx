import React from 'react';
import {
  Volume2,
  Film,
  Music,
  Check,
  X,
  Gauge,
  Palette,
  Eye,
  Sliders,
  HelpCircle,
} from 'lucide-react';
import { AdvancedDisplayInfo, AudioMediaInfo, CodecsInfo } from '../types/clientInfo';

interface MediaCodecsSectionProps {
  audio: AudioMediaInfo;
  codecs: CodecsInfo;
  display: AdvancedDisplayInfo;
}

export const MediaCodecsSection: React.FC<MediaCodecsSectionProps> = ({
  audio,
  codecs,
  display,
}) => {
  return (
    <section id="media" className="scroll-mt-20 space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-pink-600 dark:text-pink-400 mb-1">
            <Volume2 className="w-4 h-4" />
            <span>メディア・オーディオ・コーデック & 表示環境</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            AudioContext・動画/音声コーデック・リフレッシュレート(Hz)
          </h2>
        </div>
      </div>

      {/* Top 3 Cards: Audio, Display Gamut, Refresh Rate */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Audio Context */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Volume2 className="w-4 h-4 text-pink-500" />
              Web Audio 出力仕様
            </span>
            <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
              {audio.audioApiSupported ? '対応' : '非対応'}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">サンプリングレート</span>
              <span className="font-mono font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                {audio.sampleRate ? `${audio.sampleRate.toLocaleString()} Hz` : '取得不可'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">ハードウェア基本遅延</span>
              <span className="font-mono font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                {audio.baseLatencyMs !== null ? `${audio.baseLatencyMs} ms` : '非公開 (Safari等)'}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">最大チャンネル数</span>
              <span className="font-mono font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                {audio.maxChannelCount ? `${audio.maxChannelCount} ch (${audio.maxChannelCount >= 6 ? 'サラウンド対応' : 'ステレオ'})` : '2 ch'}
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Screen Refresh Rate (Hz / FPS) */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Gauge className="w-4 h-4 text-cyan-500" />
              実測画面リフレッシュレート
            </span>
            <span className="text-[11px] font-mono text-cyan-600 dark:text-cyan-400">
              requestAnimationFrame
            </span>
          </div>

          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-3xl font-extrabold font-mono text-cyan-600 dark:text-cyan-400 tabular-nums">
              {display.measuredFps ?? '60'}
            </span>
            <span className="text-sm font-bold text-slate-500">Hz / FPS (実測)</span>
          </div>

          <p className="text-[11px] text-slate-500">
            {display.measuredFps && display.measuredFps >= 120
              ? 'ProMotion / 120Hz以上の高リフレッシュレート駆動が検知されました。'
              : '標準的な60Hz駆動または省電力モードで動作しています。'}
          </p>
        </div>

        {/* Card 3: Color Gamut & Dynamic Range */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Palette className="w-4 h-4 text-purple-500" />
              広色域 & ダイナミックレンジ
            </span>
            <span className="text-[11px] font-mono text-purple-600 dark:text-purple-400">
              CSS Media Queries
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">サポート色域 (Color Gamut)</span>
              <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                {display.colorGamut}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">明暗レンジ (Dynamic Range)</span>
              <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                {display.dynamicRange}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">主要ポインター / ホバー</span>
              <span className="font-mono text-slate-800 dark:text-slate-200">
                {display.primaryPointer} · {display.hoverSupported ? 'ホバー可' : 'タッチ主体'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Codecs Support Matrix Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Video Codecs */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Film className="w-4 h-4 text-blue-500" />
            動画コーデック再生対応 (Hardware / Software Decode)
          </h3>

          <div className="space-y-2 text-xs">
            {codecs.videoCodecs.map((codec) => (
              <div
                key={codec.name}
                className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/60"
              >
                <div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100">
                    {codec.name}
                  </div>
                  <div className="font-mono text-[10px] text-slate-400 truncate max-w-xs">
                    {codec.mimeType}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {codec.supported ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      <Check className="w-3 h-3" />
                      対応
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <X className="w-3 h-3" />
                      非対応
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Audio Codecs */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Music className="w-4 h-4 text-purple-500" />
            音声コーデック再生対応 (Audio Codecs)
          </h3>

          <div className="space-y-2 text-xs">
            {codecs.audioCodecs.map((codec) => (
              <div
                key={codec.name}
                className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/60"
              >
                <div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100">
                    {codec.name}
                  </div>
                  <div className="font-mono text-[10px] text-slate-400 truncate max-w-xs">
                    {codec.mimeType}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {codec.supported ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      <Check className="w-3 h-3" />
                      対応
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <X className="w-3 h-3" />
                      非対応
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
