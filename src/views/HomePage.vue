<template>
  <ion-page>
    <!-- Menu lateral DEVE vir ANTES -->
    <ion-menu side="end" menu-id="main-menu" content-id="main-content">
      <ion-header>
        <ion-toolbar class="dark-toolbar">
          <ion-title>Menu</ion-title>
          <ion-buttons slot="start">
            <ion-menu-button color="light" menu="main-menu"></ion-menu-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content class="menu-content">
        <div class="user-section" v-if="!isAuthenticated">
          <div class="user-avatar">
            <ion-icon :icon="personCircle" class="avatar-icon"></ion-icon>
          </div>
          <p class="user-greeting">Olá, Visitante!</p>
          <div class="auth-buttons">
            <ion-button expand="block" @click="goToLogin" class="login-button">
              <ion-icon :icon="logIn" slot="start"></ion-icon>
              Login
            </ion-button>
            <ion-button expand="block" fill="outline" @click="goToRegister" class="register-button">
              <ion-icon :icon="personAdd" slot="start"></ion-icon>
              Cadastrar
            </ion-button>
          </div>
        </div>

        <div class="user-section" v-else>
          <div class="user-avatar">
            <ion-icon :icon="personCircle" class="avatar-icon logged"></ion-icon>
          </div>
          <p class="user-name">Olá, {{ userName }}!</p>
          <ion-button expand="block" fill="clear" @click="logout" class="logout-button">
            <ion-icon :icon="logOut" slot="start"></ion-icon>
            Sair
          </ion-button>
        </div>

        <ion-list lines="none">
          <ion-item @click="goToHome" class="menu-item">
            <ion-icon :icon="home" slot="start" class="menu-icon"></ion-icon>
            <ion-label>Início</ion-label>
          </ion-item>
          <ion-item @click="goToFavorites" class="menu-item">
            <ion-icon :icon="heart" slot="start" class="menu-icon"></ion-icon>
            <ion-label>Favoritos</ion-label>
            <ion-badge v-if="userFavorites.length > 0" color="danger">
              {{ userFavorites.length }}
            </ion-badge>
          </ion-item>
          <ion-item @click="goToRecent" class="menu-item">
            <ion-icon :icon="time" slot="start" class="menu-icon"></ion-icon>
            <ion-label>Recentes</ion-label>
          </ion-item>
          <ion-item @click="changeBackground" class="menu-item">
            <ion-icon :icon="image" slot="start" class="menu-icon"></ion-icon>
            <ion-label>Alterar Fundo</ion-label>
          </ion-item>
          <!-- No menu lateral, dentro do <ion-list> -->
<ion-item v-if="isAuthenticated" @click="goToDashboard" class="menu-item">
  <ion-icon :icon="analytics" slot="start" class="menu-icon"></ion-icon>
  <ion-label>Meu Painel</ion-label>
</ion-item>
          <!-- No menu lateral, dentro do <ion-list> -->
<ion-item v-if="isAuthenticated" @click="goToPublish" class="menu-item"> <!-- Adicionado v-if="isAuthenticated" -->
  <ion-icon :icon="cloudUpload" slot="start" class="menu-icon"></ion-icon>
  <ion-label>Publicar Mangá</ion-label>
