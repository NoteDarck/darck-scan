<template>
  <ion-page>
    <ion-header>
      <ion-toolbar class="dark-toolbar">
        <ion-buttons slot="start">
          <ion-back-button default-href="/dashboard" text="Voltar" color="light"></ion-back-button>
        </ion-buttons>
        <ion-title>{{ isEditing ? 'Editar Mangá' : 'Publicar Mangá' }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="publish-content">
      <div class="publish-container">
        <!-- Progress Steps -->
        <div class="progress-steps">
          <div class="step" :class="{ 'active': currentStep === 1, 'completed': currentStep > 1 }">
            <div class="step-number">1</div>
            <div class="step-label">Informações</div>
          </div>
          <div class="step-line" :class="{ 'active': currentStep > 1 }"></div>
          <div class="step" :class="{ 'active': currentStep === 2 }">
            <div class="step-number">2</div>
            <div class="step-label">Publicar</div>
          </div>
        </div>

        <!-- Step 1: Informações Básicas -->
        <div v-if="currentStep === 1" class="step-content">
          <h2 class="step-title">{{ isEditing ? 'Editar Mangá' : 'Novo Mangá' }}</h2>
          <p class="step-subtitle">Preencha as informações da sua obra</p>
          
          <form class="publish-form" @submit.prevent="saveMangaInfo">
            <!-- Upload da Capa -->
            <div class="form-section">
              <label class="section-label">Capa do Mangá *</label>
              <div class="cover-upload" @click="triggerFileInput">
                <div v-if="!mangaData.cover" class="upload-placeholder">
                  <ion-icon :icon="image" class="upload-icon"></ion-icon>
                  <p>Clique para fazer upload</p>
                  <p class="upload-hint">Recomendado: 600x800px, JPG ou PNG</p>
                </div>
                <div v-else class="cover-preview">
                  <img :src="mangaData.cover" alt="Preview da capa" class="cover-image" />
                  <button type="button" class="change-cover" @click.stop="changeCover">
                    Alterar
                  </button>
                </div>
                <input ref="fileInput" type="file" accept="image/*" @change="handleCoverUpload" style="display: none;" />
              </div>
            </div>

            <!-- Título e Autor -->
            <div class="form-section">
              <ion-item class="form-item" fill="outline">
                <ion-label position="floating">Título do Mangá *</ion-label>
                <ion-input v-model="mangaData.title" type="text" required placeholder="Ex: Solo Leveling"></ion-input>
              </ion-item>
            </div>

            <div class="form-section">
              <ion-item class="form-item" fill="outline">
                <ion-label position="floating">Nome do Autor *</ion-label>
                <ion-input v-model="mangaData.author" type="text" required placeholder="Autor da obra"></ion-input>
              </ion-item>
            </div>

            <!-- Sinopse -->
            <div class="form-section">
              <label class="section-label">Sinopse *</label>
              <textarea v-model="mangaData.synopsis" class="synopsis-input" rows="6" placeholder="Descreva a história do seu mangá... (mínimo 100 caracteres)" required></textarea>
              <div class="char-count">{{ mangaData.synopsis.length }}/2000</div>
            </div>

            <!-- Gêneros -->
            <div class="form-section">
              <label class="section-label">Gêneros *</label>
              <div class="genres-container">
                <div v-for="genre in availableGenres" :key="genre" class="genre-option" :class="{ 'selected': mangaData.genres.includes(genre) }" @click="toggleGenre(genre)">
                  {{ genre }}
                </div>
              </div>
              <div class="selected-genres" v-if="mangaData.genres.length > 0">
                <span class="selected-label">Selecionados: </span>
                <span v-for="genre in mangaData.genres" :key="genre" class="selected-tag">
                  {{ genre }}
                  <button type="button" @click="removeGenre(genre)" class="remove-genre">×</button>
                </span>
              </div>
            </div>

            <!-- Status e Tipo -->
            <div class="form-row">
              <div class="form-section half">
                <label class="section-label">Status *</label>
                <ion-select v-model="mangaData.status" placeholder="Selecione" class="form-select">
                  <ion-select-option value="em-andamento">Em andamento</ion-select-option>
                  <ion-select-option value="completo">Completo</ion-select-option>
                  <ion-select-option value="hiato">Hiato</ion-select-option>
                  <ion-select-option value="cancelado">Cancelado</ion-select-option>
                </ion-select>
              </div>
              <div class="form-section half">
                <label class="section-label">Tipo *</label>
                <ion-select v-model="mangaData.type" placeholder="Selecione" class="form-select">
                  <ion-select-option value="mangá">Mangá</ion-select-option>
                  <ion-select-option value="manhwa">Manhwa</ion-select-option>
                  <ion-select-option value="manhua">Manhua</ion-select-option>
                  <ion-select-option value="webtoon">Webtoon</ion-select-option>
                </ion-select>
              </div>
            </div>

            <!-- Tags -->
            <div class="form-section">
              <label class="section-label">Tags (opcional)</label>
              <div class="tags-input">
                <input v-model="newTag" type="text" placeholder="Adicione uma tag e pressione Enter" @keydown.enter="addTag" class="tag-input" />
                <button type="button" @click="addTag" class="add-tag-btn">
                  <ion-icon :icon="add"></ion-icon>
                </button>
              </div>
              <div class="tags-container" v-if="mangaData.tags.length > 0">
                <div v-for="tag in mangaData.tags" :key="tag" class="tag-item">
                  {{ tag }}
                  <button type="button" @click="removeTag(tag)" class="remove-tag">×</button>
                </div>
              </div>
            </div>

            <!-- Idade Recomendada -->
            <div class="form-section">
              <label class="section-label">Classificação Etária</label>
              <div class="age-rating">
                <div v-for="rating in ageRatings" :key="rating.value" class="rating-option" :class="{ 'selected': mangaData.ageRating === rating.value }" @click="mangaData.ageRating = rating.value">
                  <span class="rating-label">{{ rating.label }}</span>
                  <span class="rating-age">{{ rating.age }}+</span>
                </div>
              </div>
            </div>

            <div class="step-actions">
              <ion-button expand="block" type="submit" :disabled="!canSaveInfo">
                {{ isEditing ? 'Salvar Alterações' : 'Continuar para Publicação' }}
                <ion-icon :icon="arrowForward" slot="end"></ion-icon>
              </ion-button>
            </div>
          </form>
        </div>

        <!-- Step 2: Gerenciamento de Capítulos -->
        <div v-if="currentStep === 2" class="step-content">
          <div class="manga-header">
            <div class="manga-info-preview">
              <img :src="mangaData.cover || 'https://via.placeholder.com/100x150'" alt="Capa" class="manga-cover-small" />
              <div class="manga-details">
                <h2>{{ mangaData.title }}</h2>
                <p class="manga-author">Por: {{ mangaData.author }}</p>
                <div class="manga-meta">
                  <span class="meta-item">{{ getTypeLabel(mangaData.type) }}</span>
                  <span class="meta-item">{{ getStatusLabel(mangaData.status) }}</span>
                  <span class="meta-item">{{ mangaData.chapters.length }} capítulos</span>
                </div>
              </div>
            </div>
          </div>

          <div class="chapters-section">
            <div class="chapters-header">
              <h3>Gerenciar Capítulos</h3>
              <ion-button @click="openAddChapter" size="small" class="add-chapter-btn">
                <ion-icon :icon="add" slot="start"></ion-icon>
                Adicionar Capítulo
              </ion-button>
            </div>

            <!-- Lista de Capítulos -->
            <div v-if="mangaData.chapters.length > 0" class="chapters-list">
              <div v-for="(chapter, index) in mangaData.chapters" :key="index" class="chapter-item">
                <div class="chapter-info">
                  <div class="chapter-main">
                    <span class="chapter-number">Capítulo {{ chapter.number }}</span>
                    <span class="chapter-title">{{ chapter.title }}</span>
                    <span class="chapter-pages">{{ chapter.pages.length }} páginas</span>
                  </div>
                  <div class="chapter-actions">
                    <span class="chapter-date">{{ formatDate(chapter.createdAt) }}</span>
                    <button @click="editChapter(index)" class="action-btn">
                      <ion-icon :icon="create"></ion-icon>
                      Editar
                    </button>
                    <button @click="deleteChapter(index)" class="action-btn delete">
                      <ion-icon :icon="trash"></ion-icon>
                      Excluir
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Sem capítulos -->
            <div v-else class="no-chapters">
              <ion-icon :icon="documentText" class="no-chapters-icon"></ion-icon>
              <p>Nenhum capítulo adicionado ainda</p>
              <p class="no-chapters-hint">Clique em "Adicionar Capítulo" para começar</p>
            </div>
          </div>

          <div class="step-actions">
            <div class="action-buttons">
              <ion-button fill="outline" @click="currentStep = 1">
                <ion-icon :icon="arrowBack" slot="start"></ion-icon>
                Voltar para Informações
              </ion-button>
              <ion-button @click="viewMangaPage" fill="outline">
                <ion-icon :icon="eye" slot="start"></ion-icon>
                Visualizar Página
              </ion-button>
            </div>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonBackButton, IonButtons, IonItem, IonInput, IonLabel, IonIcon, IonSelect, IonSelectOption, IonSpinner, toastController, modalController } from '@ionic/vue';
