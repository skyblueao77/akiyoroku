import React, { useState, useRef, useEffect } from 'react';
import { CanvasElement, LogItem } from '../types';
import {
  Download,
  Plus,
  Trash2,
  RotateCw,
  Move,
  Type,
  Smile,
  BookOpen,
  Film,
  Sparkles,
  RefreshCw,
  Layers,
  Palette,
} from 'lucide-react';

interface CanvasBoardProps {
  logs: LogItem[];
  elements: CanvasElement[];
  onUpdateElements: (elements: CanvasElement[]) => void;
}

const STICKER_PALETTE = ['🍁', '🍂', '☕', '🌙', '📖', '🎬', '🕯️', '🌰', '✨', '🍷'];

export const CanvasBoard: React.FC<CanvasBoardProps> = ({
  logs,
  elements,
  onUpdateElements,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [boardTheme, setBoardTheme] = useState<'study' | 'amber' | 'paper' | 'cinema'>('study');
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [notice, setNotice] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => {
      setNotice((current) => (current === msg ? null : current));
    }, 3000);
  };

  // Add new sticky note
  const handleAddSticky = () => {
    const newSticky: CanvasElement = {
      id: `sticky-${Date.now()}`,
      type: 'sticky',
      content: '🍂 秋の夜長メモ:\nここに読書や映画の感想、読みたいリストを自由に書いてみましょう。',
      x: 100 + Math.random() * 80,
      y: 100 + Math.random() * 80,
      width: 220,
      height: 180,
      rotation: (Math.random() - 0.5) * 6,
      color: '#342a1d',
    };
    onUpdateElements([...elements, newSticky]);
    setSelectedId(newSticky.id);
  };

  // Add sticker
  const handleAddSticker = (symbol: string) => {
    const newSticker: CanvasElement = {
      id: `sticker-${Date.now()}`,
      type: 'sticker',
      stickerSymbol: symbol,
      x: 200 + Math.random() * 100,
      y: 200 + Math.random() * 100,
      width: 65,
      height: 65,
      rotation: (Math.random() - 0.5) * 20,
    };
    onUpdateElements([...elements, newSticker]);
    setSelectedId(newSticker.id);
  };

  // Add card from logs
  const handleAddLogCard = (logId: string) => {
    if (elements.some((e) => e.logId === logId)) {
      showNotice('この作品は既にキャンバスに配置されています');
      return;
    }
    const newCard: CanvasElement = {
      id: `card-${Date.now()}`,
      logId,
      type: 'card',
      x: 80 + (elements.length % 4) * 80,
      y: 80 + Math.floor(elements.length / 4) * 60,
      width: 260,
      height: 330,
      rotation: (Math.random() - 0.5) * 4,
    };
    onUpdateElements([...elements, newCard]);
    setSelectedId(newCard.id);
  };

  // Remove element
  const handleRemoveElement = (id: string) => {
    onUpdateElements(elements.filter((e) => e.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  // Rotate element
  const handleRotateElement = (id: string) => {
    onUpdateElements(
      elements.map((e) =>
        e.id === id ? { ...e, rotation: ((e.rotation + 5) % 360) } : e
      )
    );
  };

  // Re-arrange layout presets (対話的レイアウトブラッシュアップ)
  const handleApplyLayout = (type: 'grid' | 'spiral' | 'scatter') => {
    if (elements.length === 0) return;

    if (type === 'grid') {
      const cols = 3;
      const startX = 50;
      const startY = 40;
      const gapX = 290;
      const gapY = 360;

      const updated = elements.map((item, index) => {
        const col = index % cols;
        const row = Math.floor(index / cols);
        return {
          ...item,
          x: startX + col * gapX,
          y: startY + row * gapY,
          rotation: (index % 2 === 0 ? -1 : 1),
        };
      });
      onUpdateElements(updated);
    } else if (type === 'scatter') {
      const updated = elements.map((item, index) => ({
        ...item,
        x: 60 + (index % 4) * 260 + (Math.random() - 0.5) * 40,
        y: 60 + Math.floor(index / 4) * 320 + (Math.random() - 0.5) * 40,
        rotation: (Math.random() - 0.5) * 10,
      }));
      onUpdateElements(updated);
    }
  };

  // Drag handlers for mouse
  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedId(id);
    setIsDragging(true);

    const el = elements.find((item) => item.id === id);
    if (!el || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    setDragOffset({
      x: mouseX - el.x,
      y: mouseY - el.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !selectedId || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const newX = Math.max(0, mouseX - dragOffset.x);
    const newY = Math.max(0, mouseY - dragOffset.y);

    onUpdateElements(
      elements.map((item) =>
        item.id === selectedId ? { ...item, x: newX, y: newY } : item
      )
    );
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Drag handlers for touch screens (mobile/tablet support)
  const handleTouchStart = (e: React.TouchEvent, id: string) => {
    e.stopPropagation();
    setSelectedId(id);
    setIsDragging(true);

    const touch = e.touches[0];
    const el = elements.find((item) => item.id === id);
    if (!el || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const touchX = touch.clientX - rect.left;
    const touchY = touch.clientY - rect.top;

    setDragOffset({
      x: touchX - el.x,
      y: touchY - el.y,
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !selectedId || !containerRef.current) return;

    const touch = e.touches[0];
    const rect = containerRef.current.getBoundingClientRect();
    const touchX = touch.clientX - rect.left;
    const touchY = touch.clientY - rect.top;

    const newX = Math.max(0, touchX - dragOffset.x);
    const newY = Math.max(0, touchY - dragOffset.y);

    onUpdateElements(
      elements.map((item) =>
        item.id === selectedId ? { ...item, x: newX, y: newY } : item
      )
    );
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Export board as PNG using HTML Canvas
  const handleExportPNG = async () => {
    const boardEl = containerRef.current;
    if (!boardEl) return;

    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 800;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background color based on theme
    let bg = '#161310';
    if (boardTheme === 'amber') bg = '#1f160e';
    if (boardTheme === 'paper') bg = '#272019';
    if (boardTheme === 'cinema') bg = '#0d0d0f';

    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Title on canvas
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 24px "Shippori Mincho", serif';
    ctx.fillText('秋夜録 — 読書と映画のムードボード', 40, 45);

    ctx.fillStyle = '#a8a29e';
    ctx.font = '13px sans-serif';
    ctx.fillText(new Date().toLocaleDateString('ja-JP') + ' 作成', 40, 70);

    // Draw elements
    for (const el of elements) {
      ctx.save();
      ctx.translate(el.x + el.width / 2, el.y + el.height / 2);
      ctx.rotate((el.rotation * Math.PI) / 180);
      ctx.translate(-el.width / 2, -el.height / 2);

      if (el.type === 'sticker' && el.stickerSymbol) {
        ctx.font = '40px sans-serif';
        ctx.fillText(el.stickerSymbol, 10, 45);
      } else if (el.type === 'sticky') {
        ctx.fillStyle = '#2d241a';
        ctx.fillRect(0, 0, el.width, el.height);
        ctx.strokeStyle = '#443527';
        ctx.strokeRect(0, 0, el.width, el.height);

        ctx.fillStyle = '#fef3c7';
        ctx.font = '13px sans-serif';
        const lines = (el.content || '').split('\n');
        lines.forEach((line, i) => {
          ctx.fillText(line, 15, 25 + i * 20);
        });
      } else if (el.type === 'card' && el.logId) {
        const log = logs.find((l) => l.id === el.logId);
        if (log) {
          ctx.fillStyle = '#1c1712';
          ctx.fillRect(0, 0, el.width, el.height);
          ctx.strokeStyle = '#3a2e22';
          ctx.strokeRect(0, 0, el.width, el.height);

          ctx.fillStyle = log.type === 'book' ? '#fbbf24' : '#fb923c';
          ctx.font = '12px sans-serif';
          ctx.fillText(log.type === 'book' ? '【書籍】' : '【映画】', 15, 25);

          ctx.fillStyle = '#fef3c7';
          ctx.font = 'bold 16px "Shippori Mincho", serif';
          ctx.fillText(log.title.substring(0, 14), 15, 52);

          ctx.fillStyle = '#a8a29e';
          ctx.font = '12px sans-serif';
          ctx.fillText(`${log.creator} · ${log.genre}`, 15, 75);

          ctx.fillStyle = '#f59e0b';
          ctx.font = '13px monospace';
          ctx.fillText('★ ' + log.rating.toFixed(1), 15, 98);

          if (log.quote) {
            ctx.fillStyle = '#d97706';
            ctx.font = 'italic 11px serif';
            ctx.fillText('“' + log.quote.substring(0, 20) + '...”', 15, 125);
          }

          if (log.autumnPairing) {
            ctx.fillStyle = '#fde68a';
            ctx.font = '11px sans-serif';
            ctx.fillText('☕ ' + log.autumnPairing.substring(0, 18), 15, 150);
          }
        }
      }

      ctx.restore();
    }

    // Download trigger
    const link = document.createElement('a');
    link.download = `秋夜録_ムードボード_${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const getThemeClass = () => {
    switch (boardTheme) {
      case 'study':
        return 'bg-[#14110e] border-[#2e261f]';
      case 'amber':
        return 'bg-gradient-to-br from-[#1a120b] via-[#14100c] to-[#1c140d] border-amber-900/30';
      case 'paper':
        return 'bg-[#1b1713] border-[#382b20]';
      case 'cinema':
        return 'bg-[#0d0c0e] border-[#25222b]';
    }
  };

  const selectedElement = elements.find((e) => e.id === selectedId);

  return (
    <div className="space-y-4">
      {/* Canvas Toolbar & Layout controls */}
      <div className="bg-[#181410] border border-[#2e261f] rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        {/* Left tools: Add sticky, Add sticker, Add works */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleAddSticky}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#221c16] text-amber-200 border border-[#382c20] hover:bg-[#2c231b] transition-colors"
          >
            <Type className="w-3.5 h-3.5" />
            <span>+ 付箋メモ</span>
          </button>

          {/* Quick sticker stamps */}
          <div className="flex items-center gap-1 bg-[#12100e] p-1 rounded-lg border border-[#2a221b]">
            {STICKER_PALETTE.slice(0, 6).map((symbol) => (
              <button
                key={symbol}
                onClick={() => handleAddSticker(symbol)}
                className="w-7 h-7 flex items-center justify-center text-sm hover:scale-125 transition-transform"
                title={`${symbol} スタンプを配置`}
              >
                {symbol}
              </button>
            ))}
          </div>

          {/* Add log dropdown */}
          <div className="relative">
            <select
              onChange={(e) => {
                if (e.target.value) {
                  handleAddLogCard(e.target.value);
                  e.target.value = '';
                }
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#221c16] text-stone-300 border border-[#382c20] hover:text-stone-100 transition-colors cursor-pointer"
            >
              <option value="">+ 記録からカードを貼る...</option>
              {logs.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.type === 'book' ? '📖' : '🎬'} {l.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right tools: Layout brushup, theme, export */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Layout presets (対話的レイアウトブラッシュアップ) */}
          <div className="flex items-center gap-1 bg-[#12100e] p-1 rounded-lg border border-[#2a221b]">
            <button
              onClick={() => handleApplyLayout('grid')}
              className="px-2.5 py-1 text-xs text-stone-400 hover:text-amber-200 rounded transition-colors"
              title="本棚グリッド配置に整列"
            >
              整列グリッド
            </button>
            <button
              onClick={() => handleApplyLayout('scatter')}
              className="px-2.5 py-1 text-xs text-stone-400 hover:text-amber-200 rounded transition-colors"
              title="自由なムードボード配置"
            >
              散策レイアウト
            </button>
          </div>

          {/* Theme switcher */}
          <div className="flex items-center gap-1 bg-[#12100e] p-1 rounded-lg border border-[#2a221b]">
            {(
              [
                { id: 'study', label: '書斎' },
                { id: 'amber', label: '琥珀' },
                { id: 'paper', label: '和紙' },
                { id: 'cinema', label: 'シネマ' },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                onClick={() => setBoardTheme(t.id)}
                className={`px-2 py-0.5 text-xs rounded transition-colors ${
                  boardTheme === t.id
                    ? 'bg-amber-950/80 text-amber-300 border border-amber-600/40 font-medium'
                    : 'text-stone-500 hover:text-stone-300'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* PNG Export */}
          <button
            onClick={handleExportPNG}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-400 text-[#12100e] hover:bg-amber-300 transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>画像保存 (PNG)</span>
          </button>
        </div>
      </div>

      {/* Notice notification */}
      {notice && (
        <div className="bg-amber-950/60 border border-amber-600/40 text-amber-200 text-xs px-4 py-2 rounded-xl flex items-center justify-between shadow-md">
          <span>{notice}</span>
          <button
            onClick={() => setNotice(null)}
            className="text-stone-400 hover:text-stone-200 ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Selected Element Action Bar (if an item is selected) */}
      {selectedElement && (
        <div className="bg-[#1f1914] border border-[#3b2d20] rounded-xl px-4 py-2 flex items-center justify-between text-xs text-stone-300">
          <div className="flex items-center gap-2">
            <span className="text-amber-400 font-medium">選択中:</span>
            <span>
              {selectedElement.type === 'card'
                ? '作品カード'
                : selectedElement.type === 'sticky'
                ? '付箋メモ'
                : 'スタンプ'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleRotateElement(selectedElement.id)}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#16120e] hover:text-amber-300 transition-colors"
            >
              <RotateCw className="w-3 h-3" />
              少し傾ける (+5°)
            </button>
            <button
              onClick={() => handleRemoveElement(selectedElement.id)}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-rose-950/40 text-rose-300 hover:bg-rose-900/60 transition-colors"
            >
              <Trash2 className="w-3 h-3" />
              削除
            </button>
          </div>
        </div>
      )}

      {/* Interactive Moodboard Board Container */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={() => setSelectedId(null)}
        className={`relative w-full h-[650px] rounded-2xl border ${getThemeClass()} shadow-2xl overflow-hidden cursor-crosshair select-none transition-colors duration-300 touch-none`}
      >
        {/* Subtle grid pattern background */}
        <div
          className="absolute inset-0 pointer-events-none opacity-15"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgba(245, 158, 11, 0.4) 1px, transparent 0)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Board watermark branding */}
        <div className="absolute top-4 left-6 pointer-events-none opacity-40">
          <h1 className="text-xl font-serif font-bold text-amber-200/80">秋夜録</h1>
          <p className="text-xs text-stone-400">秋の読書・映画ムードボードキャンバス</p>
        </div>

        {/* Canvas Elements */}
        {elements.map((el) => {
          const isSelected = el.id === selectedId;

          // 1. STICKY NOTE
          if (el.type === 'sticky') {
            return (
              <div
                key={el.id}
                onMouseDown={(e) => handleMouseDown(e, el.id)}
                onTouchStart={(e) => handleTouchStart(e, el.id)}
                style={{
                  transform: `translate(${el.x}px, ${el.y}px) rotate(${el.rotation}deg)`,
                  width: `${el.width}px`,
                  minHeight: `${el.height}px`,
                  zIndex: isSelected ? 30 : 10,
                }}
                className={`absolute p-4 rounded-xl shadow-lg cursor-grab active:cursor-grabbing border transition-shadow bg-[#281f16] ${
                  isSelected
                    ? 'ring-2 ring-amber-400 border-amber-400'
                    : 'border-[#423324]'
                }`}
              >
                <div className="w-full flex items-center justify-between text-stone-500 mb-1 border-b border-[#3d2e1f] pb-1">
                  <span className="text-[10px] tracking-wider uppercase">NOTE</span>
                  <Move className="w-3 h-3" />
                </div>
                <textarea
                  value={el.content || ''}
                  onChange={(e) => {
                    const text = e.target.value;
                    onUpdateElements(
                      elements.map((item) =>
                        item.id === el.id ? { ...item, content: text } : item
                      )
                    );
                  }}
                  className="w-full h-32 bg-transparent resize-none text-xs text-amber-100 placeholder-stone-500 focus:outline-none leading-relaxed font-sans"
                  placeholder="付箋のメモ..."
                />
              </div>
            );
          }

          // 2. STICKER
          if (el.type === 'sticker') {
            return (
              <div
                key={el.id}
                onMouseDown={(e) => handleMouseDown(e, el.id)}
                onTouchStart={(e) => handleTouchStart(e, el.id)}
                style={{
                  transform: `translate(${el.x}px, ${el.y}px) rotate(${el.rotation}deg)`,
                  width: `${el.width}px`,
                  height: `${el.height}px`,
                  zIndex: isSelected ? 30 : 10,
                }}
                className={`absolute flex items-center justify-center text-4xl cursor-grab active:cursor-grabbing hover:scale-110 transition-transform ${
                  isSelected ? 'ring-2 ring-amber-400 rounded-full' : ''
                }`}
              >
                {el.stickerSymbol}
              </div>
            );
          }

          // 3. CARD ELEMENT
          if (el.type === 'card' && el.logId) {
            const log = logs.find((l) => l.id === el.logId);
            if (!log) return null;
            const isBook = log.type === 'book';

            return (
              <div
                key={el.id}
                onMouseDown={(e) => handleMouseDown(e, el.id)}
                onTouchStart={(e) => handleTouchStart(e, el.id)}
                style={{
                  transform: `translate(${el.x}px, ${el.y}px) rotate(${el.rotation}deg)`,
                  width: `${el.width}px`,
                  zIndex: isSelected ? 30 : 10,
                }}
                className={`absolute p-4 rounded-2xl bg-[#1b1612] border shadow-xl cursor-grab active:cursor-grabbing transition-shadow ${
                  isSelected
                    ? 'ring-2 ring-amber-400 border-amber-400'
                    : 'border-[#382d22] hover:border-amber-700/50'
                }`}
              >
                {/* Header of card */}
                <div className="flex items-center justify-between text-xs text-stone-400 mb-2">
                  <div className="flex items-center gap-1.5 text-stone-300 font-medium">
                    {isBook ? (
                      <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                    ) : (
                      <Film className="w-3.5 h-3.5 text-orange-400" />
                    )}
                    <span>{isBook ? '書籍' : '映画'}</span>
                  </div>
                  <Move className="w-3.5 h-3.5 text-stone-600" />
                </div>

                <h4 className="text-base font-serif font-bold text-amber-100 line-clamp-2 leading-snug">
                  {log.title}
                </h4>
                <div className="text-xs text-stone-400 mt-1 truncate">
                  {log.creator} · {log.genre}
                </div>

                {/* Rating */}
                <div className="mt-2 text-xs text-amber-400 font-mono font-medium">
                  {'★'.repeat(Math.round(log.rating))} ({log.rating.toFixed(1)})
                </div>

                {/* Quote */}
                {log.quote && (
                  <p className="mt-2.5 p-2 rounded bg-[#13100d] border border-[#2d231a] text-[11px] text-amber-200/90 font-serif italic line-clamp-2">
                    “{log.quote}”
                  </p>
                )}

                {/* Pairing */}
                {log.autumnPairing && (
                  <div className="mt-2 text-[11px] text-amber-300/80 truncate">
                    ☕ {log.autumnPairing}
                  </div>
                )}
              </div>
            );
          }

          return null;
        })}

        {elements.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 text-stone-500 pointer-events-none">
            <Sparkles className="w-8 h-8 text-amber-500/40 mb-2" />
            <p className="text-sm font-serif text-stone-400">キャンバスが空です</p>
            <p className="text-xs mt-1">
              上のツールバーから「付箋メモ」や「記録からカードを貼る」をクリックして作品を自由に並べましょう。
            </p>
          </div>
        )}
      </div>

      <p className="text-xs text-stone-500 text-center">
        ※ カードや付箋は自由にドラッグ移動できます。レイアウトを整えたら「画像保存 (PNG)」で保存・共有可能です。
      </p>
    </div>
  );
};
