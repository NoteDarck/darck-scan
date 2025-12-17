// src/router/index.ts
import { createRouter, createWebHistory } from '@ionic/vue-router'
import { RouteRecordRaw } from 'vue-router'
import HomePage from '@/views/HomePage.vue'
import LoginPage from '@/views/LoginPage.vue'
import RegisterPage from '@/views/RegisterPage.vue'
import FavoritesPage from '@/views/FavoritesPage.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/home',
    name: 'Home',
    component: HomePage
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
  // Em src/router/index.ts
{
  path: '/publish',
  name: 'Publish',
  component: () => import('@/views/PublishPage.vue'),
  meta: { requiresAuth: true }
},
// Em src/router/index.ts
{
  path: '/dashboard',
  name: 'Dashboard',
  component: () => import('@/views/DashboardPage.vue'),
  meta: { requiresAuth: true }
}
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router