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
  background: var(--text-dark);
  color: white;
  padding: 3rem 0 1rem;
  margin-top: 4rem;
}

.footer-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.footer-section h4 {
  color: white;
  margin-bottom: 1rem;
  font-size: 1.2rem;
}

.footer-section p {
  color: #a0aec0;
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
  color: #a0aec0;
  text-decoration: none;
  transition: color 0.3s ease;
}

.footer-links a:hover,
.footer-links router-link:hover {
  color: var(--primary-color);
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
  background: var(--primary-color);
  border-radius: 50%;
  text-decoration: none;
  font-size: 1.2rem;
  transition: transform 0.3s ease;
}

.social-link:hover {
  transform: translateY(-2px);
}

.footer-bottom {
  border-top: 1px solid #4a5568;
  padding-top: 1rem;
  text-align: center;
  color: #a0aec0;
}

.footer-bottom p {
  margin-bottom: 0.5rem;
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