</ion-item>
          <ion-item @click="goToSettings" class="menu-item">
            <ion-icon :icon="settings" slot="start" class="menu-icon"></ion-icon>
            <ion-label>Configurações</ion-label>
          </ion-item>
        </ion-list>
      </ion-content>
    </ion-menu>

    <!-- Header -->
    <ion-header>
      <ion-toolbar class="dark-toolbar">
        <ion-title>DarckScan</ion-title>
        <ion-buttons slot="end">
          <ion-menu-button color="light" menu="main-menu"></ion-menu-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <!-- Conteúdo principal -->
    <ion-content id="main-content" class="main-content">
      <div class="background-container" :style="{ background: currentBackgroundStyle }">
        <div class="hero-section">
          <h1 class="hero-title">Descubra o Mundo dos <span class="highlight">Mangás</span></h1>
          <p class="hero-subtitle">Milhares de histórias esperando por você</p>
          
          <div class="search-container">
            <ion-searchbar 
              placeholder="Buscar mangás, manhwas, autores..." 
              animated 
              class="custom-searchbar"
              @ionInput="filterMangas"
            >
              <!-- Ícone de pesquisa embutido no ion-searchbar, removido o duplicado -->
            </ion-searchbar>
          </div>

          <!-- Nova seção de Gêneros com modal -->
          <div class="genres-display-container">
            <ion-item lines="none" class="genre-selector-item" @click="openGenreSelectModal">
              <ion-label>Gêneros</ion-label>
              <div class="selected-genres-tags" slot="end">
                <ion-chip v-for="genre in selectedGenres" :key="genre" color="primary" class="genre-chip">
                  {{ genre }}
                  <ion-icon :icon="closeCircle" @click.stop="removeGenreTag(genre)"></ion-icon>
                </ion-chip>
                <ion-icon :icon="chevronForward" v-if="selectedGenres.length === 0"></ion-icon>
              </div>
            </ion-item>
          </div>
        </div>

        <div class="content-container">
          <div class="section-header">
            <h2 class="section-title">Populares</h2>
            <ion-button fill="clear" @click="seeAllPopular" class="see-all">
              Ver todos
              <ion-icon :icon="arrowForward" slot="end"></ion-icon>
            </ion-button>
          </div>

          <div class="manga-grid">
            <ion-card 
              v-for="(manga, index) in filteredMangas" 
              :key="index" 
              class="manga-card"
              @click="openMangaDetails(manga)"
            >
              <div class="card-image-container">
                <img :src="getMangaImage(manga.image)" :alt="manga.title" class="manga-image" />
                <div class="image-overlay"></div>
                <div class="manga-badge" :class="manga.type.toLowerCase()">
                  {{ manga.type }}
                </div>
                <div class="manga-rating">
                  <ion-icon :icon="star" class="rating-icon"></ion-icon>
                  <span>{{ manga.rating }}</span>
                </div>
                <ion-button 
                  @click.stop="toggleFavorite(manga)"
                  class="favorite-button"
                  fill="clear"
                  size="small"
                >
                  <ion-icon 
                    :icon="isFavorite(manga.id) ? heart : heartOutline" 
                    :color="isFavorite(manga.id) ? 'danger' : 'light'"
                  ></ion-icon>
                </ion-button>
              </div>
              
              <ion-card-header>
                <ion-card-title class="manga-title">{{ manga.title }}</ion-card-title>
                <ion-card-subtitle class="manga-author">{{ manga.author }}</ion-card-subtitle>
              </ion-card-header>
              
              <ion-card-content>
                <div class="manga-info">
                  <div class="info-item">
                    <ion-icon :icon="book" class="info-icon"></ion-icon>
                    <span>{{ manga.chapters }} caps</span>
                  </div>
                  <div class="info-item">
                    <ion-icon :icon="flag" class="info-icon"></ion-icon>
                    <span class="manga-status" :class="manga.status.toLowerCase().replace(' ', '-')">
                      {{ manga.status }}
                    </span>
                  </div>
                </div>
                <div class="manga-genres">
                  <span 
                    v-for="(genre, idx) in manga.genres.slice(0, 2)" 
                    :key="idx" 
                    class="genre-tag"
                  >
                    {{ genre }}
                  </span>
                  <span v-if="manga.genres.length > 2" class="more-genres">
                    +{{ manga.genres.length - 2 }}
                  </span>
                </div>
              </ion-card-content>
            </ion-card>
          </div>

          <div class="load-more-container" v-if="filteredMangas.length < mangas.length">
            <ion-button expand="block" @click="loadMore" class="load-more-button">
              <ion-icon :icon="add" slot="start"></ion-icon>
              Carregar Mais
            </ion-button>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { 
  IonContent, 
  IonHeader, 
  IonPage, 
  IonTitle, 
  IonToolbar, 
  IonMenu,
  IonMenuButton,
  IonButtons,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonButton,
  IonSearchbar,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonBadge,
  IonChip, // Importado IonChip
  modalController, // Importado modalController
  toastController
} from '@ionic/vue';
import { 
  home, 
  settings, 
  star, 
  time,
  image,
  book,
  add,
  personCircle,
  logIn,
  personAdd,
  logOut,
  heart,
  heartOutline,
  flag,
  search,
  arrowForward,
  analytics,
  cloudUpload,
  closeCircle, // Importado closeCircle para remover tags
  chevronForward // Importado chevronForward para indicar que é clicável
} from 'ionicons/icons';
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth';
import GenreSelectModal from '@/components/GenreSelectModal.vue'; // Importado o novo modal

