import React, { useState, useEffect } from 'react';
import { LogItem, CustomFieldDefinition, CanvasElement, RecommendationItem } from './types';
import { INITIAL_LOGS, INITIAL_CUSTOM_FIELDS, INITIAL_CANVAS_ELEMENTS } from './data/initialData';
import { Header } from './components/Header';
import { LogCard } from './components/LogCard';
import { LogModal } from './components/LogModal';
import { CustomFieldsManager } from './components/CustomFieldsManager';
import { RecommendSection } from './components/RecommendSection';
import { CanvasBoard } from './components/CanvasBoard';
import { TasteProfileModal } from './components/TasteProfileModal';
import { StatsSection } from './components/StatsSection';
import { AmbientPlayer } from './components/AmbientPlayer';
import {
  Search,
  Filter,
  Sliders,
  Sparkles,
  BookOpen,
  Film,
  Plus,
  ArrowUpDown,
  Coffee,
  Heart,
  Moon,
} from 'lucide-react';

const STORAGE_KEYS = {
  LOGS: 'shuyaroku_logs_v1',
  CUSTOM_FIELDS: 'shuyaroku_custom_fields_v1',
  CANVAS: 'shuyaroku_canvas_v1',
};

export default function App() {
  // Navigation
  const [currentTab, setCurrentTab] = useState<'logs' | 'recommend' | 'canvas' | 'stats'>('logs');

  // Core data states with LocalStorage backup
  const [logs, setLogs] = useState<LogItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LOGS);
      return saved ? JSON.parse(saved) : INITIAL_LOGS;
    } catch {
      return INITIAL_LOGS;
    }
  });

  const [customFields, setCustomFields] = useState<CustomFieldDefinition[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CUSTOM_FIELDS);
      return saved ? JSON.parse(saved) : INITIAL_CUSTOM_FIELDS;
    } catch {
      return INITIAL_CUSTOM_FIELDS;
    }
  });

  const [canvasElements, setCanvasElements] = useState<CanvasElement[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CANVAS);
      return saved ? JSON.parse(saved) : INITIAL_CANVAS_ELEMENTS;
    } catch {
      return INITIAL_CANVAS_ELEMENTS;
    }
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_FIELDS, JSON.stringify(customFields));
  }, [customFields]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CANVAS, JSON.stringify(canvasElements));
  }, [canvasElements]);

  // Modals & Panels
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<LogItem | null>(null);
  const [isCustomFieldsModalOpen, setIsCustomFieldsModalOpen] = useState(false);
  const [isTasteProfileModalOpen, setIsTasteProfileModalOpen] = useState(false);
  const [isAmbientDrawerOpen, setIsAmbientDrawerOpen] = useState(false);
  const [isAmbientActive, setIsAmbientActive] = useState(false);

  // In-app non-blocking notifications & confirmation modals
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [deletingLogId, setDeletingLogId] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3200);
  };

  // Filters & Search
  const [filterType, setFilterType] = useState<'all' | 'book' | 'movie'>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date_desc' | 'rating_desc' | 'title_asc'>('date_desc');

  // Filter logic
  const filteredLogs = logs.filter((log) => {
    if (filterType !== 'all' && log.type !== filterType) return false;
    if (filterStatus !== 'all' && log.status !== filterStatus) return false;
    if (onlyFavorites && !log.favorite) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = log.title.toLowerCase().includes(q);
      const matchCreator = log.creator?.toLowerCase().includes(q);
      const matchGenre = log.genre?.toLowerCase().includes(q);
      const matchNotes = log.notes?.toLowerCase().includes(q);
      const matchTags = log.tags?.some((t) => t.toLowerCase().includes(q));
      if (!matchTitle && !matchCreator && !matchGenre && !matchNotes && !matchTags) {
        return false;
      }
    }
    return true;
  });

  // Sort logic
  const sortedLogs = [...filteredLogs].sort((a, b) => {
    if (sortBy === 'rating_desc') {
      return (b.rating || 0) - (a.rating || 0);
    }
    if (sortBy === 'title_asc') {
      return a.title.localeCompare(b.title, 'ja');
    }
    // Default date_desc
    return (b.date || '').localeCompare(a.date || '');
  });

  // Actions
  const handleSaveLog = (newOrUpdated: LogItem) => {
    if (editingLog) {
      setLogs(logs.map((l) => (l.id === newOrUpdated.id ? newOrUpdated : l)));
      showToast(`『${newOrUpdated.title}』を更新しました`);
    } else {
      setLogs([newOrUpdated, ...logs]);
      showToast(`『${newOrUpdated.title}』を記録しました`);
    }
    setEditingLog(null);
  };

  const handleDeleteLog = (id: string) => {
    setDeletingLogId(id);
  };

  const confirmDeleteLog = () => {
    if (deletingLogId) {
      const target = logs.find((l) => l.id === deletingLogId);
      setLogs(logs.filter((l) => l.id !== deletingLogId));
      setCanvasElements(canvasElements.filter((e) => e.logId !== deletingLogId));
      setDeletingLogId(null);
      showToast(`『${target?.title || '作品'}』を削除しました`);
    }
  };

  const handleToggleFavorite = (id: string) => {
    setLogs(
      logs.map((l) => {
        if (l.id === id) {
          const next = !l.favorite;
          showToast(next ? `『${l.title}』をお気に入りに追加しました` : `『${l.title}』のお気に入りを解除しました`);
          return { ...l, favorite: next };
        }
        return l;
      })
    );
  };

  const handleOpenEdit = (log: LogItem) => {
    setEditingLog(log);
    setIsLogModalOpen(true);
  };

  const handleAddRecommendationToLog = (item: RecommendationItem) => {
    const newLog: LogItem = {
      id: `log-${Date.now()}`,
      title: item.title,
      type: item.type,
      creator: item.creator,
      genre: item.genre,
      status: 'watchlist',
      rating: 4.5,
      date: new Date().toISOString().split('T')[0],
      durationOrPages: item.durationOrPages,
      notes: `${item.reason}\n\n【秋の情景】${item.autumnAtmosphere}`,
      autumnPairing: item.pairing,
      quote: item.quoteOrCatchphrase,
      tags: ['AIレコメンド', '秋の夜長'],
      favorite: false,
    };
    setLogs([newLog, ...logs]);
    showToast(`『${item.title}』を積読・観たいリストに追加しました`);
  };

  const handleAddLogToCanvas = (log: LogItem) => {
    if (canvasElements.some((e) => e.logId === log.id)) {
      showToast('この作品は既にキャンバスに配置されています');
      setCurrentTab('canvas');
      return;
    }
    const newCard: CanvasElement = {
      id: `card-${Date.now()}`,
      logId: log.id,
      type: 'card',
      x: 100 + (canvasElements.length % 3) * 60,
      y: 100 + (canvasElements.length % 3) * 60,
      width: 270,
      height: 340,
      rotation: (Math.random() - 0.5) * 5,
    };
    setCanvasElements([...canvasElements, newCard]);
    showToast(`『${log.title}』をキャンバスに追加しました`);
    setCurrentTab('canvas');
  };

  return (
    <div className="min-h-screen bg-[#12100e] text-[#f4efe6] flex flex-col font-sans selection:bg-amber-800/40 selection:text-amber-200">
      {/* Header */}
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenNewModal={() => {
          setEditingLog(null);
          setIsLogModalOpen(true);
        }}
        onOpenTasteProfile={() => setIsTasteProfileModalOpen(true)}
        isAmbientActive={isAmbientActive}
        onToggleAmbientDrawer={() => setIsAmbientDrawerOpen(!isAmbientDrawerOpen)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* TAB 1: LOGS VIEW */}
        {currentTab === 'logs' && (
          <div className="space-y-6">
            {/* Autumn Hero Banner */}
            <div className="relative overflow-hidden bg-gradient-to-r from-[#1c1510] via-[#16120e] to-[#1a130f] rounded-3xl border border-[#34271c] p-6 sm:p-8">
              <div className="relative z-10 max-w-2xl">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400 mb-2">
                  <Moon className="w-4 h-4" />
                  <span>秋の夜長に浸る読書と映画の手帳</span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-serif font-bold text-amber-50 tracking-tight leading-snug">
                  心震える一冊、忘れられない一本を記録する。
                </h1>
                <p className="mt-2 text-xs sm:text-sm text-stone-300 leading-relaxed">
                  灯火親しむ秋の夜長。作品の心に響いた名言、お供の温かいお茶やスイーツ、
                  あなただけの自由な項目をカスタマイズして、かけがえのない夜の記憶を刻みましょう。
                </p>

                <div className="flex items-center gap-4 mt-5">
                  <button
                    onClick={() => {
                      setEditingLog(null);
                      setIsLogModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium text-[#12100e] bg-amber-400 hover:bg-amber-300 transition-colors shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>作品を記録する</span>
                  </button>
                  <button
                    onClick={() => setIsCustomFieldsModalOpen(true)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium bg-[#241c15] text-amber-200 hover:bg-[#2c221a] border border-[#3d2e20] transition-colors"
                  >
                    <Sliders className="w-3.5 h-3.5 text-amber-400" />
                    <span>項目のカスタマイズ</span>
                  </button>
                </div>
              </div>

              {/* Decorative motif element */}
              <div className="hidden lg:block absolute right-8 top-1/2 -translate-y-1/2 opacity-25 pointer-events-none text-9xl">
                🍁
              </div>
            </div>

            {/* Filter, Search & Sort Toolbar */}
            <div className="bg-[#181410] border border-[#2e261f] rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Filter Tabs (Interactive filter tabs allowed per skill constitution) */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center p-1 bg-[#12100e] rounded-xl border border-[#2a221b]">
                  <button
                    onClick={() => setFilterType('all')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                      filterType === 'all'
                        ? 'bg-amber-950/70 border border-amber-600/50 text-amber-200'
                        : 'text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    すべて ({logs.length})
                  </button>
                  <button
                    onClick={() => setFilterType('book')}
                    className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                      filterType === 'book'
                        ? 'bg-amber-950/70 border border-amber-600/50 text-amber-200'
                        : 'text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                    書籍のみ
                  </button>
                  <button
                    onClick={() => setFilterType('movie')}
                    className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                      filterType === 'movie'
                        ? 'bg-amber-950/70 border border-amber-600/50 text-amber-200'
                        : 'text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    <Film className="w-3.5 h-3.5 text-orange-400" />
                    映画のみ
                  </button>
                </div>

                {/* Status Dropdown */}
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-[#12100e] border border-[#2a221b] rounded-xl px-3 py-1.5 text-xs text-stone-300 focus:outline-none focus:border-amber-500"
                >
                  <option value="all">すべてのステータス</option>
                  <option value="completed">読了 / 鑑賞済</option>
                  <option value="in_progress">読書中 / 鑑賞中</option>
                  <option value="watchlist">積読 / 観たい</option>
                </select>

                {/* Favorite filter button */}
                <button
                  onClick={() => setOnlyFavorites(!onlyFavorites)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors ${
                    onlyFavorites
                      ? 'bg-rose-950/40 border-rose-500/50 text-rose-300'
                      : 'bg-[#12100e] border-[#2a221b] text-stone-400 hover:text-stone-200'
                  }`}
                >
                  <Heart
                    className={`w-3.5 h-3.5 ${
                      onlyFavorites ? 'fill-current text-rose-400' : ''
                    }`}
                  />
                  <span>本命お気に入りのみ</span>
                </button>
              </div>

              {/* Search input & Sort */}
              <div className="flex items-center gap-3">
                <div className="relative flex-1 sm:w-60">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
                  <input
                    type="text"
                    placeholder="タイトル、作者、感想検索..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#12100e] border border-[#2a221b] rounded-xl pl-9 pr-3 py-1.5 text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <ArrowUpDown className="w-3.5 h-3.5 text-stone-500" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-[#12100e] border border-[#2a221b] rounded-xl px-2.5 py-1.5 text-xs text-stone-300 focus:outline-none focus:border-amber-500"
                  >
                    <option value="date_desc">記録が新しい順</option>
                    <option value="rating_desc">評価が高い順</option>
                    <option value="title_asc">作品名五十音順</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Grid of Logs */}
            {sortedLogs.length === 0 ? (
              <div className="p-12 text-center bg-[#181410] border border-[#2e261f] rounded-2xl space-y-3">
                <BookOpen className="w-8 h-8 text-stone-600 mx-auto" />
                <h3 className="text-base font-serif font-bold text-amber-200">
                  該当する作品の記録がありません
                </h3>
                <p className="text-xs text-stone-400 max-w-sm mx-auto">
                  検索条件を変更するか、右上の「作品を記録」から新しい本や映画を登録してみましょう。
                </p>
                <button
                  onClick={() => {
                    setFilterType('all');
                    setFilterStatus('all');
                    setOnlyFavorites(false);
                    setSearchQuery('');
                  }}
                  className="text-xs text-amber-400 hover:text-amber-300 underline"
                >
                  フィルターをリセット
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {sortedLogs.map((log) => (
                  <LogCard
                    key={log.id}
                    log={log}
                    customFieldDefs={customFields}
                    onEdit={handleOpenEdit}
                    onDelete={handleDeleteLog}
                    onToggleFavorite={handleToggleFavorite}
                    onAddToCanvas={handleAddLogToCanvas}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: AI RECOMMEND */}
        {currentTab === 'recommend' && (
          <RecommendSection
            logs={logs}
            onAddRecommendationToLog={handleAddRecommendationToLog}
          />
        )}

        {/* TAB 3: VISUAL CANVAS */}
        {currentTab === 'canvas' && (
          <CanvasBoard
            logs={logs}
            elements={canvasElements}
            onUpdateElements={setCanvasElements}
          />
        )}

        {/* TAB 4: STATS */}
        {currentTab === 'stats' && <StatsSection logs={logs} />}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-[#251e18] bg-[#0e0c0a] py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <div className="flex items-center gap-3">
            <span className="font-serif text-amber-200/80 font-bold">秋夜録</span>
            <span>·</span>
            <span>読書と映画の秋を彩るログ＆レコメンド</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsTasteProfileModalOpen(true)}
              className="hover:text-amber-300 transition-colors"
            >
              感性診断
            </button>
            <button
              onClick={() => setIsCustomFieldsModalOpen(true)}
              className="hover:text-amber-300 transition-colors"
            >
              記録項目カスタム
            </button>
            <button
              onClick={() => setIsAmbientDrawerOpen(true)}
              className="hover:text-amber-300 transition-colors"
            >
              秋の環境音＆タイマー
            </button>
          </div>
        </div>
      </footer>

      {/* Ambient Sound & Focus Timer Drawer */}
      <AmbientPlayer
        isOpen={isAmbientDrawerOpen}
        onClose={() => setIsAmbientDrawerOpen(false)}
        onActiveStateChange={setIsAmbientActive}
      />

      {/* New/Edit Log Modal */}
      <LogModal
        isOpen={isLogModalOpen}
        onClose={() => {
          setIsLogModalOpen(false);
          setEditingLog(null);
        }}
        onSave={handleSaveLog}
        initialLog={editingLog}
        customFieldDefs={customFields}
        onOpenCustomFieldsManager={() => {
          setIsLogModalOpen(false);
          setIsCustomFieldsModalOpen(true);
        }}
      />

      {/* Custom Fields Manager Modal */}
      <CustomFieldsManager
        isOpen={isCustomFieldsModalOpen}
        onClose={() => setIsCustomFieldsModalOpen(false)}
        customFields={customFields}
        onSave={setCustomFields}
      />

      {/* Taste Profile AI Diagnosis Modal */}
      <TasteProfileModal
        isOpen={isTasteProfileModalOpen}
        onClose={() => setIsTasteProfileModalOpen(false)}
        logs={logs}
      />

      {/* Delete Confirmation Modal (avoids window.confirm in iframe) */}
      {deletingLogId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-[#181410] border border-[#382b20] rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-serif font-bold text-amber-100">
              作品記録の削除
            </h3>
            <p className="text-xs text-stone-300 leading-relaxed">
              『{logs.find((l) => l.id === deletingLogId)?.title || 'この作品'}』の記録を削除してもよろしいですか？
              キャンバスに配置されたカードも同時に削除されます。
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingLogId(null)}
                className="px-4 py-2 text-xs text-stone-300 hover:text-stone-100 bg-[#221c16] rounded-xl border border-[#33281e] transition-colors"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={confirmDeleteLog}
                className="px-4 py-2 text-xs font-medium text-white bg-rose-700 hover:bg-rose-600 rounded-xl transition-colors shadow-sm"
              >
                削除する
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Non-blocking Toast Feedback Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#1c1611]/95 border border-amber-600/40 text-amber-100 text-xs sm:text-sm px-5 py-2.5 rounded-full shadow-2xl backdrop-blur-md flex items-center gap-2 animate-fade-in">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
