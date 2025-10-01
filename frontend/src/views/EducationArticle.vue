<template>
  <div class="education-article">
    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Loading article...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <h2>Article Not Found</h2>
      <p>{{ error }}</p>
      <router-link to="/education" class="btn btn-primary">Back to Education</router-link>
    </div>

    <!-- Article Content -->
    <div v-else-if="article" class="article-container">
      <!-- Article Header -->
      <div class="article-header">
        <div class="breadcrumb">
          <router-link to="/education">Education</router-link>
          <span class="separator">›</span>
          <span class="current">{{ article.title }}</span>
        </div>
        
        <div class="article-meta">
          <span class="category">{{ article.category }}</span>
          <span class="difficulty" v-if="article.metadata?.difficulty">
            {{ formatDifficulty(article.metadata.difficulty) }}
          </span>
        </div>

        <h1 class="article-title">{{ article.title }}</h1>
        
        <div class="article-info">
          <div class="author-info">
            <span class="author">By {{ article.author }}</span>
            <span class="date">{{ formatDate(article.publishDate || article.metadata?.lastUpdated) }}</span>
          </div>
          
          <div class="reading-info">
            <span class="reading-time" v-if="article.metadata?.readingTime">
              {{ article.metadata.readingTime }} min read
            </span>
            <span class="rating" v-if="article.engagement?.rating?.average">
              ⭐ {{ article.engagement.rating.average.toFixed(1) }}
              ({{ article.engagement.rating.count }} reviews)
            </span>
          </div>
        </div>

        <p class="article-excerpt">{{ article.excerpt }}</p>
      </div>

      <!-- Article Image -->
      <div v-if="article.media?.featuredImage" class="article-image">
        <img :src="article.media.featuredImage" :alt="article.title" />
      </div>

      <!-- Article Body -->
      <div class="article-body">
        <div class="content" v-html="formatContent(article.content?.body)"></div>
        
        <!-- Key Points -->
        <div v-if="article.content?.keyPoints && article.content.keyPoints.length > 0" class="key-points">
          <h3>Key Points</h3>
          <ul>
            <li v-for="point in article.content.keyPoints" :key="point">{{ point }}</li>
          </ul>
        </div>
        
        <!-- Takeaways -->
        <div v-if="article.content?.takeaways && article.content.takeaways.length > 0" class="takeaways">
          <h3>Key Takeaways</h3>
          <ul>
            <li v-for="takeaway in article.content.takeaways" :key="takeaway">{{ takeaway }}</li>
          </ul>
        </div>
      </div>

      <!-- Tags -->
      <div v-if="article.tags && article.tags.length > 0" class="article-tags">
        <h4>Tags</h4>
        <div class="tags-list">
          <span v-for="tag in article.tags" :key="tag" class="tag">{{ tag }}</span>
        </div>
      </div>

      <!-- Related Articles -->
      <div v-if="relatedArticles.length > 0" class="related-articles">
        <h3>Related Articles</h3>
        <div class="articles-grid">
          <div 
            v-for="related in relatedArticles" 
            :key="related._id"
            class="article-card"
            @click="navigateToArticle(related.slug)"
          >
            <div class="card-content">
              <h4>{{ related.title }}</h4>
              <p>{{ related.excerpt }}</p>
              <div class="card-meta">
                <span class="category">{{ related.category }}</span>
                <span class="reading-time" v-if="related.metadata?.readingTime">
                  {{ related.metadata.readingTime }} min
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Rating Section -->
      <div class="article-rating">
        <h4>Rate this article</h4>
        <div class="rating-stars">
          <span 
            v-for="star in 5" 
            :key="star"
            class="star"
            :class="{ active: star <= userRating }"
            @click="rateArticle(star)"
          >
            ⭐
          </span>
        </div>
        <p v-if="userRating > 0" class="rating-feedback">
          Thank you for rating this article!
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { educationService } from '../services/api'