const router = useRouter();
const { 
  isAuthenticated, 
  userName, 
  userFavorites,
  logout: authLogout, 
  toggleFavorite: authToggleFavorite,
  isFavorite
} = useAuth();

// Array de backgrounds CSS
const backgroundStyles = ref([
  'linear-gradient(135deg, #000000 0%, #1a0000 100%)',
  'linear-gradient(135deg, #0a0a0a 0%, #330000 100%)',
  'linear-gradient(135deg, #1a0000 0%, #000000 100%)',
  'radial-gradient(circle at top right, #330000, #000000)',
  'linear-gradient(135deg, #000000 0%, #4a0000 50%, #000000 100%)',
]);

const currentBackgroundIndex = ref(0);
const searchQuery = ref('');
const visibleCount = ref(8);
const selectedGenres = ref<string[]>([]); // Estado para gêneros selecionados

// Gêneros disponíveis (copiado de PublishPage.vue para consistência)
const availableGenres = ref([
  'Ação', 'Aventura', 'Comédia', 'Drama', 'Fantasia', 'Horror',
  'Mistério', 'Romance', 'Sci-Fi', 'Slice of Life', 'Esportes',
  'Sobrenatural', 'Mecha', 'Histórico', 'Psicológico', 'Thriller'
]);

// Estilo atual do background
const currentBackgroundStyle = computed(() => {
  return backgroundStyles.value[currentBackgroundIndex.value];
});

// Dados dos mangás/manhwas
const mangas = ref([
  {
    id: 1,
    title: 'Solo Leveling',
    author: 'Chugong',
    image: 'solo-leveling',
    type: 'Manhwa',
    rating: 4.9,
    chapters: 179,
    status: 'Completo',
    genres: ['Ação', 'Fantasia', 'Aventura']
  },
  {
    id: 2,
    title: 'One Piece',
    author: 'Eiichiro Oda',
    image: 'one-piece',
    type: 'Mangá',
    rating: 4.8,
    chapters: 1100,
    status: 'Em andamento',
    genres: ['Aventura', 'Fantasia', 'Comédia']
  },
  {
    id: 3,
    title: 'Attack on Titan',
    author: 'Hajime Isayama',
    image: 'aot',
    type: 'Mangá',
    rating: 4.7,
    chapters: 139,
    status: 'Completo',
    genres: ['Ação', 'Fantasia Sombria', 'Drama']
  },
  {
    id: 4,
    title: 'Tower of God',
    author: 'SIU',
    image: 'tower-of-god',
    type: 'Manhwa',
    rating: 4.6,
    chapters: 550,
    status: 'Em andamento',
    genres: ['Fantasia', 'Ação', 'Mistério']
  },
  {
    id: 5,
    title: 'Demon Slayer',
    author: 'Koyoharu Gotouge',
    image: 'demon-slayer',
    type: 'Mangá',
    rating: 4.5,
    chapters: 205,
    status: 'Completo',
    genres: ['Ação', 'Fantasia', 'Histórico']
  },
  {
    id: 6,
    title: 'The Beginning After the End',
    author: 'TurtleMe',
    image: 'tbate',
    type: 'Manhwa',
    rating: 4.8,
    chapters: 175,
    status: 'Em andamento',
    genres: ['Fantasia', 'Reencarnação', 'Ação']
  },
  {
    id: 7,
    title: 'Berserk',
    author: 'Kentaro Miura',
    image: 'berserk',
    type: 'Mangá',
    rating: 4.9,
    chapters: 374,
    status: 'Em andamento',
    genres: ['Fantasia Sombria', 'Ação', 'Horror']
  },
  {
    id: 8,
    title: 'Omniscient Reader',
    author: 'Sing Shong',
    image: 'orv',
    type: 'Manhwa',
    rating: 4.7,
    chapters: 150,
    status: 'Em andamento',
    genres: ['Fantasia', 'Ação', 'Mistério']
  }
]);

const goToDashboard = () => {
  if (!isAuthenticated.value) {
    showToast('Faça login para acessar o painel!', 'warning');
    goToLogin();
  } else {
    router.push('/dashboard');
  }
};

