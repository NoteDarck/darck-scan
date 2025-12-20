<template>
  <ion-page>
    <ion-header>
      <ion-toolbar class="dark-toolbar">
        <ion-buttons slot="start">
          <ion-back-button default-href="/dashboard" text="Voltar" color="light"></ion-back-button>
        </ion-buttons>
        <ion-title>Gerenciar: {{ manga?.title }}</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="saveChanges" :disabled="isSaving">
            <ion-spinner v-if="isSaving" name="crescent"></ion-spinner>
            <span v-else>Salvar</span>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="management-content">
      <div v-if="manga" class="management-container">
        <!-- Informações do Mangá -->
        <div class="manga-info-section">
          <h2 class="section-title">Informações do Mangá</h2>
          <div class="info-card">
            <div class="manga-cover">
              <img :src="manga.cover || 'https://via.placeholder.com/150x200'" alt="Capa" />
            </div>
            <div class="manga-details">
              <h3>{{ manga.title }}</h3>
              <p><strong>Autor:</strong> {{ manga.author }}</p>
              <p><strong>Tipo:</strong> {{ getTypeLabel(manga.type) }}</p>
              <p><strong>Status:</strong> {{ getStatusLabel(manga.status) }}</p>
              <p><strong>Gêneros:</strong> {{ manga.genres.join(', ') }}</p>
              <p><strong>Visualizações:</strong> {{ manga.views || 0 }}</p>
              <p><strong>Curtidas:</strong> {{ manga.likes || 0 }}</p>
            </div>
          </div>
        </div>

        <!-- Capítulos -->
        <div class="chapters-section">
          <div class="section-header">
            <h2 class="section-title">Capítulos ({{ manga.chapters?.length || 0 }})</h2>
            <ion-button @click="addChapter" size="small" class="add-chapter-btn">
              <ion-icon :icon="add" slot="start"></ion-icon>
              Novo Capítulo
            </ion-button>
          </div>

          <!-- Lista de Capítulos -->
          <div v-if="manga.chapters && manga.chapters.length > 0" class="chapters-list">
            <div v-for="(chapter, index) in manga.chapters" :key="index" class="chapter-item" :class="{ 'editing': editingChapterIndex === index }">
              <div v-if="editingChapterIndex !== index" class="chapter-info">
                <div class="chapter-main">
                  <span class="chapter-number">Capítulo {{ chapter.number }}</span>
                  <span class="chapter-title">{{ chapter.title }}</span>
                  <span class="chapter-date">{{ formatDate(chapter.createdAt) }}</span>
                </div>
                <div class="chapter-actions">
                  <ion-button size="small" @click="editChapter(index)">
                    <ion-icon :icon="create" slot="icon-only"></ion-icon>
                  </ion-button>
                  <ion-button size="small" @click="viewChapter(chapter)" fill="outline">
                    <ion-icon :icon="eye" slot="icon-only"></ion-icon>
                  </ion-button>
                  <ion-button size="small" @click="deleteChapter(index)" color="danger">
                    <ion-icon :icon="trash" slot="icon-only"></ion-icon>
                  </ion-button>
                </div>
              </div>

              <!-- Edição do Capítulo -->
              <div v-else class="chapter-edit">
                <div class="edit-form">
                  <div class="form-group">
                    <label>Número do Capítulo</label>
                    <input v-model="chapter.number" type="number" min="1" class="form-control" />
                  </div>
                  <div class="form-group">
                    <label>Título do Capítulo</label>
                    <input v-model="chapter.title" type="text" class="form-control" placeholder="Ex: O início da jornada" />
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

        <!-- Configurações -->
        <div class="settings-section">
          <h2 class="section-title">Configurações</h2>
          <div class="settings-card">
            <ion-item class="setting-item">
              <ion-label>Permitir comentários</ion-label>
              <ion-toggle v-model="allowComments" :checked="allowComments"></ion-toggle>
            </ion-item>
            <ion-item class="setting-item">
              <ion-label>Notificar seguidores</ion-label>
              <ion-toggle v-model="notifyFollowers" :checked="notifyFollowers"></ion-toggle>
            </ion-item>
            <ion-item class="setting-item">
              <ion-label>Status do Mangá</ion-label>
              <ion-select v-model="manga.status" placeholder="Selecione" class="status-select">
                <ion-select-option value="em-andamento">Em andamento</ion-select-option>
                <ion-select-option value="completo">Completo</ion-select-option>
                <ion-select-option value="hiato">Hiato</ion-select-option>
                <ion-select-option value="cancelado">Cancelado</ion-select-option>
              </ion-select>
            </ion-item>
          </div>
        </div>

        <!-- Ações Rápidas -->
        <div class="quick-actions-section">
          <h2 class="section-title">Ações Rápidas</h2>
          <div class="actions-grid">
            <ion-button @click="viewManga" expand="block" fill="outline">
              <ion-icon :icon="eye" slot="start"></ion-icon>
              Visualizar Mangá
            </ion-button>
            <ion-button @click="editInfo" expand="block" fill="outline">
              <ion-icon :icon="create" slot="start"></ion-icon>
              Editar Informações
            </ion-button>
            <ion-button @click="viewAnalytics" expand="block" fill="outline">
              <ion-icon :icon="analytics" slot="start"></ion-icon>
              Ver Análises
            </ion-button>
            <ion-button @click="deleteManga" expand="block" color="danger" fill="outline">
              <ion-icon :icon="trash" slot="start"></ion-icon>
              Excluir Mangá
            </ion-button>
          </div>
        </div>
      </div>

      <div v-else class="loading-container">
        <ion-spinner name="crescent" class="loading-spinner"></ion-spinner>
        <p>Carregando informações do mangá...</p>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonBackButton, IonButtons, IonIcon, IonSpinner, IonItem, IonLabel, IonToggle, IonSelect, IonSelectOption, toastController, alertController } from '@ionic/vue';
