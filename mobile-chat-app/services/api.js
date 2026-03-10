import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// API Configuration
// For iOS Simulator: http://localhost:3004
// For Android Emulator: http://10.0.2.2:3004
// For Physical Device: http://YOUR_IP:3004 (e.g., http://192.168.1.100:3004)
const getApiBaseUrl = () => {
  if (Platform.OS === 'android') {
    return 'http://192.168.88.55:3004/api'; // Android Physical Device - Backend API port
  }
  return 'http://localhost:3004/api'; // iOS Simulator or other platforms
};

const API_BASE_URL = getApiBaseUrl();

// Log API configuration on startup
console.log('🔧 [API CONFIG] Platform:', Platform.OS);
console.log('🔧 [API CONFIG] Base URL:', API_BASE_URL);
console.log('🔧 [API CONFIG] Full chat endpoint:', `${API_BASE_URL}/ai-dermatology-expert/chat`);

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
    console.log('📤 [API REQUEST] Method:', config.method?.toUpperCase());
    console.log('📤 [API REQUEST] URL:', config.url);
    console.log('📤 [API REQUEST] Full URL:', config.baseURL + config.url);
    console.log('📤 [API REQUEST] Headers:', JSON.stringify(config.headers, null, 2));
    if (config.data) {
      console.log('📤 [API REQUEST] Data:', JSON.stringify(config.data, null, 2));
    }
    
    try {
      // Get token from AsyncStorage (React Native equivalent of localStorage)
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('📤 [API REQUEST] Auth token added');
      } else {
        console.log('📤 [API REQUEST] No auth token found');
      }
    } catch (error) {
      console.error('❌ [API REQUEST] Error getting auth token:', error);
    }
    return config;
  },
  (error) => {
    console.error('❌ [API REQUEST] Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log('✅ [API RESPONSE] Status:', response.status);
    console.log('✅ [API RESPONSE] URL:', response.config.url);
    console.log('✅ [API RESPONSE] Data:', JSON.stringify(response.data, null, 2));
    return response;
  },
  async (error) => {
    console.error('❌ [API ERROR] Full error:', error);
    console.error('❌ [API ERROR] Message:', error.message);
    console.error('❌ [API ERROR] Code:', error.code);
    
    if (error.response) {
      // The request was made and the server responded with a status code
      console.error('❌ [API ERROR] Response Status:', error.response.status);
      console.error('❌ [API ERROR] Response Data:', JSON.stringify(error.response.data, null, 2));
      console.error('❌ [API ERROR] Response Headers:', JSON.stringify(error.response.headers, null, 2));
      
      if (error.response.status === 401) {
        // Handle unauthorized access
        try {
          await AsyncStorage.removeItem('authToken');
          await AsyncStorage.removeItem('user');
          console.log('🔓 [API ERROR] Cleared auth data due to 401');
        } catch (e) {
          console.error('❌ [API ERROR] Error removing auth data:', e);
        }
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('❌ [API ERROR] No response received');
      console.error('❌ [API ERROR] Request:', error.request);
    } else {
      // Something happened in setting up the request
      console.error('❌ [API ERROR] Setup error:', error.message);
    }
    
    console.error('❌ [API ERROR] Config:', JSON.stringify(error.config, null, 2));
    return Promise.reject(error);
  }
);

// AI Dermatology Expert service
export const aiDermatologyExpertService = {
  async chat(message, conversationHistory = []) {
    console.log('💬 [CHAT SERVICE] Sending message:', message);
    console.log('💬 [CHAT SERVICE] Conversation history length:', conversationHistory.length);
    try {
      const response = await api.post('/ai-dermatology-expert/chat', {
        message,
        conversationHistory
      });
      console.log('💬 [CHAT SERVICE] Response received successfully');
      return response.data;
    } catch (error) {
      console.error('💬 [CHAT SERVICE] Error:', error.message);
      throw error;
    }
  }
};

// Live Chat service (same endpoint, can be extended for voice features)
export const liveChatService = {
  async chat(message, conversationHistory = []) {
    const response = await api.post('/ai-dermatology-expert/chat', {
      message,
      conversationHistory
    });
    return response.data;
  },
  
  // Audio transcription endpoint
  async transcribeAudio(audioUri) {
    try {
      const startTime = Date.now();
      console.log('📤 [FRONTEND] Starting transcription upload at:', new Date().toISOString());
      console.log('📤 [FRONTEND] Audio URI:', audioUri);
      console.log('📤 [FRONTEND] API URL:', `${API_BASE_URL}/ai-dermatology-expert/transcribe`);
      
      const formData = new FormData();
      
      // Prepare the audio file for upload
      const audioFile = {
        uri: audioUri,
        type: 'audio/m4a', // iOS/Android recording format
        name: 'recording.m4a'
      };
      
      formData.append('audio', audioFile);
      
      console.log('📦 [FRONTEND] FormData prepared with:', {
        fileName: audioFile.name,
        fileType: audioFile.type,
        fileUri: audioFile.uri
      });
      console.log('🚀 [FRONTEND] Sending POST request...');
      
      const response = await api.post('/ai-dermatology-expert/transcribe', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 90000, // Increased to 90 seconds for transcription
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log(`📊 [FRONTEND] Upload progress: ${percentCompleted}%`);
        }
      });
      
      const duration = Date.now() - startTime;
      console.log(`✅ [FRONTEND] Transcription received in ${duration}ms:`, response.data);
      return response.data;
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`❌ [FRONTEND] Transcription failed after ${duration}ms`);
      console.error('❌ [FRONTEND] Error type:', error.code || error.name);
      console.error('❌ [FRONTEND] Error message:', error.message);
      console.error('❌ [FRONTEND] Error response:', error.response?.data);
      console.error('❌ [FRONTEND] Error status:', error.response?.status);
      throw error;
    }
  },
  
  // Text-to-speech endpoint
  async textToSpeech(text) {
    try {
      const startTime = Date.now();
      console.log('🔊 [FRONTEND] Starting TTS request at:', new Date().toISOString());
      console.log('📝 [FRONTEND] Text length:', text.length);
      console.log('🚀 [FRONTEND] API URL:', `${API_BASE_URL}/ai-dermatology-expert/text-to-speech`);
      
      const response = await api.post('/ai-dermatology-expert/text-to-speech', {
        text
      }, {
        timeout: 60000 // 60 seconds for TTS
      });
      
      const duration = Date.now() - startTime;
      console.log(`✅ [FRONTEND] TTS audio received in ${duration}ms`);
      return response.data;
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`❌ [FRONTEND] TTS failed after ${duration}ms`);
      console.error('❌ [FRONTEND] Error:', error.message);
      throw error;
    }
  }
};

