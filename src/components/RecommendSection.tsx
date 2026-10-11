import React, { useState } from 'react';
import { LogItem, RecommendationItem, MediaType } from '../types';
import { Sparkles, BookOpen, Film, Coffee, Plus, Loader2, ArrowRight, Check } from 'lucide-react';

interface RecommendSectionProps {
  logs: LogItem[];
  onAddRecommendationToLog: (item: RecommendationItem) => void;
}

const MOOD_PRESETS = [
  { label: '静寂と内省の深夜', query: '秋の深夜に一人静かに浸れる、深い哲学や内省的な美しさを持つ名作' },
  { label: '胸を打つ哀愁と感動', query: '秋の冷たい風に寄り添うような、切なくも温かい余韻が長く続く人間ドラマ' },
  { label: '知的な謎解き・ミステリー', query: '秋の夜更けに一気読み・一気見したくなる、構成が緻密で美しいミステリー' },
  { label: '秋の旅情・異国の風', query: '旅に出たくなるような異国の街並みや秋の美しい自然風景が印象的な作品' },
  { label: 'ほっと温まる優しい読後感', query: '冷え込む秋の夜にホットミルクを飲みながら安心して心を満たせる温かい作品' },
];

export const RecommendSection: React.FC<RecommendSectionProps> = ({
  logs,
  onAddRecommendationToLog,
}) => {
  const [selectedMood, setSelectedMood] = useState(MOOD_PRESETS[0].query);
  const [mediaType, setMediaType] = useState<'both' | 'book' | 'movie'>('both');
  const [customThemes, setCustomThemes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisSummary, setAnalysisSummary] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [addedTitles, setAddedTitles] = useState<Record<string, boolean>>({});

  // Fetch initial recommendation on mount if empty
  React.useEffect(() => {
    if (recommendations.length === 0 && !isLoading) {
      handleGenerateRecommendations();
    }
  }, []);

  const handleGenerateRecommendations = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          logs,
          mood: selectedMood,
          mediaType,
          favoriteThemes: customThemes,
        }),
      });

      if (!res.ok) throw new Error('レコメンドの生成に失敗しました');
      const data = await res.json();
      setAnalysisSummary(data.analysisSummary || null);
      setRecommendations(data.recommendations || []);
    } catch (e: any) {
      console.error(e);
      setError('提案の取得中に問題が発生しました。もう一度お試しください。');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = (item: RecommendationItem) => {
    onAddRecommendationToLog(item);
    setAddedTitles((prev) => ({ ...prev, [item.title]: true }));
  };

  return (
    <div className="space-y-8">
      {/* Intro Header */}
      <div className="bg-[#181410] border border-[#2e251e] rounded-2xl p-6 sm:p-8">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-4 h-4" />
            AI 秋の夜長コンシェルジュ
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-amber-100">
            あなたの好みを深く読み解き、次なる秋の一作を
          </h2>
          <p className="mt-2 text-sm text-stone-300 leading-relaxed">
            これまで記録した {logs.length} 件の作品傾向と、今夜あなたが浸りたい気分に合わせて、
            Geminiが心に響く書籍・映画を厳選提案します。
          </p>
        </div>

        {/* Form controls */}
        <div className="mt-6 pt-6 border-t border-[#29221a] space-y-5">
          {/* Media Type Selector */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-stone-400 font-medium mb-2">
              希望する作品の種別
            </label>
            <div className="inline-flex p-1 bg-[#12100e] rounded-xl border border-[#2a221b]">
              <button
                type="button"
                onClick={() => setMediaType('both')}
                className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  mediaType === 'both'
                    ? 'bg-amber-950/70 border border-amber-600/50 text-amber-200'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                書籍・映画の両方
              </button>
              <button
                type="button"
                onClick={() => setMediaType('book')}
                className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  mediaType === 'book'
                    ? 'bg-amber-950/70 border border-amber-600/50 text-amber-200'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                読書 (本のみ)
              </button>
              <button
                type="button"
                onClick={() => setMediaType('movie')}
                className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  mediaType === 'movie'
                    ? 'bg-amber-950/70 border border-amber-600/50 text-amber-200'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                シネマ (映画のみ)
              </button>
            </div>
          </div>

          {/* Mood Presets */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-stone-400 font-medium mb-2">
              今夜の気分・テーマを選択
            </label>
            <div className="flex flex-wrap gap-2">
              {MOOD_PRESETS.map((m, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedMood(m.query)}
                  className={`px-3 py-1.5 text-xs rounded-xl border transition-all ${
                    selectedMood === m.query
                      ? 'bg-amber-500/20 border-amber-500/60 text-amber-200 font-medium shadow-sm'
                      : 'bg-[#14110e] border-[#2d241c] text-stone-400 hover:border-stone-600 hover:text-stone-200'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom detail input */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-stone-400 font-medium mb-1.5">
              こだわりのリクエスト (任意)
            </label>
            <input
              type="text"
              placeholder="例: 金木犀の香りがするような情景、雨の京都、90年代のフィルム感、2時間以内で観られる作品"
              value={customThemes}
              onChange={(e) => setCustomThemes(e.target.value)}
              className="w-full bg-[#12100e] border border-[#32271d] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          {/* Submit CTA */}
          <div className="pt-2">
            <button
              onClick={handleGenerateRecommendations}
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium text-[#12100e] bg-amber-400 hover:bg-amber-300 active:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>秋の夜長を彩る作品を分析・選定中...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>おすすめ作品を提案してもらう</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 bg-rose-950/40 border border-rose-800/40 rounded-2xl text-xs text-rose-200 flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={handleGenerateRecommendations}
            className="underline hover:text-rose-100"
          >
            再試行
          </button>
        </div>
      )}

      {/* Analysis summary card */}
      {analysisSummary && (
        <div className="p-5 sm:p-6 bg-[#1f1913] border border-[#3d2f21] rounded-2xl">
          <div className="text-xs uppercase tracking-wider text-amber-400 font-semibold mb-1">
            コンシェルジュの分析ノート
          </div>
          <p className="text-sm sm:text-base text-stone-200 font-serif leading-relaxed italic">
            「{analysisSummary}」
          </p>
        </div>
      )}

      {/* Recommendations Cards */}
      {recommendations.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-serif font-bold text-amber-100 flex items-center gap-2">
            <span>今夜おすすめの作品</span>
            <span className="text-xs font-mono text-stone-400">
              ({recommendations.length}作品)
            </span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {recommendations.map((item, idx) => {
              const isBook = item.type === 'book';
              const isAdded = addedTitles[item.title];

              return (
                <div
                  key={idx}
                  className="bg-[#181410] rounded-2xl border border-[#2e261f] p-5 sm:p-6 flex flex-col justify-between hover:border-amber-600/40 transition-colors shadow-sm"
                >
                  <div>
                    {/* Top row */}
                    <div className="flex items-center justify-between text-xs text-stone-400 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1 text-stone-300 font-medium">
                          {isBook ? (
                            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                          ) : (
                            <Film className="w-3.5 h-3.5 text-orange-400" />
                          )}
                          {isBook ? '書籍' : '映画'}
                        </span>
                        <span aria-hidden="true" className="text-stone-600">·</span>
                        <span>{item.genre}</span>
                        {item.durationOrPages && (
                          <>
                            <span aria-hidden="true" className="text-stone-600">·</span>
                            <span className="font-mono tabular-nums">{item.durationOrPages}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <h4 className="text-xl font-serif font-bold text-amber-50">
                      {item.title}
                    </h4>
                    <div className="text-xs sm:text-sm text-stone-400 mt-0.5">
                      {item.creator}
                    </div>

                    {/* Catchphrase if present */}
                    {item.quoteOrCatchphrase && (
                      <p className="mt-3 text-xs text-amber-300/80 font-serif italic border-l-2 border-amber-600/40 pl-2.5">
                        {item.quoteOrCatchphrase}
                      </p>
                    )}

                    {/* Synopsis */}
                    <p className="mt-3 text-xs sm:text-sm text-stone-300 leading-relaxed">
                      {item.synopsis}
                    </p>

                    {/* Why this work */}
                    <div className="mt-4 p-3 bg-[#13100d] rounded-xl border border-[#261f18] text-xs text-stone-300 space-y-1.5">
                      <div className="text-amber-300 font-medium">
                        ✦ なぜ今夜あなたにおすすめか:
                      </div>
                      <p className="leading-relaxed">{item.reason}</p>
                      <div className="text-stone-400 pt-1">
                        🍂 秋の情景: {item.autumnAtmosphere}
                      </div>
                    </div>

                    {/* Pairing */}
                    {item.pairing && (
                      <div className="mt-3 flex items-center gap-2 text-xs text-amber-300/90">
                        <Coffee className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>おすすめのお供: {item.pairing}</span>
                      </div>
                    )}
                  </div>

                  {/* Action bottom */}
                  <div className="mt-5 pt-4 border-t border-[#271f18] flex items-center justify-end">
                    <button
                      onClick={() => handleAdd(item)}
                      disabled={isAdded}
                      className={`flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg transition-colors ${
                        isAdded
                          ? 'bg-stone-800 text-stone-400 cursor-default'
                          : 'bg-amber-400/90 hover:bg-amber-300 text-[#12100e]'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>リストに追加済み</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>{isBook ? '積読リストに追加' : '観たいリストに追加'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
