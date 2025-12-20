// src/composables/useAuth.ts
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '@/supabase/config'; // Importar o cliente Supabase
import type { User as SupabaseUser } from '@supabase/supabase-js'; // Importar o tipo User do Supabase

interface User {
  id: string; // Supabase user IDs are strings (UUIDs)
  name: string;
  email: string;
  createdAt: string;
  avatar?: string;
}

interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
}

const user = ref<User | null>(null);
const isLoading = ref(false);
const userFavorites = ref<number[]>([]); // Manga IDs

const router = useRouter();

// Função para carregar o usuário e favoritos do Supabase
const loadUserAndFavorites = async () => {
  isLoading.value = true;
  try {
    const { data: { user: supabaseUser } } = await supabase.auth.getUser();

    if (supabaseUser) {
      user.value = {
        id: supabaseUser.id,
        name: supabaseUser.user_metadata?.full_name || supabaseUser.email?.split('@')[0] || 'Usuário',
        email: supabaseUser.email || '',
        createdAt: supabaseUser.created_at,
        avatar: supabaseUser.user_metadata?.avatar_url || undefined,
      };

      // Carregar favoritos do Supabase
      const { data: favoritesData, error: favoritesError } = await supabase
        .from('user_favorites')
        .select('manga_id')
        .eq('user_id', user.value.id);

      if (favoritesError) throw favoritesError;
      userFavorites.value = favoritesData.map(fav => fav.manga_id);

    } else {
      user.value = null;
      userFavorites.value = [];
    }
  } catch (error: any) {
    console.error('Erro ao carregar usuário e favoritos:', error.message);
    user.value = null;
    userFavorites.value = [];
  } finally {
    isLoading.value = false;
  }
};

// Listener para mudanças de estado de autenticação do Supabase
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
    loadUserAndFavorites();
  } else if (event === 'SIGNED_OUT') {
    user.value = null;
    userFavorites.value = [];
    router.push('/login'); // Redireciona para login após logout
  }
});

// Carregar usuário e favoritos na montagem inicial
onMounted(() => {
  loadUserAndFavorites();
});

export const useAuth = () => {
  const isAuthenticated = computed(() => !!user.value);
  const userName = computed(() => user.value?.name || 'Usuário');

  // Login com e-mail/senha
  const login = async (email: string, password: string): Promise<AuthResponse> => {
    isLoading.value = true;
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      await loadUserAndFavorites(); // Recarrega o usuário e favoritos após login

      return {
        success: true,
        message: 'Login realizado com sucesso!',
        user: user.value || undefined,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Erro ao fazer login',
      };
    } finally {
      isLoading.value = false;
    }
  };

  // Login com Google
  const loginWithGoogle = async (): Promise<AuthResponse> => {
    isLoading.value = true;
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + router.resolve('/').href, // Redireciona para a home após login
        },
      });

      if (error) throw error;

      // O listener onAuthStateChange cuidará de carregar o usuário após o redirecionamento
      return {
        success: true,
        message: 'Redirecionando para login com Google...',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Erro ao fazer login com Google',
      };
    } finally {
      isLoading.value = false;
    }
  };

  // Registro
  const register = async (name: string, email: string, password: string): Promise<AuthResponse> => {
    isLoading.value = true;
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            avatar_url: 'https://ionicframework.com/docs/img/demos/avatar.svg', // Default avatar
          },
        },
      });

      if (error) throw error;

      if (data.user && data.session) {
        await loadUserAndFavorites(); // Recarrega o usuário e favoritos após registro
        return {
          success: true,
          message: 'Cadastro realizado com sucesso! Verifique seu e-mail para confirmar a conta.',
          user: user.value || undefined,
        };
      } else {
        return {
          success: false,
          message: 'Erro ao criar conta. Tente novamente.',
        };
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Erro ao criar conta',
      };
    } finally {
      isLoading.value = false;
    }
  };

  // Logout
  const logout = async (): Promise<AuthResponse> => {
    isLoading.value = true;
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      user.value = null;
      userFavorites.value = [];
      return {
        success: true,
        message: 'Logout realizado com sucesso!',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Erro ao fazer logout',
      };
    } finally {
      isLoading.value = false;
    }
  };

  // Atualizar perfil do usuário
  const updateUserProfile = async (newName: string, newAvatar?: string): Promise<AuthResponse> => {
    if (!user.value) {
      return { success: false, message: 'Nenhum usuário logado.' };
    }
    isLoading.value = true;
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: {
          full_name: newName,
          avatar_url: newAvatar,
        },
      });

      if (error) throw error;

      if (data.user) {
        user.value = {
          id: data.user.id,
          name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'Usuário',
          email: data.user.email || '',
          createdAt: data.user.created_at,
          avatar: data.user.user_metadata?.avatar_url || undefined,
        };
        return {
          success: true,
          message: 'Perfil atualizado com sucesso!',
          user: user.value,
        };
      }
      return { success: false, message: 'Erro ao atualizar perfil.' };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Erro ao atualizar perfil',
      };
    } finally {
      isLoading.value = false;
    }
  };

  // Adicionar/remover favoritos no Supabase
  const toggleFavorite = async (mangaId: number): Promise<boolean> => {
    if (!user.value?.id) {
      console.warn('Usuário não autenticado para favoritar.');
      return false;
    }

    const userId = user.value.id;
    const index = userFavorites.value.indexOf(mangaId);
    let added = false;

    try {
      if (index > -1) {
        // Remover dos favoritos
        const { error } = await supabase
          .from('user_favorites')
          .delete()
          .eq('user_id', userId)
          .eq('manga_id', mangaId);

        if (error) throw error;
        userFavorites.value.splice(index, 1);
        added = false;
      } else {
        // Adicionar aos favoritos
        const { error } = await supabase
          .from('user_favorites')
          .insert({ user_id: userId, manga_id: mangaId });

        if (error) throw error;
        userFavorites.value.push(mangaId);
        added = true;
      }
    } catch (error: any) {
      console.error('Erro ao alternar favorito:', error.message);
      return false;
    }
    return added;
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
    loginWithGoogle,
    register,
    logout,
    updateUserProfile,
    toggleFavorite,
    isFavorite,
    loadUserAndFavorites, // Expor para recarregar manualmente se necessário
  };
};