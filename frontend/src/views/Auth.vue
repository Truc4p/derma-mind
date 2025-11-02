<template>
    <div class="auth-page">
        <div class="auth-container">
            <div class="auth-card">
                <!-- Logo/Header -->
                <div class="auth-header">
                    <h1>🌟 Skin Study</h1>
                    <p class="subtitle">Your AI-Powered Skincare Companion</p>
                </div>

                <!-- Tab Switcher -->
                <div class="auth-tabs">
                    <button 
                        :class="['tab', { active: isLogin }]"
                        @click="switchToLogin"
                    >
                        Login
                    </button>
                    <button 
                        :class="['tab', { active: !isLogin }]"
                        @click="switchToRegister"
                    >
                        Register
                    </button>
                </div>

                <!-- Login Form -->
                <form v-if="isLogin" @submit.prevent="handleLogin" class="auth-form">
                    <h2>Welcome Back!</h2>
                    <p class="form-subtitle">Sign in to continue to your skincare journey</p>

                    <div class="form-group">
                        <label for="login-email">Email</label>
                        <input
                            id="login-email"
                            v-model="loginForm.email"
                            type="email"
                            placeholder="Enter your email"
                            required
                        />
                    </div>

                    <div class="form-group">
                        <label for="login-password">Password</label>
                        <input
                            id="login-password"
                            v-model="loginForm.password"
                            type="password"
                            placeholder="Enter your password"
                            required
                        />
                    </div>

                    <div class="form-options">
                        <label class="remember-me">
                            <input type="checkbox" v-model="rememberMe" />
                            <span>Remember me</span>
                        </label>
                        <a href="#" class="forgot-password">Forgot password?</a>
                    </div>

                    <button type="submit" class="submit-btn" :disabled="isLoading">
                        <span v-if="!isLoading">Sign In</span>
                        <span v-else class="loading">
                            <span class="spinner"></span>
                            Signing in...
                        </span>
                    </button>

                    <div v-if="error" class="error-message">
                        {{ error }}
                    </div>

                    <div v-if="successMessage" class="success-message">
                        {{ successMessage }}
                    </div>
                </form>

                <!-- Register Form -->
                <form v-else @submit.prevent="handleRegister" class="auth-form">
                    <h2>Create Account</h2>
                    <p class="form-subtitle">Join us for personalized skincare advice</p>

                    <div class="form-group">
                        <label for="register-name">Full Name</label>
                        <input
                            id="register-name"
                            v-model="registerForm.name"
                            type="text"
                            placeholder="Enter your full name"
                            required
                        />
                    </div>

                    <div class="form-group">
                        <label for="register-email">Email</label>
                        <input
                            id="register-email"
                            v-model="registerForm.email"
                            type="email"
                            placeholder="Enter your email"
                            required
                        />
                    </div>

                    <div class="form-group">
                        <label for="register-password">Password</label>
                        <input
                            id="register-password"
                            v-model="registerForm.password"
                            type="password"
                            placeholder="Create a password (min. 6 characters)"
                            required
                            minlength="6"
                        />
                        <div class="password-strength">
                            <div class="strength-bar" :class="passwordStrength"></div>
                        </div>
                        <small class="password-hint">
                            {{ passwordHint }}
                        </small>
                    </div>

                    <div class="form-group">
                        <label for="register-confirm-password">Confirm Password</label>
                        <input
                            id="register-confirm-password"
                            v-model="registerForm.confirmPassword"
                            type="password"
                            placeholder="Confirm your password"
                            required
                        />
                    </div>

                    <div class="form-group checkbox-group">
                        <label class="checkbox-label">
                            <input type="checkbox" v-model="acceptTerms" required />
                            <span>
                                I agree to the 
                                <a href="#" @click.prevent="showTerms">Terms of Service</a> 
                                and 
                                <a href="#" @click.prevent="showPrivacy">Privacy Policy</a>
                            </span>
                        </label>
                    </div>

                    <button type="submit" class="submit-btn" :disabled="isLoading || !acceptTerms">
                        <span v-if="!isLoading">Create Account</span>
                        <span v-else class="loading">
                            <span class="spinner"></span>
                            Creating account...
                        </span>
                    </button>

                    <div v-if="error" class="error-message">
                        {{ error }}
                    </div>

                    <div v-if="successMessage" class="success-message">
                        {{ successMessage }}
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script>
import api from '@/services/api'