import { add, create, trash, eye, documentText, analytics } from 'ionicons/icons';
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuth } from '@/composables/useAuth';
import { useMangaData } from '@/composables/useMangaData';
import { MangaData } from '@/types/manga';

const router = useRouter();
const route = useRoute();
const { isAuthenticated, user } = useAuth();
const { getMangaById, updateManga, loadAllMangasFromLocalStorage } = useMangaData();

const manga = ref<MangaData | null>(null);
const editingChapterIndex = ref<number | null>(null);
const isSaving = ref(false);
const allowComments = ref(true);
const notifyFollowers = ref(true);

onMounted(() => {
  if (!isAuthenticated.value) {
    setTimeout(() => {
      router.push('/login');
    }, 100);
    return;
  }

  const mangaId = route.query.id ? parseInt(route.query.id as string) : null;
  if (mangaId) {
    loadManga(mangaId);
  } else {
    showToast('ID do mangá não fornecido', 'danger');
    router.back();
  }
});

const loadManga = (id: number) => {
  const foundManga = getMangaById(id);
  if (foundManga) {
    // Verificar se o usuário é o autor
    if (foundManga.userId !== user.value?.id) {
      showToast('Você não tem permissão para gerenciar este mangá', 'danger');
      router.back();
      return;
    }
    manga.value = { ...foundManga };
  } else {
    showToast('Mangá não encontrado', 'danger');
    router.back();
  }
};

const addChapter = () => {
  if (!manga.value) return;

  const newChapterNumber = (manga.value.chapters?.length || 0) + 1;
  if (!manga.value.chapters) {
    manga.value.chapters = [];
  }

  manga.value.chapters.push({
    number: newChapterNumber,
    title: `Capítulo ${newChapterNumber}`,
    pages: [],
    createdAt: new Date().toISOString()
  });

  editingChapterIndex.value = manga.value.chapters.length - 1;
  showToast('Novo capítulo adicionado', 'success');
};

const editChapter = (index: number) => {
  editingChapterIndex.value = index;
};

const saveChapterEdit = (index: number) => {
  if (!manga.value || !manga.value.chapters) return;

  if (!manga.value.chapters[index].number || !manga.value.chapters[index].title) {
    showToast('Preencha todos os campos do capítulo', 'warning');
    return;
  }

  editingChapterIndex.value = null;
  showToast('Capítulo atualizado com sucesso!', 'success');
};

const cancelEdit = () => {
  editingChapterIndex.value = null;
};

const viewChapter = (chapter: any) => {
  showToast(`Visualizando capítulo ${chapter.number}: ${chapter.title}`, 'info');
};

const deleteChapter = async (index: number) => {
  if (!manga.value || !manga.value.chapters) return;

  const alert = await alertController.create({
    header: 'Excluir Capítulo',
    message: 'Tem certeza que deseja excluir este capítulo?',
    buttons: [
      { text: 'Cancelar', role: 'cancel' },
      {
        text: 'Excluir',
        handler: () => {
          manga.value!.chapters!.splice(index, 1);
          showToast('Capítulo excluído', 'success');
        }
      }
    ]
  });
  await alert.present();
};

