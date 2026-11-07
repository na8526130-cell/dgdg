/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useState } from 'react';
import { Header } from './components/Header';
import { OverviewSection } from './components/OverviewSection';
import { NetworkGeoSection } from './components/NetworkGeoSection';
import { HardwareGpuSection } from './components/HardwareGpuSection';
import { MediaCodecsSection } from './components/MediaCodecsSection';
import { SecurityApisSection } from './components/SecurityApisSection';
import { ReferrerTimelineSection } from './components/ReferrerTimelineSection';
import { BrowserSoftwareSection } from './components/BrowserSoftwareSection';
import { ExportModal } from './components/ExportModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminPanelModal } from './components/AdminPanelModal';
import { UserEntryGate } from './components/UserEntryGate';
import { UserSwitchModal } from './components/UserSwitchModal';
import { ToastContainer, ToastMessage } from './components/Toast';
import { FullClientInspectionData } from './types/clientInfo';
import { useActivityTracker } from './hooks/useActivityTracker';
import {
  detectBrowserAndOS,
  detectHardwareAndGPU,
  detectNetworkAndBattery,
  detectReferrerAndSession,
  fetchIpAndGeoInfo,
  measureRealPing,
} from './utils/clientDetectors';
import {
  detectAdvancedDisplay,
  detectAudioCapabilities,
  detectMediaCodecs,
  detectNavigationTiming,
  detectSecurityAndPrivacy,
  detectWebApis,
  detectWebGlLimits,
  measureRefreshRate,
} from './utils/advancedDetectors';
import {
  checkAndFetchIfGranted,
  requestDeviceGeolocation,
} from './utils/geolocationDetector';
import {
  checkAdminAuthSession,
  setAdminAuthSession,
  clearAdminAuthSession,
} from './utils/adminAuth';
import { syncUserProfile } from './utils/userProfilesService';

