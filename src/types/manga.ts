// src/types/manga.ts
export interface MangaChapter {
  number: number;
  title: string;
  pages: string[];
  createdAt: string;
}

export interface MangaData {
  id?: number;
  title: string;
  author: string;
  synopsis: string;
  cover: string;
  genres: string[];
  tags: string[];
  type: 'mangá' | 'manhwa' | 'manhua' | 'webtoon';
  status: 'em-andamento' | 'completo' | 'hiato' | 'cancelado';
  ageRating: string;
  chapters: MangaChapter[];
  user_id?: string; // Alterado para user_id (string UUID do Supabase)
  published_at?: string; // Alterado para published_at
  is_draft?: boolean; // Alterado para is_draft
  views?: number;
  likes?: number;
  comments?: number;
  updated_at?: string; // Alterado para updated_at
}