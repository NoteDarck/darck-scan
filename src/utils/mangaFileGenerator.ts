// src/utils/mangaFileGenerator.ts
import { MangaData } from '@/types/manga';

export const generateMangaFileContent = (manga: MangaData): string => {
  const safeTitle = manga.title
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');

  return `<template>
  <ion-page>
    <ion-header>
      <ion-toolbar class="dark-toolbar">
        <ion-buttons slot="start">
          <ion-back-button default-href="/" text="Voltar" color="light"></ion-back-button>
        </ion-buttons>
        <ion-title>${manga.title}</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="toggleFavorite" fill="clear">
            <ion-icon :icon="isFavorite ? heart : heartOutline" :color="isFavorite ? 'danger' : 'light'"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="manga-detail-content">
      <div class="manga-header">
        <div class="manga-cover-container">
          <img src="${manga.cover || 'https://via.placeholder.com/600x800'}" alt="${manga.title}" class="manga-cover" />
          <div class="manga-badge" :class="typeClass">
            {{ typeLabel }}
          </div>
        </div>

        <div class="manga-info">
          <h1 class="manga-title">${manga.title}</h1>
          <p class="manga-author">Por: ${manga.author}</p>

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

          <div class="manga-status" :class="statusClass">
            <ion-icon :icon="flag" class="status-icon"></ion-icon>
            <span>{{ statusLabel }}</span>
          </div>

          <div class="manga-genres">
            <span v-for="(genre, index) in genres" :key="index" class="genre-tag">
              {{ genre }}
            </span>
          </div>

          <div class="manga-actions">
            <ion-button @click="startReading" class="read-btn">
              <ion-icon :icon="book" slot="start"></ion-icon>
              Começar a Ler
            </ion-button>
          </div>
        </div>
      </div>

      <div class="manga-synopsis">
        <h2>Sinopse</h2>
        <p>${manga.synopsis}</p>
      </div>

      <div class="manga-chapters">
        <h2>Capítulos ({{ manga.chapters?.length || 0 }})</h2>
        <div class="chapters-list">
          <div v-for="chapter in chapters" :key="chapter.number" class="chapter-item">
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
  toastController
} from '@ionic/vue';
import { star, eye, book, flag, heart, heartOutline } from 'ionicons/icons';
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth';

const router = useRouter();
const { isAuthenticated, toggleFavorite, isFavorite } = useAuth();

const manga = ref(${JSON.stringify(manga, null, 2)});
const isFavoriteManga = ref(false);

const typeClass = computed(() => manga.value.type.toLowerCase());
const typeLabel = computed(() => {
  const types = { 'mangá': 'Mangá', 'manhwa': 'Manhwa', 'manhua': 'Manhua', 'webtoon': 'Webtoon' };
  return types[manga.value.type] || manga.value.type;
});

const statusClass = computed(() => manga.value.status.toLowerCase().replace(' ', '-'));
const statusLabel = computed(() => {
  const statuses = {
    'em-andamento': 'Em Andamento',
    'completo': 'Completo',
    'hiato': 'Hiato',
    'cancelado': 'Cancelado'
  };
  return statuses[manga.value.status] || manga.value.status;
});

const genres = computed(() => manga.value.genres || []);
const chapters = computed(() => manga.value.chapters || []);

onMounted(() => {
  if (manga.value.id) {
    isFavoriteManga.value = isFavorite(manga.value.id);
  }
});

const toggleFavoriteManga = () => {
  if (!isAuthenticated.value) {
    showToast('Faça login para favoritar mangás!', 'warning');
    router.push('/login');
    return;
  }

  if (!manga.value.id) {
    showToast('ID do mangá não disponível', 'danger');
    return;
  }

  const added = toggleFavorite(manga.value.id);
  isFavoriteManga.value = added;
  showToast(added ? 'Adicionado aos favoritos!' : 'Removido dos favoritos!', 'success');
};

const startReading = () => {
  if (chapters.value.length > 0) {
    readChapter(chapters.value[0]);
  } else {
    showToast('Este mangá não possui capítulos ainda', 'warning');
  }
};

const readChapter = (chapter: any) => {
  showToast(\`Lendo capítulo \${chapter.number}: \${chapter.title}\`, 'info');
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('pt-BR');
};

const showToast = async (message: string, color: string = 'primary') => {
  const toast = await toastController.create({
    message,
    duration: 2000,
    color: color,
    position: 'top'
  });
  await toast.present();
};
</script>

<style scoped>
.manga-detail-content {
  --background: linear-gradient(135deg, #000000 0%, #1a0000 100%);
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
  margin-top: 1rem;
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
`;
};

export const createMangaFile = async (manga: MangaData): Promise<boolean> => {
  try {
    const fileContent = generateMangaFileContent(manga);
    
    const safeTitle = manga.title
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');

    const fileName = `${safeTitle}.vue`;

    const mangaFiles = JSON.parse(localStorage.getItem('mangaFiles') || '{}');
    mangaFiles[fileName] = fileContent;
    localStorage.setItem('mangaFiles', JSON.stringify(mangaFiles));

    return true;
  } catch (error) {
    console.error('Error creating manga file:', error);
    return false;
  }
};