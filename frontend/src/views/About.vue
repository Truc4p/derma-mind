<template>
  <div class="about">
    <div class="container">
      <!-- Hero Section -->
      <section class="hero-section">
        <div class="hero-content">
          <h1>About SkinStudy</h1>
          <p class="hero-subtitle">
            Your trusted companion for healthy, beautiful skin through science-backed education and personalized analysis
          </p>
        </div>
      </section>

      <!-- Mission Section -->
      <section class="mission-section">
        <div class="mission-content card">
          <h2>Our Mission</h2>
          <p class="mission-text">
            At SkinStudy, we believe that everyone deserves to understand their skin and make informed decisions about their skincare routine. Our mission is to democratize skincare knowledge by providing science-backed information, personalized analysis, and expert guidance to help you achieve your healthiest, most radiant skin.
          </p>
          
          <div class="mission-values">
            <div class="value-item">
              <div class="value-content">
                <h4>Science-Based</h4>
                <p>All our recommendations are backed by dermatological research and proven skincare science</p>
              </div>
            </div>
            
            <div class="value-item">
              <div class="value-content">
                <h4>Personalized</h4>
                <p>Every skin is unique. Our analysis provides tailored advice for your specific needs and concerns</p>
              </div>
            </div>
            
            <div class="value-item">
              <div class="value-content">
                <h4>Educational</h4>
                <p>We empower you with knowledge to make informed decisions about your skincare journey</p>
              </div>
            </div>
            
            <div class="value-item">
              <div class="value-content">
                <h4>Accessible</h4>
                <p>Professional skincare knowledge should be available to everyone, regardless of budget or location</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Features Section -->
      <section class="features-section">
        <h2>What We Offer</h2>
        <div class="features-grid grid grid-3">
          <div class="feature-card card">
            <h3>Skin Analysis</h3>
            <p>Take our comprehensive quiz to understand your skin type, concerns, and get personalized recommendations for your unique needs.</p>
            <router-link to="/skin-analysis" class="btn btn-outline">Try Analysis</router-link>
          </div>
          
          <div class="feature-card card">
            <h3>Education Hub</h3>
            <p>Access our extensive library of articles, guides, and tips from skincare experts and dermatologists.</p>
            <router-link to="/education" class="btn btn-outline">Learn More</router-link>
          </div>
          
          <div class="feature-card card">
            <h3>Ingredient Database</h3>
            <p>Explore our comprehensive database of skincare ingredients with safety ratings, benefits, and interactions.</p>
            <router-link to="/ingredients" class="btn btn-outline">Browse Ingredients</router-link>
          </div>
          
          <div class="feature-card card">
            <h3>Routine Builder</h3>
            <p>Create and customize your perfect skincare routine based on your skin analysis and personal preferences.</p>
            <router-link to="/skincare-routines" class="btn btn-outline">Build Routine</router-link>
          </div>
          
          <div class="feature-card card">
            <h3>Progress Tracking</h3>
            <p>Monitor your skin's journey with our tracking tools and see how your routine is working over time.</p>
            <button class="btn btn-outline" disabled>Coming Soon</button>
          </div>
          
          <div class="feature-card card">
            <h3>Expert Insights</h3>
            <p>Get access to tips and advice from certified dermatologists and skincare professionals.</p>
            <button class="btn btn-outline" disabled>Coming Soon</button>
          </div>
        </div>
      </section>

      <!-- Team Section -->
      <section class="team-section">
        <h2>Our Team</h2>
        <p class="team-intro">
          SkinStudy is built by a passionate team of developers, skincare enthusiasts, and industry experts who are committed to making skincare knowledge accessible to all.
        </p>
        
        <div class="team-grid grid grid-3">
          <div class="team-member card">
            <h4>Dr. Sarah Chen</h4>
            <p class="member-role">Lead Dermatologist</p>
            <p class="member-bio">
              Board-certified dermatologist with 15+ years of experience in clinical dermatology and cosmetic procedures.
            </p>
          </div>
          
          <div class="team-member card">
            <h4>Dr. Michael Rodriguez</h4>
            <p class="member-role">Cosmetic Chemist</p>
            <p class="member-bio">
              PhD in Chemistry with expertise in formulation science and ingredient safety research.
            </p>
          </div>
          
          <div class="team-member card">
            <h4>Emma Johnson</h4>
            <p class="member-role">UX Designer</p>
            <p class="member-bio">
              Specializes in health tech design with a passion for making complex information accessible and beautiful.
            </p>
          </div>
        </div>
      </section>

      <!-- Technology Section -->
      <section class="technology-section">
        <div class="tech-content card">
          <h2>Our Technology</h2>
          <p>
            SkinStudy is built with cutting-edge web technologies to provide you with a fast, secure, and reliable experience.
          </p>
          
          <div class="tech-stack">
            <div class="tech-category">
              <h4>Frontend</h4>
              <div class="tech-items">
                <span class="tech-item">Vue.js 3</span>
                <span class="tech-item">Vue Router</span>
                <span class="tech-item">Responsive CSS</span>
                <span class="tech-item">Progressive Web App</span>
              </div>
            </div>
            
            <div class="tech-category">
              <h4>Backend</h4>
              <div class="tech-items">
                <span class="tech-item">Node.js</span>
                <span class="tech-item">Express.js</span>
                <span class="tech-item">MongoDB</span>
                <span class="tech-item">JWT Authentication</span>
              </div>
            </div>
            
            <div class="tech-category">
              <h4>Security & Performance</h4>
              <div class="tech-items">
                <span class="tech-item">HTTPS Encryption</span>
                <span class="tech-item">Data Anonymization</span>
                <span class="tech-item">CDN Optimization</span>
                <span class="tech-item">API Rate Limiting</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Privacy & Security Section -->
      <section class="privacy-section">
        <div class="privacy-content card">
          <h2>Privacy & Security</h2>
          <p>
            Your privacy and data security are our top priorities. Here's how we protect your information:
          </p>
          
          <div class="privacy-features">
            <div class="privacy-item">
              <div class="privacy-text">
                <h4>Encrypted Data</h4>
                <p>All personal data is encrypted both in transit and at rest using industry-standard encryption protocols.</p>
              </div>
            </div>
            
            <div class="privacy-item">
              <div class="privacy-text">
                <h4>No Data Selling</h4>
                <p>We never sell your personal information to third parties. Your data belongs to you.</p>
              </div>
            </div>
            
            <div class="privacy-item">
              <div class="privacy-text">
                <h4>Anonymous Analysis</h4>
                <p>Our skin analysis can be performed anonymously without creating an account.</p>
              </div>
            </div>
            
            <div class="privacy-item">
              <div class="privacy-text">
                <h4>Data Control</h4>
                <p>You can delete your account and all associated data at any time with a single click.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Research & Methodology Section -->
      <section class="research-section">
        <h2>Our Research & Methodology</h2>
        <div class="research-grid grid grid-2">
          <div class="research-card card">
            <h3>Evidence-Based Approach</h3>
            <p>
              Our recommendations are based on peer-reviewed dermatological research and clinical studies. We continuously review and update our database to reflect the latest scientific findings.
            </p>
            <ul class="research-list">
              <li>Systematic literature reviews</li>
              <li>Clinical trial analysis</li>
              <li>Expert dermatologist consultations</li>
              <li>User feedback integration</li>
            </ul>
          </div>
          
          <div class="research-card card">
            <h3>Skin Analysis Algorithm</h3>
            <p>
              Our skin analysis quiz uses a scientifically-validated questionnaire combined with machine learning algorithms to provide accurate skin type identification and personalized recommendations.
            </p>
            <ul class="research-list">
              <li>Multi-factor assessment</li>
              <li>Confidence scoring</li>
              <li>Cultural skin variations</li>
              <li>Environmental considerations</li>
            </ul>
          </div>
        </div>
      </section>

      <!-- Stats Section -->
      <section class="stats-section">
        <h2>SkinStudy by the Numbers</h2>
        <div class="stats-grid grid grid-4">
          <div class="stat-card card">
            <div class="stat-number">50,000+</div>
            <div class="stat-label">Users Helped</div>
          </div>
          
          <div class="stat-card card">
            <div class="stat-number">1,200+</div>
            <div class="stat-label">Ingredients Analyzed</div>
          </div>
          
          <div class="stat-card card">
            <div class="stat-number">500+</div>
            <div class="stat-label">Educational Articles</div>
          </div>
          
          <div class="stat-card card">
            <div class="stat-number">98%</div>
            <div class="stat-label">User Satisfaction</div>
          </div>
        </div>
      </section>

      <!-- Contact Section -->
      <section class="contact-section">
        <div class="contact-content card">
          <h2>Get in Touch</h2>
          <p>
            Have questions, suggestions, or feedback? We'd love to hear from you!
          </p>
          
          <div class="contact-grid grid grid-2">
            <div class="contact-method">
              <div class="contact-info">
                <h4>Email Support</h4>
                <p>support@skinstudy.com</p>
                <small>We typically respond within 24 hours</small>
              </div>
            </div>
            
            <div class="contact-method">
              <div class="contact-info">
                <h4>Community Forum</h4>
                <p>Join our discussion forum</p>
                <small>Connect with other skincare enthusiasts</small>
              </div>
            </div>
            
            <div class="contact-method">
              <div class="contact-info">
                <h4>Social Media</h4>
                <p>@SkinStudyApp</p>
                <small>Follow us for daily tips and updates</small>
              </div>
            </div>
            
            <div class="contact-method">
              <div class="contact-info">
                <h4>Bug Reports</h4>
                <p>bugs@skinstudy.com</p>
                <small>Help us improve the platform</small>
              </div>
            </div>
          </div>
          
          <div class="newsletter-signup">
            <h3>Stay Updated</h3>
            <p>Subscribe to our newsletter for the latest skincare tips and platform updates.</p>
            <form @submit.prevent="subscribeNewsletter" class="newsletter-form">
              <input 
                v-model="newsletterEmail"
                type="email" 
                placeholder="Enter your email address"
                class="form-input newsletter-input"
                required
              />
              <button type="submit" class="btn btn-primary" :disabled="subscribing">
                {{ subscribing ? 'Subscribing...' : 'Subscribe' }}
              </button>
            </form>
            <div v-if="subscriptionMessage" class="subscription-message" :class="subscriptionSuccess ? 'success' : 'error'">
              {{ subscriptionMessage }}
            </div>
          </div>
        </div>
      </section>

      <!-- FAQ Section -->
      <section class="faq-section">
        <h2>Frequently Asked Questions</h2>
        <div class="faq-list">
          <div 
            v-for="(faq, index) in faqs" 
            :key="index"
            class="faq-item card"
            @click="toggleFaq(index)"
          >
            <div class="faq-question">
              <h4>{{ faq.question }}</h4>
              <span class="faq-toggle">{{ faq.open ? '−' : '+' }}</span>
            </div>
            <div v-if="faq.open" class="faq-answer">
              <p>{{ faq.answer }}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
