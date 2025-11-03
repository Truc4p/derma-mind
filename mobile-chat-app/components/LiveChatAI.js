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
  TextInput
} from 'react-native';
import * as Speech from 'expo-speech';
import { liveChatService } from '../services/api';

const { width, height } = Dimensions.get('window');

const LiveChatAI = ({ navigation }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');
  const [conversationHistory, setConversationHistory] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [showInput, setShowInput] = useState(false);
  
  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const waveAnim1 = useRef(new Animated.Value(0)).current;
  const waveAnim2 = useRef(new Animated.Value(0)).current;
  const waveAnim3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      Speech.stop();
    };
  }, []);

  // Start pulsing animation when recording or AI is speaking
  useEffect(() => {
    if (isRecording || isAISpeaking) {
      startPulseAnimation();
    } else {
      stopPulseAnimation();
    }
  }, [isRecording, isAISpeaking]);

  const requestPermissions = async () => {
    // No permissions needed for simple text input
    console.log('✅ Ready to use');
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
      console.log('💬 Opening text input...');
      setShowInput(true);
      setUserInput('');
      setTranscribedText('Type your question...');
    } catch (error) {
      console.error('❌ Failed to show input:', error);
      Alert.alert('Error', 'Failed to open text input. Please try again.');
    }
  };

  const stopRecording = async () => {
    try {
      console.log('� Processing text input...');
      setShowInput(false);
      
      const finalText = userInput.trim();
      console.log('📝 User typed:', finalText);
      
      if (!finalText) {
        setTranscribedText('No text entered. Tap to try again.');
        Alert.alert('No Text', 'Please type a question first.');
        return;
      }
      
      setIsProcessing(true);
      setTranscribedText('Processing your question...');
      
      // Process with AI
      await sendToAI(finalText);
      
    } catch (error) {
      console.error('❌ Failed to process text:', error);
      setIsProcessing(false);
      Alert.alert('Error', 'Failed to process your question.');
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
      setConversationHistory([
        ...newHistory,
        { role: 'assistant', content: response.response }
      ]);

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
            await Speech.stop();
            navigation.goBack();
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🔴 Live</Text>
        <TouchableOpacity style={styles.menuButton}>
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
      </View>

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

      {/* Text Input Overlay */}
      {showInput && (
        <View style={styles.inputOverlay}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Type your question:</Text>
            <TextInput
              style={styles.textInput}
              value={userInput}
              onChangeText={setUserInput}
              placeholder="Ask about skincare..."
              placeholderTextColor="#999"
              multiline
              autoFocus
            />
            <View style={styles.inputButtons}>
              <TouchableOpacity
                style={[styles.inputButton, styles.cancelButton]}
                onPress={() => {
                  setShowInput(false);
                  setUserInput('');
                  setTranscribedText('Tap to start talking');
                }}
              >
                <Text style={styles.inputButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.inputButton, styles.sendButton]}
                onPress={stopRecording}
              >
                <Text style={styles.inputButtonText}>Send</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
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
  inputOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  inputContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 400
  },
  inputLabel: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 12,
    fontWeight: '600'
  },
  textInput: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#fff',
    minHeight: 100,
    maxHeight: 200,
    textAlignVertical: 'top'
  },
  inputButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 12
  },
  inputButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center'
  },
  cancelButton: {
    backgroundColor: '#374151'
  },
  sendButton: {
    backgroundColor: '#3B82F6'
  },
  inputButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  }
});

export default LiveChatAI;
