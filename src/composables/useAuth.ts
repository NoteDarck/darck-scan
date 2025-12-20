// src/composables/useAuth.ts
import { ref, computed, onMounted } from 'vue';
import { auth, GoogleAuthProvider, signInWithPopup } from '@/firebase/config'; // Importar auth e GoogleAuthProvider

interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
  avatar?: string; // Adicionado campo avatar
}

interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
}

// Declarar variáveis reativas fora da função para que sejam singletons
const user = ref<User | null>(null);
const isLoading = ref(false);
const userFavorites = ref<number[]>([]);

// Função para inicializar o estado de autenticação do localStorage
const initializeAuth = () => {
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    user.value = JSON.parse(storedUser);
  }
  
  // Carregar favoritos do usuário logado
  if (user.value) {
    const favoritesKey = `favorites_${user.value.id}`;
    const storedFavorites = localStorage.getItem(favoritesKey);
    userFavorites.value = storedFavorites ? JSON.parse(storedFavorites) : [];
  } else {
    userFavorites.value = [];
  }
};

// Chamar initializeAuth uma vez quando o módulo é carregado
initializeAuth();

export const useAuth = () => {
  const isAuthenticated = computed(() => !!user.value);
  const userName = computed(() => user.value?.name || 'Usuário');

  // Login
  const login = async (identifier: string, password: string): Promise<AuthResponse> => { // 'email' mudou para 'identifier'
    isLoading.value = true;
    
    try {
      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Verificar no localStorage
      const usersString = localStorage.getItem('users');
      const users = usersString ? JSON.parse(usersString) : [];
      
      const foundUser = users.find((u: any) => 
        (u.email === identifier || u.name === identifier) && u.password === password // Verifica e-mail OU nome
      );
      
      if (!foundUser) {
        throw new Error('E-mail, usuário ou senha incorretos'); // Mensagem de erro atualizada
      }
      
      // Remover senha antes de armazenar
      const { password: _, ...userWithoutPassword } = foundUser;
      
      user.value = userWithoutPassword;
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));
      
      // Carregar favoritos do usuário
      const favoritesKey = `favorites_${userWithoutPassword.id}`;
      const storedFavorites = localStorage.getItem(favoritesKey);
      userFavorites.value = storedFavorites ? JSON.parse(storedFavorites) : [];
      localStorage.setItem('favorites', JSON.stringify(userFavorites.value)); // Atualiza o localStorage 'favorites' global
      
      return {
        success: true,
        message: 'Login realizado com sucesso!',
        user: userWithoutPassword
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erro ao fazer login'
      };
    } finally {
      isLoading.value = false;
    }
  };

  // Login com Google
  const loginWithGoogle = async (): Promise<AuthResponse> => {
    isLoading.value = true;
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;

      // Simular criação de usuário local ou buscar existente
      let localUsers = JSON.parse(localStorage.getItem('users') || '[]');
      let foundUser = localUsers.find((u: any) => u.email === firebaseUser.email);

      if (!foundUser) {
        // Se não existir localmente, cria um novo usuário simulado
        foundUser = {
          id: Date.now(),
          name: firebaseUser.displayName || 'Usuário Google',
          email: firebaseUser.email,
          createdAt: new Date().toISOString(),
          avatar: firebaseUser.photoURL || undefined // Salva a foto do Google
        };
        localUsers.push(foundUser);
        localStorage.setItem('users', JSON.stringify(localUsers));
        localStorage.setItem(`favorites_${foundUser.id}`, JSON.stringify([])); // Inicializa favoritos
      }

      user.value = {
        id: foundUser.id,
        name: foundUser.name,
        email: foundUser.email,
        createdAt: foundUser.createdAt,
        avatar: foundUser.avatar
      };
      localStorage.setItem('user', JSON.stringify(user.value));

      const favoritesKey = `favorites_${user.value.id}`;
      const storedFavorites = localStorage.getItem(favoritesKey);
      userFavorites.value = storedFavorites ? JSON.parse(storedFavorites) : [];
      localStorage.setItem('favorites', JSON.stringify(userFavorites.value));

      return {
        success: true,
        message: 'Login com Google realizado com sucesso!',
        user: user.value
      };
    } catch (error: any) {
      let errorMessage = 'Erro ao fazer login com Google';
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Login com Google cancelado.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      return {
        success: false,
        message: errorMessage
      };
    } finally {
      isLoading.value = false;
    }
  };

  // Register
  const register = async (name: string, email: string, password: string): Promise<AuthResponse> => {
    isLoading.value = true;
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Validações básicas
      if (password.length < 6) {
        throw new Error('A senha deve ter pelo menos 6 caracteres');
      }
      
      // Verificar se o email já existe
      const usersString = localStorage.getItem('users');
      const users = usersString ? JSON.parse(usersString) : [];
      
      const emailExists = users.some((u: any) => u.email === email);
      if (emailExists) {
        throw new Error('Este e-mail já está cadastrado');
      }
      
      // Criar novo usuário
      const newUser = {
        id: Date.now(),
        name,
        email,
        password, // Em produção, usar hash!
        createdAt: new Date().toISOString(),
        avatar: undefined // Avatar padrão
      };
      
      // Adicionar à lista de usuários
      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));
      
      // Fazer login automático
      const { password: _, ...userWithoutPassword } = newUser;
      user.value = userWithoutPassword;
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));
      
      // Inicializar lista de favoritos vazia
      userFavorites.value = [];
      localStorage.setItem('favorites', JSON.stringify([]));
      localStorage.setItem(`favorites_${newUser.id}`, JSON.stringify([]));
      
      return {
        success: true,
        message: 'Cadastro realizado com sucesso!',
        user: userWithoutPassword
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erro ao criar conta'
      };
    } finally {
      isLoading.value = false;
    }
  };

  // Logout
  const logout = (): AuthResponse => {
    try {
      user.value = null;
      userFavorites.value = [];
      localStorage.removeItem('user');
      localStorage.removeItem('favorites');
      
      return {
        success: true,
        message: 'Logout realizado com sucesso!'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erro ao fazer logout'
      };
    }
  };

  // Atualizar perfil do usuário
  const updateUserProfile = async (newName: string, newAvatar?: string): Promise<AuthResponse> => {
    if (!user.value) {
      return { success: false, message: 'Nenhum usuário logado.' };
    }

    try {
      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 500));

      const updatedUser: User = {
        ...user.value,
        name: newName,
        avatar: newAvatar || user.value.avatar // Atualiza avatar se fornecido
      };

      // Atualizar no localStorage de usuários
      let localUsers = JSON.parse(localStorage.getItem('users') || '[]');
      const userIndex = localUsers.findIndex((u: any) => u.id === updatedUser.id);
      if (userIndex !== -1) {
        // Preservar a senha existente
        const existingUser = localUsers[userIndex];
        localUsers[userIndex] = { 
          ...existingUser, 
          name: newName, 
          avatar: newAvatar,
          id: existingUser.id,
          email: existingUser.email,
          createdAt: existingUser.createdAt
        };
        localStorage.setItem('users', JSON.stringify(localUsers));
      }

      // Atualizar o usuário logado no ref e localStorage
      user.value = updatedUser;
      localStorage.setItem('user', JSON.stringify(updatedUser));

      return {
        success: true,
        message: 'Perfil atualizado com sucesso!',
        user: updatedUser
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erro ao atualizar perfil'
      };
    }
  };

  // Adicionar/remover favoritos
  const toggleFavorite = (mangaId: number): boolean => {
    if (!isAuthenticated.value) return false;
    
    const index = userFavorites.value.indexOf(mangaId);
    
    if (index > -1) {
      // Remover dos favoritos
      userFavorites.value.splice(index, 1);
    } else {
      // Adicionar aos favoritos
      userFavorites.value.push(mangaId);
    }
    
    // Salvar no localStorage
    localStorage.setItem('favorites', JSON.stringify(userFavorites.value));
    
    // Salvar também no perfil do usuário
    if (user.value) {
      localStorage.setItem(`favorites_${user.value.id}`, JSON.stringify(userFavorites.value));
    }
    
    return index === -1; // Retorna true se adicionou, false se removeu
  };

  // Verificar se é favorito
  const isFavorite = (mangaId: number): boolean => {
    return userFavorites.value.includes(mangaId);
  };

  return {
    user,
    isAuthenticated,
    userName,
    userFavorites,
    isLoading,
    login,
    loginWithGoogle, // Exportar nova função
    register,
    logout,
    updateUserProfile, // Exportar nova função
    toggleFavorite,
    isFavorite,
    initializeAuth // Manter para compatibilidade, mas a chamada inicial é global
  };
};