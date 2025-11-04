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

const { width, height } = Dimensions.get('window');

// Modern Pink Color Palette
const colors = {
  primary50: '#FDFBF7',
  primary100: '#FDF6F0',
  primary200: '#F8EAE1',
  primary300: '#F0D7CC',
  primary400: '#E4BCC0',
  primary500: '#C97F98',
  primary600: '#A44A6B',
  primary700: '#8C3154',
  primary800: '#7F2548',
  primary900: '#671C39',
  primary950: '#3E0E21'
};

const LiveChatAI = ({ navigation, route }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');
  const [recording, setRecording] = useState(null);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [showConversationModal, setShowConversationModal] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  
  // Add logging whenever conversationHistory changes
  useEffect(() => {
    console.log('📝 [LiveChatAI] conversationHistory updated:', conversationHistory.length, 'messages');
    if (conversationHistory.length > 0) {
      // console.log('📋 [LiveChatAI] First message:', conversationHistory[0]);
      // console.log('📋 [LiveChatAI] Last message:', conversationHistory[conversationHistory.length - 1]);
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
    console.log('🔍 [LiveChatAI] Route object available:', !!route);
    
    // Request audio permissions on mount
    requestPermissions();
    
    // Load session from route params if available
    if (route?.params?.loadSession) {
      const session = route.params.loadSession;
      console.log('📥 [LiveChatAI] Loading session from route params');
      console.log('📋 [LiveChatAI] Session ID:', session.id);
      console.log('📋 [LiveChatAI] Session messages count:', session.messages?.length);
      setConversationHistory(session.messages);
      setSessionId(session.id);
      setTranscribedText('Tap to start talking');
      console.log('✅ [LiveChatAI] Session loaded successfully');
      // Clear the route param
      navigation.setParams({ loadSession: undefined });
    } else {
      // Generate new session ID for new session
      const newSessionId = `live-${Date.now()}`;
      setSessionId(newSessionId);
      console.log('🆕 [LiveChatAI] New session created:', newSessionId);
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
      setSessionId(session.id);
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

      // Speak the AI response
      await speakAIResponse(response.response);
      
    } catch (error) {
      console.error('❌ Error getting AI response:', error);
      setIsProcessing(false);
      setTranscribedText('Sorry, there was an error. Tap to try again.');
      Alert.alert('Error', 'Failed to get AI response');
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

  const generateSessionTitle = (messages) => {
    if (messages.length === 0) return 'New Live Chat';
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

  const saveSessionToHistory = async () => {
    if (conversationHistory.length === 0) {
      console.log('⚠️ [LiveChatAI] No messages to save');
      return;
    }

    try {
      const sessionData = {
        id: sessionId,
        type: 'live',
        title: generateSessionTitle(conversationHistory),
        preview: generateSessionPreview(conversationHistory),
        timestamp: new Date().toISOString(),
        messages: conversationHistory,
        messageCount: conversationHistory.length
      };

      await liveChatStorage.saveSession(sessionId, sessionData);
      console.log('💾 [LiveChatAI] Session saved to history:', sessionId, 'with', conversationHistory.length, 'messages');
    } catch (error) {
      console.error('❌ [LiveChatAI] Failed to save session:', error);
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
            
            // Save conversation to history before ending
            await saveSessionToHistory();
            
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
      {/* Beautiful Gradient Background */}
      <View style={styles.gradientBackground}>
        <View style={[styles.gradientCircle, styles.gradient1]} />
        <View style={[styles.gradientCircle, styles.gradient2]} />
        <View style={[styles.gradientCircle, styles.gradient3]} />
      </View>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <View style={styles.liveIndicator} />
          <Text style={styles.headerTitle}>Live Chat</Text>
        </View>
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
            {conversationHistory.length} messages in history
          </Text>
        )}
        {conversationHistory.length > 0 && (
          <TouchableOpacity 
            style={styles.viewHistoryButton}
            onPress={() => {
              // console.log('📜 [LiveChatAI] View conversation history clicked');
              // console.log('📋 [LiveChatAI] Current history:', JSON.stringify(conversationHistory, null, 2));
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
                    {message.role === 'user' ? 'You' : 'AI Dermatologist'}
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
    backgroundColor: colors.primary50,
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative'
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden'
  },
  gradientCircle: {
    position: 'absolute',
    borderRadius: 1000
  },
  gradient1: {
    width: width * 1.2,
    height: width * 1.2,
    backgroundColor: 'rgba(243, 176, 250, 0.15)',
    left: width * 0.2 - (width * 0.6),
    bottom: -width * 0.4,
    opacity: 0.6
  },
  gradient2: {
    width: width * 1.1,
    height: width * 1.1,
    backgroundColor: 'rgba(230, 120, 249, 0.12)',
    right: width * 0.2 - (width * 0.55),
    top: -width * 0.3,
    opacity: 0.5
  },
  gradient3: {
    width: width * 0.8,
    height: width * 0.8,
    backgroundColor: 'rgba(252, 248, 252, 0.2)',
    left: width * 0.4 - (width * 0.4),
    top: height * 0.4 - (width * 0.4),
    opacity: 0.4
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    backgroundColor: 'rgba(253, 246, 240, 0.98)',
    borderBottomWidth: 1,
    borderBottomColor: colors.primary200,
    shadowColor: colors.primary500,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  liveIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary600,
    shadowColor: colors.primary600,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 4
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary800
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
    borderRadius: width * 0.4
  },
  wave1: {
    backgroundColor: colors.primary300,
    opacity: 0.4
  },
  wave2: {
    backgroundColor: colors.primary400,
    opacity: 0.3
  },
  wave3: {
    backgroundColor: colors.primary500,
    opacity: 0.2
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
    color: colors.primary900,
    textAlign: 'center',
    lineHeight: 24,
    backgroundColor: 'rgba(253, 246, 240, 0.95)',
    padding: 20,
    borderRadius: 16,
    maxWidth: width * 0.8,
    borderWidth: 1,
    borderColor: colors.primary200,
    shadowColor: colors.primary500,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3
  },
  historyCount: {
    fontSize: 12,
    color: colors.primary700,
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic'
  },
  viewHistoryButton: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: colors.primary200,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary300
  },
  viewHistoryText: {
    fontSize: 12,
    color: colors.primary700,
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
    backgroundColor: colors.primary200,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary300,
    shadowColor: colors.primary500,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3
  },
  endButton: {
    backgroundColor: colors.primary200,
    borderColor: colors.primary700
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
    backgroundColor: colors.primary100,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary600,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 2,
    borderColor: colors.primary300
  },
  micButtonRecording: {
    backgroundColor: colors.primary600,
    borderColor: colors.primary700
  },
  micButtonSpeaking: {
    backgroundColor: colors.primary500,
    borderColor: colors.primary600
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
    color: colors.primary700,
    textAlign: 'center',
    fontWeight: '500'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(62, 14, 33, 0.85)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContent: {
    width: width * 0.9,
    maxHeight: height * 0.8,
    backgroundColor: colors.primary50,
    borderRadius: 20,
    padding: 20,
    shadowColor: colors.primary900,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: colors.primary200
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.primary200
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.primary900
  },
  closeModalButton: {
    padding: 4,
    backgroundColor: colors.primary200,
    borderRadius: 8
  },
  closeModalText: {
    fontSize: 20,
    color: colors.primary700,
    fontWeight: '600'
  },
  conversationScroll: {
    maxHeight: height * 0.6
  },
  conversationMessage: {
    marginBottom: 16,
    padding: 12,
    borderRadius: 12,
    shadowColor: colors.primary500,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2
  },
  conversationMessageUser: {
    backgroundColor: colors.primary200,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary600
  },
  conversationMessageAssistant: {
    backgroundColor: colors.primary100,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary500
  },
  conversationRole: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary800,
    marginBottom: 6,
    opacity: 0.9
  },
  conversationContent: {
    fontSize: 14,
    color: colors.primary900,
    lineHeight: 20
  },
  closeButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: colors.primary600,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: colors.primary700,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary50
  }
});

export default LiveChatAI;