export default {
  name: 'EducationArticle',
  data() {
    return {
      article: null,
      relatedArticles: [],
      loading: true,
      error: null,
      userRating: 0
    }
  },
  async mounted() {
    await this.loadArticle()
  },
  watch: {
    '$route.params.slug': {
      handler: 'loadArticle',
      immediate: true
    }
  },
  methods: {
    async loadArticle() {
      try {
        this.loading = true
        this.error = null
        
        const slug = this.$route.params.slug
        if (!slug) {
          throw new Error('Article slug is required')
        }

        // Load article
        this.article = await educationService.getContentBySlug(slug)
        
        // Load related articles by category
        if (this.article.category) {
          try {
            const response = await educationService.getContent({
              category: this.article.category,
              limit: 4
            })
            this.relatedArticles = response.content?.filter(
              item => item.slug !== slug
            ).slice(0, 3) || []
          } catch (error) {
            console.error('Error loading related articles:', error)
            this.relatedArticles = []
          }
        }
        
      } catch (error) {
        console.error('Error loading article:', error)
        this.error = error.message || 'Failed to load article'
        this.article = null
      } finally {
        this.loading = false
      }
    },

    async rateArticle(rating) {
      try {
        this.userRating = rating
        await educationService.rateContent(this.article.slug, rating)
        // Reload article to get updated rating
        const updatedArticle = await educationService.getContentBySlug(this.article.slug)
        this.article.engagement = updatedArticle.engagement
      } catch (error) {
        console.error('Error rating article:', error)
      }
    },

    navigateToArticle(slug) {
      this.$router.push(`/education/${slug}`)
    },

    formatDate(date) {
      if (!date) return 'Date not available'
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    },

    formatDifficulty(difficulty) {
      const levels = {
        beginner: 'Beginner',
        intermediate: 'Intermediate', 
        advanced: 'Advanced'
      }
      return levels[difficulty] || difficulty
    },

    formatContent(content) {
      // Convert line breaks to HTML and add basic formatting
      if (!content || typeof content !== 'string') {
        return '<p>Content not available</p>'
      }
      
      return content
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>')
        .replace(/^/, '<p>')
        .replace(/$/, '</p>')
    }
  }
}
</script>

<style scoped>
.education-article {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.loading-container,
.error-container {
  text-align: center;
  padding: 4rem 2rem;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--color-primary-light);
  border-top: 4px solid var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

.breadcrumb {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  margin-bottom: 1rem;
}

.breadcrumb a {
  color: var(--color-primary);
  text-decoration: none;
}

.breadcrumb .separator {
  margin: 0 0.5rem;
}

.article-meta {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.category {
  background: var(--color-primary);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.8rem;
  text-transform: uppercase;
}

.difficulty {
  background: var(--color-secondary);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.8rem;
}

.article-title {
  font-size: 2.5rem;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 1.5rem;
  color: var(--color-text-primary);
}

.article-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-top: 1px solid var(--color-border);
  border-bottom: 1px solid var(--color-border);
  margin-bottom: 1.5rem;
}

.author-info,
.reading-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.author-info span,
.reading-info span {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
}

.article-excerpt {
  font-size: 1.1rem;
  line-height: 1.6;
  color: var(--color-text-secondary);
  margin-bottom: 2rem;
  font-style: italic;
}

.article-image {
  margin-bottom: 2rem;
}

.article-image img {
  width: 100%;
  border-radius: 0.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.article-body {
  margin-bottom: 3rem;
}

.content {
  font-size: 1.1rem;
  line-height: 1.8;
  color: var(--color-text-primary);
}

.content :deep(p) {
  margin-bottom: 1.5rem;
}

.key-points,
.takeaways {
  margin-top: 2rem;
  padding: 1.5rem;
  background: var(--color-bg-secondary);
  border-radius: 0.5rem;
  border-left: 4px solid var(--color-primary);
}

.key-points h3,
.takeaways h3 {
  color: var(--color-primary);
  margin-bottom: 1rem;
  font-size: 1.2rem;
}

.key-points ul,
.takeaways ul {
  list-style: none;
  padding: 0;
}

.key-points li,
.takeaways li {
  margin-bottom: 0.75rem;
  padding-left: 1.5rem;
  position: relative;
}

.key-points li:before,
.takeaways li:before {
  content: '✓';
  position: absolute;
  left: 0;
  color: var(--color-primary);
  font-weight: bold;
}

.article-tags {
  margin-bottom: 3rem;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.tag {
  background: var(--color-bg-secondary);
  padding: 0.5rem 1rem;
  border-radius: 1rem;
  font-size: 0.9rem;
  color: var(--color-text-secondary);
}

.related-articles {
  margin-bottom: 3rem;
}

.articles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
}

.article-card {
  background: var(--color-bg-secondary);
  border-radius: 0.5rem;
  padding: 1.5rem;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.article-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.article-card h4 {
  margin-bottom: 0.5rem;
  color: var(--color-text-primary);
}

.article-card p {
  color: var(--color-text-secondary);
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.card-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: var(--color-text-secondary);
}

.article-rating {
  text-align: center;
  padding: 2rem;
  background: var(--color-bg-secondary);
  border-radius: 0.5rem;
}

.rating-stars {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin: 1rem 0;
}

.star {
  font-size: 1.5rem;
  cursor: pointer;
  opacity: 0.3;
  transition: opacity 0.2s ease;
}

.star.active {
  opacity: 1;
}

.star:hover {
  opacity: 0.7;
}

.rating-feedback {
  color: var(--color-success);
  font-weight: 500;
  margin-top: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .education-article {
    padding: 1rem;
  }
  
  .article-title {
    font-size: 2rem;
  }
  
  .article-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .articles-grid {
    grid-template-columns: 1fr;
  }
}
</style>