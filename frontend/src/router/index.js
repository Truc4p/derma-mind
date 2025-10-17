import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import SkinAnalysis from '../views/SkinAnalysis.vue'
import Education from '../views/Education.vue'
import EducationArticle from '../views/EducationArticle.vue'
import SkincareRoutines from '../views/SkincareRoutines.vue'
import Ingredients from '../views/Ingredients.vue'
import IngredientStudy from '../views/IngredientStudy.vue'
import AIDermatologist from '../views/AIDermatologist.vue'
import About from '../views/About.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/analysis',
    name: 'SkinAnalysis',
    component: SkinAnalysis
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
    name: 'AIDermatologist',
    component: AIDermatologist
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

export default router