export default {
    name: 'Auth',
    data() {
        return {
            isLogin: true,
            isLoading: false,
            error: '',
            successMessage: '',
            rememberMe: false,
            acceptTerms: false,
            loginForm: {
                email: '',
                password: ''
            },
            registerForm: {
                name: '',
                email: '',
                password: '',
                confirmPassword: ''
            }
        }
    },

    computed: {
        passwordStrength() {
            const password = this.registerForm.password
            if (!password) return ''
            if (password.length < 6) return 'weak'
            if (password.length < 10) return 'medium'
            if (password.length >= 10 && /[A-Z]/.test(password) && /[0-9]/.test(password)) {
                return 'strong'
            }
            return 'medium'
        },

        passwordHint() {
            const strength = this.passwordStrength
            if (!this.registerForm.password) return ''
            if (strength === 'weak') return '⚠️ Weak password - use at least 6 characters'
            if (strength === 'medium') return '✓ Medium strength - add numbers and uppercase for better security'
            if (strength === 'strong') return '✓ Strong password!'
            return ''
        }
    },

    methods: {
        switchToLogin() {
            this.isLogin = true
            this.error = ''
            this.successMessage = ''
        },

        switchToRegister() {
            this.isLogin = false
            this.error = ''
            this.successMessage = ''
        },

        async handleLogin() {
            this.error = ''
            this.successMessage = ''
            this.isLoading = true

            try {
                const response = await api.post('/auth/login', {
                    email: this.loginForm.email,
                    password: this.loginForm.password
                })

                if (response.data.success) {
                    // Store token
                    localStorage.setItem('token', response.data.token)
                    
                    // Store user info
                    localStorage.setItem('user', JSON.stringify(response.data.user))

                    this.successMessage = 'Login successful! Redirecting...'

                    // Redirect to home or AI Dermatologist
                    setTimeout(() => {
                        this.$router.push('/ai-dermatologist')
                    }, 1000)
                }
            } catch (error) {
                console.error('Login error:', error)
                this.error = error.response?.data?.message || 'Login failed. Please check your credentials.'
            } finally {
                this.isLoading = false
            }
        },

        async handleRegister() {
            this.error = ''
            this.successMessage = ''

            // Validate passwords match
            if (this.registerForm.password !== this.registerForm.confirmPassword) {
                this.error = 'Passwords do not match'
                return
            }

            // Validate password strength
            if (this.registerForm.password.length < 6) {
                this.error = 'Password must be at least 6 characters long'
                return
            }

            this.isLoading = true

            try {
                const response = await api.post('/auth/register', {
                    name: this.registerForm.name,
                    email: this.registerForm.email,
                    password: this.registerForm.password
                })

                if (response.data.success) {
                    // Store token
                    localStorage.setItem('token', response.data.token)
                    
                    // Store user info
                    localStorage.setItem('user', JSON.stringify(response.data.user))

                    this.successMessage = 'Account created successfully! Redirecting...'

                    // Redirect to home or AI Dermatologist
                    setTimeout(() => {
                        this.$router.push('/ai-dermatologist')
                    }, 1000)
                }
            } catch (error) {
                console.error('Registration error:', error)
                this.error = error.response?.data?.message || 'Registration failed. Please try again.'
            } finally {
                this.isLoading = false
            }
        },

        showTerms() {
            alert('Terms of Service:\n\nThis is an educational skincare platform. Always consult with a licensed dermatologist for medical advice.')
        },

        showPrivacy() {
            alert('Privacy Policy:\n\nWe respect your privacy and protect your personal information according to GDPR standards.')
        }
    },

    mounted() {
        // Check if user is already logged in
        const token = localStorage.getItem('token')
        if (token) {
            this.$router.push('/ai-dermatologist')
        }
    }
}
</script>

<style scoped>
.auth-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: 
        radial-gradient(circle at 20% 80%, rgba(243, 176, 250, 0.3) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(230, 120, 249, 0.3) 0%, transparent 50%),
        radial-gradient(circle at 40% 40%, rgba(252, 248, 252, 0.1) 0%, transparent 50%),
        var(--gradient-hero);
    padding: 2rem 1rem;
}


.auth-container {
    width: 100%;
    max-width: 480px;
}

.auth-card {
    background: white;
    border-radius: 20px;
    overflow: hidden;
}

/* Header */
.auth-header {
    color: white;
    text-align: center;
    padding: 2rem;
}