import { arrowBack, arrowForward, add, image, create, trash, documentText, eye } from 'ionicons/icons';
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuth } from '@/composables/useAuth';
import { useMangaData } from '@/composables/useMangaData';
import { MangaData } from '@/types/manga';
import { createMangaFile } from '@/utils/mangaFileGenerator';
import ChapterEditorModal from '@/components/ChapterEditorModal.vue';

const router = useRouter();
const route = useRoute();
const { isAuthenticated, user } = useAuth();
const { allStoredMangas, updateManga, getMangaById, loadAllMangasFromLocalStorage } = useMangaData();

const currentStep = ref(1);
const fileInput = ref<HTMLInputElement | null>(null);
const newTag = ref('');
const isPublishing = ref(false);
const isEditing = ref(false);

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

const availableGenres = ref([
  'Ação', 'Aventura', 'Comédia', 'Drama', 'Fantasia', 'Horror', 'Mistério', 'Romance', 
  'Sci-Fi', 'Slice of Life', 'Esportes', 'Sobrenatural', 'Mecha', 'Histórico', 'Psicológico', 'Thriller'
]);

const ageRatings = ref([
  { value: 'L', label: 'Livre', age: '0' },
  { value: '10+', label: '10 anos', age: '10' },
  { value: '12+', label: '12 anos', age: '12' },
  { value: '14+', label: '14 anos', age: '14' },
  { value: '16+', label: '16 anos', age: '16' },
  { value: '18+', label: '18 anos', age: '18' }
]);

