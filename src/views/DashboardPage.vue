<template>
  <ion-page>
    <ion-header>
      <ion-toolbar class="dark-toolbar">
        <ion-buttons slot="start">
          <ion-back-button default-href="/" text="Voltar" color="light"></ion-back-button>
        </ion-buttons>
        <ion-title>Meu Painel</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="refreshData" fill="clear">
            <ion-icon :icon="refresh" slot="icon-only"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="dashboard-content">
      <!-- Banner do Autor -->
      <div class="author-banner">
        <div class="author-info">
          <div class="author-avatar">
            <img 
              v-if="user?.avatar" 
              :src="user.avatar" 
              alt="Avatar do Autor" 
              class="avatar-image"
            />
            <ion-icon v-else :icon="personCircle" class="avatar-icon"></ion-icon>
          </div>
          <div class="author-details">
            <h2>{{ user?.name || 'Autor' }}</h2>
            <p class="author-email">{{ user?.email || '' }}</p>
            <div class="author-stats">
              <span class="stat-item">
                <ion-icon :icon="book" class="stat-icon"></ion-icon>
                {{ stats.totalWorks }} obras
              </span>
              <span class="stat-item">
                <ion-icon :icon="star" class="stat-icon"></ion-icon>
                {{ stats.totalLikes }} curtidas
              </span>
              <span class="stat-item">
                <ion-icon :icon="eye" class="stat-icon"></ion-icon>
                {{ formatNumber(stats.totalViews) }} visualizações
              </span>
            </div>
          </div>
        </div>
        <div class="author-actions">
          <ion-button @click="goToPublish" class="publish-btn">
            <ion-icon :icon="add" slot="start"></ion-icon>
            Nova Obra
          </ion-button>
          <ion-button @click="goToSettings" fill="outline" class="edit-profile-btn">
            <ion-icon :icon="create" slot="start"></ion-icon>
            Editar Perfil
          </ion-button>
        </div>
      </div>

      <!-- Cards de Estatísticas -->
      <div class="stats-grid">
        <div class="stat-card primary">
          <div class="stat-icon-container">
            <ion-icon :icon="trendingUp" class="stat-card-icon"></ion-icon>
          </div>
          <div class="stat-info">
            <h3>{{ formatNumber(stats.viewsToday) }}</h3>
            <p>Visualizações Hoje</p>
            <span class="stat-change" :class="{ 'positive': stats.viewChange >= 0, 'negative': stats.viewChange < 0 }">
              <ion-icon :icon="stats.viewChange >= 0 ? arrowUp : arrowDown"></ion-icon>
              {{ Math.abs(stats.viewChange) }}%
            </span>
          </div>
        </div>

        <div class="stat-card success">
          <div class="stat-icon-container">
            <ion-icon :icon="heart" class="stat-card-icon"></ion-icon>
          </div>
          <div class="stat-info">
            <h3>{{ stats.likesToday }}</h3>
            <p>Curtidas Hoje</p>
            <span class="stat-change" :class="{ 'positive': stats.likeChange >= 0, 'negative': stats.likeChange < 0 }">
              <ion-icon :icon="stats.likeChange >= 0 ? arrowUp : arrowDown"></ion-icon>
              {{ Math.abs(stats.likeChange) }}%
            </span>
          </div>
        </div>

        <div class="stat-card warning">
          <div class="stat-icon-container">
            <ion-icon :icon="chatbubbles" class="stat-card-icon"></ion-icon>
          </div>
          <div class="stat-info">
            <h3>{{ stats.newComments }}</h3>
            <p>Novos Comentários</p>
            <span class="stat-change positive">
              <ion-icon :icon="arrowUp"></ion-icon>
              {{ stats.commentChange }}%
            </span>
          </div>
        </div>

        <div class="stat-card info">
          <div class="stat-icon-container">
            <ion-icon :icon="cash" class="stat-card-icon"></ion-icon>
          </div>
          <div class="stat-info">
            <h3>R$ {{ stats.earnings.toFixed(2) }}</h3>
            <p>Ganhos do Mês</p>
            <span class="stat-change positive">
              <ion-icon :icon="arrowUp"></ion-icon>
              {{ stats.earningChange }}%
            </span>
          </div>
        </div>
      </div>

      <!-- Gráfico de Desempenho -->
      <div class="chart-section">
        <div class="section-header">
          <h3>Desempenho (Últimos 7 dias)</h3>
          <div class="chart-options">
            <ion-segment v-model="chartType" @ionChange="updateChart">
              <ion-segment-button value="views">
                <ion-label>Visualizações</ion-label>
              </ion-segment-button>
              <ion-segment-button value="likes">
                <ion-label>Curtidas</ion-label>
              </ion-segment-button>
              <ion-segment-button value="comments">
                <ion-label>Comentários</ion-label>
              </ion-segment-button>
            </ion-segment>
          </div>
        </div>
        <div class="chart-container">
          <canvas ref="chartCanvas"></canvas>
        </div>
      </div>

      <!-- Tabs de Conteúdo -->
      <ion-segment v-model="activeTab" @ionChange="loadTabContent">
        <ion-segment-button value="works">
          <ion-label>Minhas Obras</ion-label>
        </ion-segment-button>
        <ion-segment-button value="drafts">
          <ion-label>Rascunhos</ion-label>
        </ion-segment-button>
        <ion-segment-button value="comments">
          <ion-label>Comentários</ion-label>
          <ion-badge v-if="unreadComments > 0" color="danger" class="tab-badge">
            {{ unreadComments }}
          </ion-badge>
        </ion-segment-button>
        <ion-segment-button value="analytics">
          <ion-label>Análises</ion-label>
        </ion-segment-button>
      </ion-segment>

      <!-- Conteúdo da Tab Ativa -->
      <div class="tab-content">
        <!-- Tab: Minhas Obras -->
        <div v-if="activeTab === 'works'" class="works-tab">
          <div class="works-header">
            <h3>Obras Publicadas ({{ userPublishedMangas.length }})</h3>
            <div class="sort-options">
              <ion-select v-model="sortBy" placeholder="Ordenar por" @ionChange="sortWorks">
                <ion-select-option value="newest">Mais Recentes</ion-select-option>
                <ion-select-option value="oldest">Mais Antigos</ion-select-option>
                <ion-select-option value="views">Mais Visualizações</ion-select-option>
                <ion-select-option value="likes">Mais Curtidas</ion-select-option>
              </ion-select>
            </div>
          </div>

          <div class="works-grid">
            <div v-for="manga in userPublishedMangas" :key="manga.id" class="work-card">
              <div class="work-card-header">
                <div class="work-status" :class="manga.status">
                  {{ getStatusLabel(manga.status) }}
                </div>
                <div class="work-actions-menu">
                  <ion-button fill="clear" size="small" @click="openWorkMenu(manga)">
                    <ion-icon :icon="ellipsisVertical" slot="icon-only"></ion-icon>
                  </ion-button>
                </div>
              </div>

              <div class="work-card-content" @click="viewManga(manga.id!)">
                <div class="work-cover">
                  <img :src="manga.cover || 'https://via.placeholder.com/150x200'" :alt="manga.title" />
                  <div class="work-overlay">
                    <span class="work-chapters">{{ manga.chapters?.length || 0 }} caps</span>
                  </div>
                </div>
                <div class="work-info">
                  <h4 class="work-title">{{ manga.title }}</h4>
                  <p class="work-type">{{ getTypeLabel(manga.type) }}</p>
                  <div class="work-stats">
                    <div class="work-stat">
                      <ion-icon :icon="eye" class="stat-icon"></ion-icon>
                      <span>{{ formatNumber(manga.views || 0) }}</span>
                    </div>
                    <div class="work-stat">
                      <ion-icon :icon="heart" class="stat-icon"></ion-icon>
                      <span>{{ manga.likes || 0 }}</span>
                    </div>
                    <div class="work-stat">
                      <ion-icon :icon="chatbubble" class="stat-icon"></ion-icon>
                      <span>{{ manga.comments || 0 }}</span>
                    </div>
                  </div>
                  <div class="work-date">
                    Publicado em: {{ formatDate(manga.publishedAt) }}
                  </div>
                </div>
              </div>

              <div class="work-card-footer">
                <ion-button size="small" fill="clear" @click.stop="editManga(manga.id!)">
                  <ion-icon :icon="create" slot="start"></ion-icon>
                  Editar
                </ion-button>
                <ion-button size="small" fill="clear" @click.stop="viewAnalytics(manga.id!)">
                  <ion-icon :icon="analytics" slot="start"></ion-icon>
                  Análises
                </ion-button>
                <ion-button size="small" fill="clear" @click.stop="addChapter(manga.id!)">
                  <ion-icon :icon="add" slot="start"></ion-icon>
                  Capítulo
                </ion-button>
              </div>
            </div>
          </div>

          <div v-if="userPublishedMangas.length === 0" class="empty-state">
            <ion-icon :icon="book" class="empty-icon"></ion-icon>
            <h4>Nenhuma obra publicada ainda</h4>
            <p>Comece criando sua primeira obra!</p>
            <ion-button @click="goToPublish">Criar Primeira Obra</ion-button>
          </div>
        </div>

        <!-- Tab: Rascunhos -->
        <div v-else-if="activeTab === 'drafts'" class="drafts-tab">
          <div class="drafts-header">
            <h3>Rascunhos ({{ userDrafts.length }})</h3>
            <ion-button @click="goToPublish" size="small">
              <ion-icon :icon="add" slot="start"></ion-icon>
              Novo Rascunho
            </ion-button>
          </div>

          <div class="drafts-list">
            <div v-for="draft in userDrafts" :key="draft.id" class="draft-card">
              <div class="draft-info">
                <h4>{{ draft.title || 'Sem título' }}</h4>
                <p class="draft-preview">
                  {{ draft.synopsis ? (draft.synopsis.substring(0, 100) + '...') : 'Sem descrição' }}
                </p>
                <div class="draft-details">
                  <span class="draft-date">Salvo em: {{ formatDate(draft.updatedAt) }}</span>
                  <span class="draft-chapters">{{ draft.chapters?.length || 0 }} capítulos</span>
                </div>
              </div>
              <div class="draft-actions">
                <ion-button size="small" @click="continueDraft(draft.id!)">
                  Continuar
                </ion-button>
                <ion-button size="small" fill="outline" @click="previewDraft(draft.id!)">
                  Visualizar
                </ion-button>
                <ion-button size="small" fill="clear" color="danger" @click="deleteDraft(draft.id!)">
                  <ion-icon :icon="trash" slot="icon-only"></ion-icon>
                </ion-button>
              </div>
            </div>
          </div>

          <div v-if="userDrafts.length === 0" class="empty-state">
            <ion-icon :icon="document" class="empty-icon"></ion-icon>
            <h4>Nenhum rascunho salvo</h4>
            <p>Comece a criar uma nova obra e salve como rascunho!</p>
          </div>
        </div>

        <!-- Tab: Comentários -->
        <div v-else-if="activeTab === 'comments'" class="comments-tab">
          <div class="comments-header">
            <h3>Comentários Recentes</h3>
            <div class="comment-filters">
              <ion-segment v-model="commentFilter" size="small">
                <ion-segment-button value="all">
                  <ion-label>Todos</ion-label>
                </ion-segment-button>
                <ion-segment-button value="unread">
                  <ion-label>Não Lidos</ion-label>
                </ion-segment-button>
                <ion-segment-button value="replied">
                  <ion-label>Respondidos</ion-label>
                </ion-segment-button>
              </ion-segment>
            </div>
          </div>

          <div class="comments-list">
            <div v-for="comment in filteredComments" :key="comment.id"
                 class="comment-card" :class="{ 'unread': !comment.read }">
              <div class="comment-header">
                <div class="comment-user">
                  <ion-icon :icon="personCircle" class="user-icon"></ion-icon>
                  <div class="user-info">
                    <strong>{{ comment.userName }}</strong>
                    <span class="comment-date">{{ formatDate(comment.date) }}</span>
                  </div>
                </div>
                <div class="comment-manga">
                  Em: {{ comment.mangaTitle }}
                  <span class="comment-chapter">Cap. {{ comment.chapter }}</span>
                </div>
              </div>

              <div class="comment-content">
                <p>{{ comment.content }}</p>
              </div>

              <div class="comment-actions">
                <ion-button size="small" @click="replyComment(comment.id)" v-if="!comment.replied">
                  <ion-icon :icon="arrowUndo" slot="start"></ion-icon>
                  Responder
                </ion-button>
                <ion-button size="small" fill="outline" @click="viewCommentContext(comment.id)">
                  <ion-icon :icon="open" slot="start"></ion-icon>
                  Ver Contexto
                </ion-button>
                <ion-button size="small" fill="clear" color="danger" @click="deleteComment(comment.id)">
                  <ion-icon :icon="trash" slot="icon-only"></ion-icon>
                </ion-button>
              </div>

              <div v-if="comment.reply" class="comment-reply">
                <div class="reply-header">
                  <strong>Sua resposta:</strong>
                  <span class="reply-date">{{ formatDate(comment.replyDate) }}</span>
                </div>
                <p>{{ comment.reply }}</p>
              </div>
            </div>
          </div>

          <div v-if="filteredComments.length === 0" class="empty-state">
            <ion-icon :icon="chatbubbles" class="empty-icon"></ion-icon>
            <h4>Nenhum comentário encontrado</h4>
            <p>Os comentários dos seus leitores aparecerão aqui</p>
          </div>
        </div>

        <!-- Tab: Análises -->
        <div v-else-if="activeTab === 'analytics'" class="analytics-tab">
          <div class="analytics-header">
            <h3>Análises Detalhadas</h3>
            <div class="analytics-period">
              <ion-select v-model="analyticsPeriod" @ionChange="loadAnalytics">
                <ion-select-option value="7">Últimos 7 dias</ion-select-option>
                <ion-select-option value="30">Últimos 30 dias</ion-select-option>
                <ion-select-option value="90">Últimos 3 meses</ion-select-option>
                <ion-select-option value="365">Último ano</ion-select-option>
              </ion-select>
            </div>
          </div>

          <div class="analytics-grid">
            <div class="analytics-card">
              <h4>Obras Mais Populares</h4>
              <div class="popular-works">
                <div v-for="(work, index) in topWorks" :key="work.id" class="popular-work">
                  <div class="work-rank">{{ index + 1 }}</div>
                  <div class="work-details">
                    <strong>{{ work.title }}</strong>
                    <div class="work-metrics">
                      <span>{{ formatNumber(work.views) }} visualizações</span>
                      <span>{{ work.likes }} curtidas</span>
                    </div>
                  </div>
                  <div class="work-growth" :class="{ 'positive': work.growth >= 0, 'negative': work.growth < 0 }">
                    {{ work.growth >= 0 ? '+' : '' }}{{ work.growth }}%
                  </div>
                </div>
              </div>
            </div>

            <div class="analytics-card">
              <h4>Demografia dos Leitores</h4>
              <div class="demographics">
                <div class="demographic-item">
                  <div class="demographic-label">Gênero</div>
                  <div class="demographic-data">
                    <div class="demographic-bar">
                      <div class="bar-fill" style="width: 65%"></div>
                    </div>
                    <span>65% Masculino</span>
                  </div>
                </div>
                <div class="demographic-item">
                  <div class="demographic-label">Idade</div>
                  <div class="demographic-data">
                    <div class="age-distribution">
                      <div class="age-group">
                        <span>18-24</span>
                        <div class="age-bar" style="width: 40%"></div>
                      </div>
                      <div class="age-group">
                        <span>25-34</span>
                        <div class="age-bar" style="width: 35%"></div>
                      </div>
                      <div class="age-group">
                        <span>35+</span>
                        <div class="age-bar" style="width: 25%"></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="demographic-item">
                  <div class="demographic-label">Países</div>
                  <div class="countries-list">
                    <div class="country">
                      <span>🇧🇷 Brasil</span>
                      <span>45%</span>
                    </div>
                    <div class="country">
                      <span>🇵🇹 Portugal</span>
                      <span>25%</span>
                    </div>
                    <div class="country">
                      <span>🇺🇸 EUA</span>
                      <span>15%</span>
                    </div>
                    <div class="country">
                      <span>🌐 Outros</span>
                      <span>15%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="analytics-card">
              <h4>Horários de Pico</h4>
              <div class="peak-hours">
                <div class="hour-chart">
                  <div v-for="hour in peakHours" :key="hour.time" class="hour-bar">
                    <div class="bar-label">{{ hour.time }}</div>
                    <div class="bar-container">
                      <div class="bar" :style="{ height: hour.percentage + '%' }"></div>
                    </div>
                    <div class="bar-value">{{ hour.percentage }}%</div>
                  </div>
                </div>
              </div>
            </div>

            <div class="analytics-card">
              <h4>Engajamento por Capítulo</h4>
              <div class="chapter-engagement">
                <div v-for="chapter in chapterEngagement" :key="chapter.number" class="engagement-item">
                  <div class="engagement-info">
                    <strong>Capítulo {{ chapter.number }}</strong>
                    <span>{{ chapter.title }}</span>
                  </div>
                  <div class="engagement-stats">
                    <div class="stat">
                      <ion-icon :icon="eye"></ion-icon>
                      {{ formatNumber(chapter.views) }}
                    </div>
                    <div class="stat">
                      <ion-icon :icon="heart"></ion-icon>
                      {{ chapter.likes }}
                    </div>
                    <div class="stat">
                      <ion-icon :icon="chatbubble"></ion-icon>
                      {{ chapter.comments }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions">
        <h3>Ações Rápidas</h3>
        <div class="actions-grid">
          <div class="action-card" @click="goToPublish">
            <ion-icon :icon="addCircle" class="action-icon"></ion-icon>
            <span>Nova Obra</span>
          </div>
          <div class="action-card" @click="importWork">
            <ion-icon :icon="download" class="action-icon"></ion-icon>
            <span>Importar</span>
          </div>
          <div class="action-card" @click="exportData">
            <ion-icon :icon="share" class="action-icon"></ion-icon>
            <span>Exportar Dados</span>
          </div>
          <div class="action-card" @click="viewEarnings">
            <ion-icon :icon="cash" class="action-icon"></ion-icon>
            <span>Ganhos</span>
          </div>
          <div class="action-card" @click="manageSchedule">
            <ion-icon :icon="calendar" class="action-icon"></ion-icon>
            <span>Agendar</span>
          </div>
          <div class="action-card" @click="viewNotifications">
            <ion-icon :icon="notifications" class="action-icon"></ion-icon>
            <span>Notificações</span>
            <ion-badge v-if="unreadNotifications > 0" color="danger" class="notification-badge">
              {{ unreadNotifications }}
            </ion-badge>
          </div>
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
  IonButtons,
  IonIcon,
  IonBadge,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonSelect,
  IonSelectOption,
  toastController,
  alertController,
  modalController
} from '@ionic/vue';
import { 
  personCircle, 
  book, 
  star, 
  eye, 
  add, 
  create, 
  trendingUp, 
  heart,
  chatbubbles,
  cash,
  arrowUp,
  arrowDown,
  ellipsisVertical,
  analytics,
  chatbubble,
  trash,
  document,
  arrowUndo,
  open,
  refresh,
  addCircle,
  download,
  share,
  calendar,
  notifications,
  settings
} from 'ionicons/icons';
import { ref, onMounted, computed, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth';
import { useMangaData } from '@/composables/useMangaData';
import Chart from 'chart.js/auto';
import { MangaData } from '@/types/manga';

const router = useRouter();
const { user, isAuthenticated } = useAuth();
const { allStoredMangas, loadAllMangasFromLocalStorage, updateManga } = useMangaData();

const userPublishedMangas = computed(() => {
  return allStoredMangas.value.filter(m => m.userId === user.value?.id && !m.isDraft);
});

const userDrafts = computed(() => {
  return allStoredMangas.value.filter(m => m.userId === user.value?.id && m.isDraft);
});

onMounted(() => {
  if (!isAuthenticated.value) {
    setTimeout(() => {
      router.push('/login');
    }, 100);
  } else {
    loadDashboardData();
  }
});

const activeTab = ref('works');
const chartType = ref('views');
const chartCanvas = ref<HTMLCanvasElement | null>(null);
let chartInstance: Chart | null = null;
const sortBy = ref('newest');
const commentFilter = ref('all');
const analyticsPeriod = ref('7');
const unreadComments = ref(3);
const unreadNotifications = ref(5);

const stats = ref({
  totalWorks: 0,
  totalLikes: 0,
  totalViews: 0,
  viewsToday: 0,
  likesToday: 0,
  newComments: 0,
  earnings: 0,
  viewChange: 12,
  likeChange: 8,
  commentChange: 15,
  earningChange: 25
});

const comments = ref<any[]>([]);
const topWorks = ref<any[]>([]);
const peakHours = ref<any[]>([]);
const chapterEngagement = ref<any[]>([]);

const loadDashboardData = async () => {
  try {
    loadAllMangasFromLocalStorage();

    calculateStats();

    loadComments();

    loadAnalytics();

    nextTick(() => {
      if (chartCanvas.value) {
        initializeChart();
      }
    });
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
    showToast('Erro ao carregar dados do dashboard', 'danger');
  }
};

const calculateStats = () => {
  const works = userPublishedMangas.value;

  stats.value = {
    totalWorks: works.length,
    totalLikes: works.reduce((sum, m) => sum + (m.likes || 0), 0),
    totalViews: works.reduce((sum, m) => sum + (m.views || 0), 0),
    viewsToday: Math.floor(Math.random() * 1000) + 500,
    likesToday: Math.floor(Math.random() * 200) + 50,
    newComments: Math.floor(Math.random() * 50) + 10,
    earnings: works.length * 25.50,
    viewChange: 12,
    likeChange: 8,
    commentChange: 15,
    earningChange: 25
  };
};

const loadComments = () => {
  comments.value = [
    {
      id: 1,
      userName: 'Leitor123',
      date: new Date().toISOString(),
      mangaTitle: 'Solo Leveling',
      chapter: 12,
      content: 'Incrível capítulo! Mal posso esperar pelo próximo!',
      read: false,
      replied: false
    },
    {
      id: 2,
      userName: 'MangaFan',
      date: new Date(Date.now() - 86400000).toISOString(),
      mangaTitle: 'One Piece',
      chapter: 1100,
      content: 'A arte está ficando cada vez melhor!',
      read: true,
      replied: true,
      reply: 'Obrigado! Estou me esforçando bastante!',
      replyDate: new Date().toISOString()
    },
    {
      id: 3,
      userName: 'AnimeLover',
      date: new Date(Date.now() - 172800000).toISOString(),
      mangaTitle: 'Attack on Titan',
      chapter: 139,
      content: 'Que plot twist incrível!',
      read: false,
      replied: false
    }
  ];
};

const filteredComments = computed(() => {
  if (commentFilter.value === 'unread') {
    return comments.value.filter(c => !c.read);
  } else if (commentFilter.value === 'replied') {
    return comments.value.filter(c => c.replied);
  }
  return comments.value;
});

const loadAnalytics = () => {
  topWorks.value = [...userPublishedMangas.value]
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 5)
    .map((m, i) => ({
      ...m,
      growth: [15, 8, -3, 20, 5][i]
    }));

  peakHours.value = [
    { time: '00h', percentage: 10 },
    { time: '04h', percentage: 5 },
    { time: '08h', percentage: 25 },
    { time: '12h', percentage: 40 },
    { time: '16h', percentage: 35 },
    { time: '20h', percentage: 30 },
    { time: '24h', percentage: 15 }
  ];

  chapterEngagement.value = [
    { number: 1, title: 'O Início', views: 1000, likes: 150, comments: 25 },
    { number: 2, title: 'O Desafio', views: 850, likes: 120, comments: 18 },
    { number: 3, title: 'A Revelação', views: 920, likes: 135, comments: 22 },
    { number: 4, title: 'O Confronto', views: 780, likes: 95, comments: 15 }
  ];
};

