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
  userId?: number;
  publishedAt?: string;
  isDraft?: boolean;
  views?: number; // Adicionado como opcional
  likes?: number; // Adicionado como opcional
  comments?: number; // Adicionado como opcional
  updatedAt?: string; // Adicionado para rascunhos
}