export default {
  name: 'About',
  data() {
    return {
      newsletterEmail: '',
      subscribing: false,
      subscriptionMessage: '',
      subscriptionSuccess: false,
      faqs: [
        {
          question: 'Is SkinStudy free to use?',
          answer: 'Yes! SkinStudy offers comprehensive free access to our skin analysis, ingredient database, and educational content. We believe everyone should have access to quality skincare information.',
          open: false
        },
        {
          question: 'How accurate is the skin analysis?',
          answer: 'Our skin analysis is based on scientifically-validated questionnaires and has been tested with thousands of users. While it provides excellent guidance, we always recommend consulting with a dermatologist for specific skin concerns.',
          open: false
        },
        {
          question: 'Do I need to create an account?',
          answer: 'Not necessarily! You can use our skin analysis and browse ingredients anonymously. Creating an account allows you to save your results, build routines, and track your progress over time.',
          open: false
        },
        {
          question: 'How do you keep my data safe?',
          answer: 'We use industry-standard encryption, never sell personal data, and give you full control over your information. You can delete your account and all data at any time.',
          open: false
        },
        {
          question: 'Can I trust the ingredient information?',
          answer: 'All our ingredient data comes from peer-reviewed scientific research, regulatory databases, and expert dermatologist reviews. We continuously update our database with the latest findings.',
          open: false
        },
        {
          question: 'Do you recommend specific products?',
          answer: 'We focus on ingredient education rather than specific product recommendations. Our goal is to help you understand what to look for in products based on your skin type and concerns.',
          open: false
        },
        {
          question: 'How often should I retake the skin analysis?',
          answer: 'We recommend retaking the analysis every 3-6 months or when you notice significant changes in your skin, such as seasonal changes or major life events.',
          open: false
        },
        {
          question: 'Is SkinStudy suitable for all skin tones?',
          answer: 'Absolutely! Our analysis and recommendations are designed to work for all skin tones and ethnicities. We specifically consider cultural skincare practices and diverse skin needs.',
          open: false
        }
      ]
    }
  },
  methods: {
    toggleFaq(index) {
      this.faqs[index].open = !this.faqs[index].open
    },
    
    async subscribeNewsletter() {
      if (!this.newsletterEmail) return
      
      this.subscribing = true
      this.subscriptionMessage = ''
      
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        this.subscriptionMessage = 'Thank you for subscribing! Check your email for confirmation.'
        this.subscriptionSuccess = true
        this.newsletterEmail = ''
        
        setTimeout(() => {
          this.subscriptionMessage = ''
        }, 5000)
        
      } catch (error) {
        this.subscriptionMessage = 'Something went wrong. Please try again later.'
        this.subscriptionSuccess = false
      } finally {
        this.subscribing = false
      }
    }
  }
}
</script>

