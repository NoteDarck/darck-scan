import { ref, computed, onMounted } from 'vue';
import { MangaData } from '@/types/manga';

const allStoredMangas = ref<MangaData[]>([]);

const loadAllMangasFromLocalStorage = () => {
  const storedMangas = localStorage.getItem('publishedMangas');
  if (storedMangas) {
    allStoredMangas.value = JSON.parse(storedMangas);
  } else {
    allStoredMangas.value = [];
  }
};

// Load mangas initially
loadAllMangasFromLocalStorage();

export const useMangaData = () => {
  // Re-load on mount to ensure fresh data if other pages updated it
  onMounted(() => {
    loadAllMangasFromLocalStorage();
  });

  const publishedMangas = computed(() => {
    return allStoredMangas.value.filter(manga => !manga.isDraft);
  });

  const getMangaById = (id: number) => {
    return allStoredMangas.value.find(manga => manga.id === id);
  };

  // Function to update a manga in local storage (e.g., for views/likes)
  const updateManga = (updatedManga: MangaData) => {
    const index = allStoredMangas.value.findIndex(manga => manga.id === updatedManga.id);
    if (index !== -1) {
      allStoredMangas.value[index] = updatedManga;
      localStorage.setItem('publishedMangas', JSON.stringify(allStoredMangas.value));
    }
  };

  return {
    allStoredMangas, // For debugging or if raw access is needed
    publishedMangas,
    getMangaById,
    updateManga,
    loadAllMangasFromLocalStorage // Expose for manual refresh if needed
  };
};