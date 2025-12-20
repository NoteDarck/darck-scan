<template>
  <ion-page>
    <ion-header>
      <ion-toolbar class="dark-toolbar">
        <ion-buttons slot="start">
          <ion-back-button default-href="/dashboard" text="Voltar" color="light"></ion-back-button>
        </ion-buttons>
        <ion-title>Publicar Mangá</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="publish-content">
      <div class="publish-container">
        <div class="publish-form">
          <h2 class="form-title">Informações do Mangá</h2>
          <p class="form-subtitle">Preencha os dados da sua obra</p>

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
              <ion-label position="floating">Nome do Autor/Scan *</ion-label>
              <ion-input v-model="mangaData.author" type="text" required placeholder="Seu nome ou nome do grupo"></ion-input>
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

          <!-- Opções de Publicação -->
          <div class="form-section">
            <label class="section-label">Opções de Publicação</label>
            <div class="publication-options">
              <ion-item class="option-item">
                <ion-label>Publicar como rascunho</ion-label>
                <ion-toggle v-model="publishAsDraft" :checked="publishAsDraft"></ion-toggle>
              </ion-item>
              <ion-item class="option-item">
                <ion-label>Permitir comentários</ion-label>
                <ion-toggle v-model="allowComments" :checked="allowComments"></ion-toggle>
              </ion-item>
            </div>
          </div>

          <!-- Ações -->
          <div class="form-actions">
            <ion-button expand="block" @click="publishManga" :disabled="isPublishing || !canPublish" class="publish-btn">
              <ion-spinner v-if="isPublishing" name="crescent"></ion-spinner>
              <span v-else>{{ publishAsDraft ? 'Salvar Rascunho' : 'Publicar Mangá' }}</span>
            </ion-button>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonBackButton, IonButtons, IonItem, IonInput, IonLabel, IonIcon, IonSelect, IonSelectOption, IonToggle, IonSpinner, toastController } from '@ionic/vue';
import { add, image } from 'ionicons/icons';
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
      } else {
        showToast('Mangá não encontrado para edição.', 'danger');
        router.replace('/publish');
      }
    } else if (draftMangaId) {
      const draftToEdit = getMangaById(draftMangaId);
      if (draftToEdit) {
        mangaData.value = { ...draftToEdit };
        publishAsDraft.value = true;
      } else {
        showToast('Rascunho não encontrado.', 'danger');
        router.replace('/publish');
      }
    }
  }
});

// Estado do formulário
const fileInput = ref<HTMLInputElement | null>(null);
const newTag = ref('');
const isPublishing = ref(false);
const publishAsDraft = ref(false);
const allowComments = ref(true);

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
  'Sci-Fi', 'Slice of Life', 'Esportes', 'Sobrenatural', 'Mecha', 'Histórico', 'Psicológico', 'Thriller',
  'Shounen', 'Shoujo', 'Seinen', 'Josei', 'Yaoi', 'Yuri', 'Harem', 'Isekai', 'Reencarnação', 'Sistema'
]);

// Validação
const canPublish = computed(() => {
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

// Funções
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

const publishManga = async () => {
  isPublishing.value = true;
  try {
    // Simular publicação
    await new Promise(resolve => setTimeout(resolve, 1500));
    
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
      finalMangaData.id = Date.now();
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
    
    loadAllMangasFromLocalStorage();
    
    await showToast(
      publishAsDraft.value ? 'Rascunho salvo com sucesso!' : 'Mangá publicado com sucesso!',
      'success'
    );
    
    // Redirecionar para o dashboard
    router.push('/dashboard');
  } catch (error) {
    console.error('Erro ao publicar mangá:', error);
    await showToast('Erro ao publicar mangá', 'danger');
  } finally {
    isPublishing.value = false;
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

<style scoped>
.publish-content {
  --background: linear-gradient(135deg, #000000 0%, #1a0000 100%);
}

.publish-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
}

.publish-form {
  background: rgba(20, 20, 20, 0.8);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 2rem;
  border: 1px solid rgba(255, 0, 0, 0.2);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
}

.form-title {
  color: white;
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.form-subtitle {
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 2rem;
}

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

/* Opções de Publicação */
.publication-options {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 1rem;
}

.option-item {
  --background: transparent;
  --border-color: transparent;
  --color: white;
}

/* Ações */
.form-actions {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.publish-btn {
  --background: #ff0000;
  --background-hover: #b30000;
  --color: white;
  --border-radius: 12px;
  height: 56px;
  font-weight: 600;
  font-size: 1.1rem;
}

/* Responsividade */
@media (max-width: 768px) {
  .publish-container {
    padding: 0.5rem;
  }
  
  .publish-form {
    padding: 1.5rem;
  }
  
  .form-row {
    flex-direction: column;
    gap: 1rem;
  }
}

@media (max-width: 480px) {
  .publish-form {
    padding: 1rem;
  }
  
  .form-title {
    font-size: 1.5rem;
  }
}
</style>