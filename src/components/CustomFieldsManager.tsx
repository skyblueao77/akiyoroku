import React, { useState } from 'react';
import { CustomFieldDefinition } from '../types';
import { X, Plus, Trash2, Sliders, Check } from 'lucide-react';

interface CustomFieldsManagerProps {
  isOpen: boolean;
  onClose: () => void;
  customFields: CustomFieldDefinition[];
  onSave: (fields: CustomFieldDefinition[]) => void;
}

export const CustomFieldsManager: React.FC<CustomFieldsManagerProps> = ({
  isOpen,
  onClose,
  customFields,
  onSave,
}) => {
  const [fields, setFields] = useState<CustomFieldDefinition[]>(customFields);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<CustomFieldDefinition['type']>('rating');
  const [newPlaceholder, setNewPlaceholder] = useState('');

  if (!isOpen) return null;

  const handleAddField = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const id = `field_${Date.now()}`;
    const newField: CustomFieldDefinition = {
      id,
      name: newName.trim(),
      type: newType,
      placeholder: newPlaceholder.trim() || undefined,
    };

    const updated = [...fields, newField];
    setFields(updated);
    setNewName('');
    setNewPlaceholder('');
  };

  const handleDeleteField = (id: string) => {
    setFields(fields.filter((f) => f.id !== id));
  };

  const handleApplyPreset = (presetName: string, presetType: CustomFieldDefinition['type'], placeholder?: string) => {
    if (fields.some((f) => f.name === presetName)) return;
    const newField: CustomFieldDefinition = {
      id: `field_preset_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: presetName,
      type: presetType,
      placeholder,
    };
    setFields([...fields, newField]);
  };

  const handleSaveAndClose = () => {
    onSave(fields);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#181410] border border-[#362b21] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col my-auto">
        <div className="flex items-center justify-between p-5 border-b border-[#2d251e] bg-[#14100c]">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-serif font-bold text-amber-100">
              記録項目のカスタマイズ
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-6 max-h-[75vh] overflow-y-auto">
          <p className="text-xs text-stone-300 leading-relaxed">
            あなた独自の記録項目を自由に追加できます。評価基準やメモ項目を増やして、オリジナルの読書・映画手帳にカスタマイズしましょう。
          </p>

          {/* Quick presets */}
          <div>
            <span className="text-xs uppercase tracking-wider text-stone-400 font-medium block mb-2">
              おすすめの秋プリセット
            </span>
            <div className="flex flex-wrap gap-2">
              {[
                { name: '涙活スコア (泣き度)', type: 'rating' as const },
                { name: '伏線回収の美しさ', type: 'rating' as const },
                { name: '読書・鑑賞場所', type: 'text' as const, placeholder: '自室のソファ、深夜のカフェ' },
                { name: '作品の香り/連想する匂い', type: 'text' as const, placeholder: '古書、雨、金木犀' },
                { name: '深夜2時以降の読書', type: 'boolean' as const },
              ].map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleApplyPreset(p.name, p.type, p.placeholder)}
                  disabled={fields.some((f) => f.name === p.name)}
                  className="px-2.5 py-1 text-xs rounded-md bg-[#231c16] border border-[#382c20] text-amber-200/90 hover:bg-[#2c231b] hover:border-amber-500/40 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  + {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* Current Fields List */}
          <div>
            <span className="text-xs uppercase tracking-wider text-stone-400 font-medium block mb-2">
              現在の項目 ({fields.length}件)
            </span>
            {fields.length === 0 ? (
              <p className="text-xs text-stone-500 italic p-3 bg-[#12100e] rounded-xl border border-[#261f18]">
                現在カスタム項目はありません。下から追加してください。
              </p>
            ) : (
              <div className="space-y-2">
                {fields.map((field) => (
                  <div
                    key={field.id}
                    className="flex items-center justify-between p-3 bg-[#13100d] rounded-xl border border-[#2b221a]"
                  >
                    <div>
                      <div className="text-sm font-medium text-amber-100">{field.name}</div>
                      <div className="text-xs text-stone-500 flex items-center gap-2 mt-0.5">
                        <span>
                          {field.type === 'rating'
                            ? '星評価 (1-5)'
                            : field.type === 'boolean'
                            ? 'はい/いいえ (チェック)'
                            : field.type === 'number'
                            ? '数値'
                            : 'テキスト'}
                        </span>
                        {field.placeholder && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="truncate max-w-[180px]">例: {field.placeholder}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteField(field.id)}
                      className="p-1.5 text-stone-500 hover:text-rose-400 transition-colors"
                      title="削除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add New Field Form */}
          <form
            onSubmit={handleAddField}
            className="p-4 bg-[#14110d] rounded-xl border border-[#2d241c] space-y-3"
          >
            <span className="text-xs font-semibold text-amber-200 block">
              新規カスタム項目の作成
            </span>

            <div>
              <label className="block text-xs text-stone-400 mb-1">項目名</label>
              <input
                type="text"
                required
                placeholder="例: 読んだ場所、心拍数、秋の推薦度"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full bg-[#1b1713] border border-[#342b22] rounded-lg px-3 py-1.5 text-xs text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-stone-400 mb-1">入力形式</label>
                <select
                  value={newType}
                  onChange={(e) =>
                    setNewType(e.target.value as CustomFieldDefinition['type'])
                  }
                  className="w-full bg-[#1b1713] border border-[#342b22] rounded-lg px-3 py-1.5 text-xs text-stone-100 focus:outline-none focus:border-amber-500"
                >
                  <option value="rating">★ 星評価 (1-5)</option>
                  <option value="text">テキスト入力</option>
                  <option value="number">数値</option>
                  <option value="boolean">真偽値 (チェックボックス)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-stone-400 mb-1">ヒント/例 (任意)</label>
                <input
                  type="text"
                  placeholder="例: 深夜のベランダ"
                  value={newPlaceholder}
                  onChange={(e) => setNewPlaceholder(e.target.value)}
                  className="w-full bg-[#1b1713] border border-[#342b22] rounded-lg px-3 py-1.5 text-xs text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-stone-900 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors mt-2"
            >
              <Plus className="w-3.5 h-3.5" />
              この項目を追加
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#2d251e] bg-[#14100c] flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs text-stone-400 hover:text-stone-200 transition-colors"
          >
            キャンセル
          </button>
          <button
            onClick={handleSaveAndClose}
            className="flex items-center gap-1.5 px-5 py-2 text-xs font-medium text-[#12100e] bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors"
          >
            <Check className="w-4 h-4" />
            設定を保存
          </button>
        </div>
      </div>
    </div>
  );
};
