import { createRouter, createWebHashHistory } from '@ionic/vue-router'
import type { RouteRecordRaw } from 'vue-router'

// Views
import HomePage from '@/views/HomePage.vue'
import LoginPage from '@/views/LoginPage.vue'
import RegisterPage from '@/views/RegisterPage.vue'
import FavoritesPage from '@/views/FavoritesPage.vue'
import PublishPage from '@/views/PublishPage.vue'
import DashboardPage from '@/views/DashboardPage.vue'
import SettingsPage from '@/views/SettingsPage.vue'
import MangaDetailPage from '@/views/MangaDetailPage.vue'
import ChapterEditor from '@/views/ChapterEditor.vue'
import MangaManagementPage from '@/views/MangaManagementPage.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
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
  },
  {
    path: '/settings',
    name: 'Settings',
    component: SettingsPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/manga/:id',
    name: 'MangaDetail',
    component: MangaDetailPage
  },
  {
    path: '/chapter-editor',
    name: 'ChapterEditor',
    component: ChapterEditor,
    meta: { requiresAuth: true }
  },
  {
    path: '/manage-manga',
    name: 'MangaManagement',
    component: MangaManagementPage,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router