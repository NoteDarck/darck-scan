<template>
  <ion-page>
    <ion-header>
      <ion-toolbar class="dark-toolbar">
        <ion-buttons slot="start">
          <ion-back-button default-href="/" text="Voltar" color="light"></ion-back-button>
        </ion-buttons>
        <ion-title>Configurações do Perfil</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="settings-content">
      <div class="settings-container">
        <h2 class="section-title">Informações do Perfil</h2>
        <p class="section-subtitle">Gerencie suas informações pessoais e foto de perfil.</p>

        <div class="profile-section">
          <!-- Avatar do Usuário -->
          <div class="avatar-upload-container" @click="triggerFileInput">
            <img 
              :src="tempAvatar || user?.avatar || 'https://ionicframework.com/docs/img/demos/avatar.svg'" 
              alt="Avatar do Usuário" 
              class="profile-avatar"
            />
            <div class="avatar-overlay">
              <ion-icon :icon="camera" class="camera-icon"></ion-icon>
            </div>
            <input 
              ref="fileInput"
              type="file" 
              accept="image/*" 
              @change="handleAvatarUpload"
              style="display: none;"
            />
          </div>
          <p class="avatar-hint">Clique para alterar a foto</p>

          <!-- Nome do Usuário -->
          <ion-item class="form-item" fill="outline">
            <ion-label position="floating">Nome de Usuário</ion-label>
            <ion-input 
              v-model="tempName"
              type="text" 
              placeholder="Seu nome"
            ></ion-input>
          </ion-item>

          <!-- E-mail (somente leitura) -->
          <ion-item class="form-item" fill="outline">
            <ion-label position="floating">E-mail</ion-label>
            <ion-input 
              :value="user?.email"
              type="email" 
              readonly
            ></ion-input>
          </ion-item>

          <ion-button 
            expand="block" 
            class="save-button"
            @click="saveProfileChanges"
            :disabled="isSaving"
          >
            <ion-spinner v-if="isSaving" name="crescent"></ion-spinner>
            <span v-else>Salvar Alterações</span>
          </ion-button>
        </div>

        <h2 class="section-title">Segurança da Conta</h2>
        <p class="section-subtitle">Gerencie suas credenciais de login.</p>

        <div class="security-section">
          <ion-item class="setting-item" button @click="changePassword">
            <ion-icon :icon="lockClosed" slot="start" class="setting-icon"></ion-icon>
            <ion-label>Alterar Senha</ion-label>
            <ion-icon :icon="chevronForward" slot="end"></ion-icon>
          </ion-item>

          <ion-item class="setting-item" button @click="deleteAccount">
            <ion-icon :icon="trash" slot="start" color="danger" class="setting-icon"></ion-icon>
            <ion-label color="danger">Excluir Conta</ion-label>
            <ion-icon :icon="chevronForward" slot="end" color="danger"></ion-icon>
          </ion-item>
        </div>

        <h2 class="section-title">Preferências do Aplicativo</h2>
        <p class="section-subtitle">Personalize sua experiência no DarckScan.</p>

        <div class="preferences-section">
          <ion-item class="setting-item">
            <ion-icon :icon="moon" slot="start" class="setting-icon"></ion-icon>
            <ion-label>Modo Escuro</ion-label>
            <ion-toggle :checked="isDarkMode" @ionChange="toggleDarkMode"></ion-toggle>
          </ion-item>

          <ion-item class="setting-item">
            <ion-icon :icon="notifications" slot="start" class="setting-icon"></ion-icon>
            <ion-label>Notificações Push</ion-label>
            <ion-toggle :checked="receiveNotifications" @ionChange="toggleNotifications"></ion-toggle>
          </ion-item>
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
  IonToggle,
  IonSpinner,
  toastController,
  alertController,
} from '@ionic/vue';
import { 
  camera, 
  lockClosed, 
  trash, 
  chevronForward, 
  moon, 
  notifications 
} from 'ionicons/icons';
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth';

const router = useRouter();
const { user, isAuthenticated, updateUserProfile, logout } = useAuth();

const tempName = ref(user.value?.name || '');
const tempAvatar = ref(user.value?.avatar || '');
const isSaving = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);

// Preferências do aplicativo (simuladas)
const isDarkMode = ref(true); // Exemplo: pode ser lido do localStorage
const receiveNotifications = ref(true); // Exemplo: pode ser lido do localStorage

onMounted(() => {
  if (!isAuthenticated.value) {
    setTimeout(() => {
      router.push('/login');
    }, 100);
  }
});

const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleAvatarUpload = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    const file = input.files[0];
    const reader = new FileReader();
    
    reader.onload = (e) => {
      tempAvatar.value = e.target?.result as string;
    };
    
    reader.readAsDataURL(file);
  }
};

const saveProfileChanges = async () => {
  isSaving.value = true;
  try {
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simula delay de rede

    const result = await updateUserProfile(tempName.value, tempAvatar.value);

    if (result.success) {
      await showToast(result.message, 'success');
    } else {
      await showToast(result.message, 'danger');
    }
  } catch (error) {
    console.error('Erro ao salvar perfil:', error);
    await showToast('Erro ao salvar perfil', 'danger');
  } finally {
    isSaving.value = false;
  }
};

