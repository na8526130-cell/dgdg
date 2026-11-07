import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityEvent } from '../types/clientInfo';

function formatClockTime(date: Date): string {
  const h = date.getHours().toString().padStart(2, '0');
  const m = date.getMinutes().toString().padStart(2, '0');
  const s = date.getSeconds().toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
}

export function useActivityTracker() {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [lastActiveTimestamp, setLastActiveTimestamp] = useState<number>(Date.now());
  const [sessionDurationSeconds, setSessionDurationSeconds] = useState<number>(0);
  const scrollMilestonesRef = useRef<Set<number>>(new Set());
  const isIdleRef = useRef<boolean>(false);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

  const addEvent = useCallback((
    type: ActivityEvent['type'],
    title: string,
    details: string,
    badge: string
  ) => {
    const now = Date.now();
    const newEvent: ActivityEvent = {
      id: `${now}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: now,
      timeFormatted: formatClockTime(new Date(now)),
      relativeTime: 'たった今',
      type,
      title,
      details,
      badge,
    };

    setEvents((prev) => [newEvent, ...prev.slice(0, 99)]); // Keep up to 100 recent events
    setLastActiveTimestamp(now);
  }, []);

  // Session duration timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSessionDurationSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Update relative time for events periodically
  useEffect(() => {
    const relTimer = setInterval(() => {
      const now = Date.now();
      setEvents((prev) =>
        prev.map((ev) => {
          const diffSec = Math.floor((now - ev.timestamp) / 1000);
          let rel = 'たった今';
          if (diffSec >= 60) {
            const diffMin = Math.floor(diffSec / 60);
            rel = `${diffMin}分前`;
          } else if (diffSec >= 5) {
            rel = `${diffSec}秒前`;
          }
          return { ...ev, relativeTime: rel };
        })
      );
    }, 5000);
    return () => clearInterval(relTimer);
  }, []);

  // Setup Activity listeners (Scroll, Click, Visibility, Resize, Idle)
  useEffect(() => {
    // Initial page load event
    addEvent(
      'page_load',
      'セッション開始 / ページ初期化完了',
      `初期ビューポート: ${window.innerWidth}×${window.innerHeight}px, DPR: ${window.devicePixelRatio}`,
      'INITIAL'
    );

    // Idle watchdog
    const resetIdleTimer = () => {
      setLastActiveTimestamp(Date.now());
      if (isIdleRef.current) {
        isIdleRef.current = false;
        addEvent('resume', 'ユーザー操作再開 (アクティブ復元)', 'キーボード・マウス・タッチ入力を検知', 'ACTIVE');
      }

      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      idleTimerRef.current = setTimeout(() => {
        isIdleRef.current = true;
        addEvent('idle', 'アイドル状態検知 (15秒間無操作)', 'バックグラウンド待機状態に移行', 'IDLE');
      }, 15000);
    };

    resetIdleTimer();

    // Scroll depth listener
    const handleScroll = () => {
      resetIdleTimer();
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;
      const scrollPercent = Math.round((window.scrollY / docHeight) * 100);

      const milestones = [25, 50, 75, 100];
      for (const m of milestones) {
        if (scrollPercent >= m && !scrollMilestonesRef.current.has(m)) {
          scrollMilestonesRef.current.add(m);
          addEvent(
            'scroll',
            `スクロール深度到達: ${m}%`,
            `スクロールY位置: ${Math.round(window.scrollY)}px / 全体 ${document.documentElement.scrollHeight}px`,
            `${m}%`
          );
        }
      }
    };

    // Click / Touch listener
    const handleClick = (e: MouseEvent) => {
      resetIdleTimer();
      const target = e.target as HTMLElement | null;
      let targetDesc = target ? target.tagName.toLowerCase() : 'element';
      if (target?.id) targetDesc += `#${target.id}`;
      else if (target?.className && typeof target.className === 'string') {
        const firstClass = target.className.split(' ')[0];
        if (firstClass) targetDesc += `.${firstClass}`;
      }
      const label = target?.innerText?.trim().slice(0, 24) || '';

      addEvent(
        'click',
        `ユーザー操作: ${targetDesc}`,
        `座標 (X: ${Math.round(e.clientX)}, Y: ${Math.round(e.clientY)})${label ? ` - テキスト: "${label}"` : ''}`,
        'CLICK'
      );
    };

    // Tab Visibility listener
    const handleVisibilityChange = () => {
      resetIdleTimer();
      const isVisible = document.visibilityState === 'visible';
      addEvent(
        'visibility',
        isVisible ? 'タブ前面復帰 (フォアグラウンド表示)' : 'タブ離脱 (バックグラウンド移行)',
        `visibilityState: ${document.visibilityState}`,
        isVisible ? 'FOREGROUND' : 'BACKGROUND'
      );
    };

    // Window Resize listener
    let resizeTimeout: NodeJS.Timeout | null = null;
    const handleResize = () => {
      resetIdleTimer();
      if (resizeTimeout) clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        addEvent(
          'resize',
          'ウィンドウリサイズ検知',
          `新サイズ: ${window.innerWidth}×${window.innerHeight}px (有効: ${screen.availWidth}×${screen.availHeight}px)`,
          'RESIZE'
        );
      }, 300);
    };

    // Orientation change listener
    const handleOrientation = () => {
      resetIdleTimer();
      const orientation = screen.orientation ? screen.orientation.type : (window.innerWidth > window.innerHeight ? 'landscape' : 'portrait');
      addEvent(
        'orientation',
        '画面の向き変更',
        `向き: ${orientation} (角度: ${screen.orientation?.angle || 0}°)`,
        'ORIENTATION'
      );
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('click', handleClick, { passive: true });
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientation);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('click', handleClick);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientation);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [addEvent]);

  const clearEvents = useCallback(() => {
    setEvents([]);
    scrollMilestonesRef.current.clear();
    addEvent('page_load', 'タイムラインをクリアしました', 'これ以降の操作が新しく記録されます', 'CLEAR');
  }, [addEvent]);

  return {
    events,
    addEvent,
    clearEvents,
    lastActiveTimestamp,
    sessionDurationSeconds,
  };
}