const initializeChart = () => {
  if (!chartCanvas.value) return;

  const ctx = chartCanvas.value.getContext('2d');
  if (!ctx) return;

  if (chartInstance) {
    chartInstance.destroy();
  }

  chartInstance = new Chart(ctx, {
    type: 'line',
    data: getChartData(),
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: 'rgba(255, 255, 255, 0.8)'
          }
        }
      },
      scales: {
        x: {
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          },
          ticks: {
            color: 'rgba(255, 255, 255, 0.6)'
          }
        },
        y: {
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          },
          ticks: {
            color: 'rgba(255, 255, 255, 0.6)'
          }
        }
      }
    }
  });
};

const updateChart = () => {
  if (chartInstance) {
    chartInstance.data = getChartData();
    chartInstance.update();
  }
};

const getChartData = () => {
  const labels = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

  const dataMap: Record<string, number[]> = {
    views: [500, 750, 600, 900, 1200, 1100, 1300],
    likes: [50, 75, 60, 90, 120, 110, 130],
    comments: [10, 15, 12, 18, 24, 22, 26]
  };

  return {
    labels,
    datasets: [{
      label: chartType.value === 'views' ? 'Visualizações' :
             chartType.value === 'likes' ? 'Curtidas' : 'Comentários',
      data: dataMap[chartType.value] || dataMap.views,
      borderColor: '#ff0000',
      backgroundColor: 'rgba(255, 0, 0, 0.1)',
      tension: 0.4,
      fill: true
    }]
  };
};

