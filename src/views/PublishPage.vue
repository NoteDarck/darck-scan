<template>
  <ion-page>
    <ion-header>
      <ion-toolbar class="dark-toolbar">
        <ion-buttons slot="start">
          <ion-back-button default-href="/" text="Voltar" color="light"></ion-back-button>
        </ion-buttons>
        <ion-title>Publicar Manga</ion-title>
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
          <div class="step" :class="{ 'active': currentStep === 2, 'completed': currentStep > 2 }">
            <div class="step-number">2</div>
            <div class="step-label">Capítulos</div>
          </div>
          <div class="step-line" :class="{ 'active': currentStep > 2 }"></div>
          <div class="step" :class="{ 'active': currentStep === 3 }">
            <div class="step-number">3</div>
            <div class="step-label">Revisão</div>
          </div>
        </div>

        <!-- Step 1: Informações Básicas -->
        <div v-if="currentStep === 1" class="step-content">
          <h2 class="step-title">Informações do Mangá</h2>
          <p class="step-subtitle">Preencha os dados básicos da sua obra</p>

          <form class="publish-form">
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
                <input 
                  ref="fileInput"
                  type="file" 
                  accept="image/*" 
                  @change="handleCoverUpload"
                  style="display: none;"
                />
              </div>
            </div>

            <!-- Título e Autor -->
            <div class="form-section">
              <ion-item class="form-item" fill="outline">
                <ion-label position="floating">Título do Mangá *</ion-label>
                <ion-input 
                  v-model="mangaData.title"
                  type="text" 
                  required
                  placeholder="Ex: Aventuras no Mundo dos Sonhos"
                ></ion-input>
              </ion-item>
            </div>

            <div class="form-section">
              <ion-item class="form-item" fill="outline">
                <ion-label position="floating">Nome do Autor *</ion-label>
                <ion-input 
                  v-model="mangaData.author"
                  type="text" 
                  required
                  placeholder="Seu nome ou pseudônimo"
                ></ion-input>
              </ion-item>
            </div>

            <!-- Sinopse -->
            <div class="form-section">
              <label class="section-label">Sinopse *</label>
              <textarea 
                v-model="mangaData.synopsis"
                class="synopsis-input"
                rows="6"
                placeholder="Descreva a história do seu mangá... (mínimo 100 caracteres)"
                required
              ></textarea>
              <div class="char-count">{{ mangaData.synopsis.length }}/2000</div>
            </div>

            <!-- Gêneros -->
            <div class="form-section">
              <label class="section-label">Gêneros * (Máx. 5)</label>
              <div class="genres-container">
                <div 
                  v-for="genre in availableGenres" 
                  :key="genre"
                  class="genre-option"
                  :class="{ 'selected': mangaData.genres.includes(genre) }"
                  @click="toggleGenre(genre)"
                >
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
                <ion-select 
                  v-model="mangaData.status"
                  placeholder="Selecione"
                  class="form-select"
                >
                  <ion-select-option value="em-andamento">Em andamento</ion-select-option>
                  <ion-select-option value="completo">Completo</ion-select-option>
                  <ion-select-option value="hiato">Hiato</ion-select-option>
                  <ion-select-option value="cancelado">Cancelado</ion-select-option>
                </ion-select>
              </div>

              <div class="form-section half">
                <label class="section-label">Tipo *</label>
                <ion-select 
                  v-model="mangaData.type"
                  placeholder="Selecione"
                  class="form-select"
                >
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
                <input 
                  v-model="newTag"
                  type="text" 
                  placeholder="Adicione uma tag e pressione Enter"
                  @keydown.enter="addTag"
                  class="tag-input"
                />
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
                <div 
                  v-for="rating in ageRatings" 
                  :key="rating.value"
                  class="rating-option"
                  :class="{ 'selected': mangaData.ageRating === rating.value }"
                  @click="mangaData.ageRating = rating.value"
                >
                  <span class="rating-label">{{ rating.label }}</span>
                  <span class="rating-age">{{ rating.age }}+</span>
                </div>
              </div>
            </div>
          </form>

          <div class="step-actions">
            <ion-button expand="block" @click="nextStep" :disabled="!canProceedToStep2">
              Continuar para Capítulos
              <ion-icon :icon="arrowForward" slot="end"></ion-icon>
            </ion-button>
          </div>
        </div>

        <!-- Step 2: Capítulos -->
        <div v-if="currentStep === 2" class="step-content">
          <h2 class="step-title">Capítulos</h2>
          <p class="step-subtitle">Adicione os capítulos do seu mangá</p>

          <div class="chapters-section">
            <div class="chapters-header">
              <h3>Capítulos Publicados</h3>
              <ion-button @click="addChapter" size="small" class="add-chapter-btn">
                <ion-icon :icon="add" slot="start"></ion-icon>
                Novo Capítulo
              </ion-button>
            </div>

            <!-- Lista de Capítulos -->
            <div v-if="mangaData.chapters.length > 0" class="chapters-list">
              <div 
                v-for="(chapter, index) in mangaData.chapters" 
                :key="index"
                class="chapter-item"
                :class="{ 'editing': editingChapterIndex === index }"
              >
                <div v-if="editingChapterIndex !== index" class="chapter-info">
                  <div class="chapter-main">
                    <span class="chapter-number">Capítulo {{ chapter.number }}</span>
                    <span class="chapter-title">{{ chapter.title }}</span>
                  </div>
                  <div class="chapter-actions">
                    <span class="chapter-date">{{ formatDate(chapter.createdAt) }}</span>
                    <button @click="editChapter(index)" class="action-btn">
                      <ion-icon :icon="create"></ion-icon>
                    </button>
                    <button @click="deleteChapter(index)" class="action-btn delete">
                      <ion-icon :icon="trash"></ion-icon>
                    </button>
                  </div>
                </div>

                <!-- Edição do Capítulo -->
                <div v-else class="chapter-edit">
                  <div class="edit-form">
                    <div class="form-group">
                      <label>Número do Capítulo</label>
                      <input 
                        v-model="chapter.number"
                        type="number" 
                        min="1"
                        class="form-control"
                      />
                    </div>
                    <div class="form-group">
                      <label>Título do Capítulo</label>
                      <input 
                        v-model="chapter.title"
                        type="text" 
                        class="form-control"
                        placeholder="Ex: O início da jornada"
                      />
                    </div>
                    <div class="form-group">
                      <label>Conteúdo (URLs das páginas)</label>
                      <div class="pages-input">
                        <div v-for="(page, pageIndex) in chapter.pages" :key="pageIndex" class="page-item">
                          <input 
                            v-model="chapter.pages[pageIndex]"
                            type="text" 
                            placeholder="URL da página"
                            class="page-url"
                          />
                          <button @click="removePage(chapter, pageIndex)" class="remove-page">×</button>
                        </div>
                        <button @click="addPage(chapter)" class="add-page-btn">
                          <ion-icon :icon="add"></ion-icon> Adicionar Página
                        </button>
                      </div>
                    </div>
                    <div class="edit-actions">
                      <button @click="saveChapterEdit(index)" class="save-btn">Salvar</button>
                      <button @click="cancelEdit" class="cancel-btn">Cancelar</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Sem capítulos -->
            <div v-else class="no-chapters">
              <ion-icon :icon="documentText" class="no-chapters-icon"></ion-icon>
              <p>Nenhum capítulo adicionado ainda</p>
              <p class="no-chapters-hint">Clique em "Novo Capítulo" para começar</p>
            </div>
          </div>

          <!-- Adicionar Novo Capítulo -->
          <div v-if="addingNewChapter" class="add-chapter-form">
            <h3>Novo Capítulo</h3>
            <div class="new-chapter-form">
              <div class="form-group">
                <label>Número do Capítulo *</label>
                <input 
                  v-model="newChapter.number"
                  type="number" 
                  min="1"
                  class="form-control"
                  required
                />
              </div>
              <div class="form-group">
                <label>Título do Capítulo *</label>
                <input 
                  v-model="newChapter.title"
                  type="text" 
                  class="form-control"
                  placeholder="Ex: O início da jornada"
                  required
                />
              </div>
              <div class="form-group">
                <label>Conteúdo (URLs das páginas) *</label>
                <div class="pages-input">
                  <div v-for="(page, index) in newChapter.pages" :key="index" class="page-item">
                    <input 
                      v-model="newChapter.pages[index]"
                      type="text" 
                      placeholder="URL da página"
                      class="page-url"
                      required
                    />
                    <button @click="removeNewPage(index)" class="remove-page">×</button>
                  </div>
                  <button @click="addNewPage" class="add-page-btn">
                    <ion-icon :icon="add"></ion-icon> Adicionar Página
                  </button>
                </div>
              </div>
              <div class="new-chapter-actions">
                <button @click="saveNewChapter" class="save-btn">Salvar Capítulo</button>
                <button @click="cancelNewChapter" class="cancel-btn">Cancelar</button>
              </div>
            </div>
          </div>

          <div class="step-actions">
            <div class="action-buttons">
              <ion-button fill="outline" @click="prevStep">
                <ion-icon :icon="arrowBack" slot="start"></ion-icon>
                Voltar
              </ion-button>
              <ion-button @click="nextStep" :disabled="mangaData.chapters.length === 0">
                Continuar para Revisão
                <ion-icon :icon="arrowForward" slot="end"></ion-icon>
              </ion-button>
            </div>
          </div>
        </div>

        <!-- Step 3: Revisão -->
        <div v-if="currentStep === 3" class="step-content">
          <h2 class="step-title">Revisão Final</h2>
          <p class="step-subtitle">Confira todas as informações antes de publicar</p>

          <div class="review-container">
            <!-- Resumo do Mangá -->
            <div class="review-section">
              <h3 class="review-section-title">Informações do Mangá</h3>
              <div class="review-card">
                <div class="review-cover">
                  <img :src="mangaData.cover || 'https://via.placeholder.com/200x300'" alt="Capa" />
                </div>
                <div class="review-info">
                  <h4>{{ mangaData.title || 'Sem título' }}</h4>
                  <p><strong>Autor:</strong> {{ mangaData.author || 'Não informado' }}</p>
                  <p><strong>Tipo:</strong> {{ getTypeLabel(mangaData.type) }}</p>
                  <p><strong>Status:</strong> {{ getStatusLabel(mangaData.status) }}</p>
                  <p><strong>Gêneros:</strong> {{ mangaData.genres.join(', ') || 'Não informado' }}</p>
                  <p><strong>Capítulos:</strong> {{ mangaData.chapters.length }}</p>
                </div>
              </div>
            </div>

            <!-- Sinopse -->
            <div class="review-section">
              <h3 class="review-section-title">Sinopse</h3>
              <div class="review-synopsis">
                {{ mangaData.synopsis || 'Sinopse não fornecida' }}
              </div>
            </div>

            <!-- Capítulos -->
            <div class="review-section">
              <h3 class="review-section-title">Capítulos ({{ mangaData.chapters.length }})</h3>
              <div class="review-chapters">
                <div v-for="chapter in mangaData.chapters" :key="chapter.number" class="review-chapter">
                  <div class="review-chapter-info">
                    <span class="review-chapter-number">Capítulo {{ chapter.number }}</span>
                    <span class="review-chapter-title">{{ chapter.title }}</span>
                  </div>
                  <div class="review-chapter-details">
                    <span>{{ chapter.pages.length }} páginas</span>
                    <span class="review-chapter-date">{{ formatDate(chapter.createdAt) }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Configurações de Publicação -->
            <div class="review-section">
              <h3 class="review-section-title">Configurações de Publicação</h3>
              <div class="publication-settings">
                <ion-item class="setting-item">
                  <ion-label>Publicar como rascunho</ion-label>
                  <ion-toggle 
                    v-model="publishAsDraft"
                    :checked="publishAsDraft"
                  ></ion-toggle>
                </ion-item>
                <ion-item class="setting-item">
                  <ion-label>Permitir comentários</ion-label>
                  <ion-toggle 
                    v-model="allowComments"
                    :checked="allowComments"
                  ></ion-toggle>
                </ion-item>
                <ion-item class="setting-item">
                  <ion-label>Notificar seguidores</ion-label>
                  <ion-toggle 
                    v-model="notifyFollowers"
                    :checked="notifyFollowers"
                  ></ion-toggle>
                </ion-item>
              </div>
            </div>
          </div>

          <div class="step-actions">
            <div class="action-buttons">
              <ion-button fill="outline" @click="prevStep">
                <ion-icon :icon="arrowBack" slot="start"></ion-icon>
                Voltar
              </ion-button>
              <ion-button @click="publishManga" :disabled="isPublishing" class="publish-btn">
                <ion-spinner v-if="isPublishing" name="crescent"></ion-spinner>
                <span v-else>{{ publishAsDraft ? 'Salvar Rascunho' : 'Publicar Agora' }}</span>
              </ion-button>
            </div>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { 
  IonPage, 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonButton,
  IonBackButton,
  IonButtons,
  IonItem,
  IonInput,
  IonLabel,
  IonIcon,
  IonSelect,
  IonSelectOption,
  IonToggle,
  IonSpinner,
  toastController
} from '@ionic/vue';
import { 
  arrowBack, 
  arrowForward, 
  add, 
  image,
  create,
  trash,
  documentText,
  cloudUpload
} from 'ionicons/icons';
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router'; // Importar useRoute
import { useAuth } from '@/composables/useAuth';
import { useMangaData } from '@/composables/useMangaData'; // Importar o novo composable
import { MangaData } from '@/types/manga'; // Importar o tipo MangaData
import { createMangaFile } from '@/utils/mangaFileGenerator';

const router = useRouter();
const route = useRoute(); // Usar useRoute para acessar query params
const { isAuthenticated, user } = useAuth();
const { allStoredMangas, updateManga, getMangaById, loadAllMangasFromLocalStorage } = useMangaData(); // Usar o composable

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
const newChapter = ref({
  number: 1,
  title: '',
  pages: [''],
  createdAt: new Date().toISOString()
});
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
  userId: user.value?.id, // Garante que o userId seja definido
  publishedAt: undefined,
  isDraft: false,
  views: 0,
  likes: 0
});

