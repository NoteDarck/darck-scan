<template>
  <ion-page>
    <ion-header>
      <ion-toolbar class="dark-toolbar">
        <ion-buttons slot="start">
          <ion-button @click="cancelSelection">
            <ion-icon :icon="close" slot="icon-only"></ion-icon>
          </ion-button>
        </ion-buttons>
        <ion-title>Selecionar Gêneros</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="confirmSelection">
            <ion-icon :icon="checkmark" slot="icon-only"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="genre-modal-content">
      <ion-list :inset="true">
        <ion-item v-for="genre in availableGenres" :key="genre" class="genre-item">
          <ion-label>{{ genre }}</ion-label>
          <ion-checkbox 
            slot="end" 
            :checked="currentSelectedGenres.includes(genre)"
            @ionChange="toggleGenre(genre)"
            class="custom-checkbox"
          ></ion-checkbox>
        </ion-item>
      </ion-list>
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
  IonButton,
  IonIcon,
  IonList,
  IonItem,
  IonLabel,
  IonCheckbox,
  modalController,
} from '@ionic/vue';
import { close, checkmark } from 'ionicons/icons';
import { ref } from 'vue';

const props = defineProps<{
  initialSelectedGenres: string[];
}>();

const availableGenres = ref([
  'Ação', 'Aventura', 'Comédia', 'Drama', 'Fantasia', 'Horror',
  'Mistério', 'Romance', 'Sci-Fi', 'Slice of Life', 'Esportes',
  'Sobrenatural', 'Mecha', 'Histórico', 'Psicológico', 'Thriller'
]);

const currentSelectedGenres = ref([...props.initialSelectedGenres]);

const toggleGenre = (genre: string) => {
  const index = currentSelectedGenres.value.indexOf(genre);
  if (index > -1) {
    currentSelectedGenres.value.splice(index, 1);
  } else {
    currentSelectedGenres.value.push(genre);
  }
};

const confirmSelection = () => {
  modalController.dismiss(currentSelectedGenres.value, 'confirm');
};

const cancelSelection = () => {
  modalController.dismiss(null, 'cancel');
};
</script>

<style scoped>
.genre-modal-content {
  --background: linear-gradient(135deg, #000000 0%, #1a0000 100%);
}

.dark-toolbar {
  --background: #000000 !important;
  --color: white !important;
  border-bottom: 1px solid rgba(255, 0, 0, 0.3) !important;
}

.dark-toolbar ion-title {
  color: white !important;
  font-weight: 600;
}

ion-button {
  --color: white;
}

ion-list {
  background: transparent;
}

.genre-item {
  --background: rgba(255, 255, 255, 0.05);
  --border-color: rgba(255, 255, 255, 0.1);
  --color: white;
  border-radius: 12px;
  margin-bottom: 8px;
}

.genre-item ion-label {
  color: white;
}

.custom-checkbox {
  --background: rgba(255, 255, 255, 0.1);
  --border-color: rgba(255, 255, 255, 0.2);
  --checkmark-color: #ff0000;
  --background-checked: rgba(255, 0, 0, 0.2);
  --border-color-checked: #ff0000;
}
</style>