const goToPublish = () => {
  router.push('/publish');
};

const goToSettings = () => {
  router.push('/settings');
};

const editProfile = async () => {
  const alert = await alertController.create({
    header: 'Editar Perfil',
    inputs: [
      {
        name: 'name',
        type: 'text',
        placeholder: 'Nome',
        value: user.value?.name
      },
      {
        name: 'bio',
        type: 'textarea',
        placeholder: 'Biografia',
        attributes: {
          maxlength: 500
        }
      }
    ],
    buttons: [
      {
        text: 'Cancelar',
        role: 'cancel'
      },
      {
        text: 'Salvar',
        handler: async (data) => {
          showToast('Perfil atualizado com sucesso!', 'success');
        }
      }
    ]
  });
  await alert.present();
};

const viewManga = (id: number) => {
  router.push(`/manga/${id}`);
};

const editManga = (id: number) => {
  router.push(`/publish?edit=${id}`);
};

const viewAnalytics = (id: number) => {
  activeTab.value = 'analytics';
};

const addChapter = (id: number) => {
  router.push(`/publish?manga=${id}&addChapter=true`);
};

const continueDraft = (id: number) => {
  router.push(`/publish?draft=${id}`);
};

const previewDraft = (id: number) => {
  const draft = userDrafts.value.find(d => d.id === id);
  if (draft) {
    showToast('Visualizando rascunho...', 'info');
  }
};

