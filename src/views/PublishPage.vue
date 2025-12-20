<script setup lang="ts">
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonBackButton, IonButtons, IonItem, IonInput, IonLabel, IonIcon, IonSelect, IonSelectOption, IonToggle, IonSpinner, toastController } from '@ionic/vue';
import { arrowBack, arrowForward, add, image, create, trash, documentText, cloudUpload } from 'ionicons/icons';
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuth } from '@/composables/useAuth';
import { useMangaData } from '@/composables/useMangaData';
import { MangaData } from '@/types/manga';
import { createMangaFile } from '@/utils/mangaFileGenerator';

const router = useRouter();
const route = useRoute();
const { isAuthenticated, user } = useAuth();
const { allStoredMangas, updateManga, getMangaById, loadAllMangasFromLocalStorage } = useMangaData();

// Verificar autenticação
onMounted(() => {
  if (!isAuthenticated.value) {
    setTimeout(() => {
      router.push('/login');
    }, 100);
  } else {
    // Carregar mangá para edição ou rascunho
    const editMangaId = route.query.edit ? parseInt(route.query.edit as string) : null;
    const draftMangaId = route.query.draft ? parseInt(route.query.draft as string) : null;
    
    if (editMangaId) {
      const mangaToEdit = getMangaById(editMangaId);
      if (mangaToEdit) {
        mangaData.value = { ...mangaToEdit };
        currentStep.value = 1; // Começa no passo 1 para edição
      } else {
        showToast('Mangá não encontrado para edição.', 'danger');
        router.replace('/publish'); // Redireciona para nova publicação
      }
    } else if (draftMangaId) {
      const draftToEdit = getMangaById(draftMangaId);
      if (draftToEdit) {
        mangaData.value = { ...draftToEdit };
        publishAsDraft.value = true; // Marca como rascunho
        currentStep.value = 1; // Começa no passo 1 para rascunho
      } else {
        showToast('Rascunho não encontrado.', 'danger');
        router.replace('/publish');
      }
    }
  }
});

// Estado do formulário
const currentStep = ref(1);
const fileInput = ref<HTMLInputElement | null>(null);
const newTag = ref('');
const newChapter = ref({ number: 1, title: '', pages: [''], createdAt: new Date().toISOString() });
const addingNewChapter = ref(false);
const editingChapterIndex = ref<number | null>(null);
const isPublishing = ref(false);
const publishAsDraft = ref(false);
const allowComments = ref(true);
const notifyFollowers = ref(true);

// Dados do mangá
const mangaData = ref<MangaData>({
  title: '',
  author: user.value?.name || '',
  synopsis: '',
  cover: '',
  genres: [] as string[],
  tags: [] as string[],
  type: 'mangá',
  status: 'em-andamento',
  ageRating: 'L',
  chapters: [],
  userId: user.value?.id,
  publishedAt: undefined,
  isDraft: false,
  views: 0,
  likes: 0
});

// Gêneros disponíveis
const availableGenres = ref([
  'Ação', 'Aventura', 'Comédia', 'Drama', 'Fantasia', 'Horror', 'Mistério', 'Romance', 
  'Sci-Fi', 'Slice of Life', 'Esportes', 'Sobrenatural', 'Mecha', 'Histórico', 'Psicológico', 'Thriller'
]);

// Classificações etárias
const ageRatings = ref([
  { value: 'L', label: 'Livre', age: '0' },
  { value: '10+', label: '10 anos', age: '10' },
  { value: '12+', label: '12 anos', age: '12' },
  { value: '14+', label: '14 anos', age: '14' },
  { value: '16+', label: '16 anos', age: '16' },
  { value: '18+', label: '18 anos', age: '18' }
]);

// Validações
const canProceedToStep2 = computed(() => {
  return (
    mangaData.value.title.trim() !== '' &&
    mangaData.value.author.trim() !== '' &&
    mangaData.value.synopsis.trim().length >= 100 &&
    mangaData.value.genres.length > 0 &&
    mangaData.value.cover !== '' &&
    mangaData.value.type !== '' &&
    mangaData.value.status !== ''
  );
});

// Funções do Step 1
const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleCoverUpload = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      mangaData.value.cover = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }
};

const changeCover = () => {
  triggerFileInput();
};

const toggleGenre = (genre: string) => {
  const index = mangaData.value.genres.indexOf(genre);
  if (index > -1) {
    mangaData.value.genres.splice(index, 1);
  } else {
    if (mangaData.value.genres.length < 5) {
      mangaData.value.genres.push(genre);
    } else {
      showToast('Máximo de 5 gêneros permitidos', 'warning');
    }
  }
};