const saveChanges = async () => {
  if (!manga.value) return;

  isSaving.value = true;
  try {
    await new Promise(resolve => setTimeout(resolve, 1000));

    updateManga(manga.value);
    loadAllMangasFromLocalStorage();

    showToast('Alterações salvas com sucesso!', 'success');
  } catch (error) {
    console.error('Erro ao salvar alterações:', error);
    showToast('Erro ao salvar alterações', 'danger');
  } finally {
    isSaving.value = false;
  }
};

const viewManga = () => {
  if (manga.value?.id) {
    router.push(`/manga/${manga.value.id}`);
  }
};

const editInfo = () => {
  if (manga.value?.id) {
    router.push(`/publish?edit=${manga.value.id}`);
  }
};

const viewAnalytics = () => {
  showToast('Análises em desenvolvimento', 'info');
};

const deleteManga = async () => {
  if (!manga.value) return;

  const alert = await alertController.create({
    header: 'Excluir Mangá',
    message: 'Tem certeza que deseja excluir este mangá? Esta ação é irreversível.',
    buttons: [
      { text: 'Cancelar', role: 'cancel' },
      {
        text: 'Excluir',
        cssClass: 'alert-button-danger',
        handler: () => {
          const allMangas = JSON.parse(localStorage.getItem('publishedMangas') || '[]');
          const updatedMangas = allMangas.filter((m: MangaData) => m.id !== manga.value!.id);
          localStorage.setItem('publishedMangas', JSON.stringify(updatedMangas));
          loadAllMangasFromLocalStorage();
          showToast('Mangá excluído com sucesso', 'success');
          router.push('/dashboard');
        }
      }
    ]
  });
  await alert.present();
};

const getTypeLabel = (type: string): string => {
  const types: Record<string, string> = {
    'mangá': 'Mangá',
    'manhwa': 'Manhwa',
    'manhua': 'Manhua',
    'webtoon': 'Webtoon'
  };
  return types[type] || type;
};

const getStatusLabel = (status: string): string => {
  const statuses: Record<string, string> = {
    'em-andamento': 'Em andamento',
    'completo': 'Completo',
    'hiato': 'Hiato',
    'cancelado': 'Cancelado'
  };
  return statuses[status] || status;
};

const formatDate = (dateString: string): string => {
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
.management-content {
  --background: linear-gradient(135deg, #000000 0%, #1a0000 100%);
}

.management-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 1rem;
}

.section-title {
  color: white;
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

/* Informações do Mangá */
.manga-info-section {
  margin-bottom: 2rem;
}

.info-card {
  background: rgba(20, 20, 20, 0.8);
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  gap: 1.5rem;
  border: 1px solid rgba(255, 0, 0, 0.2);
}

.manga-cover img {
  width: 120px;
  height: 180px;
  object-fit: cover;
  border-radius: 8px;
}

.manga-details {
  flex: 1;
  color: white;
}

.manga-details h3 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: white;
}

.manga-details p {
  margin-bottom: 0.5rem;
  color: rgba(255, 255, 255, 0.8);
}

.manga-details strong {
  color: white;
  margin-right: 0.5rem;
}

/* Capítulos */
.chapters-section {
  margin-bottom: 2rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
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
  background: rgba(20, 20, 20, 0.8);
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
  flex: 1;
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

.chapter-date {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.85rem;
}

.chapter-actions {
  display: flex;
  gap: 0.5rem;
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

.edit-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.save-btn,
.cancel-btn {
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
  background: rgba(20, 20, 20, 0.8);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
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

/* Configurações */
.settings-section {
  margin-bottom: 2rem;
}

.settings-card {
  background: rgba(20, 20, 20, 0.8);
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.setting-item {
  --background: transparent;
  --border-color: transparent;
  --color: white;
  margin-bottom: 1rem;
}

.setting-item:last-child {
  margin-bottom: 0;
}

.status-select {
  --background: rgba(255, 255, 255, 0.05);
  --color: white;
  --border-color: rgba(255, 255, 255, 0.1);
  --border-radius: 12px;
}

/* Ações Rápidas */
.quick-actions-section {
  margin-bottom: 2rem;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

/* Loading */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: white;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  color: #ff0000;
  margin-bottom: 1rem;
}

/* Responsividade */
@media (max-width: 768px) {
  .management-container {
    padding: 0.5rem;
  }
  
  .info-card {
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
  
  .actions-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .section-title {
    font-size: 1.3rem;
  }
  
  .manga-details h3 {
    font-size: 1.3rem;
  }
}
</style>