const deleteDraft = async (id: number) => {
  const alert = await alertController.create({
    header: 'Excluir Rascunho',
    message: 'Tem certeza que deseja excluir este rascunho?',
    buttons: [
      {
        text: 'Cancelar',
        role: 'cancel'
      },
      {
        text: 'Excluir',
        handler: () => {
          const updatedMangas = allStoredMangas.value.filter(m => m.id !== id);
          localStorage.setItem('publishedMangas', JSON.stringify(updatedMangas));
          loadAllMangasFromLocalStorage();
          showToast('Rascunho excluído', 'success');
        }
      }
    ]
  });
  await alert.present();
};

const replyComment = async (commentId: number) => {
  const alert = await alertController.create({
    header: 'Responder Comentário',
    inputs: [
      {
        name: 'reply',
        type: 'textarea',
        placeholder: 'Digite sua resposta...'
      }
    ],
    buttons: [
      {
        text: 'Cancelar',
        role: 'cancel'
      },
      {
        text: 'Enviar',
        handler: (data) => {
          const comment = comments.value.find(c => c.id === commentId);
          if (comment) {
            comment.replied = true;
            comment.reply = data.reply;
            comment.replyDate = new Date().toISOString();
            showToast('Resposta enviada!', 'success');
          }
        }
      }
    ]
  });
  await alert.present();
};

