import { createRouter, createWebHistory } from 'vue-router'
import RankingView from '../views/RankingView.vue'
import ImportView from '../views/ImportView.vue'
import ListView from '../views/ListView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'list',
      component: ListView,
    },
    {
      path: '/ranking',
      name: 'ranking',
      component: RankingView,
    },
    {
      path: '/import',
      name: 'import',
      component: ImportView,
    },
  ],
})

export default router
