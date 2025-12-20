<template>
  <ion-page>
    <ion-header>
      <ion-toolbar class="dark-toolbar">
        <ion-buttons slot="start">
          <ion-back-button default-href="/dashboard" text="Voltar" color="light"></ion-back-button>
        </ion-buttons>
        <ion-title>Editor de Capítulo</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="saveChapter" :disabled="isSaving">
            <ion-spinner v-if="isSaving" name="crescent"></ion-spinner>
            <span v-else>Salvar</span>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="chapter-editor-content">
      <div class="editor-container">
        <div class="chapter-info-section">
          <ion-item class="form-item" fill="outline">
            <ion-label position="floating">Número do Capítulo</ion-label>
            <ion-input 
              v-model="chapterData.number"
              type="number" 
              min="1"
              required
            ></ion-input>
          </ion-item>

          <ion-item class="form-item" fill="outline">
            <ion-label position="floating">Título do Capítulo</ion-label>
            <ion-input 
              v-model="chapterData.title"
              type="text" 
              required
              placeholder="Ex: O início da jornada"
            ></ion-input>
          </ion-item>
        </div>

        <div class="pages-section">
          <div class="section-header">
            <h3>Páginas do Capítulo</h3>
            <ion-button @click="addPage" size="small">
              <ion-icon :icon="add" slot="start"></ion-icon>
              Adicionar Página
            </ion-button>
          </div>

          <div class="pages-list">
            <div v-for="(page, index) in chapterData.pages" :key="index" class="page-item">
              <div class="page-header">
                <span class="page-number">Página {{ index + 1 }}</span>
                <ion-button @click="removePage(index)" size="small" fill="clear" color="danger" v-if="chapterData.pages.length > 1">
                  <ion-icon :icon="trash" slot="icon-only"></ion-icon>
                </ion-button>
              </div>
              
              <div class="page-content">
                <div class="page-upload" @click="triggerFileInput(index)">
                  <div v-if="!page" class="upload-placeholder">
                    <ion-icon :icon="image" class="upload-icon"></ion-icon>
                    <p>Clique para fazer upload da página</p>
                  </div>
                  <div v-else class="page-preview">
                    <img :src="page" alt="Preview da página" class="page-image" />
                    <button type="button" class="change-page" @click.stop="changePage(index)">
                      Alterar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <input 
            ref="fileInput"
            type="file" 
            accept="image/*" 
            @change="handlePageUpload"
            style="display: none;"
          />
        </div>

        <div class="editor-actions">
          <ion-button expand="block" @click="saveChapter" :disabled="isSaving || !canSave">
            <ion-spinner v-if="isSaving" name="crescent"></ion-spinner>
            <span v-else>Salvar Capítulo</span>
          </ion-button>
          
          <ion-button expand="block" fill="outline" @click="previewChapter">
            <ion-icon :icon="eye" slot="start"></ion-icon>
            Visualizar Capítulo
          </ion-button>
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
  IonSpinner,
  toastController
} from '@ionic/vue';
import { add, image, trash, eye } from 'ionicons/icons';
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();
const fileInput = ref<HTMLInputElement | null>(null);
const currentPageIndex = ref(0);
const isSaving = ref(false);

const chapterData = ref({
  number: 1,
  title: '',
  pages: [''],
  createdAt: new Date().toISOString()
});

const canSave = computed(() => {
  return (
    chapterData.value.number > 0 &&
    chapterData.value.title.trim() !== '' &&
    chapterData.value.pages.every(page => page.trim() !== '')
  );
});

onMounted(() => {
  // Carregar dados do capítulo se estiver editando
  const chapterId = route.query.chapterId;
  if (chapterId) {
    loadChapter(chapterId as string);
  }
});

const loadChapter = (chapterId: string) => {
  // Lógica para carregar capítulo existente
  console.log('Loading chapter:', chapterId);
};

const triggerFileInput = (index: number) => {
  currentPageIndex.value = index;
  fileInput.value?.click();
};

const handlePageUpload = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      chapterData.value.pages[currentPageIndex.value] = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  }
};

const changePage = (index: number) => {
  triggerFileInput(index);
};

const addPage = () => {
  chapterData.value.pages.push('');
};

const removePage = (index: number) => {
  if (chapterData.value.pages.length > 1) {
    chapterData.value.pages.splice(index, 1);
  }
};

const saveChapter = async () => {
  isSaving.value = true;

  try {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await showToast('Capítulo salvo com sucesso!', 'success');
    router.back();
  } catch (error) {
    await showToast('Erro ao salvar capítulo', 'danger');
  } finally {
    isSaving.value = false;
  }
};

const previewChapter = () => {
  showToast('Visualização do capítulo em desenvolvimento', 'info');
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
.chapter-editor-content {
  --background: linear-gradient(135deg, #000000 0%, #1a0000 100%);
}

.editor-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 1.5rem;
}

.chapter-info-section {
  background: rgba(20, 20, 20, 0.8);
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  border: 1px solid rgba(255, 0, 0, 0.2);
}

.form-item {
  --background: rgba(255, 255, 255, 0.05);
  --border-color: rgba(255, 255, 255, 0.1);
  --color: white;
  --highlight-color-focused: #ff0000;
  border-radius: 12px;
  margin-bottom: 1rem;
}

.form-item:last-child {
  margin-bottom: 0;
}

.pages-section {
  background: rgba(20, 20, 20, 0.8);
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  border: 1px solid rgba(255, 0, 0, 0.2);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-header h3 {
  color: white;
  margin: 0;
}

.pages-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.page-item {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.page-number {
  color: #ff0000;
  font-weight: 600;
  font-size: 1rem;
}

.page-upload {
  border: 2px dashed rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.02);
}

.page-upload:hover {
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

.page-preview {
  position: relative;
}

.page-image {
  max-width: 100%;
  max-height: 400px;
  border-radius: 8px;
  margin: 0 auto;
  display: block;
}

.change-page {
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

.change-page:hover {
  background: rgba(255, 0, 0, 0.8);
}

.editor-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

@media (max-width: 768px) {
  .editor-container {
    padding: 1rem;
  }
  
  .section-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
}
</style>