<template>
  <ion-page>
    <ion-header>
      <ion-toolbar class="dark-toolbar">
        <ion-buttons slot="start">
          <ion-back-button default-href="/" text="Voltar" color="light"></ion-back-button>
        </ion-buttons>
        <ion-title>{{ manga?.title || 'Carregando...' }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="manga-detail-content" v-if="manga">
      <div class="manga-header">
        <div class="manga-cover-container">
          <img :src="manga.cover || 'https://via.placeholder.com/600x800'" :alt="manga.title" class="manga-cover" />
          <div class="manga-badge" :class="manga.type.toLowerCase()">
            {{ manga.type }}
          </div>
        </div>

        <div class="manga-info">
          <h1 class="manga-title">{{ manga.title }}</h1>
          <p class="manga-author">Por: {{ manga.author }}</p>

          <div class="manga-meta">
            <div class="meta-item">
              <ion-icon :icon="star" class="meta-icon"></ion-icon>
              <span>{{ manga.likes || 0 }} Curtidas</span>
            </div>
            <div class="meta-item">
              <ion-icon :icon="eye" class="meta-icon"></ion-icon>
              <span>{{ manga.views || 0 }} Visualizações</span>
            </div>
            <div class="meta-item">
              <ion-icon :icon="book" class="meta-icon"></ion-icon>
              <span>{{ manga.chapters?.length || 0 }} Capítulos</span>
            </div>
          </div>

          <div class="manga-status" :class="manga.status.toLowerCase().replace(' ', '-')">
            <ion-icon :icon="flag" class="status-icon"></ion-icon>
            <span>{{ getStatusLabel(manga.status) }}</span>
          </div>

          <div class="manga-genres">
            <span v-for="(genre, index) in manga.genres" :key="index" class="genre-tag">
              {{ genre }}
            </span>
          </div>

          <div class="manga-actions">
            <ion-button @click="toggleFavoriteManga" class="favorite-btn">
              <ion-icon 
                :icon="isFavorite(manga.id!) ? heart : heartOutline" 
                slot="start"
              ></ion-icon>
              <span>{{ isFavorite(manga.id!) ? 'Favoritado' : 'Favoritar' }}</span>
            </ion-button>
            <ion-button @click="startReading" class="read-btn">
              <ion-icon :icon="book" slot="start"></ion-icon>
              Começar a Ler
            </ion-button>
          </div>
        </div>
      </div>

      <div class="manga-synopsis">
        <h2>Sinopse</h2>
        <p>{{ manga.synopsis }}</p>
      </div>

      <div class="manga-chapters">
        <h2>Capítulos ({{ manga.chapters?.length || 0 }})</h2>
        <div class="chapters-list">
          <div v-for="chapter in manga.chapters" :key="chapter.number" class="chapter-item">
            <div class="chapter-info">
              <span class="chapter-number">Capítulo {{ chapter.number }}</span>
              <span class="chapter-title">{{ chapter.title }}</span>
              <span class="chapter-date">{{ formatDate(chapter.createdAt) }}</span>
            </div>
            <div class="chapter-actions">
              <ion-button size="small" @click="readChapter(chapter)" class="read-chapter-btn">
                <ion-icon :icon="book" slot="start"></ion-icon>
                Ler
              </ion-button>
            </div>
          </div>
        </div>
      </div>

      <div class="manga-comments" v-if="manga.comments && manga.comments > 0">
        <h2>Comentários ({{ manga.comments }})</h2>
        <div class="comments-section">
          <p>Seção de comentários em desenvolvimento</p>
        </div>
      </div>
    </ion-content>

    <ion-content class="loading-content" v-else>
      <div class="loading-spinner">
        <ion-spinner name="crescent"></ion-spinner>
        <p>Carregando detalhes do mangá...</p>
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
  IonButtons,
  IonBackButton,
  IonButton,
  IonIcon,
  IonSpinner,
  toastController
} from '@ionic/vue';
import { star, eye, book, flag, heart, heartOutline } from 'ionicons/icons';
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuth } from '@/composables/useAuth';
import { useMangaData } from '@/composables/useMangaData';
import { MangaData } from '@/types/manga';

