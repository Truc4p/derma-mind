import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Alert,
  Platform
} from 'react-native';
import { Audio } from 'expo-av';
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
  const [sessionId, setSessionId] = useState(null);
  const [currentSound, setCurrentSound] = useState(null); // Track current playing audio
  const [isActionInProgress, setIsActionInProgress] = useState(false); // Prevent race conditions
  const [aiResponseText, setAiResponseText] = useState(''); // Full AI response for word-by-word display
  const wordDisplayInterval = useRef(null); // Track word display interval

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
      setTranscribedText('');
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
      console.log('🧹 Component unmounting, cleaning up...');
      if (recording) {
        recording.stopAndUnloadAsync().catch(e => 
          console.log('Warning: Error cleaning up recording on unmount:', e)
        );
      }
      // Stop gTTS audio
      if (currentSound) {
        currentSound.stopAsync().catch(console.error);
        currentSound.unloadAsync().catch(console.error);
      }
      // Clear word display interval
      if (wordDisplayInterval.current) {
        clearInterval(wordDisplayInterval.current);
      }
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
    if (isActionInProgress) {
      console.log('⏸️ Action already in progress, skipping...');
      return;
    }

    try {
      setIsActionInProgress(true);
      console.log('🎤 Starting recording...');
      
      // Stop any ongoing speech
      if (currentSound) {
        console.log('⏹️ Stopping gTTS audio...');
        try {
          await currentSound.stopAsync();
          await currentSound.unloadAsync();
        } catch (e) {
          console.log('Warning: Error stopping audio:', e);
        }
        setCurrentSound(null);
      }
      setIsAISpeaking(false);
      
      // IMPORTANT: Clean up any existing recording first
      if (recording) {
        console.log('⚠️ Cleaning up existing recording...');
        try {
          const status = await recording.getStatusAsync();
          if (status.isRecording) {
            await recording.stopAndUnloadAsync();
          } else {
            await recording._cleanupForUnloadedRecorder();
          }
        } catch (e) {
          console.log('Warning: Error cleaning up recording:', e);
        }
        setRecording(null);
        // Add a small delay to ensure cleanup is complete
        await new Promise(resolve => setTimeout(resolve, 100));
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
      setIsRecording(false);
    } finally {
      setIsActionInProgress(false);
    }
  };

  const stopRecording = async () => {
    if (!recording) {
      console.log('⚠️ No recording to stop');
      setIsRecording(false); // Ensure state is consistent
      return;
    }

    if (isActionInProgress) {
      console.log('⏸️ Action already in progress, skipping stop...');
      return;
    }

    try {
      setIsActionInProgress(true);
      console.log('🛑 Stopping recording...');
      setIsRecording(false);
      setIsProcessing(true);
      setTranscribedText('Processing your voice...');

      const status = await recording.getStatusAsync();
      if (status.isRecording) {
        await recording.stopAndUnloadAsync();
      }
      
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false
      });

      const uri = recording.getURI();
      console.log('📁 Audio file saved at:', uri);
      
      const recordingToProcess = recording;
      setRecording(null);

      // Send audio to backend for processing
      await processAudioWithAI(uri);

    } catch (error) {
      console.error('❌ Failed to stop recording:', error);
      setIsProcessing(false);
      setIsRecording(false);
      setRecording(null);
      Alert.alert('Error', 'Failed to process recording.');
    } finally {
      setIsActionInProgress(false);
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
                setTranscribedText('');
              }
            },
            {
              text: 'Send',
              onPress: async (userMessage) => {
                if (!userMessage || !userMessage.trim()) {
                  setIsProcessing(false);
                  setTranscribedText('');
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
      
      // Stop any currently playing audio first
      if (currentSound) {
        console.log('⏹️ Stopping previous audio...');
        try {
          await currentSound.stopAsync();
          await currentSound.unloadAsync();
        } catch (e) {
          console.log('Warning: Error stopping previous audio:', e);
        }
        setCurrentSound(null);
      }
      
      // Clear any existing word display interval
      if (wordDisplayInterval.current) {
        clearInterval(wordDisplayInterval.current);
        wordDisplayInterval.current = null;
      }
      
      // Store the full AI response
      setAiResponseText(text);
      
      // Split text into words for progressive display
      const words = text.split(' ');
      let currentIndex = 0;
      
      // Use gTTS for text-to-speech
      console.log('🌐 Using gTTS for voice...');
      setTranscribedText(''); // Clear before starting
      
      const ttsResponse = await liveChatService.textToSpeech(text);
      
      // Convert base64 audio to playable URI
      const audioBase64 = ttsResponse.audio;
      const audioUri = `data:audio/mp3;base64,${audioBase64}`;
      
      // Start word-by-word display animation
      setIsAISpeaking(true);
      
      // Display first word immediately
      if (words.length > 0) {
        setTranscribedText(words[0]);
        currentIndex = 1;
      }
      
      // Create and play audio to get duration
      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUri },
        { shouldPlay: false }, // Don't play yet
        (status) => {
          if (status.didJustFinish) {
            console.log('✅ gTTS playback finished');
            
            // Clear word display interval
            if (wordDisplayInterval.current) {
              clearInterval(wordDisplayInterval.current);
              wordDisplayInterval.current = null;
            }
            
            // Show complete text briefly before clearing
            setTranscribedText(text);
            
            setTimeout(() => {
              setIsAISpeaking(false);
              setTranscribedText('Tap to speak');
              setAiResponseText('');
            }, 1500);
            
            setCurrentSound(null);
            sound.unloadAsync(); // Clean up
          }
        }
      );
      
      setCurrentSound(sound); // Save sound reference for stopping
      
      // Get audio duration and calculate word timing
      const status = await sound.getStatusAsync();
      const audioDurationMs = status.durationMillis || 0;
      
      console.log(`📊 Audio duration: ${audioDurationMs}ms for ${words.length} words`);
      
      // Calculate time per word based on actual audio duration
      // Leave some buffer at the end (90% of duration for words)
      const msPerWord = audioDurationMs > 0 
        ? (audioDurationMs * 0.9) / (words.length - 1) // -1 because first word already displayed
        : 400; // Fallback to ~400ms per word
      
      console.log(`⏱️ Displaying words every ${msPerWord.toFixed(0)}ms`);
      
      // Now start playing the audio
      await sound.playAsync();
      
      // Start progressive word display with calculated timing
      wordDisplayInterval.current = setInterval(() => {
        if (currentIndex < words.length) {
          const displayedText = words.slice(0, currentIndex + 1).join(' ');
          setTranscribedText(displayedText);
          currentIndex++;
        } else {
          // All words displayed, show complete text
          setTranscribedText(text);
          if (wordDisplayInterval.current) {
            clearInterval(wordDisplayInterval.current);
            wordDisplayInterval.current = null;
          }
        }
      }, msPerWord);
      
      console.log('✅ gTTS audio playing with real-time transcription');
      
    } catch (error) {
      console.error('❌ Error in speakAIResponse:', error);
      setIsAISpeaking(false);
      setTranscribedText('Speech error: ' + error.message);
      setCurrentSound(null);
      setAiResponseText('');
      
      // Clear interval on error
      if (wordDisplayInterval.current) {
        clearInterval(wordDisplayInterval.current);
        wordDisplayInterval.current = null;
      }
    }
  };
  
  const handleMicPress = async () => {
    console.log('👆 Mic button pressed');
    console.log('📊 Current state - isRecording:', isRecording, 'isProcessing:', isProcessing, 'isAISpeaking:', isAISpeaking, 'isActionInProgress:', isActionInProgress);
    
    // Prevent rapid tapping
    if (isActionInProgress) {
      console.log('⏸️ Action in progress, ignoring press');
      return;
    }
    
    if (isProcessing) {
      console.log('⏸️ Currently processing, ignoring press');
      return;
    }
    
    if (isAISpeaking) {
      // Stop AI speaking if tapped during speech
      console.log('⏹️ Stopping AI speech...');
      
      // Clear word display interval
      if (wordDisplayInterval.current) {
        clearInterval(wordDisplayInterval.current);
        wordDisplayInterval.current = null;
      }
      
      // Stop gTTS audio
      if (currentSound) {
        try {
          await currentSound.stopAsync();
          await currentSound.unloadAsync();
          console.log('✅ gTTS audio stopped');
        } catch (e) {
          console.log('Warning: Error stopping audio:', e);
        }
        setCurrentSound(null);
      }
      
      setIsAISpeaking(false);
      setTranscribedText('');
      setAiResponseText('');
      return;
    }

    if (isRecording) {
      console.log('⏹️ Stopping recording...');
      await stopRecording();
    } else {
      console.log('▶️ Starting recording...');
      await startRecording();
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
            
            // Stop recording if active
            if (recording) {
              try {
                await recording.stopAndUnloadAsync();
              } catch (e) {
                console.log('Warning: Error stopping recording on exit:', e);
              }
            }
            
            // Clear word display interval
            if (wordDisplayInterval.current) {
              clearInterval(wordDisplayInterval.current);
              wordDisplayInterval.current = null;
            }
            
            // Stop gTTS audio if playing
            if (currentSound) {
              try {
                await currentSound.stopAsync();
                await currentSound.unloadAsync();
              } catch (e) {
                console.log('Warning: Error stopping audio on exit:', e);
              }
            }
            
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

      {/* Transcription Text - Only show when there's text */}
      {transcribedText ? (
        <View style={styles.textContainer}>
          <Text style={styles.transcriptionText}>{transcribedText}</Text>
        </View>
      ) : (
        <View style={styles.textContainer} />
      )}

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
          onPress={async () => {
            if (isAISpeaking) {
              console.log('⏸️ Pause button pressed - stopping audio...');
              
              // Clear word display interval
              if (wordDisplayInterval.current) {
                clearInterval(wordDisplayInterval.current);
                wordDisplayInterval.current = null;
              }
              
              // Stop gTTS audio
              if (currentSound) {
                try {
                  await currentSound.stopAsync();
                  await currentSound.unloadAsync();
                  console.log('✅ gTTS audio stopped');
                } catch (e) {
                  console.log('Warning: Error stopping audio:', e);
                }
                setCurrentSound(null);
              }
              
              setIsAISpeaking(false);
              setTranscribedText('Audio stopped');
              setAiResponseText('');
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
                : ''}
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
    borderRadius: 20,
    maxWidth: width * 0.8,
    elevation: 3,
    overflow: 'hidden',
    shadowColor: colors.primary500,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8
  },
  historyCount: {
    fontSize: 12,
    color: colors.primary700,
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic'
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
  }
});

export default LiveChatAI;
