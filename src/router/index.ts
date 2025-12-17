import { createRouter, createWebHistory } from '@ionic/vue-router'
import { RouteRecordRaw } from 'vue-router'
import HomePage from '@/views/HomePage.vue'
import LoginPage from '@/views/LoginPage.vue'
import RegisterPage from '@/views/RegisterPage.vue'
import FavoritesPage from '@/views/FavoritesPage.vue'
import PublishPage from '@/views/PublishPage.vue'
import DashboardPage from '@/views/DashboardPage.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: HomePage // Mudei aqui: HomePage diretamente na raiz
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginPage
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterPage
  },
  {
    path: '/favorites',
    name: 'Favorites',
    component: FavoritesPage
  },
  {
    path: '/publish',
    name: 'Publish',
    component: PublishPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: DashboardPage,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// Guarda de rota para autenticação
router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true'
  
  if (requiresAuth && !isAuthenticated) {
    next('/login')
  } else {
    next()
  }
})

export default router