const router = useRouter();
const route = useRoute();
const { isAuthenticated, toggleFavorite, isFavorite } = useAuth();
const { getMangaById, updateManga } = useMangaData();

const manga = ref<MangaData | null>(null);
const mangaId = ref<number | null>(null);

onMounted(() => {
  const id = parseInt(route.params.id as string);
  if (isNaN(id)) {
    router.push('/');
    return;
  }

  mangaId.value = id;
  loadMangaData();
});

const loadMangaData = () => {
  if (!mangaId.value) return;

  const storedManga = getMangaById(mangaId.value);
  if (storedManga) {
    manga.value = storedManga;

    // Increment views
    if (storedManga.views === undefined) {
      storedManga.views = 1;
    } else {
      storedManga.views++;
    }

    // Update manga with new view count
    updateManga(storedManga);
  } else {
    showToast('Mangá não encontrado', 'danger');
    router.push('/');
  }
};

const getStatusLabel = (status: string): string => {
  const statusMap: Record<string, string> = {
    'em-andamento': 'Em Andamento',
    'completo': 'Completo',
    'hiato': 'Hiato',
    'cancelado': 'Cancelado',
  };
  return statusMap[status] || status;
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const toggleFavoriteManga = () => {
  if (!isAuthenticated.value) {
    showToast('Faça login para favoritar mangás!', 'warning');
    router.push('/login');
    return;
  }

  if (!manga.value?.id) {
    showToast('ID do mangá não disponível', 'danger');
    return;
  }

  const added = toggleFavorite(manga.value.id);
  showToast(
    added ? 'Adicionado aos favoritos!' : 'Removido dos favoritos!',
    'success'
  );
};

const startReading = () => {
  if (manga.value?.chapters && manga.value.chapters.length > 0) {
    readChapter(manga.value.chapters[0]);
  } else {
    showToast('Este mangá não possui capítulos ainda', 'warning');
  }
};

const readChapter = (chapter: any) => {
  showToast(`Lendo capítulo ${chapter.number}: ${chapter.title}`, 'info');
  // In a real app, you would navigate to a chapter reader
  // router.push(\`/manga/\${mangaId.value}/chapter/\${chapter.number}\`);
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
.manga-detail-content {
  --background: linear-gradient(135deg, #000000 0%, #1a0000 100%);
}

.loading-content {
  --background: linear-gradient(135deg, #000000 0%, #1a0000 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-spinner {
  text-align: center;
  color: white;
}

.loading-spinner ion-spinner {
  width: 50px;
  height: 50px;
  color: #ff0000;
}

.loading-spinner p {
  margin-top: 1rem;
  font-size: 1.1rem;
}

.manga-header {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1.5rem;
}

.manga-cover-container {
  position: relative;
  width: 100%;
  max-width: 400px;
  height: 550px;
  margin: 0 auto;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
}

.manga-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.manga-badge {
  position: absolute;
  top: 15px;
  left: 15px;
  padding: 6px 16px;
  border-radius: 25px;
  font-size: 0.9rem;
  font-weight: 700;
  text-transform: uppercase;
  color: white;
  backdrop-filter: blur(10px);
  letter-spacing: 0.5px;
  z-index: 2;
}

.manga-badge.mangá {
  background: linear-gradient(45deg, #ff0000, #b30000);
  border: 1px solid rgba(255, 0, 0, 0.3);
}

.manga-badge.manhwa {
  background: linear-gradient(45deg, #ff6b6b, #ff3838);
  border: 1px solid rgba(255, 107, 107, 0.3);
}

.manga-badge.manhua {
  background: linear-gradient(45deg, #ff8c00, #ff6b00);
  border: 1px solid rgba(255, 140, 0, 0.3);
}

.manga-badge.webtoon {
  background: linear-gradient(45deg, #9370db, #7b68ee);
  border: 1px solid rgba(147, 112, 219, 0.3);
}

.manga-info {
  text-align: center;
  padding: 1rem;
}

.manga-title {
  font-size: 2rem;
  font-weight: 800;
  color: white;
  margin-bottom: 0.5rem;
}

.manga-author {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 1.5rem;
}

.manga-meta {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgba(255, 255, 255, 0.9);
}

.meta-icon {
  color: #ff0000;
  font-size: 1.2rem;
}

.manga-status {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 8px 16px;
  border-radius: 25px;
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.manga-status.em-andamento {
  background: rgba(255, 215, 0, 0.1);
  color: #ffd700;
  border: 1px solid rgba(255, 215, 0, 0.3);
}

.manga-status.completo {
  background: rgba(0, 255, 0, 0.1);
  color: #00ff00;
  border: 1px solid rgba(0, 255, 0, 0.3);
}

.manga-status.hiato {
  background: rgba(255, 165, 0, 0.1);
  color: #ffa500;
  border: 1px solid rgba(255, 165, 0, 0.3);
}

.manga-status.cancelado {
  background: rgba(255, 0, 0, 0.1);
  color: #ff6b6b;
  border: 1px solid rgba(255, 0, 0, 0.3);
}

.manga-genres {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.genre-tag {
  padding: 6px 12px;
  background: rgba(255, 0, 0, 0.1);
  border-radius: 20px;
  font-size: 0.85rem;
  color: white;
  border: 1px solid rgba(255, 0, 0, 0.2);
}

.manga-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;
}

.favorite-btn {
  --background: rgba(255, 0, 0, 0.2);
  --background-hover: rgba(255, 0, 0, 0.3);
  --color: white;
  --border-radius: 12px;
}

.read-btn {
  --background: #ff0000;
  --background-hover: #b30000;
  --color: white;
  --border-radius: 12px;
}

.manga-synopsis {
  background: rgba(20, 20, 20, 0.8);
  border-radius: 16px;
  padding: 1.5rem;
  margin: 1.5rem;
  border: 1px solid rgba(255, 0, 0, 0.2);
}

.manga-synopsis h2 {
  color: white;
  margin-bottom: 1rem;
  font-size: 1.3rem;
}

.manga-synopsis p {
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.6;
  white-space: pre-line;
}

.manga-chapters {
  background: rgba(20, 20, 20, 0.8);
  border-radius: 16px;
  padding: 1.5rem;
  margin: 1.5rem;
  border: 1px solid rgba(255, 0, 0, 0.2);
}

.manga-chapters h2 {
  color: white;
  margin-bottom: 1.5rem;
  font-size: 1.3rem;
}

.chapters-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.chapter-item {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.chapter-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
}

.chapter-number {
  color: #ff0000;
  font-weight: 600;
  font-size: 1rem;
}

.chapter-title {
  color: white;
  font-size: 0.95rem;
}

.chapter-date {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.85rem;
}

.chapter-actions {
  display: flex;
  gap: 0.5rem;
  margin-left: 1rem;
}

.read-chapter-btn {
  --background: #ff0000;
  --background-hover: #b30000;
  --color: white;
  --border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
}

.manga-comments {
  background: rgba(20, 20, 20, 0.8);
  border-radius: 16px;
  padding: 1.5rem;
  margin: 1.5rem;
  border: 1px solid rgba(255, 0, 0, 0.2);
}

.manga-comments h2 {
  color: white;
  margin-bottom: 1rem;
  font-size: 1.3rem;
}

.comments-section {
  padding: 1rem;
  text-align: center;
  color: rgba(255, 255, 255, 0.6);
}

@media (max-width: 768px) {
  .manga-header {
    padding: 1rem;
  }

  .manga-cover-container {
    height: 450px;
  }

  .manga-title {
    font-size: 1.6rem;
  }

  .manga-meta {
    gap: 1rem;
  }

  .manga-actions {
    flex-direction: column;
    gap: 0.5rem;
  }
}

@media (max-width: 480px) {
  .manga-meta {
    flex-direction: column;
    gap: 0.5rem;
  }

  .manga-genres {
    gap: 0.25rem;
  }

  .genre-tag {
    padding: 4px 8px;
    font-size: 0.75rem;
  }

  .chapter-item {
    flex-direction: column;
    gap: 0.5rem;
    align-items: stretch;
  }

  .chapter-actions {
    margin-left: 0;
  }
}
</style>