.auth-header h1 {
    margin: 0;
    font-size: 2rem;
    font-weight: 700;
}

.auth-header .subtitle {
    margin: 0.5rem 0 0 0;
    opacity: 0.9;
    font-size: 0.95rem;
}

/* Tabs */
.auth-tabs {
    display: flex;
    background: white;
}

.auth-tabs .tab {
    flex: 1;
    padding: 1rem;
    border: none;
    background: transparent;
    font-size: 1rem;
    font-weight: 600;
    color: #666;
    cursor: pointer;
    transition: all 0.3s;
    border-bottom: 3px solid transparent;
}

.auth-tabs .tab.active {
    color: var(--primary-600);
    border-bottom-color: var(--primary-500);
}

/* Form */
.auth-form {
    padding: 2rem;
}

.auth-form h2 {
    margin: 0 0 0.5rem 0;
    color: var(--primary-800);
    font-size: 1.75rem;
}

.form-subtitle {
    color: #666;
    margin: 0 0 1.5rem 0;
    font-size: 0.95rem;
}

.form-group {
    margin-bottom: 1.5rem;
}

.form-group label {
    display: block;
    margin-bottom: 0.5rem;
    color: var(--primary-700);
    font-weight: 600;
    font-size: 0.9rem;
}

.form-group input[type="text"],
.form-group input[type="email"],
.form-group input[type="password"] {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 2px solid #e0e0e0;
    border-radius: 10px;
    font-size: 1rem;
    transition: all 0.3s;
    box-sizing: border-box;
}

.form-group input:focus {
    outline: none;
    border-color: var(--primary-500);
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

/* Password Strength */
.password-strength {
    height: 4px;
    background: #e0e0e0;
    border-radius: 2px;
    margin-top: 0.5rem;
    overflow: hidden;
}

.strength-bar {
    height: 100%;
    transition: all 0.3s;
    border-radius: 2px;
}

.strength-bar.weak {
    width: 33%;
    background: #f44336;
}

.strength-bar.medium {
    width: 66%;
    background: #ff9800;
}

.strength-bar.strong {
    width: 100%;
    background: #4caf50;
}

.password-hint {
    display: block;
    margin-top: 0.5rem;
    font-size: 0.85rem;
    color: #666;
}

/* Form Options */
.form-options {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    font-size: 0.9rem;
}

.remember-me {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    color: #666;
}

.remember-me input {
    cursor: pointer;
}

.forgot-password {
    color: var(--primary-600);
    text-decoration: none;
    font-weight: 600;
}

.forgot-password:hover {
    text-decoration: underline;
}

/* Checkbox Group */
.checkbox-group {
    margin-bottom: 1.5rem;
}

.checkbox-label {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    cursor: pointer;
    font-size: 0.9rem;
    color: #666;
}

.checkbox-label input {
    margin-top: 0.2rem;
    cursor: pointer;
}

.checkbox-label a {
    color: var(--primary-600);
    text-decoration: none;
    font-weight: 600;
}

.checkbox-label a:hover {
    text-decoration: underline;
}

/* Submit Button */
.submit-btn {
    width: 100%;
    padding: 1rem;
    background: linear-gradient(135deg, var(--primary-500) 0%, var(--primary-600) 100%);
    color: white;
    border: none;
    border-radius: 10px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
}

.submit-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
}

.submit-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
}

.loading {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.spinner {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

/* Messages */
.error-message {
    margin-top: 1rem;
    padding: 0.75rem;
    background: #ffebee;
    color: #c62828;
    border-radius: 8px;
    font-size: 0.9rem;
    border-left: 4px solid #c62828;
}

.success-message {
    margin-top: 1rem;
    padding: 0.75rem;
    background: #e8f5e9;
    color: #2e7d32;
    border-radius: 8px;
    font-size: 0.9rem;
    border-left: 4px solid #4caf50;
}

/* Responsive */
@media (max-width: 480px) {
    .auth-page {
        padding: 1rem 0.5rem;
    }

    .auth-card {
        border-radius: 15px;
    }

    .auth-header {
        padding: 1.5rem;
    }

    .auth-header h1 {
        font-size: 1.5rem;
    }

    .auth-form {
        padding: 1.5rem;
    }

    .auth-form h2 {
        font-size: 1.5rem;
    }

    .features-list {
        grid-template-columns: 1fr;
    }

    .form-options {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.75rem;
    }
}
</style>
