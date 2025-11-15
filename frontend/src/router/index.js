import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Auth from '../views/Auth.vue'
import SkinAnalysis from '../views/SkinAnalysis.vue'
import Education from '../views/Education.vue'
import EducationArticle from '../views/EducationArticle.vue'
import SkincareRoutines from '../views/SkincareRoutines.vue'
import Ingredients from '../views/Ingredients.vue'
import IngredientStudy from '../views/IngredientStudy.vue'
import AIDermatologyExpert from '../views/AIDermatologyExpert.vue'
import About from '../views/About.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/auth',
    name: 'Auth',
    component: Auth
  },
  {
    path: '/analysis',
    name: 'SkinAnalysis',
    component: SkinAnalysis,
    meta: { requiresAuth: true }
  },
  {
    path: '/education',
    name: 'Education',
    component: Education
  },
  {
    path: '/education/:slug',
    name: 'EducationArticle',
    component: EducationArticle
  },
  {
    path: '/routines',
    name: 'SkincareRoutines',
    component: SkincareRoutines
  },
  {
    path: '/ingredients',
    name: 'Ingredients',
    component: Ingredients
  },
  {
    path: '/ingredient-study',
    name: 'IngredientStudy',
    component: IngredientStudy
  },
  {
    path: '/ai-dermatologist',
    name: 'AIDermatologyExpert',
    component: AIDermatologyExpert,
    meta: { requiresAuth: true }
  },
  {
    path: '/about',
    name: 'About',
    component: About
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard to check authentication
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  
  if (to.meta.requiresAuth && !token) {
    // Redirect to auth page if route requires authentication
    next('/auth')
  } else if (to.path === '/auth' && token) {
    // Redirect to home if already logged in
    next('/')
  } else {
    next()
  }
})

export default router