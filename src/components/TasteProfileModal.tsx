import React, { useState } from 'react';
import { LogItem, TasteProfile } from '../types';
import { X, Sparkles, Loader2, Award, Compass, CompassIcon } from 'lucide-react';

interface TasteProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: LogItem[];
}

export const TasteProfileModal: React.FC<TasteProfileModalProps> = ({
  isOpen,
  onClose,
  logs,
}) => {
  const [profile, setProfile] = useState<TasteProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAnalyze = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/analyze-taste', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logs }),
      });
      if (!res.ok) throw new Error('好みの分析に失敗しました');
      const data = await res.json();
      setProfile(data);
    } catch (e: any) {
      setError(e?.message || 'エラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#181410] border border-[#362b21] rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col my-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#2d251e] bg-[#14100c]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-serif font-bold text-amber-100">
              秋の夜長・感性プロファイル診断
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {!profile && !isLoading && (
            <div className="text-center py-8 space-y-4">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-950/40 border border-amber-600/30 flex items-center justify-center text-amber-400">
                <Compass className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-serif font-bold text-amber-100">
                  あなたの記録から美意識と好みを言語化
                </h3>
                <p className="text-xs sm:text-sm text-stone-400 max-w-md mx-auto mt-2 leading-relaxed">
                  登録された {logs.length} 件の読書・映画鑑賞ログや名言メモから、
                  あなたがどんな世界観に心を奪われやすいかをAIが解き明かします。
                </p>
              </div>
              <button
                onClick={handleAnalyze}
                disabled={logs.length === 0}
                className="px-6 py-2.5 rounded-xl text-sm font-medium text-[#12100e] bg-amber-400 hover:bg-amber-300 disabled:opacity-50 transition-colors shadow-md"
              >
                感性を診断する
              </button>
              {logs.length === 0 && (
                <p className="text-xs text-rose-400">
                  ※ 診断には1件以上の記録が必要です。
                </p>
              )}
            </div>
          )}

          {isLoading && (
            <div className="py-16 text-center space-y-3">
              <Loader2 className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
              <p className="text-sm font-serif text-amber-200">
                あなたの読書・映画ログから感性の響きを分析中...
              </p>
              <p className="text-xs text-stone-500">
                心に残った言葉や評価の傾向を紐解いています
              </p>
            </div>
          )}

          {error && (
            <div className="p-4 bg-rose-950/40 border border-rose-800/40 rounded-xl text-xs text-rose-200">
              {error}
            </div>
          )}

          {profile && (
            <div className="space-y-6 animate-fade-in">
              {/* Type Badge */}
              <div className="text-center p-6 bg-gradient-to-b from-[#241c15] to-[#181410] rounded-2xl border border-amber-600/30">
                <span className="text-[11px] uppercase tracking-wider text-amber-400 font-semibold">
                  あなたの感性タイプ
                </span>
                <h3 className="text-2xl sm:text-3xl font-serif font-bold text-amber-100 mt-1">
                  『{profile.personaTitle}』
                </h3>
                <p className="mt-3 text-xs sm:text-sm text-stone-300 leading-relaxed font-serif">
                  {profile.summary}
                </p>
              </div>

              {/* Attributes Scores */}
              <div>
                <h4 className="text-xs uppercase tracking-wider text-stone-400 font-medium mb-3">
                  感性チャート分析
                </h4>
                <div className="space-y-2.5">
                  {profile.radarAttributes.map((attr, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs text-stone-300">
                        <span>{attr.label}</span>
                        <span className="font-mono text-amber-300 tabular-nums">
                          {attr.score} / 100
                        </span>
                      </div>
                      <div className="w-full bg-[#12100e] rounded-full h-2 overflow-hidden border border-[#2a221b]">
                        <div
                          className="bg-gradient-to-r from-amber-600 to-amber-400 h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, Math.max(0, attr.score))}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Advice */}
              <div className="p-4 bg-[#14100c] rounded-xl border border-[#2e251e] space-y-1.5">
                <span className="text-xs text-amber-400 font-medium">
                  🍂 この秋の夜長をさらに楽しむためのアドバイス:
                </span>
                <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                  {profile.autumnNightAdvice}
                </p>
              </div>

              {/* Recommended Genres */}
              <div>
                <span className="text-xs uppercase tracking-wider text-stone-400 font-medium block mb-2">
                  親和性の高いジャンル
                </span>
                <div className="flex flex-wrap gap-2">
                  {profile.recommendedGenres.map((g, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 text-xs rounded-lg bg-[#221c15] text-amber-200 border border-[#382d21]"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-center">
                <button
                  onClick={handleAnalyze}
                  className="text-xs text-stone-400 hover:text-amber-300 transition-colors"
                >
                  再診断する
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#2d251e] bg-[#14100c] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-medium text-stone-300 bg-stone-800 hover:bg-stone-700 rounded-lg transition-colors"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};
