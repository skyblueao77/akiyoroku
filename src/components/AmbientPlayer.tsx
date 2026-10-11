import React, { useState, useEffect } from 'react';
import { ambientSound } from '../utils/ambientSound';
import { Play, Pause, RotateCcw, X, Moon, Flame, CloudRain, Bug } from 'lucide-react';

interface AmbientPlayerProps {
  isOpen: boolean;
  onClose: () => void;
  onActiveStateChange: (isActive: boolean) => void;
}

export const AmbientPlayer: React.FC<AmbientPlayerProps> = ({
  isOpen,
  onClose,
  onActiveStateChange,
}) => {
  const [crickets, setCrickets] = useState(false);
  const [fireplace, setFireplace] = useState(false);
  const [rain, setRain] = useState(false);

  // Timer states
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [initialSeconds, setInitialSeconds] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  useEffect(() => {
    const active = crickets || fireplace || rain || isTimerRunning;
    onActiveStateChange(active);
  }, [crickets, fireplace, rain, isTimerRunning, onActiveStateChange]);

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  const toggleCricketSound = () => {
    const next = !crickets;
    setCrickets(next);
    ambientSound.toggleCrickets(next, 0.4);
  };

  const toggleFireplaceSound = () => {
    const next = !fireplace;
    setFireplace(next);
    ambientSound.toggleFireplace(next, 0.35);
  };

  const toggleRainSound = () => {
    const next = !rain;
    setRain(next);
    ambientSound.toggleRain(next, 0.3);
  };

  const handleStopAll = () => {
    setCrickets(false);
    setFireplace(false);
    setRain(false);
    ambientSound.stopAll();
  };

  const formatTime = (totalSec: number) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const setPresetMinutes = (min: number) => {
    const secs = min * 60;
    setTimerSeconds(secs);
    setInitialSeconds(secs);
    setIsTimerRunning(false);
  };

  return (
    <>
      {/* Backdrop overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-[#161310] border-l border-[#2e261f] shadow-2xl flex flex-col justify-between overflow-y-auto transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full pointer-events-none'
        }`}
      >
        <div className="p-6">
        <div className="flex items-center justify-between pb-4 border-b border-[#2d251e]">
          <div className="flex items-center gap-2">
            <Moon className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-serif font-bold text-amber-100">
              秋の夜長アンビエント＆読書灯
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-200 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Ambient Sounds */}
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs uppercase tracking-wider text-stone-400 font-medium">
              秋の環境音
            </h3>
            {(crickets || fireplace || rain) && (
              <button
                onClick={handleStopAll}
                className="text-xs text-amber-400/80 hover:text-amber-300 transition-colors"
              >
                すべて停止
              </button>
            )}
          </div>

          {/* Cricket button */}
          <div
            onClick={toggleCricketSound}
            className={`cursor-pointer p-3.5 rounded-xl border transition-all flex items-center justify-between ${
              crickets
                ? 'bg-amber-950/40 border-amber-500/50 text-amber-200'
                : 'bg-stone-900/60 border-stone-800 text-stone-300 hover:border-stone-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                  crickets ? 'bg-amber-900/60 text-amber-300' : 'bg-stone-800 text-stone-400'
                }`}
              >
                <Bug className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-medium">秋の虫の声 (鈴虫・松虫)</div>
                <div className="text-xs text-stone-400">涼やかで澄んだ夜の音色</div>
              </div>
            </div>
            <div
              className={`text-xs px-2 py-0.5 rounded font-mono ${
                crickets ? 'bg-amber-500/20 text-amber-300' : 'text-stone-500'
              }`}
            >
              {crickets ? '再生中' : '停止中'}
            </div>
          </div>

          {/* Fireplace button */}
          <div
            onClick={toggleFireplaceSound}
            className={`cursor-pointer p-3.5 rounded-xl border transition-all flex items-center justify-between ${
              fireplace
                ? 'bg-amber-950/40 border-amber-500/50 text-amber-200'
                : 'bg-stone-900/60 border-stone-800 text-stone-300 hover:border-stone-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                  fireplace ? 'bg-orange-950/60 text-orange-400' : 'bg-stone-800 text-stone-400'
                }`}
              >
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-medium">暖炉の薪のはぜる音</div>
                <div className="text-xs text-stone-400">じんわりと温まるパチパチ音</div>
              </div>
            </div>
            <div
              className={`text-xs px-2 py-0.5 rounded font-mono ${
                fireplace ? 'bg-amber-500/20 text-amber-300' : 'text-stone-500'
              }`}
            >
              {fireplace ? '再生中' : '停止中'}
            </div>
          </div>

          {/* Gentle rain button */}
          <div
            onClick={toggleRainSound}
            className={`cursor-pointer p-3.5 rounded-xl border transition-all flex items-center justify-between ${
              rain
                ? 'bg-amber-950/40 border-amber-500/50 text-amber-200'
                : 'bg-stone-900/60 border-stone-800 text-stone-300 hover:border-stone-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                  rain ? 'bg-blue-950/60 text-blue-300' : 'bg-stone-800 text-stone-400'
                }`}
              >
                <CloudRain className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-medium">静かな秋の雨</div>
                <div className="text-xs text-stone-400">窓を濡らす落ち着いた雨音</div>
              </div>
            </div>
            <div
              className={`text-xs px-2 py-0.5 rounded font-mono ${
                rain ? 'bg-amber-500/20 text-amber-300' : 'text-stone-500'
              }`}
            >
              {rain ? '再生中' : '停止中'}
            </div>
          </div>
        </div>

        {/* Night Reading Timer */}
        <div className="mt-8 pt-6 border-t border-[#2d251e]">
          <h3 className="text-xs uppercase tracking-wider text-stone-400 font-medium mb-3">
            秋夜の読書・鑑賞タイマー
          </h3>

          <div className="bg-[#1b1713] rounded-2xl p-5 border border-[#342b23] text-center">
            <div className="text-4xl font-mono tabular-nums font-bold text-amber-100 tracking-wider">
              {formatTime(timerSeconds)}
            </div>
            <div className="text-xs text-stone-400 mt-1">
              静かに作品に浸るためのフォーカスタイマー
            </div>

            {/* Presets */}
            <div className="flex items-center justify-center gap-2 mt-4">
              {[15, 25, 45, 60].map((m) => (
                <button
                  key={m}
                  onClick={() => setPresetMinutes(m)}
                  className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                    initialSeconds === m * 60
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-medium'
                      : 'bg-stone-800/80 text-stone-400 hover:text-stone-200'
                  }`}
                >
                  {m}分
                </button>
              ))}
            </div>

            {/* Play/Pause/Reset */}
            <div className="flex items-center justify-center gap-3 mt-5">
              <button
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className={`flex items-center gap-1.5 px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isTimerRunning
                    ? 'bg-stone-800 text-stone-200 hover:bg-stone-700'
                    : 'bg-amber-500 text-[#12100e] hover:bg-amber-400 font-semibold'
                }`}
              >
                {isTimerRunning ? (
                  <>
                    <Pause className="w-4 h-4" /> 一時停止
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" /> 開始
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setIsTimerRunning(false);
                  setTimerSeconds(initialSeconds);
                }}
                className="p-2 rounded-lg bg-stone-800/80 text-stone-400 hover:text-stone-200 transition-colors"
                title="リセット"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-[#2d251e] bg-[#12100e]/70 text-center">
        <p className="text-xs text-stone-500 font-serif">
          「灯火親しむべし」— 韓愈
        </p>
      </div>
    </div>
  </>
);
};
