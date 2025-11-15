<template>
  <nav class="navbar">
    <div class="container-lg">
      <div class="nav-content">
        <router-link to="/" class="nav-logo">
          <span class="logo-icon">🌸</span>
          <span class="logo-text">SkinStudy</span>
        </router-link>

        <div class="nav-menu" :class="{ 'nav-menu-open': isMenuOpen }">
          <router-link to="/" class="nav-link" @click="closeMenu">Home</router-link>
          <router-link to="/ai-dermatology-expert" class="nav-link" @click="closeMenu">AI Doctor</router-link>
          <router-link to="/analysis" class="nav-link" @click="closeMenu">Skin Analysis</router-link>
          <router-link to="/routines" class="nav-link" @click="closeMenu">Routines</router-link>
          <router-link to="/ingredients" class="nav-link" @click="closeMenu">Ingredients</router-link>
          <router-link to="/ingredient-study" class="nav-link" @click="closeMenu">Product Study</router-link>
          <router-link to="/education" class="nav-link" @click="closeMenu">Education</router-link>
          <router-link to="/about" class="nav-link" @click="closeMenu">About</router-link>
          
          <!-- Auth Section -->
          <div class="nav-auth">
            <template v-if="isLoggedIn">
              <span class="user-name">{{ userName }}</span>
              <button @click="handleLogout" class="btn-logout">Logout</button>
            </template>
            <template v-else>
              <router-link to="/auth" class="btn-login" @click="closeMenu">Login</router-link>
            </template>
          </div>
        </div>

        <button class="nav-toggle" @click="toggleMenu">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </div>
  </nav>
</template>

<script>
export default {
  name: 'NavBar',
  data() {
    return {
      isMenuOpen: false,
      isLoggedIn: false,
      userName: ''
    }
  },
  methods: {
    toggleMenu() {
      this.isMenuOpen = !this.isMenuOpen
    },
    closeMenu() {
      this.isMenuOpen = false
    },
    checkAuthStatus() {
      const token = localStorage.getItem('token')
      const user = localStorage.getItem('user')
      
      this.isLoggedIn = !!token
      
      if (user) {
        try {
          const userObj = JSON.parse(user)
          this.userName = userObj.name || 'User'
        } catch (e) {
          this.userName = 'User'
        }
      }
    },
    handleLogout() {
      if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        this.isLoggedIn = false
        this.userName = ''
        this.$router.push('/')
        this.closeMenu()
      }
    }
  },
  mounted() {
    this.checkAuthStatus()
    
    // Listen for storage changes (login/logout in other tabs)
    window.addEventListener('storage', this.checkAuthStatus)
  },
  beforeUnmount() {
    window.removeEventListener('storage', this.checkAuthStatus)
  },
  watch: {
    $route() {
      this.checkAuthStatus()
    }
  }
}
</script>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--border-color);
  z-index: 1000;
}

.nav-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 0;
}

.nav-logo {
  display: flex;
  align-items: center;
  text-decoration: none;
  font-weight: 600;
  font-size: 1.5rem;
  color: var(--text-dark);
}

.logo-icon {
  font-size: 2rem;
  margin-right: 0.5rem;
}

.logo-text {
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 700;
}

.nav-menu {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.nav-link {
  text-decoration: none;
  color: var(--text-light);
  font-weight: 500;
  transition: color 0.3s ease;
  position: relative;
}

.nav-link:hover,
.nav-link.router-link-active {
  color: var(--primary-color);
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 0;
  height: 2px;
  background: var(--primary-color);
  transition: width 0.3s ease;
}

.nav-link:hover::after,
.nav-link.router-link-active::after {
  width: 100%;
}

/* Auth Section */
.nav-auth {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-left: 1rem;
  padding-left: 1rem;
  border-left: 1px solid var(--border-color);
}

.user-name {
  color: var(--text-dark);
  font-weight: 600;
  font-size: 0.9rem;
}

.btn-login,
.btn-logout {
  padding: 0.5rem 1.25rem;
  border-radius: 20px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
}

.btn-login {
  background: var(--gradient-primary);
  color: white;
  display: inline-block;
}

.btn-login:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-logout {
  background: #f5f5f5;
  color: var(--text-dark);
}

.btn-logout:hover {
  background: #ffebee;
  color: #c62828;
}

.nav-toggle {
  display: none;
  flex-direction: column;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
}

.nav-toggle span {
  width: 25px;
  height: 3px;
  background: var(--text-dark);
  margin: 2px 0;
  transition: 0.3s;
  border-radius: 2px;
}

@media (max-width: 768px) {
  .nav-menu {
    position: fixed;
    top: 100%;
    left: 0;
    right: 0;
    background: white;
    flex-direction: column;
    padding: 2rem;
    box-shadow: var(--shadow-lg);
    transform: translateY(-100%);
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
    gap: 0.5rem;
  }

  .nav-menu-open {
    transform: translateY(0);
    opacity: 1;
    visibility: visible;
  }

  .nav-toggle {
    display: flex;
  }

  .nav-link {
    padding: 0.5rem 0;
    font-size: 1.1rem;
  }

  .nav-auth {
    margin-left: 0;
    padding-left: 0;
    border-left: none;
    border-top: 1px solid var(--border-color);
    padding-top: 1rem;
    margin-top: 1rem;
    width: 100%;
    flex-direction: column;
    align-items: stretch;
  }

  .btn-login,
  .btn-logout {
    width: 100%;
    text-align: center;
    padding: 0.75rem 1.25rem;
  }

  .user-name {
    text-align: center;
    padding: 0.5rem 0;
  }
}
</style>