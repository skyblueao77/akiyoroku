import React from 'react';
import { LogItem } from '../types';
import { BookOpen, Film, Star, Heart, Clock, Award, BookMarked } from 'lucide-react';

interface StatsSectionProps {
  logs: LogItem[];
  onFilterGenre?: (genre: string) => void;
}

export const StatsSection: React.FC<StatsSectionProps> = ({ logs, onFilterGenre }) => {
  const books = logs.filter((l) => l.type === 'book');
  const movies = logs.filter((l) => l.type === 'movie');

  const completedBooks = books.filter((b) => b.status === 'completed');
  const completedMovies = movies.filter((m) => m.status === 'completed');

  const inProgressCount = logs.filter((l) => l.status === 'in_progress').length;
  const watchlistCount = logs.filter((l) => l.status === 'watchlist').length;

  const totalRating = logs.reduce((acc, l) => acc + (l.rating || 0), 0);
  const avgRating = logs.length > 0 ? (totalRating / logs.length).toFixed(1) : '0.0';

  const favoriteCount = logs.filter((l) => l.favorite).length;

  // Genre counts
  const genreCounts: Record<string, number> = {};
  logs.forEach((l) => {
    if (l.genre) {
      genreCounts[l.genre] = (genreCounts[l.genre] || 0) + 1;
    }
  });

  const sortedGenres = Object.entries(genreCounts).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-6">
      {/* Overview KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#181410] border border-[#2e261f] rounded-2xl p-5">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-xs uppercase tracking-wider">読了した書籍</span>
            <BookOpen className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-mono font-bold text-amber-100 tabular-nums">
            {completedBooks.length}
            <span className="text-xs font-sans text-stone-400 font-normal ml-1">冊</span>
          </div>
          <div className="text-xs text-stone-500 mt-1">
            全 {books.length} 冊中
          </div>
        </div>

        <div className="bg-[#181410] border border-[#2e261f] rounded-2xl p-5">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-xs uppercase tracking-wider">鑑賞した映画</span>
            <Film className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-3xl font-mono font-bold text-amber-100 tabular-nums">
            {completedMovies.length}
            <span className="text-xs font-sans text-stone-400 font-normal ml-1">本</span>
          </div>
          <div className="text-xs text-stone-500 mt-1">
            全 {movies.length} 本中
          </div>
        </div>

        <div className="bg-[#181410] border border-[#2e261f] rounded-2xl p-5">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-xs uppercase tracking-wider">平均満足度</span>
            <Star className="w-4 h-4 text-amber-400 fill-current" />
          </div>
          <div className="text-3xl font-mono font-bold text-amber-200 tabular-nums">
            {avgRating}
            <span className="text-xs font-sans text-stone-400 font-normal ml-1">/ 5.0</span>
          </div>
          <div className="text-xs text-stone-500 mt-1">
            本命お気に入り: {favoriteCount} 作品
          </div>
        </div>

        <div className="bg-[#181410] border border-[#2e261f] rounded-2xl p-5">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-xs uppercase tracking-wider">進行中 & 積読</span>
            <BookMarked className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-mono font-bold text-amber-100 tabular-nums">
            {inProgressCount + watchlistCount}
            <span className="text-xs font-sans text-stone-400 font-normal ml-1">件</span>
          </div>
          <div className="text-xs text-stone-500 mt-1">
            読書/鑑賞中: {inProgressCount} · 積読/待機: {watchlistCount}
          </div>
        </div>
      </div>

      {/* Genre distribution & Autumn Quote */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Genre distribution */}
        <div className="bg-[#181410] border border-[#2e261f] rounded-2xl p-6">
          <h3 className="text-base font-serif font-bold text-amber-100 mb-4">
            秋の好むジャンル分布
          </h3>
          {sortedGenres.length === 0 ? (
            <p className="text-xs text-stone-500">まだジャンルが記録されていません。</p>
          ) : (
            <div className="space-y-3">
              {sortedGenres.slice(0, 6).map(([genre, count]) => {
                const percentage = Math.round((count / logs.length) * 100);
                return (
                  <div key={genre} className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-stone-300">
                      <span>{genre}</span>
                      <span className="font-mono text-stone-400 tabular-nums">
                        {count}件 ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-[#12100e] rounded-full h-2 overflow-hidden border border-[#261f18]">
                      <div
                        className="bg-amber-500/80 h-full rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Autumn Atmosphere quote banner */}
        <div className="bg-[#1b1510] border border-[#3b2b1e] rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="text-xs uppercase tracking-wider text-amber-400 font-semibold mb-2">
              秋の夜長のことば
            </div>
            <blockquote className="text-sm sm:text-base font-serif text-amber-100 leading-relaxed italic">
              「読書とは他人にものを考えてもらうことである。一日を読書に費やした夜、秋の冷気の中で自らの思索が深まる。」
            </blockquote>
          </div>

          <div className="mt-6 pt-4 border-t border-[#2d2218] flex items-center justify-between text-xs text-stone-400">
            <span>記録数: {logs.length} 作品</span>
            <span className="font-serif">令和の秋夜録</span>
          </div>
        </div>
      </div>
    </div>
  );
};
