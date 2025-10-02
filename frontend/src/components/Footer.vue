<template>
  <footer class="footer">
    <div class="container">
      <div class="footer-content">
        <div class="footer-section">
          <h4>SkinStudy</h4>
          <p>Your journey to healthy, beautiful skin starts here.</p>
          <div class="social-links">
            <a href="#" class="social-link">📱</a>
            <a href="#" class="social-link">🐦</a>
            <a href="#" class="social-link">📧</a>
          </div>
        </div>
        
        <div class="footer-section">
          <h4>Quick Links</h4>
          <ul class="footer-links">
            <li><router-link to="/analysis">Skin Analysis</router-link></li>
            <li><router-link to="/education">Education</router-link></li>
            <li><router-link to="/routines">Skincare Routines</router-link></li>
            <li><router-link to="/ingredients">Ingredients</router-link></li>
          </ul>
        </div>
        
        <div class="footer-section">
          <h4>Resources</h4>
          <ul class="footer-links">
            <li><a href="#">Skin Health Tips</a></li>
            <li><a href="#">Research Articles</a></li>
            <li><a href="#">Expert Advice</a></li>
            <li><a href="#">FAQ</a></li>
          </ul>
        </div>
        
        <div class="footer-section">
          <h4>Contact</h4>
          <ul class="footer-links">
            <li><a href="#">Support</a></li>
            <li><a href="#">Privacy Policy</a></li>
            <li><a href="#">Terms of Service</a></li>
            <li><router-link to="/about">About Us</router-link></li>
          </ul>
        </div>
      </div>
      
      <div class="footer-bottom">
        <p>&copy; 2024 SkinStudy. All rights reserved.</p>
        <p>Made with ❤️ for healthy skin</p>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'Footer'
}
</script>

<style scoped>
.footer {
  background: var(--gradient-hero);
  color: var(--primary-950);
  padding: 3rem 0 1rem;
  margin-top: 4rem;
  position: relative;
  overflow: hidden;
}

.footer::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: rgba(251, 249, 251, 0.3);
}

.footer::after {
  content: '';
  position: absolute;
  top: -50%;
  left: -25%;
  width: 150%;
  height: 200%;
  background: 
    radial-gradient(circle at 20% 80%, rgba(243, 176, 250, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(230, 120, 249, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, rgba(252, 248, 252, 0.1) 0%, transparent 50%);
  pointer-events: none;
}

.footer-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
  position: relative;
  z-index: 10;
}

.footer-section h4 {
  color: var(--primary-800);
  margin-bottom: 1rem;
  font-size: 1.2rem;
  font-weight: 700;
}

.footer-section p {
  color: var(--primary-700);
  margin-bottom: 1rem;
}

.footer-links {
  list-style: none;
}

.footer-links li {
  margin-bottom: 0.5rem;
}

.footer-links a,
.footer-links router-link {
  color: var(--primary-700);
  text-decoration: none;
  transition: all 0.3s ease;
}

.footer-links a:hover,
.footer-links router-link:hover {
  color: var(--primary-900);
  transform: translateX(5px);
}

.social-links {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.social-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: var(--gradient-primary);
  border-radius: 50%;
  text-decoration: none;
  font-size: 1.2rem;
  transition: all 0.3s ease;
  box-shadow: var(--shadow-soft);
}

.social-link:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-medium);
}

.footer-bottom {
  border-top: 1px solid var(--primary-300);
  padding-top: 1rem;
  text-align: center;
  color: var(--primary-700);
  position: relative;
  z-index: 10;
}

.footer-bottom p {
  margin-bottom: 0.5rem;
  color: var(--primary-700);
}

@media (max-width: 768px) {
  .footer-content {
    grid-template-columns: 1fr;
    text-align: center;
  }
  
  .social-links {
    justify-content: center;
  }
}
</style>