const canSaveInfo = computed(() => {
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

onMounted(() => {
  if (!isAuthenticated.value) {
    setTimeout(() => {
      router.push('/login');
    }, 100);
    return;
  }

  const editMangaId = route.query.edit ? parseInt(route.query.edit as string) : null;
  const draftMangaId = route.query.draft ? parseInt(route.query.draft as string) : null;
  
  if (editMangaId) {
    const mangaToEdit = getMangaById(editMangaId);
    if (mangaToEdit && mangaToEdit.userId === user.value?.id) {
      mangaData.value = { ...mangaToEdit };
      isEditing.value = true;
      currentStep.value = 2; // Vai direto para gerenciamento de capítulos
    } else {
      showToast('Mangá não encontrado ou você não tem permissão para editá-lo.', 'danger');
      router.replace('/dashboard');
    }
  } else if (draftMangaId) {
    const draftToEdit = getMangaById(draftMangaId);
    if (draftToEdit && draftToEdit.userId === user.value?.id) {
      mangaData.value = { ...draftToEdit };
      isEditing.value = true;
      currentStep.value = 1;
    } else {
      showToast('Rascunho não encontrado.', 'danger');
      router.replace('/dashboard');
    }
  }
});

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
    mangaData.value.genres.push(genre);
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

const saveMangaInfo = async () => {
  try {
    if (!canSaveInfo.value) {
      showToast('Preencha todos os campos obrigatórios', 'warning');
      return;
    }

    // Se for edição, atualiza o mangá existente
    if (mangaData.value.id) {
      updateManga(mangaData.value);
      showToast('Informações salvas com sucesso!', 'success');
    } else {
      // Se for novo, cria o mangá
      mangaData.value.id = Date.now();
      mangaData.value.userId = user.value?.id;
      mangaData.value.publishedAt = new Date().toISOString();
      
      const currentMangas = JSON.parse(localStorage.getItem('publishedMangas') || '[]');
      currentMangas.push(mangaData.value);
      localStorage.setItem('publishedMangas', JSON.stringify(currentMangas));
      loadAllMangasFromLocalStorage();
      
      showToast('Mangá criado com sucesso!', 'success');
      isEditing.value = true;
    }

    // Criar/atualizar arquivo Vue
    const fileCreated = await createMangaFile(mangaData.value);
    if (fileCreated) {
      console.log('Manga file created/updated successfully');
    }

    currentStep.value = 2;
  } catch (error) {
    console.error('Erro ao salvar mangá:', error);
    showToast('Erro ao salvar mangá', 'danger');
  }
};

const openAddChapter = async () => {
  const modal = await modalController.create({
    component: ChapterEditorModal,
    componentProps: {
      mangaId: mangaData.value.id,
      chapterNumber: mangaData.value.chapters.length + 1
    }
  });

  modal.present();

  const { data } = await modal.onDidDismiss();
  if (data && data.chapter) {
    mangaData.value.chapters.push(data.chapter);
    updateManga(mangaData.value);
    showToast('Capítulo adicionado com sucesso!', 'success');
  }
};

const editChapter = async (index: number) => {
  const chapter = mangaData.value.chapters[index];
  
  const modal = await modalController.create({
    component: ChapterEditorModal,
    componentProps: {
      mangaId: mangaData.value.id,
      chapter: chapter,
      isEditing: true
    }
  });

  modal.present();

  const { data } = await modal.onDidDismiss();
  if (data && data.chapter) {
    mangaData.value.chapters[index] = data.chapter;
    updateManga(mangaData.value);
    showToast('Capítulo atualizado com sucesso!', 'success');
  }
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
          updateManga(mangaData.value);
          showToast('Capítulo excluído', 'success');
        } 
      }
    ]
  });
  await toast.present();
};

