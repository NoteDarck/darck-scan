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
        <ion-item 
          v-for="genre in availableGenres" 
          :key="genre" 
          class="genre-item"
          :class="{ 'selected': currentSelectedGenres.includes(genre) }"
          @click="toggleGenre(genre)"
          button
        >
          <ion-label>{{ genre }}</ion-label>
          <ion-icon 
            v-if="currentSelectedGenres.includes(genre)" 
            :icon="checkmarkCircle" 
            slot="end" 
            color="primary"
            class="selected-icon"
          ></ion-icon>
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
  modalController,
} from '@ionic/vue';
import { close, checkmark, checkmarkCircle } from 'ionicons/icons'; // Adicionado checkmarkCircle
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
  transition: all 0.2s ease-in-out; /* Adicionada transição para hover e seleção */
  cursor: pointer;
}

.genre-item ion-label {
  color: white;
}

/* Estilo para o hover */
.genre-item:hover {
  --background: rgba(255, 0, 0, 0.1); /* Fundo vermelho suave no hover */
  --border-color: #ff0000; /* Borda vermelha no hover */
  transform: translateY(-2px); /* Leve levantamento no hover */
  box-shadow: 0 4px 8px rgba(255, 0, 0, 0.2); /* Sombra no hover */
}

/* Estilo para o item selecionado */
.genre-item.selected {
  --background: rgba(255, 0, 0, 0.2); /* Fundo vermelho mais forte para selecionado */
  --border-color: #ff0000; /* Borda vermelha para selecionado */
  box-shadow: 0 0 0 2px rgba(255, 0, 0, 0.3); /* Anel de foco para selecionado */
}

.selected-icon {
  color: var(--ion-color-primary); /* Usa a cor primária definida em variables.css */
  font-size: 1.3rem;
}
</style>