const viewCommentContext = (commentId: number) => {
  const comment = comments.value.find(c => c.id === commentId);
  if (comment) {
    showToast(`Abrindo capítulo ${comment.chapter} de ${comment.mangaTitle}`, 'info');
  }
};

const deleteComment = async (commentId: number) => {
  const alert = await alertController.create({
    header: 'Excluir Comentário',
    message: 'Tem certeza que deseja excluir este comentário?',
    buttons: [
      {
        text: 'Cancelar',
        role: 'cancel'
      },
      {
        text: 'Excluir',
        handler: () => {
          comments.value = comments.value.filter(c => c.id !== commentId);
          showToast('Comentário excluído', 'success');
        }
      }
    ]
  });
  await alert.present();
};

const importWork = async () => {
  const alert = await alertController.create({
    header: 'Importar Obra',
    message: 'Esta funcionalidade permitirá importar obras de outras plataformas.',
    buttons: ['OK']
  });
  await alert.present();
};

const exportData = async () => {
  const alert = await alertController.create({
    header: 'Exportar Dados',
    message: 'Seus dados serão exportados em formato CSV.',
    buttons: [
      {
        text: 'Cancelar',
        role: 'cancel'
      },
      {
        text: 'Exportar',
        handler: () => {
          showToast('Dados exportados com sucesso!', 'success');
        }
      }
    ]
  });
  await alert.present();
};

