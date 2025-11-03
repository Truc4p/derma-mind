import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Alert,
  Platform,
  ScrollView,
  Modal
} from 'react-native';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { liveChatService, liveChatStorage } from '../services/api';
import ChatHistory from './ChatHistory';

const { width, height } = Dimensions.get('window');

const LiveChatAI = ({ navigation, route }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');
  const [recording, setRecording] = useState(null);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState('current');
  const [showConversationModal, setShowConversationModal] = useState(false);
  
  // Add logging whenever conversationHistory changes
  useEffect(() => {
    console.log('📝 [LiveChatAI] conversationHistory updated:', conversationHistory.length, 'messages');
    if (conversationHistory.length > 0) {
      console.log('📋 [LiveChatAI] First message:', conversationHistory[0]);
      console.log('📋 [LiveChatAI] Last message:', conversationHistory[conversationHistory.length - 1]);
    }
  }, [conversationHistory]);
  
  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const waveAnim1 = useRef(new Animated.Value(0)).current;
  const waveAnim2 = useRef(new Animated.Value(0)).current;
  const waveAnim3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    console.log('🔄 [LiveChatAI] Component mounted');
    console.log('📋 [LiveChatAI] Route params:', route?.params);
    
    // Request audio permissions on mount
    requestPermissions();
    
    // Load conversation history or session from route params
    if (route?.params?.loadSession) {
      const session = route.params.loadSession;
      console.log('📥 [LiveChatAI] Loading session from route params');
      console.log('📋 [LiveChatAI] Session ID:', session.id);
      console.log('📋 [LiveChatAI] Session messages count:', session.messages?.length);
      setConversationHistory(session.messages);
      setCurrentSessionId(session.id);
      console.log('✅ [LiveChatAI] Session loaded successfully');
      // Clear the route param
      navigation.setParams({ loadSession: undefined });
    } else {
      console.log('📖 [LiveChatAI] No session in params, loading default history');
      loadChatHistory();
    }
    
    // Cleanup on unmount
    return () => {
      if (recording) {
        recording.stopAndUnloadAsync();
      }
      Speech.stop();
    };
  }, []);

  // Watch for route params changes
  useEffect(() => {
    console.log('🔄 [LiveChatAI] Route params changed');
    console.log('📋 [LiveChatAI] New route params:', route?.params);
    
    if (route?.params?.loadSession) {
      const session = route.params.loadSession;
      console.log('📥 [LiveChatAI] Loading NEW session from updated params');
      console.log('📋 [LiveChatAI] Session ID:', session.id);
      console.log('📋 [LiveChatAI] Session messages count:', session.messages?.length);
      setConversationHistory(session.messages);
      setCurrentSessionId(session.id);
      console.log('✅ [LiveChatAI] Session updated successfully');
      navigation.setParams({ loadSession: undefined });
    }
  }, [route?.params?.loadSession]);

  // Start pulsing animation when recording or AI is speaking
  useEffect(() => {
    if (isRecording || isAISpeaking) {
      startPulseAnimation();
    } else {
      stopPulseAnimation();
    }
  }, [isRecording, isAISpeaking]);

  const loadChatHistory = async () => {
    try {
      const history = await liveChatStorage.loadLiveChatHistory();
      setConversationHistory(history);
      console.log('📖 Loaded live chat history:', history.length, 'messages');
    } catch (error) {
      console.error('❌ Failed to load chat history:', error);
    }
  };

  const saveChatHistory = async (messages) => {
    try {
      // Save messages to history
      await liveChatStorage.saveLiveChatHistory(messages);
      
      // Also save as a session
      const sessionData = {
        id: currentSessionId,
        title: generateSessionTitle(messages),
        preview: generateSessionPreview(messages),
        timestamp: new Date().toISOString(),
        messages: messages,
        messageCount: messages.length
      };
      
      await liveChatStorage.saveSession(currentSessionId, sessionData);
      console.log('💾 Saved live chat history:', messages.length, 'messages');
    } catch (error) {
      console.error('❌ Failed to save chat history:', error);
    }
  };

  const generateSessionTitle = (messages) => {
    if (messages.length === 0) return 'New Chat';
    const firstUserMessage = messages.find(m => m.role === 'user');
    if (firstUserMessage) {
      const title = firstUserMessage.content.substring(0, 50);
      return title.length < firstUserMessage.content.length ? title + '...' : title;
    }
    return 'Live Chat Session';
  };

  const generateSessionPreview = (messages) => {
    if (messages.length === 0) return 'No messages yet';
    const lastMessage = messages[messages.length - 1];
    const preview = lastMessage.content.substring(0, 80);
    return preview + (lastMessage.content.length > 80 ? '...' : '');
  };

  const requestPermissions = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please grant microphone permission to use live chat.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error requesting permissions:', error);
    }
  };

  const startPulseAnimation = () => {
    // Main pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true
        })
      ])
    ).start();

    // Wave animations with stagger
    const createWaveAnimation = (animValue, delay) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(animValue, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true
          }),
          Animated.timing(animValue, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true
          })
        ])
      );
    };

    Animated.parallel([
      createWaveAnimation(waveAnim1, 0),
      createWaveAnimation(waveAnim2, 500),
      createWaveAnimation(waveAnim3, 1000)
    ]).start();
  };

  const stopPulseAnimation = () => {
    pulseAnim.setValue(1);
    waveAnim1.setValue(0);
    waveAnim2.setValue(0);
    waveAnim3.setValue(0);
  };

  const startRecording = async () => {
    try {
      console.log('🎤 Starting recording...');
      
      // Stop any ongoing speech
      await Speech.stop();
      setIsAISpeaking(false);
      
      // IMPORTANT: Clean up any existing recording first
      if (recording) {
        console.log('⚠️ Cleaning up existing recording...');
        try {
          await recording.stopAndUnloadAsync();
        } catch (e) {
          console.log('Warning: Error cleaning up recording:', e);
        }
        setRecording(null);
      }
      
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      console.log('✅ Recording started successfully');
      setRecording(newRecording);
      setIsRecording(true);
      setTranscribedText('Listening... Speak now');
    } catch (error) {
      console.error('❌ Failed to start recording:', error);
      Alert.alert('Error', 'Failed to start recording. Please try again.');
      setRecording(null);
    }
  };

  const stopRecording = async () => {
    if (!recording) {
      console.log('⚠️ No recording to stop');
      return;
    }

    try {
      console.log('🛑 Stopping recording...');
      setIsRecording(false);
      setIsProcessing(true);
      setTranscribedText('Processing your voice...');
      
      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false
      });

      const uri = recording.getURI();
      console.log('📁 Audio file saved at:', uri);
      setRecording(null);

      // Send audio to backend for processing
      await processAudioWithAI(uri);
      
    } catch (error) {
      console.error('❌ Failed to stop recording:', error);
      setIsProcessing(false);
      setRecording(null);
      Alert.alert('Error', 'Failed to process recording.');
    }
  };

  const processAudioWithAI = async (audioUri) => {
    try {
      console.log('🔄 Processing audio from:', audioUri);
      
      // Step 1: Try automatic transcription with Gemini
      setTranscribedText('Transcribing your voice...');
      
      try {
        const transcriptionResult = await liveChatService.transcribeAudio(audioUri);
        const userMessage = transcriptionResult.transcription;
        
        if (!userMessage || !userMessage.trim()) {
          throw new Error('Empty transcription');
        }
        
        console.log('✅ Auto-transcription successful:', userMessage);
        await sendToAI(userMessage.trim());
        
      } catch (transcriptionError) {
        console.log('⚠️ Auto-transcription failed:', transcriptionError.message);
        
        // Fall back to manual input
        console.log('🔄 Falling back to manual input...');
        setTranscribedText('Transcription failed. Please type your question:');
        
        Alert.prompt(
          'Manual Input',
          'Automatic transcription is not available yet. Please type what you said:',
          [
            {
              text: 'Cancel',
              style: 'cancel',
              onPress: () => {
                setIsProcessing(false);
                setTranscribedText('Tap to start talking');
              }
            },
            {
              text: 'Send',
              onPress: async (userMessage) => {
                if (!userMessage || !userMessage.trim()) {
                  setIsProcessing(false);
                  setTranscribedText('Tap to start talking');
                  return;
                }
                await sendToAI(userMessage.trim());
              }
            }
          ],
          'plain-text'
        );
      }
      
    } catch (error) {
      console.error('❌ Error processing audio:', error);
      setIsProcessing(false);
      setTranscribedText('Error occurred. Tap to try again.');
      Alert.alert('Error', 'Failed to process audio. Please try again.');
    }
  };

  const sendToAI = async (userMessage) => {
    try {
      console.log('📝 User message:', userMessage);
      setTranscribedText(`You: ${userMessage}`);
      
      // Add to conversation history
      const newHistory = [
        ...conversationHistory,
        { role: 'user', content: userMessage }
      ];
      setConversationHistory(newHistory);
      await saveChatHistory(newHistory);

      // Get AI response from backend
      console.log('🤖 Sending to AI...');
      const response = await liveChatService.chat(userMessage, newHistory);
      console.log('✅ AI response received:', response.response.substring(0, 100) + '...');
      
      setIsProcessing(false);
      
      // Add AI response to history
      const fullHistory = [
        ...newHistory,
        { role: 'assistant', content: response.response }
      ];
      setConversationHistory(fullHistory);
      await saveChatHistory(fullHistory);

      // Speak the AI response
      await speakAIResponse(response.response);
      
    } catch (error) {
      console.error('❌ Error getting AI response:', error);
      setIsProcessing(false);
      setTranscribedText('Sorry, there was an error. Tap to try again.');
      Alert.alert('Error', 'Failed to get AI response');
    }
  };

  const handleClearHistory = () => {
    Alert.alert(
      'Clear Live Chat History',
      'Are you sure you want to clear all conversation history?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            setConversationHistory([]);
            await liveChatStorage.clearLiveChatHistory();
            setTranscribedText('');
            Alert.alert('Success', 'Live chat history cleared');
          }
        }
      ]
    );
  };

  const handleViewHistory = () => {
    setHistoryModalVisible(true);
  };

  const handleLoadSession = (session) => {
    console.log('🔍 [LiveChatAI] handleLoadSession called');
    console.log('📋 [LiveChatAI] Session:', JSON.stringify(session, null, 2));
    
    if (session && session.messages) {
      console.log('✅ [LiveChatAI] Session has messages, loading...');
      console.log('📝 [LiveChatAI] Messages count:', session.messages.length);
      setConversationHistory(session.messages);
      setCurrentSessionId(session.id);
      setTranscribedText('Chat history loaded');
      console.log('📖 [LiveChatAI] Loaded session:', session.title);
    } else {
      console.error('❌ [LiveChatAI] Session or messages is undefined!');
    }
  };

  const speakAIResponse = async (text) => {
    try {
      console.log('🔊 Speaking AI response...');
      // Strip HTML/markdown for clean speech
      const cleanText = text
        .replace(/<[^>]*>/g, ' ')
        .replace(/\*\*([^*]+)\*\*/g, '$1')
        .replace(/^#{1,6}\s+/gm, '')
        .replace(/^[\*\-•]\s+/gm, '')
        .replace(/^\d+\.\s+/gm, '')
        .replace(/\s+/g, ' ')
        .trim();

      const MAX_SPEECH_LENGTH = 3900;
      const textToSpeak = cleanText.length > MAX_SPEECH_LENGTH
        ? cleanText.substring(0, MAX_SPEECH_LENGTH) + '...'
        : cleanText;

      console.log('📢 Text to speak length:', textToSpeak.length);
      setIsAISpeaking(true);
      setTranscribedText(text);

      Speech.speak(textToSpeak, {
        language: 'en-US',
        pitch: 1.0,
        rate: 0.9,
        onDone: () => {
          console.log('✅ Speech completed');
          setIsAISpeaking(false);
          setTranscribedText('Tap to start talking');
        },
        onStopped: () => {
          console.log('⏸️ Speech stopped');
          setIsAISpeaking(false);
          setTranscribedText('Tap to start talking');
        },
        onError: (error) => {
          console.error('❌ Speech error:', error);
          setIsAISpeaking(false);
          setTranscribedText('Tap to start talking');
        }
      });
    } catch (error) {
      console.error('❌ Error speaking:', error);
      setIsAISpeaking(false);
      setTranscribedText('Tap to start talking');
    }
  };

  const handleMicPress = () => {
    console.log('👆 Mic button pressed');
    console.log('📊 Current state - isRecording:', isRecording, 'isProcessing:', isProcessing, 'isAISpeaking:', isAISpeaking);
    
    if (isProcessing || isAISpeaking) {
      // Stop AI speaking if tapped during speech
      if (isAISpeaking) {
        console.log('⏹️ Stopping AI speech...');
        Speech.stop();
        setIsAISpeaking(false);
        setTranscribedText('Tap to start talking');
      }
      return;
    }

    if (isRecording) {
      console.log('⏹️ Stopping recording...');
      stopRecording();
    } else {
      console.log('▶️ Starting recording...');
      startRecording();
    }
  };

  const handleEndSession = () => {
    Alert.alert(
      'End Session',
      'Are you sure you want to end this live chat session?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End',
          style: 'destructive',
          onPress: async () => {
            console.log('🔚 Ending session...');
            if (recording) {
              try {
                await recording.stopAndUnloadAsync();
              } catch (e) {
                console.log('Warning: Error stopping recording on exit:', e);
              }
            }
            await Speech.stop();
            navigation.goBack();
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Chat History Modal */}
      <ChatHistory
        visible={historyModalVisible}
        onClose={() => setHistoryModalVisible(false)}
        onLoadSession={handleLoadSession}
        currentChatType="live"
        navigation={navigation}
      />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🔴 Live</Text>
        <TouchableOpacity 
          style={styles.menuButton}
          onPress={handleViewHistory}
        >
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>
      </View>

      {/* Animated Wave Background */}
      <View style={styles.waveContainer}>
        <Animated.View
          style={[
            styles.wave,
            styles.wave1,
            {
              opacity: waveAnim1,
              transform: [
                {
                  scale: waveAnim1.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1.5]
                  })
                }
              ]
            }
          ]}
        />
        <Animated.View
          style={[
            styles.wave,
            styles.wave2,
            {
              opacity: waveAnim2.interpolate({
                inputRange: [0, 1],
                outputRange: [0.3, 0.6]
              }),
              transform: [
                {
                  scale: waveAnim2.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.9, 1.8]
                  })
                }
              ]
            }
          ]}
        />
        <Animated.View
          style={[
            styles.wave,
            styles.wave3,
            {
              opacity: waveAnim3.interpolate({
                inputRange: [0, 1],
                outputRange: [0.2, 0.4]
              }),
              transform: [
                {
                  scale: waveAnim3.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 2]
                  })
                }
              ]
            }
          ]}
        />
      </View>

      {/* Transcription Text */}
      <View style={styles.textContainer}>
        <Text style={styles.transcriptionText}>{transcribedText}</Text>
        {conversationHistory.length > 0 && (
          <Text style={styles.historyCount}>
            💬 {conversationHistory.length} messages in history
          </Text>
        )}
        {conversationHistory.length > 0 && (
          <TouchableOpacity 
            style={styles.viewHistoryButton}
            onPress={() => {
              console.log('📜 [LiveChatAI] View conversation history clicked');
              console.log('📋 [LiveChatAI] Current history:', JSON.stringify(conversationHistory, null, 2));
              setShowConversationModal(true);
            }}
          >
            <Text style={styles.viewHistoryText}>Tap to view conversation</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Conversation History Modal */}
      <Modal
        visible={showConversationModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowConversationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Conversation History</Text>
              <TouchableOpacity 
                onPress={() => setShowConversationModal(false)}
                style={styles.closeModalButton}
              >
                <Text style={styles.closeModalText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.conversationScroll}>
              {conversationHistory.map((message, index) => (
                <View
                  key={index}
                  style={[
                    styles.conversationMessage,
                    message.role === 'user' 
                      ? styles.conversationMessageUser 
                      : styles.conversationMessageAssistant
                  ]}
                >
                  <Text style={styles.conversationRole}>
                    {message.role === 'user' ? '👤 You' : '🤖 AI Dermatologist'}
                  </Text>
                  <Text style={styles.conversationContent}>
                    {message.content}
                  </Text>
                </View>
              ))}
            </ScrollView>
            
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowConversationModal(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Control Buttons */}
      <View style={styles.controlsContainer}>
        {/* Video Button (placeholder) */}
        <TouchableOpacity style={styles.controlButton} disabled>
          <Text style={styles.controlIcon}>📹</Text>
        </TouchableOpacity>

        {/* Upload Button (placeholder) */}
        <TouchableOpacity style={styles.controlButton} disabled>
          <Text style={styles.controlIcon}>⬆️</Text>
        </TouchableOpacity>

        {/* Pause/Resume Button */}
        <TouchableOpacity 
          style={styles.controlButton}
          onPress={() => {
            if (isAISpeaking) {
              Speech.stop();
              setIsAISpeaking(false);
            }
          }}
          disabled={!isAISpeaking}
        >
          <Text style={styles.controlIcon}>⏸️</Text>
        </TouchableOpacity>

        {/* End Session Button */}
        <TouchableOpacity 
          style={[styles.controlButton, styles.endButton]}
          onPress={handleEndSession}
        >
          <Text style={styles.controlIcon}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Main Recording Button */}
      <TouchableOpacity
        style={styles.micButtonContainer}
        onPress={handleMicPress}
        activeOpacity={0.8}
      >
        <Animated.View
          style={[
            styles.micButton,
            {
              transform: [{ scale: pulseAnim }]
            },
            isRecording && styles.micButtonRecording,
            isAISpeaking && styles.micButtonSpeaking
          ]}
        >
          <Text style={styles.micIcon}>
            {isProcessing ? '⏳' : isRecording ? '🎤' : isAISpeaking ? '🔊' : '🎤'}
          </Text>
        </Animated.View>
      </TouchableOpacity>

      {/* Status Text */}
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>
          {isRecording
            ? 'Release to send'
            : isProcessing
            ? 'Processing...'
            : isAISpeaking
            ? 'AI is speaking'
            : 'Tap to start talking'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff'
  },
  menuButton: {
    padding: 8
  },
  menuIcon: {
    fontSize: 24,
    color: '#fff'
  },
  waveContainer: {
    position: 'absolute',
    width: width,
    height: height * 0.6,
    top: height * 0.2,
    alignItems: 'center',
    justifyContent: 'center'
  },
  wave: {
    position: 'absolute',
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    backgroundColor: '#1E40AF'
  },
  wave1: {
    backgroundColor: '#3B82F6'
  },
  wave2: {
    backgroundColor: '#60A5FA'
  },
  wave3: {
    backgroundColor: '#93C5FD'
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    marginTop: 100
  },
  transcriptionText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 24,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20,
    borderRadius: 16,
    maxWidth: width * 0.8
  },
  historyCount: {
    fontSize: 12,
    color: '#A0A0A0',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic'
  },
  viewHistoryButton: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(59, 130, 246, 0.3)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.5)'
  },
  viewHistoryText: {
    fontSize: 12,
    color: '#3B82F6',
    textAlign: 'center',
    fontWeight: '500'
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: width * 0.8,
    marginBottom: 40
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  endButton: {
    backgroundColor: '#EF4444'
  },
  controlIcon: {
    fontSize: 24
  },
  micButtonContainer: {
    marginBottom: 20
  },
  micButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8
  },
  micButtonRecording: {
    backgroundColor: '#EF4444'
  },
  micButtonSpeaking: {
    backgroundColor: '#3B82F6'
  },
  micIcon: {
    fontSize: 36
  },
  statusContainer: {
    paddingBottom: 40,
    paddingHorizontal: 20
  },
  statusText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContent: {
    width: width * 0.9,
    maxHeight: height * 0.8,
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)'
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff'
  },
  closeModalButton: {
    padding: 4
  },
  closeModalText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: '600'
  },
  conversationScroll: {
    maxHeight: height * 0.6
  },
  conversationMessage: {
    marginBottom: 16,
    padding: 12,
    borderRadius: 12
  },
  conversationMessageUser: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderLeftWidth: 3,
    borderLeftColor: '#3B82F6'
  },
  conversationMessageAssistant: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    borderLeftWidth: 3,
    borderLeftColor: '#22C55E'
  },
  conversationRole: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 6,
    opacity: 0.8
  },
  conversationContent: {
    fontSize: 14,
    color: '#fff',
    lineHeight: 20
  },
  closeButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    alignItems: 'center'
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff'
  }
});

export default LiveChatAI;
