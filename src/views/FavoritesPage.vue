<template>
  <ion-page>
    <ion-header>
      <ion-toolbar class="dark-toolbar">
        <ion-buttons slot="start">
          <ion-back-button default-href="/" text="Voltar" color="light"></ion-back-button>
        </ion-buttons>
        <ion-title>Meus Favoritos</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="favorites-content">
      <div v-if="!isAuthenticated" class="auth-required">
        <ion-icon :icon="heart" class="auth-icon"></ion-icon>
        <h2>Faça login para ver seus favoritos</h2>
        <p>Entre na sua conta para gerenciar sua lista de mangás favoritos</p>
        <ion-button @click="goToLogin" expand="block" class="login-button">
          Fazer Login
        </ion-button>
      </div>

      <div v-else-if="favoriteMangas.length === 0" class="empty-favorites">
        <ion-icon :icon="heartOutline" class="empty-icon"></ion-icon>
        <h2>Nenhum favorito ainda</h2>
        <p>Adicione mangás aos seus favoritos para vê-los aqui</p>
        <ion-button @click="goToHome" expand="block" fill="outline" class="explore-button">
          Explorar Mangás
        </ion-button>
      </div>

      <div v-else class="favorites-container">
        <div class="favorites-header">
          <h2>Seus Favoritos ({{ favoriteMangas.length }})</h2>
          <ion-button fill="clear" color="danger" @click="clearAllFavorites" v-if="favoriteMangas.length > 0">
            Limpar Todos
          </ion-button>
        </div>
        
        <div class="favorites-grid">
          <ion-card 
            v-for="manga in favoriteMangas" 
            :key="manga.id"
            class="favorite-card"
          >
            <div class="card-image-container">
              <img :src="getMangaImage(manga.image)" :alt="manga.title" />
              <div class="image-overlay"></div>
              <ion-button 
                @click.stop="removeFromFavorites(manga)"
                class="remove-button"
                fill="clear"
                size="small"
              >
                <ion-icon :icon="heart" color="danger"></ion-icon>
              </ion-button>
            </div>
            
            <ion-card-header>
              <ion-card-title class="manga-title">{{ manga.title }}</ion-card-title>
              <ion-card-subtitle class="manga-author">{{ manga.author }}</ion-card-subtitle>
            </ion-card-header>
            
            <ion-card-content>
              <div class="manga-info">
                <div class="info-item">
                  <ion-icon :icon="star" color="warning"></ion-icon>
                  <span>{{ manga.rating }}</span>
                </div>
                <div class="info-item">
                  <ion-icon :icon="book"></ion-icon>
                  <span>{{ manga.chapters }} caps</span>
                </div>
              </div>
              
              <div class="action-buttons">
                <ion-button expand="block" @click="openMangaDetails(manga)" fill="solid" class="read-button">
                  Ler
                </ion-button>
              </div>
            </ion-card-content>
          </ion-card>
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
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonIcon,
  alertController,
  toastController
} from '@ionic/vue';
import { heart, heartOutline, star, book } from 'ionicons/icons';
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth';

const router = useRouter();
const { isAuthenticated, userFavorites, toggleFavorite } = useAuth();

// Dados dos mangás
const allMangas = ref([
  {
    id: 1,
    title: 'Solo Leveling',
    author: 'Chugong',
    image: 'solo-leveling',
    rating: 4.9,
    chapters: 179,
    status: 'Completo',
    genres: ['Ação', 'Fantasia', 'Aventura']
  },
  // ... outros mangás (mesma lista da HomePage)
]);

// Computed para obter mangás favoritos
const favoriteMangas = computed(() => {
  return allMangas.value.filter(manga => userFavorites.value.includes(manga.id));
});

const getMangaImage = (imageName: string) => {
  const imageMap: Record<string, string> = {
    'solo-leveling': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    // ... outros mapeamentos
  };
  return imageMap[imageName] || 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80';
};

const goToLogin = () => {
  router.push('/login');
};

const goToHome = () => {
  router.push('/');
};

const removeFromFavorites = async (manga: any) => {
  toggleFavorite(manga.id);
  
  const toast = await toastController.create({
    message: 'Removido dos favoritos',
    duration: 2000,
    color: 'success',
    position: 'top'
  });
  await toast.present();
};

