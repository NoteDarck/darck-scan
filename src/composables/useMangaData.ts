import { ref, computed, onMounted } from 'vue';
import { supabase } from '@/supabase/config';
import { MangaData } from '@/types/manga';
import { useAuth } from './useAuth';

const allStoredMangas = ref<MangaData[]>([]);
const { user } = useAuth();

const loadAllMangasFromSupabase = async () => {
  try {
    const { data, error } = await supabase
      .from('mangas')
      .select('*')
      .or(`is_draft.eq.false,user_id.eq.${user.value?.id}`);

    if (error) throw error;
    allStoredMangas.value = data as MangaData[];
  } catch (error: any) {
    console.error('Erro ao carregar mangás do Supabase:', error.message);
    allStoredMangas.value = [];
  }
};

onMounted(() => {
  loadAllMangasFromSupabase();
});

export const useMangaData = () => {
  const publishedMangas = computed(() => {
    return allStoredMangas.value.filter(manga => !manga.is_draft);
  });

  const userPublishedMangas = computed(() => {
    return allStoredMangas.value.filter(manga => !manga.is_draft && manga.user_id === user.value?.id);
  });

  const userDrafts = computed(() => {
    return allStoredMangas.value.filter(manga => manga.is_draft && manga.user_id === user.value?.id);
  });

  const getMangaById = async (id: number): Promise<MangaData | undefined> => {
    try {
      const { data, error } = await supabase
        .from('mangas')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as MangaData;
    } catch (error: any) {
      console.error('Erro ao buscar mangá por ID:', error.message);
      return undefined;
    }
  };

  const addManga = async (newManga: MangaData) => {
    try {
      const { data, error } = await supabase
        .from('mangas')
        .insert({
          ...newManga,
          user_id: user.value?.id,
          published_at: newManga.is_draft ? null : new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        allStoredMangas.value.push(data as MangaData);
      }
      return { success: true, message: 'Mangá adicionado com sucesso!', data: data as MangaData };
    } catch (error: any) {
      console.error('Erro ao adicionar mangá:', error.message);
      return { success: false, message: error.message || 'Erro ao adicionar mangá' };
    }
  };

  const updateManga = async (updatedManga: MangaData) => {
    try {
      const { data, error } = await supabase
        .from('mangas')
        .update({
          ...updatedManga,
          updated_at: new Date().toISOString(),
          published_at: updatedManga.is_draft ? updatedManga.published_at : new Date().toISOString(),
        })
        .eq('id', updatedManga.id)
        .select()
        .single();

      if (error) throw error;

      const index = allStoredMangas.value.findIndex(manga => manga.id === updatedManga.id);
      if (index !== -1 && data) {
        allStoredMangas.value[index] = data as MangaData;
      }
      return { success: true, message: 'Mangá atualizado com sucesso!', data: data as MangaData };
    } catch (error: any) {
      console.error('Erro ao atualizar mangá:', error.message);
      return { success: false, message: error.message || 'Erro ao atualizar mangá' };
    }
  };

  const deleteManga = async (id: number) => {
    try {
      const { error } = await supabase
        .from('mangas')
        .delete()
        .eq('id', id);

      if (error) throw error;

      allStoredMangas.value = allStoredMangas.value.filter(manga => manga.id !== id);
      return { success: true, message: 'Mangá excluído com sucesso!' };
    } catch (error: any) {
      console.error('Erro ao excluir mangá:', error.message);
      return { success: false, message: error.message || 'Erro ao excluir mangá' };
    }
  };

  return {
    allStoredMangas,
    publishedMangas,
    userPublishedMangas,
    userDrafts,
    getMangaById,
    addManga,
    updateManga,
    deleteManga,
    loadAllMangasFromSupabase,
  };
};