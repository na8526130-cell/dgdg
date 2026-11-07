import React, { useState, useEffect, useRef } from 'react';
import {
  User,
  ArrowRight,
  Shield,
  Sparkles,
  Lock,
  AlertCircle,
  Terminal,
  Activity,
  Globe,
  CheckCircle,
} from 'lucide-react';

interface UserEntryGateProps {
  onEnter: (username: string) => void;
  onOpenAdminLogin: () => void;
}

export const UserEntryGate: React.FC<UserEntryGateProps> = ({
  onEnter,
  onOpenAdminLogin,
}) => {
  const [usernameInput, setUsernameInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = usernameInput.trim();
    if (!trimmed) {
      setError('ユーザー名を入力してください。');
      inputRef.current?.focus();
      return;
    }
    if (trimmed.length > 32) {
      setError('ユーザー名は32文字以内で入力してください。');
      return;
    }
    setError(null);
    onEnter(trimmed);
  };

  const generateRandomName = () => {
    const id = Math.floor(1000 + Math.random() * 9000);
    const generated = `User_${id}`;
    setUsernameInput(generated);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between items-center p-4 sm:p-6 relative overflow-hidden select-none font-sans">
      {/* Background Decorative Ambient Gradients */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/[0.03] rounded-full blur-2xl pointer-events-none" />

      {/* Top Bar Header */}
      <div className="w-full max-w-xl mx-auto pt-4 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyan-500 animate-ping" />
          <span className="font-mono text-cyan-400 font-semibold tracking-wider uppercase">
            System Online
          </span>
        </div>
        <span className="font-mono text-[11px] text-slate-500">
          SECURE CLIENT PROFILER GATE
        </span>
      </div>

      {/* Main Gate Card */}
      <div className="w-full max-w-md mx-auto my-auto py-6">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden">
          {/* Top subtle highlight line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500" />

          {/* Logo & Intro */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 mb-4 shadow-inner">
              <User className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white mb-2">
              診断セッション入場認証
            </h1>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
              このサイトに入るにはユーザー名の入力が必要です。診断セッションおよびレポート署名に使用されます。
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="gate-username"
                  className="text-xs font-semibold text-slate-300 flex items-center gap-1.5"
                >
                  <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                  <span>ユーザー名を入力</span>
                </label>
                <button
                  type="button"
                  onClick={generateRandomName}
                  className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>ランダム生成</span>
                </button>
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="gate-username"
                  ref={inputRef}
                  type="text"
                  value={usernameInput}
                  onChange={(e) => {
                    setUsernameInput(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="例: Investigator_01, 診断太郎"
                  maxLength={32}
                  className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-700/80 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent font-medium transition-all"
                  autoComplete="off"
                  spellCheck="false"
                />
              </div>

              {/* Validation error */}
              {error && (
                <div className="mt-2 text-xs text-rose-400 flex items-center gap-1.5 animate-in fade-in">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            {/* Submit button */}
            <button
              type="submit"
              className="w-full py-3 px-4 bg-gradient-to-r from-cyan-600 via-cyan-500 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
            >
              <span>診断ダッシュボードに入る</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Privacy Note */}
          <div className="mt-5 pt-4 border-t border-slate-800 text-[11px] text-slate-500 space-y-1.5">
            <div className="flex items-center gap-1.5 text-slate-400 font-medium">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>プライバシー・ローカル保存方針</span>
            </div>
            <p className="leading-relaxed">
              ユーザー名は端末ブラウザのローカル環境にのみ保存され、外部サーバーへ無断送信されません。後からいつでも変更・ログアウトできます。
            </p>
          </div>

          {/* Admin Direct Login Link */}
          <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-center text-xs">
            <button
              onClick={onOpenAdminLogin}
              className="text-slate-400 hover:text-cyan-400 flex items-center gap-1.5 transition-colors font-medium"
            >
              <Lock className="w-3 h-3 text-purple-400" />
              <span>管理者の方はこちら (管理者直接ログイン)</span>
            </button>
          </div>
        </div>

        {/* Feature Highlights Pills under Card */}
        <div className="mt-6 grid grid-cols-3 gap-2 text-center text-[11px] text-slate-400">
          <div className="p-2 bg-slate-900/50 border border-slate-800/80 rounded-lg">
            <Globe className="w-3.5 h-3.5 text-cyan-400 mx-auto mb-1" />
            <span>IP・回線実測</span>
          </div>
          <div className="p-2 bg-slate-900/50 border border-slate-800/80 rounded-lg">
            <Activity className="w-3.5 h-3.5 text-emerald-400 mx-auto mb-1" />
            <span>GPU・CPU診断</span>
          </div>
          <div className="p-2 bg-slate-900/50 border border-slate-800/80 rounded-lg">
            <CheckCircle className="w-3.5 h-3.5 text-purple-400 mx-auto mb-1" />
            <span>100% 生データ</span>
          </div>
        </div>
      </div>

      {/* Footer copyright / info */}
      <div className="w-full max-w-xl mx-auto pb-4 text-center text-xs text-slate-600">
        <span>Client Profiler · クライアント環境・接続詳細診断</span>
      </div>
    </div>
  );
};
