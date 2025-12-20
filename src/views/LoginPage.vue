<template>
  <ion-page>
    <div class="login-background">
      <ion-header>
        <ion-toolbar class="dark-toolbar">
          <ion-buttons slot="start">
            <ion-back-button 
              default-href="/" 
              text="Voltar" 
              color="light"
              class="custom-back-button"
            ></ion-back-button>
          </ion-buttons>
          <ion-title>Login</ion-title>
        </ion-toolbar>
      </ion-header>

      <ion-content class="login-content">
        <div class="login-container">
          <div class="logo-section">
            <div class="logo-icon-container">
              <ion-icon :icon="personCircle" class="logo-icon"></ion-icon>
            </div>
            <h1 class="logo-title">Darck<span class="highlight">Scan</span></h1>
            <p class="logo-subtitle">Entre no mundo dos mangás</p>
          </div>

          <form @submit.prevent="handleLogin" class="login-form">
            <div class="input-group">
              <ion-icon :icon="mail" class="input-icon"></ion-icon>
              <ion-item class="form-item" fill="outline">
                <ion-label position="floating">E-mail</ion-label>
                <ion-input 
                  v-model="loginForm.email"
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
                  v-model="loginForm.password"
                  type="password" 
                  required
                  placeholder="Digite sua senha"
                ></ion-input>
              </ion-item>
            </div>

            <div class="form-options">
              <div class="remember-me">
                <ion-checkbox v-model="rememberMe" class="custom-checkbox"></ion-checkbox>
                <ion-label class="option-label">Lembrar-me</ion-label>
              </div>
              <a href="#" class="forgot-password" @click.prevent="forgotPassword">
                Esqueci a senha
              </a>
            </div>

            <ion-button 
              expand="block" 
              type="submit" 
              class="submit-button"
              :disabled="isLoading"
            >
              <ion-spinner v-if="isLoading" name="crescent"></ion-spinner>
              <span v-else>Entrar</span>
            </ion-button>

            <div class="divider">
              <span class="divider-text">OU</span>
            </div>

            <ion-button 
              expand="block" 
              fill="outline"
              class="google-button"
              @click="handleGoogleLogin"
              :disabled="isLoading"
            >
              <ion-icon :icon="logoGoogle" slot="start"></ion-icon>
              <ion-spinner v-if="isLoading" name="crescent"></ion-spinner>
              <span v-else>Entrar com Google</span>
            </ion-button>

            <div class="register-link">
              <p>Não tem uma conta?</p>
              <ion-button fill="clear" @click="goToRegister" class="register-link-button">
                Cadastre-se agora
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
import { personCircle, mail, lockClosed, logoGoogle } from 'ionicons/icons'; // Importar logoGoogle
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth';

const router = useRouter();
const { login, loginWithGoogle, isLoading } = useAuth(); // Adicionar loginWithGoogle

const loginForm = ref({
  email: '',
  password: ''
});

const rememberMe = ref(false);

const handleLogin = async () => {
  if (!loginForm.value.email || !loginForm.value.password) {
    const toast = await toastController.create({
      message: 'Por favor, preencha todos os campos',
      duration: 2000,
      color: 'danger',
      position: 'top'
    });
    await toast.present();
    return;
  }

  const result = await login(loginForm.value.email, loginForm.value.password);
  
  const toast = await toastController.create({
    message: result.message,
    duration: 2000,
    color: result.success ? 'success' : 'danger',
    position: 'top'
  });
  await toast.present();

  if (result.success) {
    if (rememberMe.value) {
      localStorage.setItem('rememberMe', 'true');
    }
    router.push('/');
  }
};

const handleGoogleLogin = async () => {
  const result = await loginWithGoogle();

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

const forgotPassword = async () => {
  const toast = await toastController.create({
    message: 'Funcionalidade de recuperação de senha em desenvolvimento',
    duration: 2000,
    color: 'warning',
    position: 'top'
  });
  await toast.present();
};

const goToRegister = () => {
  router.push('/register');
};
</script>

<style scoped>
.login-background {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: linear-gradient(135deg, #000000 0%, #1a0000 100%);
}

/* Header fixo */
.dark-toolbar {
  --background: #000000 !important;
  --color: white !important;
  background: #000000 !important;
  color: white !important;
  border-bottom: 1px solid rgba(255, 0, 0, 0.3) !important;
}

.dark-toolbar ion-title {
  color: white !important;
  font-weight: 600;
}

/* Botão voltar VISÍVEL */
.custom-back-button {
  --color: white !important;
  --icon-color: white !important;
}

.custom-back-button::part(text) {
  color: white !important;
}

.custom-back-button::part(icon) {
  color: white !important;
}

/* Conteúdo */
.login-content {
  --background: transparent;
}

.login-container {
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
  background: rgba(255, 0, 0, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid rgba(255, 0, 0, 0.3);
}

.logo-icon {
  font-size: 3rem;
  color: #ff0000;
}

.logo-title {
  color: white;
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
}

.logo-title .highlight {
  color: #ff0000;
}

.logo-subtitle {
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.1rem;
  font-weight: 300;
}

.login-form {
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
  color: #ff0000;
  font-size: 1.2rem;
  z-index: 10;
}

.form-item {
  --background: rgba(255, 255, 255, 0.05);
  --border-color: rgba(255, 255, 255, 0.1);
  --color: white;
  --highlight-color-focused: #ff0000;
  --padding-start: 50px;
  border-radius: 12px;
  margin: 0;
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

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 8px;
}

.custom-checkbox {
  --size: 20px;
  --background: rgba(255, 255, 255, 0.1);
  --border-color: rgba(255, 255, 255, 0.2);
  --checkmark-color: #ff0000;
  --background-checked: rgba(255, 0, 0, 0.2);
  --border-color-checked: #ff0000;
}

.option-label {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
}

.forgot-password {
  color: #ff0000;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
}

.forgot-password:hover {
  color: #ff3333;
  text-decoration: underline;
}

.submit-button {
  --background: linear-gradient(45deg, #ff0000, #b30000);
  --background-hover: linear-gradient(45deg, #b30000, #990000);
  --border-radius: 12px;
  --color: white;
  height: 56px;
  font-weight: 600;
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
  --box-shadow: 0 4px 20px rgba(255, 0, 0, 0.3);
}

/* Divider para o botão do Google */
.divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 2rem 0;
  color: rgba(255, 255, 255, 0.5);
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.divider:not(:empty)::before {
  margin-right: .5em;
}

.divider:not(:empty)::after {
  margin-left: .5em;
}

.divider-text {
  padding: 0 10px;
  font-size: 0.9rem;
}

.google-button {
  --background: rgba(255, 255, 255, 0.05);
  --background-hover: rgba(255, 255, 255, 0.1);
  --border-color: rgba(255, 255, 255, 0.2);
  --color: white;
  --border-radius: 12px;
  height: 56px;
  font-weight: 600;
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
}

.google-button ion-icon {
  font-size: 1.4rem;
  margin-right: 10px;
}

.register-link {
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
}

.register-link p {
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
}

.register-link-button {
  --color: #ff0000;
  font-weight: 600;
  font-size: 1rem;
}

/* Responsividade */
@media (max-width: 480px) {
  .login-container {
    padding: 1rem;
  }
  
  .login-form {
    padding: 1.5rem;
  }
  
  .logo-title {
    font-size: 2rem;
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
}
</style>