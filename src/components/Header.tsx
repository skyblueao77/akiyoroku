import React from 'react';
import { Plus, Sparkles, Volume2, VolumeX } from 'lucide-react';

interface HeaderProps {
  currentTab: 'logs' | 'recommend' | 'canvas' | 'stats';
  onSelectTab: (tab: 'logs' | 'recommend' | 'canvas' | 'stats') => void;
  onOpenNewModal: () => void;
  onOpenTasteProfile: () => void;
  isAmbientActive: boolean;
  onToggleAmbientDrawer: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  onOpenNewModal,
  onOpenTasteProfile,
  isAmbientActive,
  onToggleAmbientDrawer,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#12100e]/90 backdrop-blur-md border-b border-[#2d251e]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand wordmark */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            onSelectTab('logs');
          }}
          className="text-xl sm:text-2xl font-serif font-bold tracking-wider text-amber-100 hover:text-amber-200 transition-colors whitespace-nowrap shrink-0 flex items-center gap-2"
        >
          <span>秋夜録</span>
          <span className="text-xs font-sans tracking-normal font-normal text-amber-300/60 hidden sm:inline">
            SHUYAROKU
          </span>
        </a>

        {/* Zone 2: 4–5 single-line clean nav links */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-medium text-stone-300">
          <button
            onClick={() => onSelectTab('logs')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              currentTab === 'logs'
                ? 'text-amber-300 border-b-2 border-amber-400 font-semibold'
                : 'hover:text-stone-100'
            }`}
          >
            記録ログ
          </button>
          <button
            onClick={() => onSelectTab('recommend')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              currentTab === 'recommend'
                ? 'text-amber-300 border-b-2 border-amber-400 font-semibold'
                : 'hover:text-stone-100'
            }`}
          >
            AIレコメンド
          </button>
          <button
            onClick={() => onSelectTab('canvas')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              currentTab === 'canvas'
                ? 'text-amber-300 border-b-2 border-amber-400 font-semibold'
                : 'hover:text-stone-100'
            }`}
          >
            キャンバス
          </button>
          <button
            onClick={() => onSelectTab('stats')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              currentTab === 'stats'
                ? 'text-amber-300 border-b-2 border-amber-400 font-semibold'
                : 'hover:text-stone-100'
            }`}
          >
            秋夜統計
          </button>
          <button
            onClick={onOpenTasteProfile}
            className="whitespace-nowrap shrink-0 transition-colors py-1 text-stone-400 hover:text-amber-300 flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400/80" />
            感性診断
          </button>
        </nav>

        {/* Zone 3: 1 primary action (+ ambient sound trigger) */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onToggleAmbientDrawer}
            title="秋の夜長アンビエント音＆読書タイマー"
            className={`p-2 rounded-lg border transition-colors ${
              isAmbientActive
                ? 'bg-amber-950/60 border-amber-600/50 text-amber-300 shadow-sm'
                : 'bg-stone-900/60 border-stone-800 text-stone-400 hover:text-stone-200'
            }`}
          >
            {isAmbientActive ? (
              <Volume2 className="w-4 h-4 text-amber-400" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
          </button>

          <button
            onClick={onOpenNewModal}
            className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-medium text-[#12100e] bg-amber-400 hover:bg-amber-300 active:bg-amber-500 rounded-lg shadow-sm transition-colors whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>作品を記録</span>
          </button>
        </div>
      </div>

      {/* Mobile nav strip */}
      <div className="md:hidden flex items-center justify-around border-t border-[#2d251e] bg-[#161310] px-2 py-2 text-xs text-stone-300">
        <button
          onClick={() => onSelectTab('logs')}
          className={`py-1 px-2.5 rounded ${
            currentTab === 'logs' ? 'text-amber-300 bg-amber-950/40 font-semibold' : ''
          }`}
        >
          記録ログ
        </button>
        <button
          onClick={() => onSelectTab('recommend')}
          className={`py-1 px-2.5 rounded ${
            currentTab === 'recommend' ? 'text-amber-300 bg-amber-950/40 font-semibold' : ''
          }`}
        >
          レコメンド
        </button>
        <button
          onClick={() => onSelectTab('canvas')}
          className={`py-1 px-2.5 rounded ${
            currentTab === 'canvas' ? 'text-amber-300 bg-amber-950/40 font-semibold' : ''
          }`}
        >
          キャンバス
        </button>
        <button
          onClick={() => onSelectTab('stats')}
          className={`py-1 px-2.5 rounded ${
            currentTab === 'stats' ? 'text-amber-300 bg-amber-950/40 font-semibold' : ''
          }`}
        >
          統計
        </button>
        <button
          onClick={onOpenTasteProfile}
          className="py-1 px-2.5 rounded text-amber-400"
        >
          感性診断
        </button>
      </div>
    </header>
  );
};
