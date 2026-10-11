import React, { useState, useEffect } from 'react';
import { LogItem, CustomFieldDefinition, MediaType, LogStatus } from '../types';
import { X, Sparkles, BookOpen, Film, Star, Loader2 } from 'lucide-react';

interface LogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (log: LogItem) => void;
  initialLog?: LogItem | null;
  customFieldDefs: CustomFieldDefinition[];
  onOpenCustomFieldsManager: () => void;
}

export const LogModal: React.FC<LogModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialLog,
  customFieldDefs,
  onOpenCustomFieldsManager,
}) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<MediaType>('book');
  const [creator, setCreator] = useState('');
  const [genre, setGenre] = useState('');
  const [status, setStatus] = useState<LogStatus>('completed');
  const [rating, setRating] = useState<number>(4.5);
  const [date, setDate] = useState<string>('');
  const [durationOrPages, setDurationOrPages] = useState('');
  const [quote, setQuote] = useState('');
  const [notes, setNotes] = useState('');
  const [autumnPairing, setAutumnPairing] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [favorite, setFavorite] = useState(false);
  const [customFields, setCustomFields] = useState<Record<string, any>>({});
  const [isAutocompleting, setIsAutocompleting] = useState(false);
  const [autocompleteMessage, setAutocompleteMessage] = useState('');

  useEffect(() => {
    if (initialLog) {
      setTitle(initialLog.title);
      setType(initialLog.type);
      setCreator(initialLog.creator);
      setGenre(initialLog.genre);
      setStatus(initialLog.status);
      setRating(initialLog.rating);
      setDate(initialLog.date || '');
      setDurationOrPages(initialLog.durationOrPages || '');
      setQuote(initialLog.quote || '');
      setNotes(initialLog.notes || '');
      setAutumnPairing(initialLog.autumnPairing || '');
      setTagsInput(initialLog.tags?.join(', ') || '');
      setFavorite(initialLog.favorite || false);
      setCustomFields(initialLog.customFields || {});
    } else {
      // Default empty
      setTitle('');
      setType('book');
      setCreator('');
      setGenre('');
      setStatus('completed');
      setRating(4);
      setDate(new Date().toISOString().split('T')[0]);
      setDurationOrPages('');
      setQuote('');
      setNotes('');
      setAutumnPairing('');
      setTagsInput('');
      setFavorite(false);
      setCustomFields({});
    }
    setAutocompleteMessage('');
  }, [initialLog, isOpen]);

  const handleAutocomplete = async () => {
    if (!title.trim()) {
      setAutocompleteMessage('作品名を入力してください');
      return;
    }
    setIsAutocompleting(true);
    setAutocompleteMessage('');
    try {
      const res = await fetch('/api/autocomplete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), type }),
      });
      if (!res.ok) throw new Error('補完に失敗しました');
      const data = await res.json();
      if (data.creator && !creator) setCreator(data.creator);
      if (data.genre && !genre) setGenre(data.genre);
      if (data.durationOrPages && !durationOrPages) setDurationOrPages(data.durationOrPages);
      if (data.synopsis && !notes) setNotes(data.synopsis);
      if (data.suggestedTags && tagsInput === '') {
        setTagsInput(data.suggestedTags.join(', '));
      }
      setAutocompleteMessage('AIによる情報を反映しました');
    } catch (e: any) {
      setAutocompleteMessage('補完できませんでした。手動で入力してください');
    } finally {
      setIsAutocompleting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const newLog: LogItem = {
      id: initialLog ? initialLog.id : `log-${Date.now()}`,
      title: title.trim(),
      type,
      creator: creator.trim(),
      genre: genre.trim(),
      status,
      rating,
      date: date || new Date().toISOString().split('T')[0],
      durationOrPages: durationOrPages.trim(),
      quote: quote.trim(),
      notes: notes.trim(),
      autumnPairing: autumnPairing.trim(),
      tags,
      favorite,
      customFields,
    };

    onSave(newLog);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#181410] border border-[#362b21] rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl my-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#2d251e] bg-[#14100c] rounded-t-2xl">
          <h2 className="text-lg font-serif font-bold text-amber-100">
            {initialLog ? '記録を編集する' : '秋の夜長に作品を記録する'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {/* Media Type Switcher */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-stone-400 font-medium mb-2">
              作品種別
            </label>
            <div className="grid grid-cols-2 gap-3 p-1 bg-[#12100e] rounded-xl border border-[#2a221b]">
              <button
                type="button"
                onClick={() => setType('book')}
                className={`flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-colors ${
                  type === 'book'
                    ? 'bg-amber-950/70 border border-amber-600/50 text-amber-200 shadow-sm'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <BookOpen className="w-4 h-4 text-amber-400" />
                書籍・本
              </button>
              <button
                type="button"
                onClick={() => setType('movie')}
                className={`flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-colors ${
                  type === 'movie'
                    ? 'bg-amber-950/70 border border-amber-600/50 text-amber-200 shadow-sm'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <Film className="w-4 h-4 text-orange-400" />
                映画・映像
              </button>
            </div>
          </div>

          {/* Title with AI Autocomplete */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs uppercase tracking-wider text-stone-300 font-medium">
                作品名 <span className="text-amber-500">*</span>
              </label>
              <button
                type="button"
                onClick={handleAutocomplete}
                disabled={isAutocompleting || !title.trim()}
                className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isAutocompleting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                <span>AIで情報を自動補完</span>
              </button>
            </div>
            <input
              type="text"
              required
              placeholder={type === 'book' ? '例: 夜のピクニック、舟を編む' : '例: いまを生きる、秋刀魚の味'}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#12100e] border border-[#32271d] rounded-xl px-4 py-2.5 text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
            {autocompleteMessage && (
              <p className="mt-1 text-xs text-amber-300/80">{autocompleteMessage}</p>
            )}
          </div>

          {/* Creator & Genre */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-stone-400 font-medium mb-1.5">
                {type === 'book' ? '著者・作家' : '監督・演出'}
              </label>
              <input
                type="text"
                placeholder={type === 'book' ? '例: 恩田陸' : '例: ピーター・ウィアー'}
                value={creator}
                onChange={(e) => setCreator(e.target.value)}
                className="w-full bg-[#12100e] border border-[#32271d] rounded-xl px-4 py-2.5 text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-stone-400 font-medium mb-1.5">
                ジャンル
              </label>
              <input
                type="text"
                placeholder="例: 文芸、ミステリー、ヒューマンドラマ"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full bg-[#12100e] border border-[#32271d] rounded-xl px-4 py-2.5 text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
          </div>

          {/* Status, Date & Duration/Pages */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-stone-400 font-medium mb-1.5">
                状態
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as LogStatus)}
                className="w-full bg-[#12100e] border border-[#32271d] rounded-xl px-3 py-2.5 text-sm text-stone-100 focus:outline-none focus:border-amber-500 transition-colors"
              >
                <option value="completed">{type === 'book' ? '読了' : '鑑賞済'}</option>
                <option value="in_progress">{type === 'book' ? '読書中' : '鑑賞中'}</option>
                <option value="watchlist">{type === 'book' ? '積読リスト' : '観たいリスト'}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-stone-400 font-medium mb-1.5">
                記録日
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-[#12100e] border border-[#32271d] rounded-xl px-3 py-2 text-sm text-stone-100 focus:outline-none focus:border-amber-500 transition-colors font-mono"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-stone-400 font-medium mb-1.5">
                {type === 'book' ? 'ページ数 / 読了時間' : '上映時間'}
              </label>
              <input
                type="text"
                placeholder={type === 'book' ? '例: 384頁 / 4時間' : '例: 128分'}
                value={durationOrPages}
                onChange={(e) => setDurationOrPages(e.target.value)}
                className="w-full bg-[#12100e] border border-[#32271d] rounded-xl px-3 py-2.5 text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500 transition-colors font-mono"
              />
            </div>
          </div>

          {/* Rating & Favorite */}
          <div className="flex items-center justify-between gap-4 p-3.5 bg-[#12100e] rounded-xl border border-[#2d241c]">
            <div className="flex items-center gap-3">
              <span className="text-xs uppercase tracking-wider text-stone-400 font-medium">
                評価
              </span>
              <div className="flex items-center gap-1 text-amber-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        rating >= star ? 'fill-current' : 'text-stone-700'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <span className="text-sm font-mono font-bold text-amber-300 tabular-nums">
                {rating}
              </span>
            </div>

            <label className="flex items-center gap-2 cursor-pointer text-xs text-stone-300">
              <input
                type="checkbox"
                checked={favorite}
                onChange={(e) => setFavorite(e.target.checked)}
                className="accent-amber-500 w-4 h-4 rounded"
              />
              <span>★ 本命お気に入り</span>
            </label>
          </div>

          {/* Quote */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-stone-400 font-medium mb-1.5">
              心に残る名言・台詞 (Quotes)
            </label>
            <input
              type="text"
              placeholder="例: 「ほんとうのさいわいは一体何だろう。」"
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              className="w-full bg-[#12100e] border border-[#32271d] rounded-xl px-4 py-2.5 text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500 transition-colors font-serif italic"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-stone-400 font-medium mb-1.5">
              感想・余韻メモ
            </label>
            <textarea
              rows={3}
              placeholder="秋の夜更けに感じた空気感、登場人物の心情、考えたこと..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-[#12100e] border border-[#32271d] rounded-xl px-4 py-2.5 text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500 transition-colors leading-relaxed"
            />
          </div>

          {/* Autumn Pairing */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-stone-400 font-medium mb-1.5">
              秋のペアリング (お供のお茶・お酒・スイーツ・演出)
            </label>
            <input
              type="text"
              placeholder="例: 深煎り珈琲とモンブラン、ほうじ茶ラテ、ホットワイン"
              value={autumnPairing}
              onChange={(e) => setAutumnPairing(e.target.value)}
              className="w-full bg-[#12100e] border border-[#32271d] rounded-xl px-4 py-2.5 text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-stone-400 font-medium mb-1.5">
              タグ (カンマ区切り)
            </label>
            <input
              type="text"
              placeholder="例: 秋の夜長, 哀愁, 青春, ノスタルジー"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full bg-[#12100e] border border-[#32271d] rounded-xl px-4 py-2.5 text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          {/* Custom Fields Section */}
          <div className="pt-4 border-t border-[#2d251e]">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs uppercase tracking-wider text-stone-300 font-medium">
                オリジナルのカスタム記録項目 ({customFieldDefs.length}項目)
              </label>
              <button
                type="button"
                onClick={onOpenCustomFieldsManager}
                className="text-xs text-amber-400 hover:text-amber-300 transition-colors"
              >
                + 項目を編集・追加
              </button>
            </div>

            {customFieldDefs.length === 0 ? (
              <p className="text-xs text-stone-500">
                記録しておきたい独自の項目（泣き度、読書場所など）を自由に追加できます。
              </p>
            ) : (
              <div className="space-y-3 bg-[#13100d] p-3.5 rounded-xl border border-[#2b221a]">
                {customFieldDefs.map((def) => {
                  const val = customFields[def.id];

                  if (def.type === 'boolean') {
                    return (
                      <label
                        key={def.id}
                        className="flex items-center justify-between cursor-pointer text-xs text-stone-300 py-1"
                      >
                        <span>{def.name}</span>
                        <input
                          type="checkbox"
                          checked={Boolean(val)}
                          onChange={(e) =>
                            setCustomFields({ ...customFields, [def.id]: e.target.checked })
                          }
                          className="accent-amber-500 w-4 h-4 rounded"
                        />
                      </label>
                    );
                  }

                  if (def.type === 'rating') {
                    return (
                      <div
                        key={def.id}
                        className="flex items-center justify-between text-xs text-stone-300 py-1"
                      >
                        <span>{def.name}</span>
                        <div className="flex items-center gap-1 text-amber-400">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() =>
                                setCustomFields({ ...customFields, [def.id]: s })
                              }
                              className="p-0.5 hover:scale-110"
                            >
                              <Star
                                className={`w-3.5 h-3.5 ${
                                  (Number(val) || 0) >= s
                                    ? 'fill-current'
                                    : 'text-stone-700'
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={def.id} className="text-xs">
                      <label className="block text-stone-400 mb-1">{def.name}</label>
                      <input
                        type={def.type === 'number' ? 'number' : 'text'}
                        placeholder={def.placeholder || ''}
                        value={val !== undefined ? String(val) : ''}
                        onChange={(e) =>
                          setCustomFields({
                            ...customFields,
                            [def.id]:
                              def.type === 'number'
                                ? Number(e.target.value)
                                : e.target.value,
                          })
                        }
                        className="w-full bg-[#181410] border border-[#342b22] rounded-lg px-3 py-1.5 text-xs text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-[#2d251e] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs sm:text-sm font-medium text-stone-400 hover:text-stone-200 rounded-lg transition-colors"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs sm:text-sm font-medium text-[#12100e] bg-amber-400 hover:bg-amber-300 active:bg-amber-500 rounded-lg shadow-sm transition-colors"
            >
              {initialLog ? '更新を保存' : '記録を保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