const removeGenre = (genre: string) => {
  const index = mangaData.value.genres.indexOf(genre);
  if (index > -1) {
    mangaData.value.genres.splice(index, 1);
  }
};

const addTag = () => {
  if (newTag.value.trim() !== '' && !mangaData.value.tags.includes(newTag.value.trim())) {
    mangaData.value.tags.push(newTag.value.trim());
    newTag.value = '';
  }
};

const removeTag = (tag: string) => {
  const index = mangaData.value.tags.indexOf(tag);
  if (index > -1) {
    mangaData.value.tags.splice(index, 1);
  }
};

// Funções do Step 2
const addChapter = () => {
  const newChapterNumber = mangaData.value.chapters.length + 1;
  mangaData.value.chapters.push({
    number: newChapterNumber,
    title: `Capítulo ${newChapterNumber}`,
    pages: [],
    createdAt: new Date().toISOString()
  });
  
  editingChapterIndex.value = mangaData.value.chapters.length - 1;
};

const editChapter = (index: number) => {
  editingChapterIndex.value = index;
};

const saveChapterEdit = (index: number) => {
  if (!mangaData.value.chapters[index].number || !mangaData.value.chapters[index].title) {
    showToast('Preencha todos os campos do capítulo', 'warning');
    return;
  }
  editingChapterIndex.value = null;
  showToast('Capítulo atualizado com sucesso!', 'success');
};

const cancelEdit = () => {
  editingChapterIndex.value = null;
};

const deleteChapter = async (index: number) => {
  const toast = await toastController.create({
    message: 'Tem certeza que deseja excluir este capítulo?',
    buttons: [
      { text: 'Cancelar', role: 'cancel' },
      { 
        text: 'Excluir', 
        handler: () => {
          mangaData.value.chapters.splice(index, 1);
          showToast('Capítulo excluído', 'success');
        } 
      }
    ]
  });
  await toast.present();
};

// Funções do Step 3
const getTypeLabel = (type: string) => {
  const types: Record<string, string> = {
    'mangá': 'Mangá',
    'manhwa': 'Manhwa',
    'manhua': 'Manhua',
    'webtoon': 'Webtoon'
  };
  return types[type] || type;
};

const getStatusLabel = (status: string) => {
  const statuses: Record<string, string> = {
    'em-andamento': 'Em andamento',
    'completo': 'Completo',
    'hiato': 'Hiato',
    'cancelado': 'Cancelado'
  };
  return statuses[status] || status;
};

const publishManga = async () => {
  isPublishing.value = true;
  try {
    // Simular publicação
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Preparar dados do mangá
    const finalMangaData: MangaData = {
      ...mangaData.value,
      userId: user.value?.id,
      publishedAt: new Date().toISOString(),
      isDraft: publishAsDraft.value,
      views: mangaData.value.views || 0,
      likes: mangaData.value.likes || 0
    };
    
    // Se for uma edição, atualiza o mangá existente
    if (mangaData.value.id) {
      updateManga(finalMangaData);
    } else {
      // Se for um novo mangá, adiciona um ID e salva
      finalMangaData.id = Date.now(); // Gerar um ID único
      const currentMangas = JSON.parse(localStorage.getItem('publishedMangas') || '[]');
      currentMangas.push(finalMangaData);
      localStorage.setItem('publishedMangas', JSON.stringify(currentMangas));
    }
    
    // Criar arquivo Vue para o mangá (somente se não for rascunho)
    if (!publishAsDraft.value) {
      const fileCreated = await createMangaFile(finalMangaData);
      if (fileCreated) {
        console.log('Manga file created successfully');
      }
    }
    
    loadAllMangasFromLocalStorage(); // Recarrega os dados no composable
    
    await showToast(
      publishAsDraft.value ? 'Rascunho salvo com sucesso!' : 'Mangá publicado com sucesso!',
      'success'
    );
    
    // Redirecionar para a página do mangá ou dashboard
    router.push('/dashboard'); // Redireciona para o dashboard após publicar/salvar
  } catch (error) {
    console.error('Erro ao publicar mangá:', error);
    await showToast('Erro ao publicar mangá', 'danger');
  } finally {
    isPublishing.value = false;
  }
};

// Funções auxiliares
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('pt-BR');
};

const nextStep = () => {
  if (currentStep.value < 3) {
    currentStep.value++;
  }
};

const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--;
  }
};

const showToast = async (message: string, color: string = 'primary') => {
  const toast = await toastController.create({
    message,
    duration: 2000,
    color: color as any,
    position: 'top'
  });
  await toast.present();
};
</script>