// No script setup da HomePage
const goToPublish = () => {
  if (!isAuthenticated.value) {
    showToast('Faça login para publicar mangás!', 'warning');
    goToLogin();
  } else {
    router.push('/publish');
  }
};

// Função para obter imagem do mangá
const getMangaImage = (imageName: string) => {
  const imageMap: Record<string, string> = {
    'solo-leveling': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    'one-piece': 'https://images.unsplash.com/photo-1639322537228-f710d846310a?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    'aot': 'https://images.unsplash.com/photo-1635805737707-575885ab0820?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    'tower-of-god': 'https://images.unsplash.com/photo-1639322537502-9e1f6bf8c5c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    'demon-slayer': 'https://images.unsplash.com/photo-1635805737707-575885ab0820?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    'tbate': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    'berserk': 'https://images.unsplash.com/photo-1639322537228-f710d846310a?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    'orv': 'https://images.unsplash.com/photo-1635805737707-575885ab0820?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
  };
  
  return imageMap[imageName] || 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80';
};

// Filtrar mangás
const filteredMangas = computed(() => {
  let filtered = mangas.value;

  // Filtrar por texto de pesquisa
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(manga => 
      manga.title.toLowerCase().includes(query) ||
      manga.author.toLowerCase().includes(query) ||
      manga.genres.some(genre => 
        genre.toLowerCase().includes(query)
      )
    );
  }

  // Filtrar por gêneros selecionados
  if (selectedGenres.value.length > 0) {
    filtered = filtered.filter(manga => 
      manga.genres.some(genre => selectedGenres.value.includes(genre))
    );
  }
  
  return filtered.slice(0, visibleCount.value);
});

// Funções de navegação
const goToHome = () => {
  router.push('/');
};

const goToLogin = () => {
  router.push('/login');
};

const goToRegister = () => {
  router.push('/register');
};

const goToFavorites = () => {
  if (!isAuthenticated.value) {
    showToast('Faça login para ver seus favoritos!', 'warning');
    goToLogin();
  } else {
    router.push('/favorites');
  }
};

const goToRecent = () => {
  showToast('Funcionalidade em desenvolvimento', 'info');
};

const goToSettings = () => {
  showToast('Configurações em desenvolvimento', 'info');
};

const seeAllPopular = () => {
  visibleCount.value = mangas.value.length;
};

const logout = async () => {
  const result = authLogout();
  if (result.success) {
    await showToast(result.message, 'success');
    router.push('/');
  }
};

const changeBackground = () => {
  currentBackgroundIndex.value = (currentBackgroundIndex.value + 1) % backgroundStyles.value.length;
};

const filterMangas = (event: any) => {
  searchQuery.value = event.target.value.toLowerCase();
};

const loadMore = () => {
  visibleCount.value += 4;
};

const openMangaDetails = (manga: any) => {
  console.log('Abrindo detalhes do mangá:', manga.title);
};

