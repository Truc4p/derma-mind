import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API Configuration
// Change this to your backend URL when deploying
const API_BASE_URL = 'http://localhost:3004/api';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60 seconds for AI responses
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    try {
      // Get token from AsyncStorage (React Native equivalent of localStorage)
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      try {
        await AsyncStorage.removeItem('authToken');
        await AsyncStorage.removeItem('user');
      } catch (e) {
        console.error('Error removing auth data:', e);
      }
    }
    return Promise.reject(error);
  }
);

// AI Dermatologist service
export const aiDermatologistService = {
  async chat(message, conversationHistory = []) {
    const response = await api.post('/ai-dermatologist/chat', {
      message,
      conversationHistory
    });
    return response.data;
  }
};

// Storage utilities for chat history
export const chatStorage = {
  async saveChatHistory(messages) {
    try {
      await AsyncStorage.setItem('aiDermatologistChat', JSON.stringify(messages));
    } catch (error) {
      console.warn('Failed to save chat history:', error);
    }
  },

  async loadChatHistory() {
    try {
      const savedChat = await AsyncStorage.getItem('aiDermatologistChat');
      if (savedChat) {
        return JSON.parse(savedChat);
      }
      return [];
    } catch (error) {
      console.warn('Failed to load chat history:', error);
      return [];
    }
  },

  async clearChatHistory() {
    try {
      await AsyncStorage.removeItem('aiDermatologistChat');
    } catch (error) {
      console.warn('Failed to clear chat history:', error);
    }
  }
};

export default api;
