import React, { useState } from 'react';
import {
  Clock,
  Compass,
  Footprints,
  MousePointer,
  RotateCcw,
  Eye,
  Maximize,
  Radio,
  Trash2,
  Download,
  Filter,
} from 'lucide-react';
import { ActivityEvent, ReferrerSessionInfo } from '../types/clientInfo';
import { formatDuration } from '../utils/clientDetectors';

interface ReferrerTimelineSectionProps {
  session: ReferrerSessionInfo;
  events: ActivityEvent[];
  onClearEvents: () => void;
  onCopy: (text: string, label: string) => void;
}

export const ReferrerTimelineSection: React.FC<ReferrerTimelineSectionProps> = ({
  session,
  events,
  onClearEvents,
  onCopy,
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredEvents = events.filter((ev) => {
    if (filterType !== 'all' && ev.type !== filterType) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        ev.title.toLowerCase().includes(q) ||
        ev.details.toLowerCase().includes(q) ||
        ev.badge.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getEventIcon = (type: ActivityEvent['type']) => {
    switch (type) {
      case 'click':
        return <MousePointer className="w-3.5 h-3.5 text-cyan-500" />;
      case 'scroll':
        return <Footprints className="w-3.5 h-3.5 text-blue-500" />;
      case 'visibility':
        return <Eye className="w-3.5 h-3.5 text-purple-500" />;
      case 'resize':
      case 'orientation':
        return <Maximize className="w-3.5 h-3.5 text-amber-500" />;
      case 'idle':
      case 'resume':
        return <Clock className="w-3.5 h-3.5 text-rose-500" />;
      default:
        return <Radio className="w-3.5 h-3.5 text-emerald-500" />;
    }
  };

  const getEventBadgeColor = (badge: string) => {
    switch (badge) {
      case 'INITIAL':
      case 'ACTIVE':
        return 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'IDLE':
      case 'CLEAR':
        return 'text-rose-700 bg-rose-50 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      case 'CLICK':
        return 'text-cyan-700 bg-cyan-50 dark:bg-cyan-950/60 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800';
      case 'FOREGROUND':
      case 'BACKGROUND':
        return 'text-purple-700 bg-purple-50 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      default:
        return 'text-slate-700 bg-slate-100 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <section id="referrer" className="scroll-mt-20 space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-rose-600 dark:text-rose-400 mb-1">
            <Compass className="w-4 h-4" />
            <span>流入元解析・セッション履歴・行動ログ</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            流入元リファラ・訪問回数・リアルタイム行動タイムライン
          </h2>
        </div>

        <button
          onClick={() => {
            const lines = events.map(
              (e) => `[${e.timeFormatted}] (${e.badge}) ${e.title} - ${e.details}`
            );
            onCopy(lines.join('\n'), '行動ログテキスト');
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span>行動ログをコピー</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (1 col): Referrer & Session Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Referrer Details Card */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Compass className="w-4 h-4 text-rose-500" />
              流入元リファラ (Referrer)
            </h3>

            <div className="bg-slate-50 dark:bg-slate-950/60 p-3.5 rounded-lg border border-slate-200/80 dark:border-slate-800/80">
              <span className="text-[11px] text-slate-500 block mb-1">判別された流入経路</span>
              <div className="text-base font-bold text-slate-900 dark:text-slate-100">
                {session.referrerSourceLabel}
              </div>
              <div className="mt-1 text-xs text-slate-500 font-mono break-all">
                {session.referrer}
              </div>
              {session.referrerNote && (
                <p className="mt-2 text-[11px] text-slate-400">
                  {session.referrerNote}
                </p>
              )}
            </div>

            {session.searchQuery && (
              <div className="p-3 bg-cyan-50 dark:bg-cyan-950/40 rounded-lg border border-cyan-200 dark:border-cyan-900 text-xs">
                <span className="text-slate-500 block text-[11px]">検索キーワード</span>
                <span className="font-bold text-cyan-800 dark:text-cyan-200">
                  {session.searchQuery}
                </span>
              </div>
            )}

            {/* UTM Parameters */}
            <div className="space-y-2 text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300 block">
                URLパラメータ / UTM属性
              </span>
              <div className="space-y-1.5 font-mono text-[11px]">
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">utm_source:</span>
                  <span className="text-slate-800 dark:text-slate-200">{session.utmParams.source || '(未指定)'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">utm_medium:</span>
                  <span className="text-slate-800 dark:text-slate-200">{session.utmParams.medium || '(未指定)'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">utm_campaign:</span>
                  <span className="text-slate-800 dark:text-slate-200">{session.utmParams.campaign || '(未指定)'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">utm_term:</span>
                  <span className="text-slate-800 dark:text-slate-200">{session.utmParams.term || '(未指定)'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Session & Visits Card */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-500" />
              訪問統計 & セッションタイマー
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg">
                <span className="text-slate-500 block text-[11px] mb-1">通算訪問回数</span>
                <span className="text-2xl font-extrabold font-mono text-cyan-600 dark:text-cyan-400 tabular-nums">
                  第 {session.visitCount} 回
                </span>
                <span className="text-[10px] text-slate-400 block mt-1">
                  localStorage永続記録
                </span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg">
                <span className="text-slate-500 block text-[11px] mb-1">今セッション滞在</span>
                <span className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {formatDuration(session.sessionDurationSeconds)}
                </span>
                <span className="text-[10px] text-slate-400 block mt-1">
                  リアルタイム更新中
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs pt-1">
              {session.username && (
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">認証ユーザー名</span>
                  <span className="font-mono text-cyan-600 dark:text-cyan-400 font-bold">
                    {session.username}
                  </span>
                </div>
              )}
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">初回アクセス日時</span>
                <div className="text-right">
                  <span className="font-mono text-slate-800 dark:text-slate-200 font-medium">
                    {session.firstVisitDate}
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    ({session.firstVisitRelative})
                  </span>
                </div>
              </div>

              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">最終活動検知</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                  アクティブ中 (入力監視中)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (2 cols): Real-Time Activity Timeline */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 flex flex-col">
          {/* Timeline Header & Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  リアルタイム行動履歴タイムライン
                </h3>
                <span className="text-xs font-mono font-medium text-slate-500">
                  ({events.length} イベント記録)
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                クリック、スクロール深度、タブ切替、リサイズ、アイドル復帰がリアルタイムに記録されます。
              </p>
            </div>

            <button
              onClick={onClearEvents}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors self-start sm:self-auto"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>ログクリア</span>
            </button>
          </div>

          {/* Filters Bar */}
          <div className="py-3 flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center gap-1 text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-400 mr-1" />
              {(
                [
                  { id: 'all', label: 'すべて' },
                  { id: 'click', label: 'クリック' },
                  { id: 'scroll', label: 'スクロール' },
                  { id: 'visibility', label: 'タブ切替' },
                  { id: 'resize', label: '画面リサイズ' },
                  { id: 'idle', label: 'アイドル' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilterType(tab.id)}
                  className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                    filterType === tab.id
                      ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <input
              type="text"
              placeholder="イベント検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-2.5 py-1 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-500 w-full sm:w-44"
            />
          </div>

          {/* Timeline Event List */}
          <div className="mt-4 flex-1 overflow-y-auto max-h-[460px] pr-2 space-y-3 font-sans">
            {filteredEvents.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                表示できる行動イベントがありません。画面上をクリックまたはスクロールしてください。
              </div>
            ) : (
              filteredEvents.map((ev) => (
                <div
                  key={ev.id}
                  className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-50/60 dark:bg-slate-950/40 border border-slate-200/60 dark:border-slate-800/60 text-xs hover:bg-slate-100/60 dark:hover:bg-slate-900/60 transition-colors"
                >
                  <div className="mt-0.5 p-1.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shrink-0">
                    {getEventIcon(ev.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {ev.title}
                      </span>
                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`px-1.5 py-0.5 text-[10px] font-mono font-medium rounded border ${getEventBadgeColor(
                            ev.badge
                          )}`}
                        >
                          {ev.badge}
                        </span>
                        <span className="font-mono text-slate-400 tabular-nums text-[11px]">
                          {ev.timeFormatted}
                        </span>
                      </div>
                    </div>
                    <div className="mt-1 text-slate-600 dark:text-slate-400 font-mono text-[11px] break-all">
                      {ev.details}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
