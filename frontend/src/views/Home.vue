<template>
  <div class="home">
    <!-- Hero Section -->
    <section class="hero">
      <div class="container">
        <div class="hero-content">
          <div class="hero-text">
            <h1 class="fade-in-up">Your Journey to Beautiful, Healthy Skin</h1>
            <p class="hero-description fade-in-up">
              Discover the science behind skincare, analyze your skin type, and get personalized 
              recommendations for a radiant complexion.
            </p>
            <div class="hero-buttons fade-in-up">
              <router-link to="/analysis" class="btn btn-primary">Start Skin Analysis</router-link>
              <router-link to="/education" class="btn btn-outline">Learn More</router-link>
            </div>
          </div>
          <div class="hero-image">
            <div class="hero-graphic">
              <div class="skin-layers">
                <div class="layer layer-1">🌸</div>
                <div class="layer layer-2">✨</div>
                <div class="layer layer-3">💧</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features">
      <div class="container">
        <h2 class="section-title">Why Choose SkinStudy?</h2>
        <div class="grid grid-3">
          <div class="feature-card card fade-in-up">
            <div class="feature-icon">🔬</div>
            <h3>Science-Based Analysis</h3>
            <p>Our skin analysis tool uses scientific principles to assess your skin type, concerns, and provide accurate recommendations.</p>
          </div>
          <div class="feature-card card fade-in-up">
            <div class="feature-icon">📚</div>
            <h3>Educational Content</h3>
            <p>Learn about skin science, ingredient benefits, and proper skincare techniques from dermatology experts.</p>
          </div>
          <div class="feature-card card fade-in-up">
            <div class="feature-icon">💄</div>
            <h3>Personalized Routines</h3>
            <p>Get customized skincare routines based on your skin type, concerns, and lifestyle preferences.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Stats Section -->
    <section class="stats">
      <div class="container">
        <div class="grid grid-4">
          <div class="stat-item">
            <div class="stat-number">10K+</div>
            <div class="stat-label">Happy Users</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">500+</div>
            <div class="stat-label">Skincare Products</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">50+</div>
            <div class="stat-label">Expert Articles</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">24/7</div>
            <div class="stat-label">Support Available</div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta">
      <div class="container">
        <div class="cta-content">
          <h2>Ready to Transform Your Skin?</h2>
          <p>Join thousands of users who have improved their skin health with our expert guidance.</p>
          <router-link to="/analysis" class="btn btn-primary btn-lg">Start Your Skin Journey</router-link>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: 'Home',
  mounted() {
    // Add animation delays
    const elements = document.querySelectorAll('.fade-in-up')
    elements.forEach((el, index) => {
      el.style.animationDelay = `${index * 0.2}s`
    })
  }
}
</script>

<style scoped>
.hero {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 4rem 0;
  min-height: 80vh;
  display: flex;
  align-items: center;
  color: white;
}

.hero-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
}

.hero-text h1 {
  font-size: 3.5rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: white;
}

.hero-description {
  font-size: 1.25rem;
  margin-bottom: 2rem;
  color: rgba(255, 255, 255, 0.9);
}

.hero-buttons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.btn-lg {
  padding: 16px 32px;
  font-size: 18px;
}

.hero-graphic {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
}

.skin-layers {
  position: relative;
  width: 300px;
  height: 300px;
}

.layer {
  position: absolute;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 4rem;
  animation: float 3s ease-in-out infinite;
}

.layer-1 {
  top: 20px;
  left: 50px;
  width: 100px;
  height: 100px;
  background: rgba(255, 107, 157, 0.3);
  animation-delay: 0s;
}

.layer-2 {
  top: 100px;
  right: 20px;
  width: 80px;
  height: 80px;
  background: rgba(78, 205, 196, 0.3);
  animation-delay: 1s;
}

.layer-3 {
  bottom: 50px;
  left: 20px;
  width: 120px;
  height: 120px;
  background: rgba(247, 231, 206, 0.3);
  animation-delay: 2s;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

.features {
  padding: 6rem 0;
  background: var(--background-light);
}

.section-title {
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 3rem;
  color: var(--text-dark);
}

.feature-card {
  text-align: center;
  padding: 2rem;
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.feature-card h3 {
  color: var(--text-dark);
  margin-bottom: 1rem;
}

.stats {
  padding: 4rem 0;
  background: var(--primary-color);
  color: white;
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 1.1rem;
  opacity: 0.9;
}

.cta {
  padding: 6rem 0;
  background: var(--text-dark);
  color: white;
}

.cta-content {
  text-align: center;
  max-width: 600px;
  margin: 0 auto;
}

.cta-content h2 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: white;
}

.cta-content p {
  font-size: 1.25rem;
  margin-bottom: 2rem;
  color: rgba(255, 255, 255, 0.9);
}

@media (max-width: 768px) {
  .hero-content {
    grid-template-columns: 1fr;
    text-align: center;
  }
  
  .hero-text h1 {
    font-size: 2.5rem;
  }
  
  .hero-buttons {
    justify-content: center;
  }
  
  .skin-layers {
    width: 250px;
    height: 250px;
  }
  
  .layer {
    font-size: 2.5rem;
  }
  
  .stats .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>