import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Keyboard,
  useWindowDimensions
} from 'react-native';
import RenderHtml from 'react-native-render-html';
import * as Speech from 'expo-speech';
import { aiDermatologistService, chatStorage, liveChatStorage } from '../services/api';
import { styles, colors } from './AIDermatologist.styles';
import ChatHistory from './ChatHistory';

// API base URL - update this based on your setup
// For iOS Simulator: http://localhost:3004
// For Android Emulator: http://10.0.2.2:3004
// For Physical Device: http://YOUR_IP:3004
const API_BASE_URL = 'http://localhost:3004';

const AIDermatologist = ({ navigation }) => {
  const { width } = useWindowDimensions();
  const [userInput, setUserInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [speakingMessageIndex, setSpeakingMessageIndex] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const scrollViewRef = useRef(null);

  // Log component mount and navigation availability
  useEffect(() => {
    console.log('🔄 [AIDermatologist] Component mounted');
    console.log('🧭 [AIDermatologist] Navigation available on mount:', !!navigation);
    console.log('🧭 [AIDermatologist] Navigation object:', navigation);
  }, []);

  // Add logging whenever messages change
  useEffect(() => {
    console.log('📝 [AIDermatologist] messages updated:', messages.length, 'messages');
    if (messages.length > 0) {
      // console.log('📋 [AIDermatologist] First message:', messages[0]);
      // console.log('📋 [AIDermatologist] Last message:', messages[messages.length - 1]);
    }
  }, [messages]);

  const sampleQuestions = [
    "What's a good routine for oily skin?",
    "How do I reduce wrinkles naturally?",
    "What ingredients should I avoid for sensitive skin?",
    "Can you recommend products for acne-prone skin?",
    "How often should I exfoliate?"
  ];

  // Memoized tag styles for RenderHtml to prevent unnecessary re-renders
  const userTagsStyles = useMemo(() => ({
    p: {
      fontSize: 15,
      lineHeight: 24,
      color: '#FFFFFF',
      margin: 0,
      marginBottom: 8
    },
    strong: {
      fontWeight: '600',
      color: '#FFFFFF'
    },
    h1: {
      fontSize: 20,
      fontWeight: '600',
      color: '#FFFFFF',
      marginTop: 12,
      marginBottom: 8
    },
    h2: {
      fontSize: 18,
      fontWeight: '600',
      color: '#FFFFFF',
      marginTop: 12,
      marginBottom: 8
    },
    h3: {
      fontSize: 16,
      fontWeight: '600',
      color: '#FFFFFF',
      marginTop: 10,
      marginBottom: 6
    },
    h4: {
      fontSize: 15,
      fontWeight: '600',
      color: '#FFFFFF',
      marginTop: 8,
      marginBottom: 4
    },
    ul: {
      marginTop: 8,
      marginBottom: 8,
      paddingLeft: 20
    },
    ol: {
      marginTop: 8,
      marginBottom: 8,
      paddingLeft: 20
    },
    li: {
      fontSize: 15,
      lineHeight: 24,
      color: '#FFFFFF',
      marginBottom: 4
    },
    'ul ul': {
      marginTop: 4,
      marginBottom: 4,
      paddingLeft: 20
    },
    'ul ul li': {
      fontSize: 15,
      lineHeight: 24,
      color: '#FFFFFF',
      marginBottom: 4
    },
    'ul ul ul': {
      marginTop: 4,
      marginBottom: 4,
      paddingLeft: 20
    },
    'ul ul ul li': {
      fontSize: 15,
      lineHeight: 24,
      color: '#FFFFFF',
      marginBottom: 4
    }
  }), []);

  const assistantTagsStyles = useMemo(() => ({
    body: {
      fontSize: 15,
      lineHeight: 24,
      color: colors.gray800
    },
    p: {
      fontSize: 15,
      lineHeight: 24,
      color: colors.gray800,
      margin: 0,
      marginBottom: 8
    },
    strong: {
      fontWeight: '600',
      color: colors.primary800
    },
    h1: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.primary800,
      marginTop: 12,
      marginBottom: 8
    },
    h2: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.primary800,
      marginTop: 12,
      marginBottom: 8
    },
    h3: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.primary800,
      marginTop: 10,
      marginBottom: 6
    },
    h4: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.primary800,
      marginTop: 8,
      marginBottom: 4
    },
    ul: {
      marginTop: 8,
      marginBottom: 8,
      lineHeight: 24,
      paddingLeft: 20
    },
    ol: {
      marginTop: 8,
      marginBottom: 8,
      paddingLeft: 20
    },
    li: {
      fontSize: 15,
      lineHeight: 24,
      color: colors.gray800,
      marginBottom: 4
    },
    'ul ul': {
      marginTop: 4,
      marginBottom: 4,
      paddingLeft: 20
    },
    'ul ul li': {
      fontSize: 15,
      lineHeight: 24,
      color: colors.gray800,
      marginBottom: 4
    },
    'ul ul ul': {
      marginTop: 4,
      marginBottom: 4,
      paddingLeft: 20
    },
    'ul ul ul li': {
      fontSize: 15,
      lineHeight: 24,
      color: colors.gray800,
      marginBottom: 4
    }
  }), []);

  // Load chat history on mount
  useEffect(() => {
    loadChatHistory();
  }, []);

  // Auto-scroll when messages change
  useEffect(() => {
    if (messages.length > 0) {
      saveChatHistory();
      setTimeout(() => scrollToBottom(), 100);
    }
  }, [messages]);

  const loadChatHistory = async () => {
    const history = await chatStorage.loadChatHistory();
    setMessages(history);
  };

  const saveChatHistory = async () => {
    await chatStorage.saveChatHistory(messages);
  };

  const scrollToBottom = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  const sendMessage = async () => {
    if (!userInput.trim() || isLoading) return;

    const userMessage = {
      role: 'user',
      content: userInput.trim(),
      timestamp: new Date().toISOString()
    };

    console.log('📤 Sending user message:', userMessage.content);
    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    Keyboard.dismiss();

    setIsLoading(true);

    try {
      await getAIResponse(userMessage.content);
    } catch (error) {
      console.error('❌ Error getting AI response:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I apologize, but I'm having trouble responding right now. Please try again in a moment.",
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const getAIResponse = async (userMessage) => {
    try {
      console.log('🔍 Preparing API request...');
      console.log('📚 User query:', userMessage);
      console.log('📝 Conversation history (last 10 messages):', messages.slice(-10));

      const response = await aiDermatologistService.chat(
        userMessage,
        messages.slice(-10)
      );

      console.log('✅ Received API response:', response);
      console.log('💡 AI Response:', response.response);

      if (response.sources) {
        console.log('📖 Sources used:', response.sources);
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response.response,
        sources: response.sources,
        timestamp: new Date().toISOString()
      }]);
    } catch (error) {
      console.error('❌ Error calling AI API:', error);
      console.error('❌ Error details:', error.response?.data || error.message);

      // Fallback to local response if API fails
      console.log('⚠️ Falling back to local response');
      const fallbackResponse = generateContextualResponse(userMessage);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: fallbackResponse + '\n\n*Note: Using offline knowledge base. For best results, ensure backend is running.*',
        timestamp: new Date().toISOString()
      }]);
    }
  };

  const generateContextualResponse = (message) => {
    console.log('🔄 Generating contextual fallback response for:', message);
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('routine') && lowerMessage.includes('oily')) {
      console.log('✅ Matched pattern: oily skin routine');
      return `For oily skin, I recommend a balanced routine:

**Morning:**
1. Gentle foaming cleanser
2. Toner with salicylic acid or niacinamide
3. Lightweight, oil-free moisturizer
4. Broad-spectrum SPF 30+

**Evening:**
1. Oil-based cleanser (double cleanse)
2. Gentle foaming cleanser
3. Treatment (like BHA or retinol)
4. Lightweight moisturizer

**Key ingredients to look for:**
- Niacinamide (reduces oil production)
- Salicylic acid (unclogs pores)
- Hyaluronic acid (hydration without oil)

Would you like product recommendations or have questions about specific products?`;
    }

    if (lowerMessage.includes('wrinkle') || lowerMessage.includes('anti-aging')) {
      console.log('✅ Matched pattern: wrinkles/anti-aging');
      return `To reduce wrinkles naturally and effectively:

**Top Recommendations:**
1. **Retinol/Retinoids** - The gold standard for anti-aging
2. **Vitamin C** - Antioxidant protection and collagen production
3. **Peptides** - Support skin structure and firmness
4. **Sunscreen** - Daily SPF 30+ is crucial!

**Natural approaches:**
- Stay hydrated (drink water)
- Get adequate sleep (7-9 hours)
- Facial massage to improve circulation
- Antioxidant-rich diet
- Avoid smoking and excess alcohol

**Gentle exfoliation** with AHAs (glycolic, lactic acid) can also help improve skin texture.

Start slowly with active ingredients and build tolerance. Would you like specific product recommendations?`;
    }

    if (lowerMessage.includes('sensitive skin') || lowerMessage.includes('avoid')) {
      console.log('✅ Matched pattern: sensitive skin');
      return `For sensitive skin, **avoid these common irritants:**

**❌ Ingredients to avoid:**
- Fragrance (parfum)
- Denatured alcohol
- Essential oils
- Harsh sulfates (SLS)
- High-concentration acids
- Physical exfoliants

**✅ Look for instead:**
- Ceramides
- Centella Asiatica
- Colloidal oatmeal
- Hyaluronic acid
- Niacinamide (low %)
- Squalane

**Tips:**
- Patch test new products
- Introduce one product at a time
- Choose fragrance-free formulas
- Use lukewarm water (not hot)

What specific concerns do you have with your sensitive skin?`;
    }

    if (lowerMessage.includes('acne') || lowerMessage.includes('breakout')) {
      console.log('✅ Matched pattern: acne/breakouts');
      return `For acne-prone skin, here's my recommendation:

**Key Ingredients:**
1. **Salicylic Acid (BHA)** - Unclogs pores, 2% is ideal
2. **Benzoyl Peroxide** - Kills acne bacteria
3. **Niacinamide** - Reduces inflammation and oil
4. **Retinoids** - Prevents clogged pores

**Product Types:**
- Gentle, non-comedogenic cleanser
- BHA toner or treatment
- Lightweight, oil-free moisturizer
- Spot treatment for active breakouts
- Always use SPF!

**Important tips:**
- Don't over-dry your skin
- Be patient (6-8 weeks for results)
- Avoid touching your face
- Change pillowcases regularly
- Consider seeing a dermatologist for severe acne

Would you like specific product recommendations or have questions about acne scarring?`;
    }

    if (lowerMessage.includes('exfoliate') || lowerMessage.includes('exfoliation')) {
      console.log('✅ Matched pattern: exfoliation');
      return `**Exfoliation Guidelines:**

**How often:**
- **Normal skin:** 2-3 times per week
- **Oily/resilient skin:** 3-4 times per week
- **Dry/sensitive skin:** 1-2 times per week
- **Mature skin:** 2-3 times per week (gentle)

**Types of exfoliation:**

**Chemical (preferred):**
- AHAs (glycolic, lactic) - for surface/dry skin
- BHAs (salicylic) - for oily/acne-prone skin
- PHAs - gentlest option for sensitive skin

**Physical:**
- Use very gentle options
- Avoid harsh scrubs with large particles

**Important rules:**
- Don't combine with retinoids on same night
- Always follow with moisturizer
- Use SPF during the day
- Less is more - don't over-exfoliate!

**Signs of over-exfoliation:**
- Redness, irritation
- Increased sensitivity
- Tight, dry feeling

What's your skin type? I can give you more specific recommendations!`;
    }

    // Generic response
    console.log('No specific pattern matched, using generic response');
    return `Thank you for your question! As a virtual dermatologist, I'm here to help with skincare, cosmetic, and facial improvement advice.

To provide you with the most accurate and personalized recommendation, could you tell me more about:

- Your skin type (oily, dry, combination, sensitive)?
- Your main skin concerns?
- Any products you're currently using?
- Any allergies or sensitivities?

This will help me give you better tailored advice. You can also ask me about:
- Specific ingredients
- Product recommendations
- Skincare routines
- Treatment options
- Facial improvement techniques

What would you like to know more about?`;
  };

  // Convert markdown to HTML
  const convertMarkdownToHtml = (markdown) => {
    if (!markdown) return '';

    let html = markdown;

    // Convert headers (must be done before other conversions)
    html = html.replace(/^#### (.+)$/gm, '<h4>$1</h4>');
    html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

    // Convert bold text (before lists to handle bold in list items)
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

    // Convert unordered lists with nested support (support *, -, and • bullet points)
    // Support up to 3 levels: parent (0 spaces), child (2-4 spaces), grandchild (4-8 spaces)
    html = html.replace(/(?:^[\*\-•] .+$\n?(?:^ {2,8}[\*\-•] .+$\n?)*)+/gm, (match) => {
      const lines = match.trim().split('\n').filter(line => line.trim());
      let result = '<ul>';
      let nestedLevel = 0; // Track nesting level
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const level1Match = line.match(/^ {2,4}[\*\-•] /);
        const level2Match = line.match(/^ {5,8}[\*\-•] /);
        
        let currentLevel = 0;
        let content = '';
        
        if (level2Match) {
          // Grandchild (level 2)
          currentLevel = 2;
          content = line.replace(/^ {5,8}[\*\-•] (.+)$/, '$1').trim();
        } else if (level1Match) {
          // Child (level 1)
          currentLevel = 1;
          content = line.replace(/^ {2,4}[\*\-•] (.+)$/, '$1').trim();
        } else {
          // Parent (level 0)
          currentLevel = 0;
          content = line.replace(/^[\*\-•] (.+)$/, '$1').trim();
        }
        
        // Open nested lists if going deeper
        while (nestedLevel < currentLevel) {
          result += '<ul>';
          nestedLevel++;
        }
        
        // Close nested lists if going shallower
        while (nestedLevel > currentLevel) {
          result += '</ul></li>';
          nestedLevel--;
        }
        
        // Add the list item
        result += `<li>${content}`;
        
        // Check if next line is at a deeper level
        const nextLine = i < lines.length - 1 ? lines[i + 1] : null;
        if (nextLine) {
          const nextLevel1 = nextLine.match(/^ {2,4}[\*\-•] /);
          const nextLevel2 = nextLine.match(/^ {5,8}[\*\-•] /);
          const nextLevel = nextLevel2 ? 2 : (nextLevel1 ? 1 : 0);
          
          if (nextLevel <= currentLevel) {
            result += '</li>';
          }
        } else {
          result += '</li>';
        }
      }
      
      // Close all remaining nested lists
      while (nestedLevel > 0) {
        result += '</ul></li>';
        nestedLevel--;
      }
      
      result += '</ul>';
      return result;
    });

    // Convert numbered lists
    html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');

    // Split by double line breaks to identify paragraphs
    const blocks = html.split(/\n\n+/);
    html = blocks.map(block => {
      block = block.trim();
      if (!block) return '';
      
      // Don't wrap if it's already a block element
      if (block.match(/^<(h[1-6]|ul|ol|li)/)) {
        return block;
      }
      
      // Wrap in paragraph and convert single line breaks to <br/>
      return `<p>${block.replace(/\n/g, '<br/>')}</p>`;
    }).join('');

    return html;
  };

  const askSampleQuestion = (question) => {
    setUserInput(question);
    // Auto-send after a brief delay to show the question was selected
    setTimeout(() => {
      sendMessage();
    }, 100);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const startNewChat = () => {
    Alert.alert(
      'Start New Chat',
      'Current conversation will be saved. Start a new chat?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start New',
          onPress: async () => {
            setMessages([]);
            setUserInput('');
            await chatStorage.clearChatHistory();
          }
        }
      ]
    );
  };

  const handleLoadSession = (session) => {
    console.log('🔍 [AIDermatologist] handleLoadSession called');
    console.log('📋 [AIDermatologist] Session type:', session.type);
    console.log('📋 [AIDermatologist] Session messages:', session.messages?.length);
    
    if (session.type === 'text') {
      // Load text chat
      console.log('💬 [AIDermatologist] Loading text chat session');
      // console.log('📝 [AIDermatologist] Setting messages:', session.messages);
      setMessages(session.messages);
      console.log('✅ [AIDermatologist] Messages set successfully');
    } else if (session.type === 'live') {
      // Navigate to LiveChatAI and load live chat session
      console.log('🎤 [AIDermatologist] Loading live chat session, navigating...');
      navigation.navigate('LiveChatAI', { loadSession: session });
    }
  };

  // Helper function to strip HTML and markdown for speech
  const stripFormattingForSpeech = (text) => {
    if (!text) return '';
    
    // Remove HTML tags
    let cleanText = text.replace(/<[^>]*>/g, ' ');
    
    // Remove markdown bold
    cleanText = cleanText.replace(/\*\*([^*]+)\*\*/g, '$1');
    
    // Remove markdown headers
    cleanText = cleanText.replace(/^#{1,6}\s+/gm, '');
    
    // Remove bullet points and list markers
    cleanText = cleanText.replace(/^[\*\-•]\s+/gm, '');
    cleanText = cleanText.replace(/^\d+\.\s+/gm, '');
    
    // Remove extra whitespace
    cleanText = cleanText.replace(/\s+/g, ' ').trim();
    
    return cleanText;
  };

  // Text-to-speech functions
  const handleSpeak = async (messageIndex) => {
    const message = messages[messageIndex];
    if (!message || message.role !== 'assistant') return;

    try {
      // If already speaking this message, stop it
      if (speakingMessageIndex === messageIndex && isSpeaking) {
        await Speech.stop();
        setSpeakingMessageIndex(null);
        setIsSpeaking(false);
        return;
      }

      // Stop any currently speaking message
      if (isSpeaking) {
        await Speech.stop();
      }

      // Clean the text for speech
      let textToSpeak = stripFormattingForSpeech(message.content);
      
      // Check if text is too long (limit is 4000 characters)
      const MAX_SPEECH_LENGTH = 3900; // Leave some buffer
      if (textToSpeak.length > MAX_SPEECH_LENGTH) {
        textToSpeak = textToSpeak.substring(0, MAX_SPEECH_LENGTH) + '... Message truncated due to length.';
        Alert.alert(
          'Long Message',
          'This message is too long. Only the first part will be spoken.',
          [{ text: 'OK' }]
        );
      }
      
      setSpeakingMessageIndex(messageIndex);
      setIsSpeaking(true);

      // Start speaking
      Speech.speak(textToSpeak, {
        language: 'en-US',
        pitch: 1.0,
        rate: 0.9,
        onDone: () => {
          setSpeakingMessageIndex(null);
          setIsSpeaking(false);
        },
        onStopped: () => {
          setSpeakingMessageIndex(null);
          setIsSpeaking(false);
        },
        onError: (error) => {
          console.error('Speech error:', error);
          setSpeakingMessageIndex(null);
          setIsSpeaking(false);
          Alert.alert('Error', 'Failed to speak the message');
        }
      });
    } catch (error) {
      console.error('Error in handleSpeak:', error);
      setSpeakingMessageIndex(null);
      setIsSpeaking(false);
      Alert.alert('Error', 'Failed to initialize speech');
    }
  };

  // Stop speech when component unmounts or messages change significantly
  useEffect(() => {
    return () => {
      Speech.stop();
    };
  }, []);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Chat History Modal */}
      <ChatHistory
        visible={historyModalVisible}
        onClose={() => setHistoryModalVisible(false)}
        onLoadSession={handleLoadSession}
        currentChatType="text"
        navigation={navigation}
      />

      {/* Chat Container */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.chatContainer}
        contentContainerStyle={styles.chatContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Welcome Section */}
        {messages.length === 0 && (
          <View style={styles.welcomeSection}>
            <View style={styles.welcomeCard}>
              <View style={styles.welcomeHeader}>
                <Text style={styles.welcomeTitle}>AI Dermatologist</Text>
              </View>

              <Text style={styles.welcomeText}>
                I'm here to help you with all your skincare concerns. I can assist with:
              </Text>

              <View style={styles.capabilitiesGrid}>
                {[
                  { text: 'Skincare routines' },
                  { text: 'Cosmetic advice' },
                  { text: 'Product recommendations' },
                  { text: 'Face improvement tips' },
                  { text: 'Ingredient analysis' },
                  { text: 'Skin concerns' }
                ].map((item, index) => (
                  <View key={index} style={styles.capabilityItem}>
                    <Text style={styles.capabilityText}>{item.text}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.sampleQuestions}>
                <Text style={styles.sampleTitle}>Try asking:</Text>
                {sampleQuestions.map((question, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.sampleQuestionBtn}
                    onPress={() => askSampleQuestion(question)}
                  >
                    <Text style={styles.sampleQuestionText}>{question}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Chat Messages */}
        {messages.map((message, index) => (
          <View
            key={index}
            style={[
              styles.message,
              message.role === 'user' ? styles.messageUser : styles.messageAssistant
            ]}
          >
            <View style={[
              styles.messageContent,
              message.role === 'user' ? styles.messageContentUser : styles.messageContentAssistant
            ]}>
              <RenderHtml
                contentWidth={width * 0.8}
                source={{ html: convertMarkdownToHtml(message.content) }}
                tagsStyles={message.role === 'user' ? userTagsStyles : assistantTagsStyles}
                baseStyle={message.role === 'user' ? { color: '#FFFFFF' } : { color: colors.gray800 }}
              />
              <View style={styles.messageFooter}>
                <Text style={[
                  styles.messageTime,
                  message.role === 'user' && styles.messageTimeUser
                ]}>
                  {formatTime(message.timestamp)}
                </Text>
                
                {/* Voice Button for Assistant Messages */}
                {message.role === 'assistant' && (
                  <TouchableOpacity
                    style={[
                      styles.voiceButton,
                      speakingMessageIndex === index && isSpeaking && styles.voiceButtonActive
                    ]}
                    onPress={() => handleSpeak(index)}
                  >
                    <Text style={styles.voiceButtonIcon}>
                      {speakingMessageIndex === index && isSpeaking ? '⏸' : '🔊'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        ))}

        {/* Loading Indicator */}
        {isLoading && (
          <View style={[styles.message, styles.messageAssistant]}>
            <View style={styles.messageContent}>
              <View style={styles.typingIndicator}>
                <View style={[styles.typingDot, styles.typingDot1]} />
                <View style={[styles.typingDot, styles.typingDot2]} />
                <View style={[styles.typingDot, styles.typingDot3]} />
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Input Area */}
      <View style={styles.inputContainer}>
        {/* Action Buttons Row */}
        <View style={styles.actionButtonsRow}>
          {/* Live Chat Button */}
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => {
              console.log('🎤 [AIDermatologist] Go Live with AI button pressed');
              console.log('🧭 [AIDermatologist] Navigation available:', !!navigation);
              console.log('🧭 [AIDermatologist] Navigation object:', navigation);
              if (navigation) {
                console.log('✅ [AIDermatologist] Calling navigation.navigate("LiveChatAI")');
                navigation.navigate('LiveChatAI');
                console.log('✅ [AIDermatologist] Navigation called');
              } else {
                console.error('❌ [AIDermatologist] Navigation is undefined!');
              }
            }}
          >
            <Text style={styles.actionButtonText}>Live</Text>
          </TouchableOpacity>

          {/* Chat History Button */}
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => setHistoryModalVisible(true)}
          >
            <Text style={styles.actionButtonText}>History</Text>
          </TouchableOpacity>

          {/* New Chat Button */}
          {messages.length > 0 && (
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={startNewChat}
            >
              <Text style={styles.actionButtonText}>New</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            placeholder="Ask me about skincare, cosmetics, or facial improvements..."
            placeholderTextColor="#9ca3af"
            value={userInput}
            onChangeText={setUserInput}
            multiline
            maxLength={1000}
            editable={!isLoading}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!userInput.trim() || isLoading) && styles.sendButtonDisabled
            ]}
            onPress={sendMessage}
            disabled={!userInput.trim() || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={{ fontSize: 20, color: 'white' }}>➤</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default AIDermatologist;
