import React, { useState, useEffect } from 'react';
import { X, User, LogOut, Check, Sparkles } from 'lucide-react';

interface UserSwitchModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUsername: string;
  onUpdateUsername: (newUsername: string) => void;
  onUserLogout: () => void;
}

export const UserSwitchModal: React.FC<UserSwitchModalProps> = ({
  isOpen,
  onClose,
  currentUsername,
  onUpdateUsername,
  onUserLogout,
}) => {
  const [name, setName] = useState(currentUsername);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setName(currentUsername);
    setError(null);
  }, [currentUsername, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('ユーザー名を入力してください。');
      return;
    }
    if (trimmed.length > 32) {
      setError('ユーザー名は32文字以内で入力してください。');
      return;
    }
    onUpdateUsername(trimmed);
    onClose();
  };

  const generateRandom = () => {
    const id = Math.floor(1000 + Math.random() * 9000);
    setName(`User_${id}`);
    setError(null);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
          aria-label="閉じる"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              ユーザー名の変更
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              現在のユーザー: <span className="font-semibold text-slate-700 dark:text-slate-200">{currentUsername}</span>
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                新しいユーザー名
              </label>
              <button
                type="button"
                onClick={generateRandom}
                className="text-[11px] text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                <span>ランダム</span>
              </button>
            </div>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError(null);
              }}
              maxLength={32}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-medium"
            />
            {error && (
              <p className="mt-1 text-xs text-rose-500">{error}</p>
            )}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                onUserLogout();
                onClose();
              }}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors font-medium"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>ログアウト (初期化)</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                キャンセル
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg shadow-sm"
              >
                <Check className="w-3.5 h-3.5" />
                <span>保存</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
