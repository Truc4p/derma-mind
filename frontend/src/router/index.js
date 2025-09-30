import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import SkinAnalysis from '../views/SkinAnalysis.vue'
import Education from '../views/Education.vue'
import SkincareRoutines from '../views/SkincareRoutines.vue'
import Ingredients from '../views/Ingredients.vue'
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