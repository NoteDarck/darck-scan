<template>
  <ion-page>
    <div class="register-background">
      <div class="background-overlay"></div>
      <div class="background-image"></div>
      
      <ion-header>
        <ion-toolbar class="dark-toolbar">
          <ion-buttons slot="start">
            <ion-back-button default-href="/" text="Voltar" color="light"></ion-back-button>
          </ion-buttons>
          <ion-title>Cadastro</ion-title>
        </ion-toolbar>
      </ion-header>

      <ion-content class="register-content">
        <div class="register-container">
          <div class="logo-section">
            <div class="logo-icon-container">
              <ion-icon :icon="personAdd" class="logo-icon"></ion-icon>
            </div>
            <h1 class="logo-title">Junte-se à <span class="highlight">Comunidade</span></h1>
            <p class="logo-subtitle">Crie sua conta gratuitamente</p>
          </div>

          <form @submit.prevent="handleRegister" class="register-form">
            <div class="input-group">
              <ion-icon :icon="person" class="input-icon"></ion-icon>
              <ion-item class="form-item" fill="outline">
                <ion-label position="floating">Nome completo</ion-label>
                <ion-input 
                  v-model="registerForm.name"
                  type="text" 
                  required
                  placeholder="Seu nome"
                ></ion-input>
              </ion-item>
            </div>

            <div class="input-group">
              <ion-icon :icon="mail" class="input-icon"></ion-icon>
              <ion-item class="form-item" fill="outline">
                <ion-label position="floating">E-mail</ion-label>
                <ion-input 
                  v-model="registerForm.email"
                  type="email" 
                  required
                  placeholder="seu@email.com"
                ></ion-input>
              </ion-item>
            </div>

            <div class="input-group">
              <ion-icon :icon="lockClosed" class="input-icon"></ion-icon>
              <ion-item class="form-item" fill="outline">
                <ion-label position="floating">Senha</ion-label>
                <ion-input 
                  v-model="registerForm.password"
                  type="password" 
                  required
                  placeholder="Mínimo 6 caracteres"
                ></ion-input>
              </ion-item>
            </div>

            <div class="input-group">
              <ion-icon :icon="lockClosed" class="input-icon"></ion-icon>
              <ion-item class="form-item" fill="outline">
                <ion-label position="floating">Confirmar senha</ion-label>
                <ion-input 
                  v-model="registerForm.confirmPassword"
                  type="password" 
                  required
                  placeholder="Digite novamente"
                ></ion-input>
              </ion-item>
            </div>

            <div class="form-options">
              <ion-checkbox v-model="acceptTerms" required class="custom-checkbox"></ion-checkbox>
              <ion-label class="terms-label">
                Concordo com os 
                <a href="#" class="terms-link" @click.prevent="showTerms">Termos de Serviço</a> 
                e 
                <a href="#" class="terms-link" @click.prevent="showPrivacy">Política de Privacidade</a>
              </ion-label>
            </div>

            <ion-button 
              expand="block" 
              type="submit" 
              class="submit-button"
              :disabled="isLoading"
            >
              <ion-spinner v-if="isLoading" name="crescent"></ion-spinner>
              <span v-else>Criar Conta</span>
            </ion-button>

            <div class="login-link">
              <p>Já tem uma conta?</p>
              <ion-button fill="clear" @click="goToLogin" class="login-link-button">
                Faça login
              </ion-button>
            </div>
          </form>
        </div>
      </ion-content>
    </div>
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
  IonCheckbox,
  IonSpinner,
  toastController
} from '@ionic/vue';
import { personAdd, mail, lockClosed, person } from 'ionicons/icons';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth';

const router = useRouter();
const { register, isLoading } = useAuth();

const registerForm = ref({
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
});

const acceptTerms = ref(false);

const handleRegister = async () => {
  // Validações
  if (!registerForm.value.name || !registerForm.value.email || 
      !registerForm.value.password || !registerForm.value.confirmPassword) {
    const toast = await toastController.create({
      message: 'Por favor, preencha todos os campos obrigatórios',
      duration: 2000,
      color: 'danger',
      position: 'top'
    });
    await toast.present();
    return;
  }

  if (registerForm.value.password !== registerForm.value.confirmPassword) {
    const toast = await toastController.create({
      message: 'As senhas não coincidem',
      duration: 2000,
      color: 'danger',
      position: 'top'
    });
    await toast.present();
    return;
  }

  if (registerForm.value.password.length < 6) {
    const toast = await toastController.create({
      message: 'A senha deve ter no mínimo 6 caracteres',
      duration: 2000,
      color: 'warning',
      position: 'top'
    });
    await toast.present();
    return;
  }

  if (!acceptTerms.value) {
    const toast = await toastController.create({
      message: 'Você deve aceitar os termos e condições',
      duration: 2000,
      color: 'warning',
      position: 'top'
    });
    await toast.present();
    return;
  }

  const result = await register(
    registerForm.value.name,
    registerForm.value.email,
    registerForm.value.password
  );
  
  const toast = await toastController.create({
    message: result.message,
    duration: 2000,
    color: result.success ? 'success' : 'danger',
    position: 'top'
  });
  await toast.present();

  if (result.success) {
    router.push('/');
  }
};