export default function App() {
  const [isDark, setIsDark] = useState<boolean>(true);
  const [isAdmin, setIsAdmin] = useState<boolean>(() => checkAdminAuthSession());
  const [isAdminLoginModalOpen, setIsAdminLoginModalOpen] = useState<boolean>(false);
  const [isAdminPanelModalOpen, setIsAdminPanelModalOpen] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [username, setUsername] = useState<string>(() => {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('cp_username') || '';
    }
    return '';
  });
  const [isUserSwitchModalOpen, setIsUserSwitchModalOpen] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isPinging, setIsPinging] = useState<boolean>(false);
  const [isLookingUp, setIsLookingUp] = useState<boolean>(false);
  const [isRequestingGeo, setIsRequestingGeo] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [activeSection, setActiveSection] = useState<string>('overview');

  const {
    events,
    addEvent,
    clearEvents,
    lastActiveTimestamp,
    sessionDurationSeconds,
  } = useActivityTracker();

  // Full inspection state
  const [data, setData] = useState<FullClientInspectionData>(() => {
    const hw = detectHardwareAndGPU();
    hw.webglLimits = detectWebGlLimits();
    const storedUsername = typeof localStorage !== 'undefined' ? localStorage.getItem('cp_username') || undefined : undefined;
    const sessionData = detectReferrerAndSession();
    sessionData.username = storedUsername;

    return {
      username: storedUsername,
      session: sessionData,
      network: {
        effectiveType: '判定中...',
        connectionType: '判定中...',
        downlinkMbps: null,
        rttMs: null,
        saveData: null,
        networkApiSupported: false,
        isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
        batteryLevel: null,
        batteryCharging: null,
        batteryChargingTime: null,
        batteryDischargingTime: null,
        batterySupported: false,
        livePingMs: null,
        livePingMin: null,
        livePingMax: null,
        livePingJitter: null,
        pingStatus: 'idle',
      },
      hardware: hw,
      ipGeo: {
        ip: '取得中...',
        ipType: 'Unknown',
        country: '取得中...',
        countryCode: 'N/A',
        flagEmoji: '🌐',
        region: '取得中...',
        city: '取得中...',
        postalCode: '-',
        latitude: null,
        longitude: null,
        googleMapsUrl: 'https://www.google.com/maps',
        isp: '取得中...',
        org: '取得中...',
        asn: '-',
        domain: '-',
        timezoneId: typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'Asia/Tokyo',
        timezoneUtcOffset: '端末基準',
        isTimezoneMatch: true,
        deviceTimezone: typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'Asia/Tokyo',
        dataSource: '初期化中',
        fetchStatus: 'loading',
      },
      deviceGeo: {
        permissionState: 'unknown',
        status: 'checking',
        latitude: null,
        longitude: null,
        accuracyMeters: null,
        altitudeMeters: null,
        altitudeAccuracyMeters: null,
        heading: null,
        speedMps: null,
        timestamp: null,
        fetchedAtFormatted: null,
      },
      browser: detectBrowserAndOS(),
      audio: detectAudioCapabilities(),
      codecs: detectMediaCodecs(),
      display: detectAdvancedDisplay(null),
      performanceTiming: detectNavigationTiming(),
      security: {
        adBlockDetected: false,
        adBlockNote: '診断中...',
        incognitoDetected: false,
        incognitoConfidence: '通常モード',
        isSecureContext: typeof window !== 'undefined' ? Boolean(window.isSecureContext) : false,
        crossOriginIsolated: typeof window !== 'undefined' ? Boolean(window.crossOriginIsolated) : false,
        cookieEnabled: typeof navigator !== 'undefined' ? navigator.cookieEnabled : false,
        localStorageWorking: true,
        sessionStorageWorking: true,
        indexedDbWorking: true,
        canvasProtectionActive: false,
      },
      webApis: detectWebApis(),
      inspectedAt: new Date().toLocaleString('ja-JP'),
    };
  });

  // Toast helper
  const showToast = useCallback((message: string, type: 'success' | 'info' = 'success') => {
    const id = `${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2800);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const handleCopy = useCallback(
    (text: string, label: string) => {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(text).then(
          () => {
            showToast(`${label} をコピーしました`);
            addEvent('copy', `${label} コピー`, text.slice(0, 40) + (text.length > 40 ? '...' : ''), 'COPY');
          },
          () => {
            showToast('コピーに失敗しました', 'info');
          }
        );
      }
    },
    [showToast, addEvent]
  );

  // Sync session duration & last active timestamp from tracker
  useEffect(() => {
    setData((prev) => ({
      ...prev,
      session: {
        ...prev.session,
        lastActiveTimestamp,
        sessionDurationSeconds,
      },
    }));
  }, [lastActiveTimestamp, sessionDurationSeconds]);

  // Initial load & async network/IP fetching
  const refreshAllData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const [networkInfo, ipInfo, fps, securityInfo] = await Promise.all([
        detectNetworkAndBattery(),
        fetchIpAndGeoInfo(),
        measureRefreshRate(),
        detectSecurityAndPrivacy(),
      ]);

      // Check device geolocation if permission was already granted ("位置情報許可されてたら取得")
      const deviceGeoInfo = await checkAndFetchIfGranted(ipInfo.latitude, ipInfo.longitude);

      const hardwareInfo = detectHardwareAndGPU();
      hardwareInfo.webglLimits = detectWebGlLimits();
      const browserInfo = detectBrowserAndOS();
      const sessionInfo = detectReferrerAndSession();
      const audioInfo = detectAudioCapabilities();
      const codecsInfo = detectMediaCodecs();
      const displayInfo = detectAdvancedDisplay(fps);
      const perfTiming = detectNavigationTiming();
      const webApisList = detectWebApis();

      setData((prev) => ({
        ...prev,
        username: prev.username || username || undefined,
        session: {
          ...sessionInfo,
          username: prev.username || username || undefined,
          lastActiveTimestamp: Date.now(),
          sessionDurationSeconds: prev.session.sessionDurationSeconds,
        },
        network: {
          ...networkInfo,
          livePingMs: prev.network.livePingMs,
          livePingMin: prev.network.livePingMin,
          livePingMax: prev.network.livePingMax,
          livePingJitter: prev.network.livePingJitter,
          pingStatus: prev.network.pingStatus,
        },
        hardware: hardwareInfo,
        ipGeo: ipInfo,
        deviceGeo: deviceGeoInfo,
        browser: browserInfo,
        audio: audioInfo,
        codecs: codecsInfo,
        display: displayInfo,
        performanceTiming: perfTiming,
        security: securityInfo,
        webApis: webApisList,
        inspectedAt: new Date().toLocaleString('ja-JP'),
      }));

      if (deviceGeoInfo.status === 'success') {
        showToast('最新の診断データと高精度位置情報を取得しました');
      } else {
        showToast('最新の診断データを取得しました');
      }
    } catch (err) {
      console.error('Failed to refresh data', err);
      showToast('データ更新中にエラーが発生しました', 'info');
    } finally {
      setIsRefreshing(false);
    }
  }, [showToast]);

  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  // Request device geolocation on demand (e.g. user clicks button to grant)
  const handleRequestDeviceLocation = useCallback(async () => {
    setIsRequestingGeo(true);
    setData((prev) => ({
      ...prev,
      deviceGeo: { ...prev.deviceGeo, status: 'requesting' },
    }));
    addEvent('click', '位置情報リクエスト', 'ブラウザの高精度位置情報(GPS)取得を開始', 'GEO');

    try {
      const geoResult = await requestDeviceGeolocation(data.ipGeo.latitude, data.ipGeo.longitude);
      setData((prev) => ({
        ...prev,
        deviceGeo: geoResult,
      }));

      if (geoResult.status === 'success' && geoResult.latitude !== null && geoResult.longitude !== null) {
        showToast(`高精度位置情報を取得しました (精度: ±${geoResult.accuracyMeters}m)`);
        addEvent(
          'click',
          '位置情報取得成功',
          `緯度: ${geoResult.latitude.toFixed(5)}, 経度: ${geoResult.longitude.toFixed(5)}, 誤差: ±${geoResult.accuracyMeters}m${geoResult.distanceFromIpKm !== null ? `, IPとの差: ${geoResult.distanceFromIpKm}km` : ''}`,
          'GEO'
        );
      } else if (geoResult.status === 'denied') {
        showToast('位置情報の利用が拒否されました', 'info');
        addEvent('click', '位置情報拒否', 'ブラウザ設定により位置情報アクセスが拒否されました', 'GEO');
      } else {
        showToast(geoResult.errorMessage || '位置情報の取得に失敗しました', 'info');
      }
    } catch {
      showToast('位置情報の取得処理中にエラーが発生しました', 'info');
    } finally {
      setIsRequestingGeo(false);
    }
  }, [data.ipGeo.latitude, data.ipGeo.longitude, addEvent, showToast]);

  // Listen to geolocation permission status changes
  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'permissions' in navigator) {
      navigator.permissions
        .query({ name: 'geolocation' })
        .then((permStatus) => {
          const handler = async () => {
            if (permStatus.state === 'granted') {
              const res = await requestDeviceGeolocation(data.ipGeo.latitude, data.ipGeo.longitude);
              setData((prev) => ({ ...prev, deviceGeo: res }));
              if (res.status === 'success') {
                showToast('位置情報の許可が検出され、現在地を取得しました');
              }
            } else if (permStatus.state === 'denied') {
              setData((prev) => ({
                ...prev,
                deviceGeo: {
                  ...prev.deviceGeo,
                  permissionState: 'denied',
                  status: 'denied',
                  errorMessage: 'ブラウザ設定で位置情報が拒否されています',
                },
              }));
            }
          };
          permStatus.addEventListener('change', handler);
          return () => permStatus.removeEventListener('change', handler);
        })
        .catch(() => {});
    }
  }, [data.ipGeo.latitude, data.ipGeo.longitude, showToast]);

  // Ping test handler
  const handleTriggerPing = useCallback(async () => {
    if (isPinging) return;
    setIsPinging(true);
    addEvent('speed_test', '実測Pingプローブ開始', 'CDNエンドポイントへのHTTP遅延測定中', 'PING');

    try {
      const result = await measureRealPing(3);
      setData((prev) => ({
        ...prev,
        network: {
          ...prev.network,
          livePingMs: result.avg,
          livePingMin: result.min,
          livePingMax: result.max,
          livePingJitter: result.jitter,
          pingStatus: 'success',
        },
      }));
      showToast(`実測Ping: 平均 ${result.avg}ms (ジッター: ${result.jitter}ms)`);
      addEvent(
        'speed_test',
        '実測Pingプローブ完了',
        `平均: ${result.avg}ms, 最小: ${result.min}ms, 最大: ${result.max}ms, ジッター: ${result.jitter}ms`,
        'PING'
      );
    } catch {
      showToast('Pingプローブの実行に失敗しました', 'info');
    } finally {
      setIsPinging(false);
    }
  }, [isPinging, addEvent, showToast]);

  // Manual IP verification / lookup handler
  const handleLookupIp = useCallback(async (customIp: string) => {
    setIsLookingUp(true);
    const isSelfRefresh = !customIp.trim();
    addEvent(
      'speed_test',
      isSelfRefresh ? 'IP・地理情報再取得' : 'IP手動照会開始',
      isSelfRefresh
        ? '最新のパブリックIPおよびプロバイダ地理情報を再取得中'
        : `指定IP [${customIp}] の位置・プロバイダ情報を再取得中`,
      'LOOKUP'
    );
    try {
      const result = await fetchIpAndGeoInfo(customIp.trim() || undefined);
      setData((prev) => ({
        ...prev,
        ipGeo: result,
      }));
      showToast(`IP [${result.ip}] の地理情報を更新しました (${result.dataSource.split(' ')[0]})`);
      addEvent(
        'speed_test',
        'IP照会完了',
        `国: ${result.country}, 地域: ${result.region}, ISP: ${result.isp}`,
        'LOOKUP'
      );
    } catch {
      showToast('IP情報の照会に失敗しました', 'info');
    } finally {
      setIsLookingUp(false);
    }
  }, [addEvent, showToast]);

  // Admin authentication handlers
  const handleAdminLoginSuccess = useCallback(() => {
    setAdminAuthSession();
    setIsAdmin(true);
    showToast('管理者として認証されました (SHA-256検証完了)');
    addEvent('visibility', '管理者ログイン成功', 'SHA-256暗号化照合により管理者権限を付与', 'ADMIN');
    setIsAdminPanelModalOpen(true);
  }, [showToast, addEvent]);

  const handleAdminLogout = useCallback(() => {
    clearAdminAuthSession();
    setIsAdmin(false);
    showToast('管理者ログアウトしました', 'info');
    addEvent('visibility', '管理者ログアウト', 'セッションから管理者権限を破棄', 'ADMIN');
  }, [showToast, addEvent]);

  // Username management & Entry Gate callbacks
  const handleSetUsername = useCallback(
    (name: string) => {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('cp_username', name);
      }
      setUsername(name);
      setData((prev) => {
        const next = {
          ...prev,
          username: name,
          session: {
            ...prev.session,
            username: name,
          },
        };
        syncUserProfile(name, next, events);
        return next;
      });
      addEvent('page_load', 'ユーザー入場', `${name} として診断セッションを開始しました`, 'USER');
      showToast(`${name} さん、ようこそ！診断ダッシュボードを開始します`);
    },
    [events, addEvent, showToast]
  );

  const handleUpdateUsername = useCallback(
    (newName: string) => {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('cp_username', newName);
      }
      setUsername(newName);
      setData((prev) => {
        const next = {
          ...prev,
          username: newName,
          session: {
            ...prev.session,
            username: newName,
          },
        };
        syncUserProfile(newName, next, events);
        return next;
      });
      addEvent('visibility', 'ユーザー名変更', `ユーザー名を「${newName}」に更新しました`, 'USER');
      showToast(`ユーザー名を「${newName}」に変更しました`);
    },
    [events, addEvent, showToast]
  );

  const handleUserLogout = useCallback(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('cp_username');
    }
    setUsername('');
    setData((prev) => ({
      ...prev,
      username: undefined,
      session: {
        ...prev.session,
        username: undefined,
      },
    }));
    addEvent('visibility', 'ユーザーログアウト', 'ユーザーセッションを終了し入場ゲートに戻りました', 'USER');
    showToast('ログアウトしました。新しいユーザー名を入力してください', 'info');
  }, [addEvent, showToast]);

  // Keep admin database synced with current user profile telemetry
  useEffect(() => {
    if (username && data.ipGeo.fetchStatus !== 'loading' && data.ipGeo.ip !== '取得中...') {
      syncUserProfile(username, data, events);
    }
  }, [username, data.ipGeo.ip, data.deviceGeo.status, events.length]);

  // Listen to Network & Battery events
  useEffect(() => {
    const handleOnline = () => {
      setData((prev) => ({
        ...prev,
        network: { ...prev.network, isOnline: true },
      }));
      addEvent('page_load', '回線ステータス変化', 'ネットワークに再接続 (Online)', 'ONLINE');
    };

    const handleOffline = () => {
      setData((prev) => ({
        ...prev,
        network: { ...prev.network, isOnline: false },
      }));
      addEvent('page_load', '回線ステータス変化', 'ネットワークが切断 (Offline)', 'OFFLINE');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Battery listeners if supported
    let batteryObj: any = null;
    if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        batteryObj = battery;
        const updateBattery = () => {
          setData((prev) => ({
            ...prev,
            network: {
              ...prev.network,
              batteryLevel: Math.round(battery.level * 100),
              batteryCharging: battery.charging,
              batteryChargingTime: Number.isFinite(battery.chargingTime) ? battery.chargingTime : null,
              batteryDischargingTime: Number.isFinite(battery.dischargingTime) ? battery.dischargingTime : null,
              batterySupported: true,
            },
          }));
        };
        battery.addEventListener('levelchange', updateBattery);
        battery.addEventListener('chargingchange', updateBattery);
      }).catch(() => {});
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [addEvent]);

  // Dark mode toggle
  const toggleTheme = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return next;
    });
  }, []);

  // Update active section on scroll
  useEffect(() => {
    const sections = ['overview', 'network', 'hardware', 'media', 'security', 'referrer', 'browser'];
    const handleScroll = () => {
      const scrollPos = window.scrollY + 120;
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(id);
            break;
          }
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Entry gate: block access until username is entered ("まずこのサイト入るにはユーザー名を入れないと入れない")
  if (!username) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500/20 selection:text-cyan-200">
        <UserEntryGate
          onEnter={handleSetUsername}
          onOpenAdminLogin={() => setIsAdminLoginModalOpen(true)}
        />

        {/* Admin Direct Login Modal */}
        <AdminLoginModal
          isOpen={isAdminLoginModalOpen}
          onClose={() => setIsAdminLoginModalOpen(false)}
          onLoginSuccess={handleAdminLoginSuccess}
        />

        {/* Toast Notification Container */}
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Bar Header adhering strictly to Top Bar Contract */}
      <Header
        isDark={isDark}
        isAdmin={isAdmin}
        username={username}
        onToggleTheme={toggleTheme}
        onOpenExport={() => setIsExportModalOpen(true)}
        onOpenAdminLogin={() => setIsAdminLoginModalOpen(true)}
        onOpenAdminPanel={() => setIsAdminPanelModalOpen(true)}
        onOpenUserSwitch={() => setIsUserSwitchModalOpen(true)}
        onRefresh={refreshAllData}
        isRefreshing={isRefreshing}
        activeSection={activeSection}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* 1. Overview Section */}
        <OverviewSection
          data={data}
          onSelectTab={(id) => {
            const el = document.getElementById(id);
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          onTriggerPing={handleTriggerPing}
          onRequestDeviceLocation={handleRequestDeviceLocation}
          isPinging={isPinging}
          isRequestingGeo={isRequestingGeo}
        />

        {/* 2. Network & Public IP Geolocation */}
        <NetworkGeoSection
          ipGeo={data.ipGeo}
          deviceGeo={data.deviceGeo}
          network={data.network}
          onCopy={handleCopy}
          onTriggerPing={handleTriggerPing}
          onLookupIp={handleLookupIp}
          onRequestDeviceLocation={handleRequestDeviceLocation}
          isPinging={isPinging}
          isLookingUp={isLookingUp}
          isRequestingGeo={isRequestingGeo}
        />

        {/* 3. Hardware, GPU & WebGL Limits */}
        <HardwareGpuSection
          hardware={data.hardware}
          onCopy={handleCopy}
        />

        {/* 4. Media, Audio & Codecs */}
        <MediaCodecsSection
          audio={data.audio}
          codecs={data.codecs}
          display={data.display}
        />

        {/* 5. Security Context & Modern Web APIs Matrix */}
        <SecurityApisSection
          security={data.security}
          performanceTiming={data.performanceTiming}
          webApis={data.webApis}
        />

        {/* 6. Referrer & Real-time Activity Timeline */}
        <ReferrerTimelineSection
          session={data.session}
          events={events}
          onClearEvents={clearEvents}
          onCopy={handleCopy}
        />

        {/* 7. Browser, OS & Software Specs */}
        <BrowserSoftwareSection
          browser={data.browser}
          onCopy={handleCopy}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/80 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Client Profiler</span>
            <span aria-hidden="true">·</span>
            <span>高精度クライアント環境・接続詳細診断 (100%実測・生データ検証)</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
            >
              レポート出力
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
            >
              ページ最上部へ戻る
            </button>
          </div>
        </div>
      </footer>

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        data={data}
        onCopy={handleCopy}
      />

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginModalOpen}
        onClose={() => setIsAdminLoginModalOpen(false)}
        onLoginSuccess={handleAdminLoginSuccess}
      />

      {/* Admin Control Panel Modal */}
      <AdminPanelModal
        isOpen={isAdminPanelModalOpen}
        onClose={() => setIsAdminPanelModalOpen(false)}
        onLogout={handleAdminLogout}
        data={data}
        events={events}
        onClearEvents={clearEvents}
        onCopy={handleCopy}
        showToast={showToast}
      />

      {/* User Switch & Logout Modal */}
      <UserSwitchModal
        isOpen={isUserSwitchModalOpen}
        onClose={() => setIsUserSwitchModalOpen(false)}
        currentUsername={username}
        onUpdateUsername={handleUpdateUsername}
        onUserLogout={handleUserLogout}
      />

      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
