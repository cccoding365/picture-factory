import { createRouter, createWebHistory } from 'vue-router'
import Home from '../pages/Home.vue'
import CropPage from '../pages/CropPage.vue'
import FiltersPage from '../pages/FiltersPage.vue'
import { imageUrl } from '../stores/image.js'

const routes = [
  { path: '/', name: 'home', component: Home },
  { path: '/crop', name: 'crop', component: CropPage, meta: { requiresImage: true } },
  { path: '/filters', name: 'filters', component: FiltersPage, meta: { requiresImage: true } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  if (to.meta?.requiresImage && !imageUrl.value) {
    return { name: 'home' }
  }
})

export default router