const showTerms = async () => {
  const toast = await toastController.create({
    message: 'Termos de Serviço em desenvolvimento',
    duration: 2000,
    color: 'info',
    position: 'top'
  });
  await toast.present();
};

const showPrivacy = async () => {
  const toast = await toastController.create({
    message: 'Política de Privacidade em desenvolvimento',
    duration: 2000,
    color: 'info',
    position: 'top'
  });
  await toast.present();
};

const goToLogin = () => {
  router.push('/login');
};
</script>

<style scoped>
/* ... CSS (igual ao anterior) ... */
</style>

<style scoped>
.register-background {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

.background-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(10, 0, 0, 0.95) 0%, rgba(0, 0, 0, 0.98) 100%);
  z-index: -1;
}

.background-image {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url('@/assets/backgrounds/dark-red-2.jpg');
  background-size: cover;
  background-position: center;
  opacity: 0.1;
  z-index: -2;
}

.register-content {
  --background: transparent;
}

.register-container {
  max-width: 420px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.logo-section {
  text-align: center;
  margin-bottom: 3rem;
}

.logo-icon-container {
  width: 80px;
  height: 80px;
  margin: 0 auto 1.5rem;
  background: linear-gradient(135deg, rgba(255, 0, 0, 0.1) 0%, transparent 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid rgba(255, 0, 0, 0.3);
}

.logo-icon {
  font-size: 3rem;
  color: var(--primary-red, #ff0000);
}

.logo-title {
  color: white;
  font-size: 2.2rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
}

.logo-title .highlight {
  color: var(--primary-red, #ff0000);
  background: linear-gradient(45deg, #ff0000, #ff3333);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.logo-subtitle {
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.1rem;
  font-weight: 300;
}

.register-form {
  background: rgba(20, 20, 20, 0.8);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 2rem;
  border: 1px solid rgba(255, 0, 0, 0.2);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
}

.input-group {
  position: relative;
  margin-bottom: 1.5rem;
}

.input-icon {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--primary-red, #ff0000);
  font-size: 1.2rem;
  z-index: 10;
}

.form-item {
  --background: rgba(255, 255, 255, 0.05);
  --border-color: rgba(255, 255, 255, 0.1);
  --color: white;
  --highlight-color-focused: var(--primary-red, #ff0000);
  --padding-start: 50px;
  border-radius: 12px;
  margin: 0;
}

.form-item.ion-focused {
  --border-color: var(--primary-red, #ff0000);
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

.form-options {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin: 2rem 0;
}

.custom-checkbox {
  --size: 20px;
  --background: rgba(255, 255, 255, 0.1);
  --border-color: rgba(255, 255, 255, 0.2);
  --checkmark-color: var(--primary-red, #ff0000);
  --background-checked: rgba(255, 0, 0, 0.2);
  --border-color-checked: var(--primary-red, #ff0000);
  flex-shrink: 0;
  margin-top: 2px;
}

.terms-label {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  line-height: 1.4;
}

.terms-link {
  color: var(--primary-red, #ff0000);
  text-decoration: none;
  font-weight: 500;
}

.terms-link:hover {
  text-decoration: underline;
}

.submit-button {
  --background: linear-gradient(45deg, var(--primary-red, #ff0000), var(--dark-red, #b30000));
  --background-hover: linear-gradient(45deg, var(--dark-red, #b30000), #990000);
  --border-radius: 12px;
  --color: white;
  height: 56px;
  font-weight: 600;
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
  --box-shadow: 0 4px 20px rgba(255, 0, 0, 0.3);
}

.login-link {
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.login-link p {
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
}

.login-link-button {
  --color: var(--primary-red, #ff0000);
  font-weight: 600;
  font-size: 1rem;
}

/* Animações */
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.register-form {
  animation: slideUp 0.6s ease-out;
}

/* Responsividade */
@media (max-width: 480px) {
  .register-container {
    padding: 1rem;
  }
  
  .register-form {
    padding: 1.5rem;
  }
  
  .logo-title {
    font-size: 1.8rem;
  }
  
  .logo-subtitle {
    font-size: 1rem;
  }
  
  .logo-icon-container {
    width: 60px;
    height: 60px;
  }
  
  .logo-icon {
    font-size: 2rem;
  }
  
  .terms-label {
    font-size: 0.85rem;
  }
}
</style>