// src/composables/useAuth.ts
import { ref, computed, onMounted } from 'vue';

interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
}

export const useAuth = () => {
  const user = ref<User | null>(null);
  const isLoading = ref(false);
  const userFavorites = ref<number[]>([]);

  // Inicializar com dados do localStorage
  const initializeAuth = () => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      user.value = JSON.parse(storedUser);
    }
    
    const storedFavorites = localStorage.getItem('favorites');
    if (storedFavorites) {
      userFavorites.value = JSON.parse(storedFavorites);
    }
  };

  onMounted(() => {
    initializeAuth();
  });

  const isAuthenticated = computed(() => !!user.value);
  const userName = computed(() => user.value?.name || 'Usuário');

  // Login
  const login = async (email: string, password: string): Promise<AuthResponse> => {
    isLoading.value = true;
    
    try {
      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Verificar no localStorage
      const usersString = localStorage.getItem('users');
      const users = usersString ? JSON.parse(usersString) : [];
      
      const foundUser = users.find((u: any) => 
        u.email === email && u.password === password
      );
      
      if (!foundUser) {
        throw new Error('E-mail ou senha incorretos');
      }
      
      // Remover senha antes de armazenar
      const { password: _, ...userWithoutPassword } = foundUser;
      
      user.value = userWithoutPassword;
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));
      
      // Carregar favoritos do usuário
      const favoritesKey = `favorites_${userWithoutPassword.id}`;
      const storedFavorites = localStorage.getItem(favoritesKey);
      userFavorites.value = storedFavorites ? JSON.parse(storedFavorites) : [];
      localStorage.setItem('favorites', JSON.stringify(userFavorites.value));
      
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
        createdAt: new Date().toISOString()
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
    register,
    logout,
    toggleFavorite,
    isFavorite,
    initializeAuth
  };
};