const changePassword = async () => {
  const alert = await alertController.create({
    header: 'Alterar Senha',
    message: 'Esta funcionalidade será implementada em breve. Você poderá alterar sua senha aqui.',
    buttons: ['OK']
  });
  await alert.present();
};

const deleteAccount = async () => {
  const alert = await alertController.create({
    header: 'Excluir Conta',
    message: 'Tem certeza que deseja excluir sua conta? Esta ação é irreversível.',
    buttons: [
      {
        text: 'Cancelar',
        role: 'cancel',
      },
      {
        text: 'Excluir',
        cssClass: 'alert-button-danger',
        handler: async () => {
          // Lógica para excluir a conta (simulada)
          await new Promise(resolve => setTimeout(resolve, 1500));
          logout(); // Faz logout após a exclusão
          await showToast('Sua conta foi excluída com sucesso.', 'success');
          router.push('/register'); // Redireciona para a página de registro
        },
      },
    ],
  });
  await alert.present();
};

const toggleDarkMode = (event: CustomEvent) => {
  isDarkMode.value = event.detail.checked;
  // Implementar lógica para mudar o tema globalmente
  showToast(`Modo Escuro ${isDarkMode.value ? 'ativado' : 'desativado'}`, 'info');
};

const toggleNotifications = (event: CustomEvent) => {
  receiveNotifications.value = event.detail.checked;
  // Implementar lógica para gerenciar notificações
  showToast(`Notificações ${receiveNotifications.value ? 'ativadas' : 'desativadas'}`, 'info');
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
.settings-content {
  --background: linear-gradient(135deg, #000000 0%, #1a0000 100%);
}

.settings-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 1.5rem;
}

.section-title {
  color: white;
  font-size: 1.5rem;
  font-weight: 700;
  margin-top: 2rem;
  margin-bottom: 0.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.section-subtitle {
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 1.5rem;
  font-size: 0.95rem;
}

.profile-section,
.security-section,
.preferences-section {
  background: rgba(20, 20, 20, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 0, 0, 0.2);
  margin-bottom: 2rem;
}

/* Avatar Upload */
.avatar-upload-container {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  margin: 0 auto 1rem;
  border: 3px solid #ff0000;
  cursor: pointer;
  transition: all 0.3s ease;
}

.avatar-upload-container:hover {
  transform: scale(1.05);
  box-shadow: 0 0 0 5px rgba(255, 0, 0, 0.3);
}

.profile-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.avatar-upload-container:hover .avatar-overlay {
  opacity: 1;
}

.camera-icon {
  font-size: 2.5rem;
  color: white;
}

.avatar-hint {
  text-align: center;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.85rem;
  margin-bottom: 2rem;
}

/* Formulário */
.form-item {
  --background: rgba(255, 255, 255, 0.05);
  --border-color: rgba(255, 255, 255, 0.1);
  --color: white;
  --highlight-color-focused: #ff0000;
  border-radius: 12px;
  margin-bottom: 1rem;
}

.form-item.ion-focused {
  --border-color: #ff0000;
  --box-shadow: 0 0 0 2px rgba(255, 0, 0, 0.2);
}

.form-item ion-label {
  color: rgba(255, 255, 255, 0.7);
  font-weight: 400;
}

.form-item ion-input {
  color: white;
  --padding-top: 16px;
  --padding-bottom: 16px;
}

.save-button {
  --background: linear-gradient(45deg, #ff0000, #b30000);
  --background-hover: linear-gradient(45deg, #b30000, #990000);
  --border-radius: 12px;
  --color: white;
  height: 50px;
  font-weight: 600;
  font-size: 1rem;
  margin-top: 1.5rem;
  --box-shadow: 0 4px 20px rgba(255, 0, 0, 0.3);
}

/* Itens de Configuração */
.setting-item {
  --background: transparent;
  --border-color: rgba(255, 255, 255, 0.1);
  --color: white;
  border-radius: 12px;
  margin-bottom: 0.5rem;
  transition: background 0.3s ease;
}

.setting-item:hover {
  --background: rgba(255, 0, 0, 0.05);
}

.setting-icon {
  color: #ff0000;
  font-size: 1.3rem;
}

.setting-item ion-label {
  color: white;
  font-weight: 500;
}

.setting-item ion-toggle {
  --handle-background: #ff0000;
  --handle-background-checked: #00ff00;
  --background: rgba(255, 255, 255, 0.2);
  --background-checked: rgba(0, 255, 0, 0.2);
}

/* Responsividade */
@media (max-width: 480px) {
  .settings-container {
    padding: 1rem;
  }
  
  .section-title {
    font-size: 1.3rem;
  }
  
  .section-subtitle {
    font-size: 0.85rem;
  }
  
  .profile-section,
  .security-section,
  .preferences-section {
    padding: 1rem;
  }
  
  .avatar-upload-container {
    width: 100px;
    height: 100px;
  }
  
  .camera-icon {
    font-size: 2rem;
  }
}
</style>