// Gêneros disponíveis
const availableGenres = ref([
  'Ação', 'Aventura', 'Comédia', 'Drama', 'Fantasia', 'Horror',
  'Mistério', 'Romance', 'Sci-Fi', 'Slice of Life', 'Esportes',
  'Sobrenatural', 'Mecha', 'Histórico', 'Psicológico', 'Thriller'
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
    mangaData.value.type !== '' && // Verifica se foi alterado do valor padrão
    mangaData.value.status !== '' // Verifica se foi alterado do valor padrão
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
  addingNewChapter.value = true;
  newChapter.value = {
    number: mangaData.value.chapters.length + 1,
    title: '',
    pages: [''],
    createdAt: new Date().toISOString()
  };
};

const addPage = (chapter: any) => {
  chapter.pages.push('');
};

const removePage = (chapter: any, index: number) => {
  if (chapter.pages.length > 1) {
    chapter.pages.splice(index, 1);
  }
};

const addNewPage = () => {
  newChapter.value.pages.push('');
};

const removeNewPage = (index: number) => {
  if (newChapter.value.pages.length > 1) {
    newChapter.value.pages.splice(index, 1);
  }
};

const saveNewChapter = () => {
  if (!newChapter.value.number || !newChapter.value.title || newChapter.value.pages.some(page => !page.trim())) {
    showToast('Preencha todos os campos do capítulo', 'warning');
    return;
  }

  mangaData.value.chapters.push({
    ...newChapter.value,
    pages: newChapter.value.pages.filter(page => page.trim() !== '')
  });

  // Ordenar capítulos por número
  mangaData.value.chapters.sort((a, b) => a.number - b.number);

  addingNewChapter.value = false;
  showToast('Capítulo adicionado com sucesso!', 'success');
};

const cancelNewChapter = () => {
  addingNewChapter.value = false;
  newChapter.value = {
    number: 1,
    title: '',
    pages: [''],
    createdAt: new Date().toISOString()
  };
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
      {
        text: 'Cancelar',
        role: 'cancel'
      },
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
  justify-content: space-between;
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

/* Step 2: Capítulos */
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

.chapter-item.editing {
  background: rgba(255, 0, 0, 0.05);
  border-color: #ff0000;
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
  font-size: 1.2rem;
  padding: 5px;
  border-radius: 5px;
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

/* Edição de Capítulo */
.chapter-edit {
  margin-top: 1rem;
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  color: white;
  font-weight: 500;
  font-size: 0.95rem;
}

.form-control {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: white;
  padding: 0.75rem 1rem;
  font-size: 1rem;
}

.form-control:focus {
  outline: none;
  border-color: #ff0000;
  box-shadow: 0 0 0 2px rgba(255, 0, 0, 0.2);
}

.pages-input {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.page-item {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.page-url {
  flex: 1;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: white;
  padding: 0.75rem 1rem;
  font-size: 0.95rem;
}

.page-url:focus {
  outline: none;
  border-color: #ff0000;
}

.remove-page {
  background: rgba(255, 0, 0, 0.2);
  color: white;
  border: none;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.remove-page:hover {
  background: rgba(255, 0, 0, 0.4);
}

.add-page-btn {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px dashed rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  padding: 0.75rem 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.95rem;
  transition: all 0.3s ease;
}

.add-page-btn:hover {
  background: rgba(255, 0, 0, 0.1);
  border-color: #ff0000;
}

.edit-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.save-btn, .cancel-btn {
  padding: 8px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  font-size: 0.95rem;
  transition: all 0.3s ease;
}

.save-btn {
  background: #ff0000;
  color: white;
}

.save-btn:hover {
  background: #b30000;
}

.cancel-btn {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.cancel-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  color: white;
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

/* Novo Capítulo */
.add-chapter-form {
  background: rgba(255, 0, 0, 0.05);
  border: 1px solid rgba(255, 0, 0, 0.2);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.add-chapter-form h3 {
  color: white;
  margin-bottom: 1rem;
}

.new-chapter-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.new-chapter-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

/* Step 3: Revisão */
.review-section {
  margin-bottom: 2rem;
}

.review-section-title {
  color: white;
  font-size: 1.3rem;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.review-card {
  display: flex;
  gap: 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 1.5rem;
}

.review-cover img {
  width: 120px;
  height: 180px;
  object-fit: cover;
  border-radius: 8px;
}

.review-info {
  flex: 1;
  color: white;
}

.review-info h4 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: white;
}

.review-info p {
  margin-bottom: 0.5rem;
  color: rgba(255, 255, 255, 0.8);
}

.review-info strong {
  color: white;
  margin-right: 0.5rem;
}

.review-synopsis {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 1.5rem;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.6;
  white-space: pre-line;
}

.review-chapters {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.review-chapter {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.review-chapter-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.review-chapter-number {
  color: #ff0000;
  font-weight: 600;
}

.review-chapter-title {
  color: white;
  font-size: 0.95rem;
}

.review-chapter-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  align-items: flex-end;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.85rem;
}

.review-chapter-date {
  color: rgba(255, 255, 255, 0.5);
}

.publication-settings {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 1rem;
}

.setting-item {
  --background: transparent;
  --border-color: transparent;
  --color: white;
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

.publish-btn {
  --background: #00ff00;
  --background-hover: #00cc00;
  --color: #000;
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

  .review-card {
    flex-direction: column;
    align-items: center;
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