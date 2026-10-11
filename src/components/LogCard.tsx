import React from 'react';
import { LogItem, CustomFieldDefinition } from '../types';
import { BookOpen, Film, Star, Heart, Edit3, Trash2, LayoutGrid, Quote, Coffee } from 'lucide-react';

interface LogCardProps {
  log: LogItem;
  customFieldDefs: CustomFieldDefinition[];
  onEdit: (log: LogItem) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onAddToCanvas?: (log: LogItem) => void;
}

export const LogCard: React.FC<LogCardProps> = ({
  log,
  customFieldDefs,
  onEdit,
  onDelete,
  onToggleFavorite,
  onAddToCanvas,
}) => {
  const isBook = log.type === 'book';

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5 text-amber-400">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star
            key={s}
            className={`w-3.5 h-3.5 ${
              rating >= s
                ? 'fill-current'
                : rating >= s - 0.5
                ? 'fill-amber-400/50'
                : 'text-stone-700'
            }`}
          />
        ))}
        <span className="ml-1.5 text-xs font-mono font-medium text-amber-300 tabular-nums">
          {rating.toFixed(1)}
        </span>
      </div>
    );
  };

  const getStatusLabel = (status: LogItem['status']) => {
    switch (status) {
      case 'completed':
        return isBook ? '読了' : '鑑賞済';
      case 'in_progress':
        return isBook ? '読書中' : '鑑賞中';
      case 'watchlist':
        return isBook ? '積読' : '観たい';
    }
  };

  return (
    <article className="group relative bg-[#181410] hover:bg-[#1d1914] rounded-2xl border border-[#2e261f] hover:border-amber-600/40 p-5 sm:p-6 transition-all duration-200 shadow-sm hover:shadow-xl flex flex-col justify-between">
      {/* Top row: Type, Date, Status, Actions */}
      <div>
        <div className="flex items-center justify-between gap-3 text-xs text-stone-400 mb-2">
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
            <span>{getStatusLabel(log.status)}</span>
            {log.date && (
              <>
                <span aria-hidden="true" className="text-stone-600">·</span>
                <span className="font-mono tabular-nums">{log.date}</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onToggleFavorite(log.id)}
              title={log.favorite ? 'お気に入り解除' : 'お気に入りに追加'}
              className={`p-1.5 rounded transition-colors ${
                log.favorite
                  ? 'text-rose-400 hover:text-rose-300'
                  : 'text-stone-500 hover:text-stone-300'
              }`}
            >
              <Heart
                className={`w-4 h-4 ${log.favorite ? 'fill-current' : ''}`}
              />
            </button>

            <button
              onClick={() => onEdit(log)}
              title="編集"
              className="p-1.5 rounded text-stone-500 hover:text-stone-300 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => onDelete(log.id)}
              title="削除"
              className="p-1.5 rounded text-stone-600 hover:text-rose-400 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Title and Creator */}
        <h3 className="text-lg sm:text-xl font-serif font-bold text-amber-50 group-hover:text-amber-200 transition-colors leading-snug">
          {log.title}
        </h3>
        <div className="text-sm text-stone-400 mt-1 flex items-center gap-2 flex-wrap">
          <span>{log.creator || '作者不明'}</span>
          {log.genre && (
            <>
              <span aria-hidden="true" className="text-stone-600">·</span>
              <span>{log.genre}</span>
            </>
          )}
          {log.durationOrPages && (
            <>
              <span aria-hidden="true" className="text-stone-600">·</span>
              <span className="font-mono tabular-nums">{log.durationOrPages}</span>
            </>
          )}
        </div>

        {/* Rating */}
        <div className="mt-3">{renderStars(log.rating)}</div>

        {/* Quote if any */}
        {log.quote && (
          <div className="mt-4 p-3 rounded-lg bg-[#221c16] border border-[#362b21] text-xs text-amber-200/90 font-serif italic relative">
            <Quote className="w-3.5 h-3.5 text-amber-500/40 inline mr-1 -mt-1" />
            <span>{log.quote}</span>
          </div>
        )}

        {/* Notes */}
        {log.notes && (
          <p className="mt-3 text-xs sm:text-sm text-stone-300/90 leading-relaxed line-clamp-3">
            {log.notes}
          </p>
        )}

        {/* Autumn Pairing */}
        {log.autumnPairing && (
          <div className="mt-3 flex items-center gap-1.5 text-xs text-amber-300/80">
            <Coffee className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate">お供: {log.autumnPairing}</span>
          </div>
        )}

        {/* Custom fields display */}
        {log.customFields && Object.keys(log.customFields).length > 0 && (
          <div className="mt-4 pt-3 border-t border-[#29211a] grid grid-cols-2 gap-2 text-xs text-stone-400">
            {Object.entries(log.customFields).map(([key, value]) => {
              const def = customFieldDefs.find((d) => d.id === key);
              const label = def ? def.name : key;
              if (value === undefined || value === '') return null;

              if (typeof value === 'boolean') {
                return (
                  <div key={key} className="flex items-center gap-1.5">
                    <span className="text-stone-500">{label}:</span>
                    <span className="text-amber-200">
                      {value ? 'はい' : 'いいえ'}
                    </span>
                  </div>
                );
              }

              if (def?.type === 'rating' && typeof value === 'number') {
                return (
                  <div key={key} className="flex items-center gap-1.5">
                    <span className="text-stone-500">{label}:</span>
                    <span className="text-amber-300 font-mono font-medium">
                      {'★'.repeat(value)}
                    </span>
                  </div>
                );
              }

              return (
                <div key={key} className="truncate">
                  <span className="text-stone-500">{label}: </span>
                  <span className="text-stone-300">{String(value)}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer: Tags & Canvas Pin */}
      <div className="mt-4 pt-3 border-t border-[#251e18] flex items-center justify-between gap-2 text-xs text-stone-500">
        <div className="flex items-center gap-1.5 flex-wrap truncate">
          {log.tags && log.tags.length > 0 ? (
            log.tags.map((tag, idx) => (
              <span key={idx} className="text-stone-400">
                #{tag}
              </span>
            ))
          ) : (
            <span>タグなし</span>
          )}
        </div>

        {onAddToCanvas && (
          <button
            onClick={() => onAddToCanvas(log)}
            className="flex items-center gap-1 text-xs text-stone-400 hover:text-amber-300 transition-colors shrink-0"
            title="キャンバスに配置"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">ボードに貼る</span>
          </button>
        )}
      </div>
    </article>
  );
};