const viewEarnings = () => {
  showToast('Abrindo detalhes de ganhos...', 'info');
};

const manageSchedule = () => {
  showToast('Abrindo agendador...', 'info');
};

const viewNotifications = () => {
  showToast('Abrindo notificações...', 'info');
};

const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

const formatDate = (dateString?: string): string => {
  if (!dateString) return 'Data não disponível';
  return new Date(dateString).toLocaleDateString('pt-BR');
};

const getStatusLabel = (status: string): string => {
  const statusMap: Record<string, string> = {
    'em-andamento': 'Em Andamento',
    'completo': 'Completo',
    'hiato': 'Hiato',
    'cancelado': 'Cancelado',
    'draft': 'Rascunho'
  };
  return statusMap[status] || status;
};

const getTypeLabel = (type: string): string => {
  const typeMap: Record<string, string> = {
    'mangá': 'Mangá',
    'manhwa': 'Manhwa',
    'manhua': 'Manhua',
    'webtoon': 'Webtoon'
  };
  return typeMap[type] || type;
};

const openWorkMenu = (manga: MangaData) => {
  showToast(`Abrindo menu para ${manga.title}`, 'info');
};

const sortWorks = () => {
  switch (sortBy.value) {
    case 'newest':
      userPublishedMangas.value.sort((a, b) =>
        new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime()
      );
      break;
    case 'oldest':
      userPublishedMangas.value.sort((a, b) =>
        new Date(a.publishedAt || 0).getTime() - new Date(b.publishedAt || 0).getTime()
      );
      break;
    case 'views':
      userPublishedMangas.value.sort((a, b) => (b.views || 0) - (a.views || 0));
      break;
    case 'likes':
      userPublishedMangas.value.sort((a, b) => (b.likes || 0) - (a.likes || 0));
      break;
  }
};

const refreshData = () => {
  loadDashboardData();
  showToast('Dados atualizados!', 'success');
};