const viewMangaPage = () => {
  if (mangaData.value.id) {
    router.push(`/manga/${mangaData.value.id}`);
  } else {
    showToast('Mangá ainda não foi salvo', 'warning');
  }
};

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

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('pt-BR');
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

<style scoped>
.publish-content {
  --background: linear-gradient(135deg, #000000 0%, #1a0000 100%);
}

.publish-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
}

/* Progress Steps */
.progress-steps {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 2rem;
  padding: 0 1rem;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 1;
}

.step-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.2rem;
  border: 2px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.step.active .step-number {
  background: #ff0000;
  color: white;
  border-color: #ff0000;
  box-shadow: 0 0 0 4px rgba(255, 0, 0, 0.2);
}

.step.completed .step-number {
  background: #00ff00;
  color: #000;
  border-color: #00ff00;
}

.step-label {
  margin-top: 0.5rem;
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.85rem;
  font-weight: 500;
}

.step.active .step-label {
  color: white;
}

.step-line {
  flex: 1;
  height: 2px;
  background: rgba(255, 255, 255, 0.2);
  margin: 0 10px;
  max-width: 100px;
}

.step-line.active {
  background: #ff0000;
}

/* Step Content */
.step-content {
  background: rgba(20, 20, 20, 0.8);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 2rem;
  border: 1px solid rgba(255, 0, 0, 0.2);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
}

.step-title {
  color: white;
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.step-subtitle {
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 2rem;
}

/* Formulário */
.form-section {
  margin-bottom: 1.5rem;
}

.section-label {
  display: block;
  color: white;
  margin-bottom: 0.5rem;
  font-weight: 600;
  font-size: 1rem;
}

.form-item {
  --background: rgba(255, 255, 255, 0.05);
  --border-color: rgba(255, 255, 255, 0.1);
  --color: white;
  --highlight-color-focused: #ff0000;
  border-radius: 12px;
  margin: 0;
}

.form-item.ion-focused {
  --border-color: #ff0000;
  --box-shadow: 0 0 0 2px rgba(255, 0, 0, 0.2);
}

/* Upload da Capa */
.cover-upload {
  border: 2px dashed rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.02);
}

.cover-upload:hover {
  border-color: #ff0000;
  background: rgba(255, 0, 0, 0.05);
}

.upload-placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.upload-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #ff0000;
}

.upload-hint {
  font-size: 0.85rem;
  margin-top: 0.5rem;
  color: rgba(255, 255, 255, 0.4);
}

.cover-preview {
  position: relative;
}

.cover-image {
  max-width: 200px;
  max-height: 300px;
  border-radius: 8px;
  margin: 0 auto;
  display: block;
}

.change-cover {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: background 0.3s ease;
}

.change-cover:hover {
  background: rgba(255, 0, 0, 0.8);
}

/* Sinopse */
.synopsis-input {
  width: 100%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: white;
  padding: 1rem;
  font-size: 1rem;
  resize: vertical;
  font-family: inherit;
}

.synopsis-input:focus {
  outline: none;
  border-color: #ff0000;
  box-shadow: 0 0 0 2px rgba(255, 0, 0, 0.2);
}

.char-count {
  text-align: right;
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.85rem;
  margin-top: 0.5rem;
}