const clearAllFavorites = async () => {
  const alert = await alertController.create({
    header: 'Limpar Todos os Favoritos',
    message: 'Tem certeza que deseja remover todos os mangás dos favoritos?',
    buttons: [
      {
        text: 'Cancelar',
        role: 'cancel'
      },
      {
        text: 'Limpar',
        handler: async () => {
          // Limpar todos os favoritos
          while (userFavorites.value.length > 0) {
            toggleFavorite(userFavorites.value[0]);
          }
          
          const toast = await toastController.create({
            message: 'Todos os favoritos foram removidos',
            duration: 2000,
            color: 'success',
            position: 'top'
          });
          await toast.present();
        }
      }
    ]
  });
  
  await alert.present();
};

const openMangaDetails = (manga: any) => {
  console.log('Abrindo mangá:', manga.title);
  // Navegar para página de detalhes
};

onMounted(() => {
  // Carregar todos os mangás se necessário
  if (allMangas.value.length === 0) {
    // Aqui você poderia carregar de uma API
  }
});
</script>

<style scoped>
.favorites-content {
  --background: linear-gradient(135deg, #000000 0%, #1a0000 100%);
}

.auth-required,
.empty-favorites {
  text-align: center;
  padding: 3rem 1.5rem;
  max-width: 400px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.auth-icon,
.empty-icon {
  font-size: 4rem;
  color: #ff0000;
  margin-bottom: 1.5rem;
}

.auth-required h2,
.empty-favorites h2 {
  color: white;
  margin-bottom: 0.5rem;
  font-size: 1.5rem;
  font-weight: 600;
}

.auth-required p,
.empty-favorites p {
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 2rem;
  text-align: center;
  line-height: 1.5;
}

.login-button {
  --background: #ff0000;
  --background-hover: #b30000;
  --color: white;
  max-width: 200px;
  font-weight: 600;
}

.explore-button {
  --color: #ff0000;
  --border-color: #ff0000;
  max-width: 200px;
  font-weight: 600;
}

.favorites-container {
  padding: 1rem;
}

.favorites-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding: 0 0.5rem;
}

.favorites-header h2 {
  color: white;
  font-size: 1.3rem;
  font-weight: 600;
  margin: 0;
}

.favorites-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}

.favorite-card {
  background: rgba(20, 20, 20, 0.8);
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(255, 0, 0, 0.2);
  backdrop-filter: blur(10px);
}

.card-image-container {
  position: relative;
  height: 160px;
  overflow: hidden;
}

.card-image-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, transparent 50%, rgba(0, 0, 0, 0.8) 100%);
}

.remove-button {
  position: absolute;
  top: 10px;
  right: 10px;
  --background: rgba(0, 0, 0, 0.6);
  --border-radius: 50%;
  width: 36px;
  height: 36px;
}

.manga-title {
  font-size: 1.1rem !important;
  font-weight: 600 !important;
  color: white !important;
  margin-bottom: 0.25rem !important;
}

.manga-author {
  font-size: 0.9rem !important;
  color: rgba(255, 255, 255, 0.7) !important;
}

.manga-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.85rem;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.read-button {
  --background: #ff0000;
  --background-hover: #b30000;
  --color: white;
  font-size: 0.9rem;
  font-weight: 500;
}

@media (max-width: 480px) {
  .favorites-grid {
    grid-template-columns: 1fr;
  }
  
  .auth-icon,
  .empty-icon {
    font-size: 3rem;
  }
  
  .auth-required h2,
  .empty-favorites h2 {
    font-size: 1.3rem;
  }
}
</style>

<style scoped>
/* Estilos para a página de favoritos */
.auth-required,
.empty-favorites {
  text-align: center;
  padding: 50px 20px;
  max-width: 400px;
  margin: 0 auto;
}

.auth-icon,
.empty-icon {
  font-size: 80px;
  color: #4fc3f7;
  margin-bottom: 20px;
}

.auth-required h2,
.empty-favorites h2 {
  color: white;
  margin-bottom: 10px;
}

.auth-required p,
.empty-favorites p {
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 30px;
}

.favorites-container {
  padding: 20px;
}

.favorites-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.favorite-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  overflow: hidden;
}

.card-image-container {
  height: 180px;
  overflow: hidden;
}

.card-image-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>