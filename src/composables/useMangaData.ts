import { ref, computed, onMounted } from 'vue';
import { supabase } from '@/supabase/config'; // Importar o cliente Supabase
import { MangaData } from '@/types/manga';
import { useAuth } from './useAuth'; // Importar useAuth para obter o user_id

const allStoredMangas = ref<MangaData[]>([]);
const { user } = useAuth(); // Obter o usuário logado

const loadAllMangasFromSupabase = async () => {
  try {
    // Busca todos os mangás publicados (is_draft = false)
    // E também os rascunhos do usuário logado
    const { data, error } = await supabase
      .from('mangas')
      .select('*')
      .or(`is_draft.eq.false,user_id.eq.${user.value?.id}`); // RLS deve lidar com isso, mas é uma segurança extra

    if (error) throw error;
    allStoredMangas.value = data as MangaData[];
  } catch (error: any) {
    console.error('Erro ao carregar mangás do Supabase:', error.message);
    allStoredMangas.value = [];
  }
};

// Carregar mangás inicialmente
loadAllMangasFromSupabase();

export const useMangaData = () => {
  // Re-load on mount to ensure fresh data if other pages updated it
  onMounted(() => {
    loadAllMangasFromSupabase();
  });

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

  // Função para adicionar um novo mangá ao Supabase
  const addManga = async (newManga: MangaData) => {
    try {
      const { data, error } = await supabase
        .from('mangas')
        .insert({
          ...newManga,
          user_id: user.value?.id, // Garante que o user_id está associado
          published_at: newManga.is_draft ? null : new Date().toISOString(), // Define published_at se não for rascunho
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      
      // Atualiza a lista local após a inserção
      if (data) {
        allStoredMangas.value.push(data as MangaData);
      }
      return { success: true, message: 'Mangá adicionado com sucesso!', data: data as MangaData };
    } catch (error: any) {
      console.error('Erro ao adicionar mangá:', error.message);
      return { success: false, message: error.message || 'Erro ao adicionar mangá' };
    }
  };

  // Função para atualizar um mangá no Supabase
  const updateManga = async (updatedManga: MangaData) => {
    try {
      const { data, error } = await supabase
        .from('mangas')
        .update({
          ...updatedManga,
          updated_at: new Date().toISOString(),
          published_at: updatedManga.is_draft ? updatedManga.published_at : new Date().toISOString(), // Atualiza published_at se for publicado
        })
        .eq('id', updatedManga.id)
        .select()
        .single();

      if (error) throw error;

      // Atualiza a lista local após a atualização
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

  // Função para deletar um mangá do Supabase
  const deleteManga = async (id: number) => {
    try {
      const { error } = await supabase
        .from('mangas')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Remove da lista local
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
    loadAllMangasFromSupabase, // Expose para refresh manual
  };
};