const loadTabContent = () => {
  if (activeTab.value === 'comments') {
    loadComments();
  } else if (activeTab.value === 'analytics') {
    loadAnalytics();
  }
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
.dashboard-content {
  --background: linear-gradient(135deg, #000000 0%, #1a0000 100%);
}

/* Banner do Autor */
.author-banner {
  background: linear-gradient(135deg, rgba(255, 0, 0, 0.2) 0%, transparent 100%);
  padding: 2rem;
  border-bottom: 1px solid rgba(255, 0, 0, 0.3);
}

.author-info {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.author-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(255, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #ff0000;
  overflow: hidden;
}

.avatar-icon {
  font-size: 3rem;
  color: #ff0000;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.author-details h2 {
  color: white;
  margin: 0 0 0.5rem 0;
  font-size: 1.8rem;
}

.author-email {
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 1rem 0;
}

.author-stats {
  display: flex;
  gap: 1.5rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgba(255, 255, 255, 0.8);
}

.stat-icon {
  color: #ff0000;
}

.author-actions {
  display: flex;
  gap: 1rem;
}

.publish-btn {
  --background: #ff0000;
  --background-hover: #b30000;
}

.edit-profile-btn {
  --color: white;
  --border-color: rgba(255, 255, 255, 0.3);
}

/* Grid de Estatísticas */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  padding: 1.5rem;
}

.stat-card {
  background: rgba(20, 20, 20, 0.8);
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.stat-card.primary {
  border-left: 4px solid #ff0000;
}

.stat-card.success {
  border-left: 4px solid #00ff00;
}

.stat-card.warning {
  border-left: 4px solid #ffd700;
}

.stat-card.info {
  border-left: 4px solid #4fc3f7;
}

.stat-icon-container {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-card.primary .stat-icon-container {
  background: rgba(255, 0, 0, 0.1);
}

.stat-card.success .stat-icon-container {
  background: rgba(0, 255, 0, 0.1);
}

.stat-card.warning .stat-icon-container {
  background: rgba(255, 215, 0, 0.1);
}

.stat-card.info .stat-icon-container {
  background: rgba(79, 195, 247, 0.1);
}

.stat-card-icon {
  font-size: 1.5rem;
}

.stat-card.primary .stat-card-icon {
  color: #ff0000;
}

.stat-card.success .stat-card-icon {
  color: #00ff00;
}

.stat-card.warning .stat-card-icon {
  color: #ffd700;
}

.stat-card.info .stat-card-icon {
  color: #4fc3f7;
}

.stat-info h3 {
  color: white;
  margin: 0 0 0.25rem 0;
  font-size: 1.8rem;
}

.stat-info p {
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
}

.stat-change {
  font-size: 0.85rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.stat-change.positive {
  color: #00ff00;
}

.stat-change.negative {
  color: #ff0000;
}

/* Seção do Gráfico */
.chart-section {
  background: rgba(20, 20, 20, 0.8);
  border-radius: 16px;
  padding: 1.5rem;
  margin: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
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

.chart-options {
  width: auto;
}

.chart-container {
  height: 300px;
  position: relative;
}

/* Tabs */
ion-segment {
  margin: 1.5rem;
  --background: rgba(255, 255, 255, 0.05);
  --border-radius: 12px;
  padding: 4px;
}

.tab-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  font-size: 0.7rem;
  min-width: 18px;
  height: 18px;
}

/* Conteúdo das Tabs */
.tab-content {
  padding: 0 1.5rem 2rem;
}

.works-header,
.drafts-header,
.comments-header,
.analytics-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.works-header h3,
.drafts-header h3,
.comments-header h3,
.analytics-header h3 {
  color: white;
  margin: 0;
}

/* Grid de Obras */
.works-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.work-card {
  background: rgba(20, 20, 20, 0.8);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
  backdrop-filter: blur(10px);
}

.work-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.work-status {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.work-status.em-andamento {
  background: rgba(255, 215, 0, 0.1);
  color: #ffd700;
  border: 1px solid rgba(255, 215, 0, 0.3);
}

.work-status.completo {
  background: rgba(0, 255, 0, 0.1);
  color: #00ff00;
  border: 1px solid rgba(0, 255, 0, 0.3);
}

.work-status.hiato {
  background: rgba(255, 165, 0, 0.1);
  color: #ffa500;
  border: 1px solid rgba(255, 165, 0, 0.3);
}

.work-card-content {
  padding: 1rem;
  cursor: pointer;
  display: flex;
  gap: 1rem;
}

.work-cover {
  position: relative;
  width: 100px;
  height: 140px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
}

.work-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.work-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.8);
  padding: 4px;
  text-align: center;
}

.work-chapters {
  color: white;
  font-size: 0.8rem;
  font-weight: 600;
}

.work-info {
  flex: 1;
}

.work-title {
  color: white;
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  line-height: 1.3;
}

.work-type {
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 1rem 0;
  font-size: 0.9rem;
}

.work-stats {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.work-stat {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.85rem;
}

.work-stat .stat-icon {
  color: #ff0000;
  font-size: 1rem;
}

.work-date {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.8rem;
}

.work-card-footer {
  display: flex;
  justify-content: space-around;
  padding: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

/* Lista de Rascunhos */
.drafts-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.draft-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px dashed rgba(255, 255, 255, 0.2);
}

.draft-info {
  flex: 1;
}

.draft-info h4 {
  color: white;
  margin: 0 0 0.5rem 0;
}

.draft-preview {
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
  line-height: 1.4;
}

.draft-details {
  display: flex;
  gap: 1rem;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.5);
}

.draft-actions {
  display: flex;
  gap: 0.5rem;
}

/* Lista de Comentários */
.comments-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.comment-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.comment-card.unread {
  background: rgba(255, 0, 0, 0.05);
  border-color: rgba(255, 0, 0, 0.3);
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.comment-user {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-icon {
  font-size: 2rem;
  color: #ff0000;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-info strong {
  color: white;
  margin-bottom: 0.25rem;
}

.comment-date {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.85rem;
}

.comment-manga {
  text-align: right;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
}

.comment-chapter {
  display: block;
  color: #ff0000;
  font-weight: 600;
  margin-top: 0.25rem;
}

.comment-content {
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.5;
  margin-bottom: 1rem;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
}

.comment-actions {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.comment-reply {
  background: rgba(0, 255, 0, 0.05);
  border: 1px solid rgba(0, 255, 0, 0.2);
  border-radius: 8px;
  padding: 1rem;
  margin-top: 1rem;
}

.reply-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.reply-header strong {
  color: #00ff00;
}

.reply-date {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.85rem;
}

.comment-reply p {
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
  line-height: 1.5;
}

/* Análises */
.analytics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.analytics-card {
  background: rgba(20, 20, 20, 0.8);
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.analytics-card h4 {
  color: white;
  margin: 0 0 1.5rem 0;
  font-size: 1.2rem;
}

.popular-works {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.popular-work {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.work-rank {
  width: 30px;
  height: 30px;
  background: #ff0000;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.9rem;
}

.work-details {
  flex: 1;
}

.work-details strong {
  color: white;
  display: block;
  margin-bottom: 0.25rem;
}

.work-metrics {
  display: flex;
  gap: 1rem;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.7);
}

.work-growth {
  font-weight: bold;
  font-size: 0.9rem;
}

.work-growth.positive {
  color: #00ff00;
}

.work-growth.negative {
  color: #ff0000;
}

.demographics {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.demographic-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.demographic-label {
  color: white;
  font-weight: 600;
  font-size: 0.95rem;
}

.demographic-data {
  color: rgba(255, 255, 255, 0.8);
}

.demographic-bar {
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.bar-fill {
  height: 100%;
  background: #ff0000;
}

.age-distribution {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.age-group {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.age-group span {
  width: 40px;
  color: white;
  font-size: 0.9rem;
}

.age-bar {
  flex: 1;
  height: 6px;
  background: #ff0000;
  border-radius: 3px;
}

.countries-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.country {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
}

.peak-hours {
  margin-top: 1rem;
}

.hour-chart {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  height: 150px;
  padding: 1rem 0;
}

.hour-bar {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.bar-label {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.8rem;
}

.bar-container {
  width: 20px;
  height: 100px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  position: relative;
  overflow: hidden;
}

.bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: #ff0000;
  border-radius: 4px 4px 0 0;
}

.bar-value {
  color: white;
  font-size: 0.8rem;
  font-weight: 600;
}

.chapter-engagement {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.engagement-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.engagement-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.engagement-info strong {
  color: white;
  font-size: 0.95rem;
}

.engagement-info span {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.85rem;
}

.engagement-stats {
  display: flex;
  gap: 1rem;
}

.engagement-stats .stat {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
}

.engagement-stats .stat ion-icon {
  color: #ff0000;
}

/* Estado Vazio */
.empty-state {
  text-align: center;
  padding: 3rem;
  color: rgba(255, 255, 255, 0.5);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  color: rgba(255, 255, 255, 0.2);
}

.empty-state h4 {
  color: rgba(255, 255, 255, 0.8);
  margin: 0 0 0.5rem 0;
}

.empty-state p {
  margin: 0 0 1.5rem 0;
}

/* Ações Rápidas */
.quick-actions {
  padding: 2rem 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.quick-actions h3 {
  color: white;
  margin-bottom: 1.5rem;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.action-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
}

.action-card:hover {
  background: rgba(255, 0, 0, 0.1);
  border-color: rgba(255, 0, 0, 0.3);
  transform: translateY(-2px);
}

.action-icon {
  font-size: 2rem;
  color: #ff0000;
  margin-bottom: 0.75rem;
}

.action-card span {
  color: white;
  font-weight: 500;
  font-size: 0.95rem;
}

.notification-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 0.7rem;
  min-width: 20px;
  height: 20px;
}

/* Responsividade */
@media (max-width: 768px) {
  .author-banner {
    padding: 1rem;
  }

  .author-info {
    flex-direction: column;
    text-align: center;
  }

  .author-stats {
    justify-content: center;
  }

  .author-actions {
    flex-direction: column;
  }

  .stats-grid {
    grid-template-columns: 1fr;
    padding: 1rem;
  }

  .works-grid {
    grid-template-columns: 1fr;
  }

  .work-card-content {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .work-cover {
    width: 150px;
    height: 210px;
  }

  .analytics-grid {
    grid-template-columns: 1fr;
  }

  .actions-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .section-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .chart-options {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .actions-grid {
    grid-template-columns: 1fr;
  }

  .draft-card {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .draft-actions {
    justify-content: center;
  }

  .comment-header {
    flex-direction: column;
    gap: 1rem;
  }

  .comment-manga {
    text-align: left;
  }
}
</style>