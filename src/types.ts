export type MediaType = 'book' | 'movie';

export type LogStatus = 'completed' | 'in_progress' | 'watchlist';

export interface CustomFieldDefinition {
  id: string;
  name: string;
  type: 'text' | 'number' | 'rating' | 'boolean' | 'tag';
  placeholder?: string;
  description?: string;
}

export interface CustomFieldValue {
  fieldId: string;
  value: string | number | boolean;
}

export interface LogItem {
  id: string;
  title: string;
  type: MediaType;
  creator: string; // Author or Director
  genre: string;
  status: LogStatus;
  rating: number; // 0 - 5
  date: string; // YYYY-MM-DD
  durationOrPages?: string;
  quote?: string;
  notes?: string;
  autumnPairing?: string; // Hot cider, roasted green tea, etc.
  tags: string[];
  favorite: boolean;
  customFields?: Record<string, string | number | boolean>;
  coverColor?: string; // Aesthetic gradient/color for book/movie card
}

export interface RecommendationItem {
  title: string;
  type: MediaType;
  creator: string;
  genre: string;
  durationOrPages?: string;
  synopsis: string;
  reason: string;
  autumnAtmosphere: string;
  pairing: string;
  quoteOrCatchphrase?: string;
}

export interface TasteProfile {
  personaTitle: string;
  summary: string;
  radarAttributes: {
    label: string;
    score: number;
  }[];
  autumnNightAdvice: string;
  recommendedGenres: string[];
}

export interface CanvasElement {
  id: string;
  logId?: string;
  type: 'card' | 'sticky' | 'sticker' | 'quote';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  content?: string;
  color?: string;
  stickerSymbol?: string;
}