<style scoped>
.about {
  padding-top: 2rem;
}

.hero-section {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 3rem;
  align-items: center;
  margin-bottom: 4rem;
  padding: 2rem 0;
}

.hero-content h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 1.25rem;
  color: var(--text-light);
  line-height: 1.6;
  max-width: 500px;
}

.mission-section {
  margin-bottom: 4rem;
}

.mission-content {
  padding: 3rem;
}

.mission-text {
  font-size: 1.1rem;
  line-height: 1.8;
  margin-bottom: 3rem;
  color: var(--text-dark);
}

.mission-values {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.value-item {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.value-content h4 {
  margin-bottom: 0.5rem;
  color: var(--primary-color);
}

.features-section {
  margin-bottom: 4rem;
}

.features-section h2 {
  text-align: center;
  margin-bottom: 3rem;
}

.feature-card {
  text-align: center;
  padding: 2rem;
  transition: transform 0.3s ease;
}

.feature-card h3 {
  margin-bottom: 1rem;
  color: var(--primary-color);
}

.feature-card p {
  margin-bottom: 2rem;
  line-height: 1.6;
}

.team-section {
  margin-bottom: 4rem;
}

.team-section h2 {
  text-align: center;
  margin-bottom: 1rem;
}

.team-intro {
  text-align: center;
  color: var(--text-light);
  margin-bottom: 3rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.team-member {
  text-align: center;
  padding: 2rem;
}

.member-role {
  color: var(--secondary-color);
  font-weight: 600;
  margin-bottom: 1rem;
}

.member-bio {
  color: var(--text-light);
  line-height: 1.6;
}

.technology-section {
  margin-bottom: 4rem;
}

.tech-content {
  padding: 3rem;
}

.tech-content h2 {
  text-align: center;
  margin-bottom: 1rem;
}

.tech-content > p {
  text-align: center;
  color: var(--text-light);
  margin-bottom: 3rem;
}

.tech-stack {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.tech-category h4 {
  color: var(--primary-color);
  margin-bottom: 1rem;
}

.tech-items {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tech-item {
  padding: 0.5rem 1rem;
  background: var(--background-light);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  font-size: 0.875rem;
  color: var(--text-dark);
}

.privacy-section {
  margin-bottom: 4rem;
}

.privacy-content {
  padding: 3rem;
}

.privacy-content h2 {
  text-align: center;
  margin-bottom: 1rem;
}

.privacy-content > p {
  text-align: center;
  color: var(--text-light);
  margin-bottom: 3rem;
}

.privacy-features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.privacy-item {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.privacy-text h4 {
  margin-bottom: 0.5rem;
  color: var(--primary-color);
}

.research-section {
  margin-bottom: 4rem;
}

.research-section h2 {
  text-align: center;
  margin-bottom: 3rem;
}

.research-card {
  padding: 2rem;
}

.research-card h3 {
  color: var(--primary-color);
  margin-bottom: 1rem;
}

.research-card p {
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.research-list {
  list-style: none;
  padding: 0;
}

.research-list li {
  padding: 0.5rem 0;
  padding-left: 1.5rem;
  position: relative;
}

.research-list li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: var(--secondary-color);
  font-weight: bold;
}

.stats-section {
  margin-bottom: 4rem;
}

.stats-section h2 {
  text-align: center;
  margin-bottom: 3rem;
}

.stat-card {
  text-align: center;
  padding: 2rem;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: 0.5rem;
}

.stat-label {
  color: var(--text-light);
  font-weight: 500;
}

.contact-section {
  margin-bottom: 4rem;
}

.contact-content {
  padding: 3rem;
}

.contact-content h2 {
  text-align: center;
  margin-bottom: 1rem;
}

.contact-content > p {
  text-align: center;
  color: var(--text-light);
  margin-bottom: 3rem;
}

.contact-method {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  padding: 1.5rem;
  background: var(--background-light);
  border-radius: var(--border-radius);
}

.contact-info h4 {
  margin-bottom: 0.5rem;
  color: var(--primary-color);
}

.contact-info p {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.contact-info small {
  color: var(--text-light);
}

.newsletter-signup {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid var(--border-color);
  text-align: center;
}

.newsletter-signup h3 {
  margin-bottom: 0.5rem;
  color: var(--primary-color);
}

.newsletter-signup > p {
  color: var(--text-light);
  margin-bottom: 2rem;
}

.newsletter-form {
  display: flex;
  gap: 1rem;
  max-width: 400px;
  margin: 0 auto;
}

.newsletter-input {
  flex: 1;
}

.subscription-message {
  margin-top: 1rem;
  padding: 1rem;
  border-radius: var(--border-radius);
  font-weight: 500;
}

.subscription-message.success {
  background: #d1fae5;
  color: #065f46;
  border: 1px solid #a7f3d0;
}

.subscription-message.error {
  background: #fee2e2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

.faq-section {
  margin-bottom: 4rem;
}

.faq-section h2 {
  text-align: center;
  margin-bottom: 3rem;
}

.faq-list {
  max-width: 800px;
  margin: 0 auto;
}

.faq-item {
  margin-bottom: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  }


.faq-question {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
}

.faq-question h4 {
  margin: 0;
  color: var(--primary-color);
}

.faq-toggle {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--primary-color);
}

.faq-answer {
  padding: 0 1.5rem 1.5rem;
  border-top: 1px solid var(--border-color);
}

.faq-answer p {
  margin: 1rem 0 0 0;
  line-height: 1.6;
  color: var(--text-light);
}

@media (max-width: 768px) {
  .hero-section {
    grid-template-columns: 1fr;
    text-align: center;
    gap: 2rem;
  }
  
  .hero-content h1 {
    font-size: 2rem;
  }
  
  .mission-values {
    grid-template-columns: 1fr;
  }
  
  .tech-stack,
  .privacy-features {
    grid-template-columns: 1fr;
  }
  
  .newsletter-form {
    flex-direction: column;
  }
  
  .stat-number {
    font-size: 2rem;
  }
  
  .contact-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .hero-content h1 {
    font-size: 1.75rem;
  }
  
  .mission-content,
  .tech-content,
  .privacy-content,
  .contact-content {
    padding: 2rem;
  }
  
  .feature-card,
  .team-member,
  .research-card,
  .stat-card {
    padding: 1.5rem;
  }
}
</style>