const toggleFavorite = async (manga: any) => {
  if (!isAuthenticated.value) {
    await showToast('Faça login para adicionar aos favoritos!', 'warning');
    goToLogin();
    return;
  }

  const added = authToggleFavorite(manga.id);
  await showToast(
    added ? 'Adicionado aos favoritos!' : 'Removido dos favoritos!',
    'success'
  );
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

// Função para abrir o modal de seleção de gêneros
const openGenreSelectModal = async () => {
  const modal = await modalController.create({
    component: GenreSelectModal,
    componentProps: {
      initialSelectedGenres: selectedGenres.value,
    },
  });

  modal.present();

  const { data, role } = await modal.onDidDismiss();
  if (role === 'confirm' && data) {
    selectedGenres.value = data;
  }
};

// Função para remover uma tag de gênero diretamente
const removeGenreTag = (genreToRemove: string) => {
  selectedGenres.value = selectedGenres.value.filter(genre => genre !== genreToRemove);
};

onMounted(() => {
  if (!localStorage.getItem('users')) {
    localStorage.setItem('users', JSON.stringify([]));
  }
});
</script>

<style scoped>
/* RESET */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* Menu lateral - CORES FIXAS */
.menu-content {
  --background: linear-gradient(135deg, #000000 0%, #1a0000 100%) !important;
  background: linear-gradient(135deg, #000000 0%, #1a0000 100%) !important;
}

.menu-content ion-toolbar {
  --background: linear-gradient(135deg, #000000 0%, #1a0000 100%) !important;
  background: linear-gradient(135deg, #000000 0%, #1a0000 100%) !important;
  --color: white !important;
  color: white !important;
  border-bottom: 1px solid rgba(255, 0, 0, 0.3) !important;
}

.user-section {
  padding: 2rem 1.5rem;
  text-align: center;
  background: linear-gradient(135deg, rgba(255, 0, 0, 0.1) 0%, transparent 100%);
  border-bottom: 1px solid rgba(255, 0, 0, 0.2);
}

.user-avatar {
  width: 80px;
  height: 80px;
  margin: 0 auto 1rem;
  border-radius: 50%;
  background: rgba(255, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #ff0000;
}

.avatar-icon {
  font-size: 3rem;
  color: rgba(255, 255, 255, 0.8);
}

.avatar-icon.logged {
  color: #ff0000;
}

.user-greeting,
.user-name {
  color: white;
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.user-name {
  color: #ff0000;
  font-weight: 600;
}

.auth-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.login-button {
  --background: #ff0000 !important;
  --color: white !important;
  --border-radius: 8px !important;
  font-weight: 600;
}

.register-button {
  --color: #ff0000 !important;
  --border-color: #ff0000 !important;
  --border-radius: 8px !important;
  font-weight: 600;
}

.logout-button {
  --color: #ff3333 !important;
  font-weight: 500;
}

/* Menu items */
.menu-item {
  --background: transparent !important;
  --color: white !important;
  color: white !important;
  --padding-start: 1.5rem !important;
  --padding-end: 1.5rem !important;
  --min-height: 56px !important;
  margin: 0.25rem 0.5rem;
  border-radius: 12px;
}

.menu-item:hover {
  --background: rgba(255, 0, 0, 0.1) !important;
  background: rgba(255, 0, 0, 0.1) !important;
}

.menu-icon {
  color: #ff0000 !important;
  margin-right: 1rem;
}

/* Header */
.dark-toolbar {
  --background: #000000 !important;
  --color: white !important;
  background: #000000 !important;
  color: white !important;
  border-bottom: 1px solid rgba(255, 0, 0, 0.3);
}

.dark-toolbar ion-title {
  font-weight: 700;
  font-size: 1.4rem;
  letter-spacing: 1px;
}

/* Conteúdo principal */
.main-content {
  --background: transparent;
}

.background-container {
  min-height: 100%;
  background: linear-gradient(135deg, #000000 0%, #1a0000 100%);
  transition: background 0.8s ease-in-out;
}

/* Hero Section */
.hero-section {
  padding: 2rem 1.5rem 1.5rem;
  text-align: center;
  background: linear-gradient(180deg, rgba(255, 0, 0, 0.1) 0%, transparent 100%);
}

.hero-title {
  font-size: 2.5rem;
  font-weight: 800;
  color: white;
  margin-bottom: 0.5rem;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
}

.hero-title .highlight {
  color: #ff0000;
}

.hero-subtitle {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 2rem;
  font-weight: 300;
}

/* Search bar */
.search-container {
  max-width: 600px;
  margin: 0 auto 1rem; /* Ajustado margin-bottom */
}

.custom-searchbar {
  --background: rgba(255, 255, 255, 0.05);
  --border-radius: 50px;
  --box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  --color: white;
  --placeholder-color: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(255, 0, 0, 0.2);
  backdrop-filter: blur(10px);
}

.search-icon {
  color: #ff0000;
  font-size: 1.2rem;
  margin-left: 10px;
}

/* Gêneros Display Container (novo) */
.genres-display-container {
  max-width: 600px;
  margin: 0 auto 2rem;
  padding: 0 1rem;
}

.genre-selector-item {
  --background: rgba(255, 255, 255, 0.05);
  --border-color: rgba(255, 255, 255, 0.1);
  --color: white;
  --highlight-color-focused: #ff0000;
  border-radius: 12px;
  margin: 0;
  padding-left: 1rem;
  cursor: pointer;
}

.genre-selector-item ion-label {
  color: rgba(255, 255, 255, 0.7);
  font-weight: 400;
}

.selected-genres-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  max-width: 70%; /* Limita a largura para não quebrar o layout */
  justify-content: flex-end;
}

.genre-chip {
  --background: rgba(255, 0, 0, 0.2);
  --color: white;
  --border-radius: 16px;
  font-size: 0.85rem;
  padding: 4px 8px;
  border: 1px solid rgba(255, 0, 0, 0.3);
}

.genre-chip ion-icon {
  font-size: 1rem;
  margin-left: 4px;
  color: rgba(255, 255, 255, 0.7);
}

.genre-chip ion-icon:hover {
  color: white;
}

.selected-genres-tags ion-icon[name="chevron-forward"] {
  color: rgba(255, 255, 255, 0.5);
  font-size: 1.2rem;
}

/* Content container */
.content-container {
  padding: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(255, 0, 0, 0.2);
}

.section-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: white;
  margin: 0;
}

.section-title::before {
  content: '';
  display: inline-block;
  width: 4px;
  height: 20px;
  background: #ff0000;
  margin-right: 10px;
  vertical-align: middle;
}

.see-all {
  --color: #ff0000;
  font-weight: 500;
}

/* Grade de mangás */
.manga-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.manga-card {
  background: rgba(20, 20, 20, 0.8);
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(255, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
  backdrop-filter: blur(10px);
}

.manga-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 40px rgba(255, 0, 0, 0.2);
  border-color: #ff0000;
}

.card-image-container {
  position: relative;
  height: 220px;
  overflow: hidden;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, transparent 50%, rgba(0, 0, 0, 0.8) 100%);
}

.manga-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.manga-card:hover .manga-image {
  transform: scale(1.05);
}

.manga-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
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

.manga-rating {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 20px;
  color: #ffd700;
  font-size: 0.9rem;
  font-weight: 700;
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 215, 0, 0.3);
  z-index: 2;
}

.rating-icon {
  font-size: 1rem;
}

.favorite-button {
  position: absolute;
  bottom: 12px;
  left: 12px;
  --background: rgba(0, 0, 0, 0.6);
  --border-radius: 50%;
  width: 40px;
  height: 40px;
  z-index: 2;
}

.favorite-button ion-icon {
  font-size: 1.2rem;
}

/* Card content */
ion-card-header {
  padding: 1rem 1rem 0.5rem;
}

.manga-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: white;
  margin-bottom: 0.25rem;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.manga-author {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 400;
}

ion-card-content {
  padding: 0 1rem 1rem;
}

.manga-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 5px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.85rem;
  font-weight: 500;
}

.info-icon {
  color: #ff0000;
  font-size: 1rem;
}

.manga-status {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  padding: 2px 8px;
  border-radius: 10px;
}

.manga-status.completo {
  background: rgba(0, 255, 0, 0.1);
  color: #00ff00;
  border: 1px solid rgba(0, 255, 0, 0.2);
}

.manga-status.em-andamento {
  background: rgba(255, 255, 0, 0.1);
  color: #ffff00;
  border: 1px solid rgba(255, 255, 0, 0.2);
}

/* Gêneros */
.manga-genres {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.genre-tag {
  padding: 4px 10px;
  background: rgba(255, 0, 0, 0.1);
  border-radius: 12px;
  font-size: 0.75rem;
  color: white;
  border: 1px solid rgba(255, 0, 0, 0.2);
  font-weight: 500;
}

.more-genres {
  padding: 4px 10px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
}

/* Botão carregar mais */
.load-more-container {
  padding: 2rem 0;
  text-align: center;
}

.load-more-button {
  --background: #ff0000;
  --background-hover: #b30000;
  --color: white;
  --border-radius: 50px;
  --padding-top: 1rem;
  --padding-bottom: 1rem;
  max-width: 300px;
  margin: 0 auto;
  font-weight: 600;
}

/* Responsividade */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2rem;
  }
  
  .manga-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1rem;
  }
  
  .content-container {
    padding: 1rem;
  }
  
  .section-title {
    font-size: 1.5rem;
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 1.6rem;
  }
  
  .hero-subtitle {
    font-size: 1rem;
  }
  
  .manga-grid {
    grid-template-columns: 1fr;
  }
  
  .card-image-container {
    height: 200px;
  }
  
  .user-section {
    padding: 1.5rem 1rem;
  }
  
  .user-avatar {
    width: 60px;
    height: 60px;
  }
  
  .avatar-icon {
    font-size: 2rem;
  }
}
</style>