/* Gêneros */
.genres-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.genre-option {
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.genre-option:hover {
  background: rgba(255, 0, 0, 0.1);
  border-color: rgba(255, 0, 0, 0.3);
}

.genre-option.selected {
  background: #ff0000;
  color: white;
  border-color: #ff0000;
}

.selected-genres {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
}

.selected-label {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
}

.selected-tag {
  background: rgba(255, 0, 0, 0.2);
  color: white;
  padding: 4px 12px;
  border-radius: 15px;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 5px;
}

.remove-genre {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 1.2rem;
  line-height: 1;
  padding: 0;
}

.remove-genre:hover {
  color: #ff0000;
}

/* Tags */
.tags-input {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.tag-input {
  flex: 1;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: white;
  padding: 0.75rem 1rem;
  font-size: 1rem;
}

.tag-input:focus {
  outline: none;
  border-color: #ff0000;
}

.add-tag-btn {
  background: #ff0000;
  color: white;
  border: none;
  border-radius: 12px;
  width: 44px;
  height: 44px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.3s ease;
}

.add-tag-btn:hover {
  background: #b30000;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag-item {
  background: rgba(255, 0, 0, 0.2);
  color: white;
  padding: 6px 12px;
  border-radius: 15px;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 5px;
}

.remove-tag {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 1.2rem;
  line-height: 1;
  padding: 0;
}

.remove-tag:hover {
  color: #ff0000;
}

/* Classificação Etária */
.age-rating {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 0.5rem;
}

.rating-option {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.rating-option:hover {
  background: rgba(255, 0, 0, 0.1);
  border-color: rgba(255, 0, 0, 0.3);
}

.rating-option.selected {
  background: #ff0000;
  border-color: #ff0000;
}

.rating-label {
  display: block;
  color: white;
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
}

.rating-age {
  display: block;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.85rem;
}

.rating-option.selected .rating-label,
.rating-option.selected .rating-age {
  color: white;
}

/* Layout de Linha */
.form-row {
  display: flex;
  gap: 1rem;
}

.form-section.half {
  flex: 1;
}

.form-select {
  --background: rgba(255, 255, 255, 0.05);
  --color: white;
  --border-color: rgba(255, 255, 255, 0.1);
  --border-radius: 12px;
  width: 100%;
}

/* Step 2: Gerenciamento de Capítulos */
.manga-header {
  background: rgba(255, 0, 0, 0.1);
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  border: 1px solid rgba(255, 0, 0, 0.2);
}

.manga-info-preview {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

.manga-cover-small {
  width: 100px;
  height: 150px;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
}

.manga-details {
  flex: 1;
}

.manga-details h2 {
  color: white;
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
}

.manga-author {
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 1rem 0;
}

.manga-meta {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.meta-item {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  padding: 4px 12px;
  border-radius: 15px;
  font-size: 0.85rem;
}

.chapters-section {
  margin-bottom: 2rem;
}

.chapters-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.chapters-header h3 {
  color: white;
  margin: 0;
}

.add-chapter-btn {
  --background: #ff0000;
  --background-hover: #b30000;
  --color: white;
}

.chapters-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.chapter-item {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1rem;
  transition: all 0.3s ease;
}

.chapter-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chapter-main {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.chapter-number {
  color: #ff0000;
  font-weight: 600;
  font-size: 1.1rem;
}

.chapter-title {
  color: white;
  font-size: 0.95rem;
}

.chapter-pages {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.85rem;
}

.chapter-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.chapter-date {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.85rem;
}

.action-btn {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  font-size: 0.9rem;
  padding: 6px 12px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.action-btn:hover {
  color: white;
  background: rgba(255, 255, 255, 0.1);
}

.action-btn.delete:hover {
  color: #ff0000;
  background: rgba(255, 0, 0, 0.1);
}

/* Sem capítulos */
.no-chapters {
  text-align: center;
  padding: 3rem;
  color: rgba(255, 255, 255, 0.5);
}

.no-chapters-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  color: rgba(255, 255, 255, 0.2);
}

.no-chapters-hint {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.4);
}

/* Step Actions */
.step-actions {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.action-buttons {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

/* Botões de Navegação */
ion-button {
  --border-radius: 12px;
  font-weight: 600;
}

/* Responsividade */
@media (max-width: 768px) {
  .publish-container {
    padding: 0.5rem;
  }
  
  .step-content {
    padding: 1.5rem;
  }
  
  .form-row {
    flex-direction: column;
    gap: 1rem;
  }
  
  .manga-info-preview {
    flex-direction: column;
    text-align: center;
  }
  
  .chapter-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .chapter-actions {
    width: 100%;
    justify-content: space-between;
  }
  
  .action-buttons {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .progress-steps {
    padding: 0;
  }
  
  .step-label {
    font-size: 0.75rem;
  }
  
  .step-number {
    width: 32px;
    height: 32px;
    font-size: 1rem;
  }
  
  .step-content {
    padding: 1rem;
  }
  
  .step-title {
    font-size: 1.5rem;
  }
}
</style>