// Storage utilities for chat history
export const chatStorage = {
  async saveChatHistory(messages) {
    try {
      await AsyncStorage.setItem('aiDermatologyExpertChat', JSON.stringify(messages));
    } catch (error) {
      console.warn('Failed to save chat history:', error);
    }
  },

  async loadChatHistory() {
    try {
      const savedChat = await AsyncStorage.getItem('aiDermatologyExpertChat');
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
      await AsyncStorage.removeItem('aiDermatologyExpertChat');
    } catch (error) {
      console.warn('Failed to clear chat history:', error);
    }
  }
};

// Storage utilities for Live Chat history
export const liveChatStorage = {
  async saveLiveChatHistory(messages) {
    try {
      await AsyncStorage.setItem('liveChatHistory', JSON.stringify(messages));
      console.log('💾 Live chat history saved:', messages.length, 'messages');
    } catch (error) {
      console.warn('Failed to save live chat history:', error);
    }
  },

  async loadLiveChatHistory() {
    try {
      const savedChat = await AsyncStorage.getItem('liveChatHistory');
      if (savedChat) {
        const parsed = JSON.parse(savedChat);
        console.log('📖 Loaded live chat history:', parsed.length, 'messages');
        return parsed;
      }
      return [];
    } catch (error) {
      console.warn('Failed to load live chat history:', error);
      return [];
    }
  },

  async clearLiveChatHistory() {
    try {
      await AsyncStorage.removeItem('liveChatHistory');
      await AsyncStorage.removeItem('liveChatSessions');
      await AsyncStorage.removeItem('liveChatCurrentSession');
      console.log('🗑️ Live chat history cleared');
    } catch (error) {
      console.warn('Failed to clear live chat history:', error);
    }
  },

  // Session management
  async saveSession(sessionId, sessionData) {
    try {
      const sessions = await this.loadAllSessions();
      const existingIndex = sessions.findIndex(s => s.id === sessionId);
      
      if (existingIndex >= 0) {
        sessions[existingIndex] = sessionData;
      } else {
        sessions.push(sessionData);
      }
      
      await AsyncStorage.setItem('liveChatSessions', JSON.stringify(sessions));
      await AsyncStorage.setItem('liveChatCurrentSession', sessionId);
      console.log('💾 Session saved:', sessionId);
    } catch (error) {
      console.warn('Failed to save session:', error);
    }
  },

  async loadAllSessions() {
    try {
      const saved = await AsyncStorage.getItem('liveChatSessions');
      if (saved) {
        return JSON.parse(saved);
      }
      return [];
    } catch (error) {
      console.warn('Failed to load sessions:', error);
      return [];
    }
  },

  async loadCurrentSessionId() {
    try {
      const sessionId = await AsyncStorage.getItem('liveChatCurrentSession');
      return sessionId;
    } catch (error) {
      console.warn('Failed to load current session ID:', error);
      return null;
    }
  },

  async deleteSession(sessionId) {
    try {
      const sessions = await this.loadAllSessions();
      const filtered = sessions.filter(s => s.id !== sessionId);
      await AsyncStorage.setItem('liveChatSessions', JSON.stringify(filtered));
      console.log('🗑️ Session deleted:', sessionId);
    } catch (error) {
      console.warn('Failed to delete session:', error);
    }
  }
};

export default api;
