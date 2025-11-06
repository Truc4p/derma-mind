import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  ScrollView,
  Dimensions,
  SafeAreaView,
  Alert,
  useWindowDimensions
} from 'react-native';
import RenderHtml from 'react-native-render-html';
import { chatStorage, liveChatStorage } from '../services/api';

const { width, height } = Dimensions.get('window');

// Pink color theme
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

const ChatHistory = ({ visible, onClose, onLoadSession, currentChatType, navigation }) => {
  const { width } = useWindowDimensions();
  const contentWidth = useMemo(() => width * 0.85, [width]);
  
  const [allSessions, setAllSessions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSession, setSelectedSession] = useState(null); // Track selected session for detail view

  // HTML tag styles for assistant messages
  const assistantTagsStyles = useMemo(() => ({
    body: {
      fontSize: 15,
      lineHeight: 24,
      color: colors.primary950
    },
    p: {
      fontSize: 15,
      lineHeight: 24,
      color: colors.primary950,
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
      color: colors.primary950,
      marginBottom: 4
    }
  }), []);

  // Convert markdown to HTML for better display
  const convertMarkdownToHtml = useMemo(() => (markdown) => {
    if (!markdown) return '';

    let html = markdown;

    // Convert headers
    html = html.replace(/^#### (.+)$/gm, '<h4>$1</h4>');
    html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

    // Convert bold text
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

    // Convert unordered lists with nested support
    html = html.replace(/(?:^[\*\-•] .+$\n?(?:^ {2,8}[\*\-•] .+$\n?)*)+/gm, (match) => {
      const lines = match.trim().split('\n').filter(line => line.trim());
      let result = '<ul>';
      let nestedLevel = 0;
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const spaces = line.search(/[\*\-•]/);
        const currentLevel = Math.floor(spaces / 2);
        const content = line.replace(/^[\s]*[\*\-•]\s*/, '');
        
        while (nestedLevel < currentLevel) {
          result += '<ul>';
          nestedLevel++;
        }
        
        while (nestedLevel > currentLevel) {
          result += '</ul></li>';
          nestedLevel--;
        }
        
        if (i < lines.length - 1) {
          const nextSpaces = lines[i + 1].search(/[\*\-•]/);
          const nextLevel = Math.floor(nextSpaces / 2);
          if (nextLevel > currentLevel) {
            result += `<li>${content}`;
          } else {
            result += `<li>${content}</li>`;
          }
        } else {
          result += `<li>${content}</li>`;
        }
      }
      
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
  }, []);

  useEffect(() => {
    console.log('🔄 [ChatHistory] Component rendered/updated');
    console.log('📋 [ChatHistory] Props:', { visible, currentChatType, hasNavigation: !!navigation });
    if (visible) {
      loadAllSessions();
      setSelectedSession(null); // Reset selected session when modal opens
    }
  }, [visible]);

  const loadAllSessions = async () => {
    try {
      console.log('📖 [ChatHistory] Loading all sessions...');
      const sessions = [];

      // Load text chat history
      const textHistory = await chatStorage.loadChatHistory();
      console.log('💬 [ChatHistory] Text chat history loaded:', textHistory.length, 'messages');
      if (textHistory.length > 0) {
        sessions.push({
          id: 'text-chat-current',
          type: 'text',
          title: generateSessionTitle(textHistory),
          preview: generateSessionPreview(textHistory),
          timestamp: textHistory[textHistory.length - 1]?.timestamp || new Date().toISOString(),
          messages: textHistory,
          messageCount: textHistory.length
        });
      }

      // Load live chat sessions
      const liveSessions = await liveChatStorage.loadAllSessions();
      console.log('🎤 [ChatHistory] Live chat sessions loaded:', liveSessions.length, 'sessions');
      // console.log('📋 [ChatHistory] Live sessions details:', JSON.stringify(liveSessions, null, 2));
      const liveSessionsWithType = liveSessions.map(session => ({
        ...session,
        type: 'live'
      }));
      sessions.push(...liveSessionsWithType);

      // Sort by timestamp, newest first
      const sorted = sessions.sort((a, b) => 
        new Date(b.timestamp) - new Date(a.timestamp)
      );

      console.log('✅ [ChatHistory] Total sessions loaded:', sorted.length);
      setAllSessions(sorted);
    } catch (error) {
      console.error('❌ [ChatHistory] Failed to load sessions:', error);
      setAllSessions([]);
    }
  };

  const generateSessionTitle = (messages) => {
    if (messages.length === 0) return 'New Chat';
    const firstUserMessage = messages.find(m => m.role === 'user');
    if (firstUserMessage) {
      const title = firstUserMessage.content.substring(0, 50);
      return title.length < firstUserMessage.content.length ? title + '...' : title;
    }
    return 'Chat Session';
  };

  const generateSessionPreview = (messages) => {
    if (messages.length === 0) return 'No messages yet';
    const lastMessage = messages[messages.length - 1];
    const preview = lastMessage.content.substring(0, 80);
    return preview + (lastMessage.content.length > 80 ? '...' : '');
  };

  const formatSessionDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return 'Today ' + date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
      });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return days + ' days ago';
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    }
  };

  const handleDeleteSession = async (session) => {
    Alert.alert(
      'Delete Conversation',
      `Delete this ${session.type === 'text' ? 'text chat' : 'live chat'} conversation? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (session.type === 'text') {
              await chatStorage.clearChatHistory();
            } else {
              await liveChatStorage.deleteSession(session.id);
            }
            loadAllSessions();
          }
        }
      ]
    );
  };

  const handleLoadSession = (session) => {
    console.log('🔍 [ChatHistory] handleLoadSession called');
    console.log('📋 [ChatHistory] Session type:', session.type);
    console.log('📋 [ChatHistory] Session ID:', session.id);
    console.log('📋 [ChatHistory] Session messages count:', session.messages?.length);
    // console.log('📋 [ChatHistory] Full session:', JSON.stringify(session, null, 2));
    
    if (session.type === 'text') {
      // Load text chat
      console.log('💬 [ChatHistory] Loading text chat session');
      console.log('📝 [ChatHistory] Calling onLoadSession with session');
      onLoadSession(session);
    } else if (session.type === 'live') {
      // Show live chat session details in modal instead of navigating
      console.log('🎤 [ChatHistory] Showing live chat session details');
      setSelectedSession(session);
    }
  };

  const filteredSessions = allSessions
    .filter(session => {
      // Filter by search query
      if (!searchQuery.trim()) return true;
      
      const query = searchQuery.toLowerCase();
      return (
        session.title.toLowerCase().includes(query) ||
        session.preview.toLowerCase().includes(query) ||
        session.messages.some(msg => msg.content.toLowerCase().includes(query))
      );
    });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Show session detail view if a live session is selected */}
        {selectedSession ? (
          <>
            {/* Detail View Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={() => setSelectedSession(null)} style={styles.backButton}>
                <Text style={styles.backButtonText}>← Back</Text>
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Session Details</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Session Info */}
            <View style={styles.detailHeader}>
              <Text style={styles.detailTitle}>{selectedSession.title}</Text>
              <View style={styles.detailMetaRow}>
                <Text style={styles.detailDate}>{formatSessionDate(selectedSession.timestamp)}</Text>
                <View style={styles.detailBadge}>
                  <Text style={styles.detailBadgeText}>Live Chat</Text>
                </View>
                <Text style={styles.detailCount}>{selectedSession.messageCount} messages</Text>
              </View>
            </View>

            {/* Messages List */}
            <ScrollView style={styles.messagesContainer}>
              {selectedSession.messages.map((message, index) => {
                const messageKey = `msg-${message.timestamp || Date.now()}-${index}`;
                const html = message.role === 'assistant' 
                  ? convertMarkdownToHtml(message.content)
                  : message.content;
                
                return (
                  <View
                    key={messageKey}
                    style={[
                      styles.messageItem,
                      message.role === 'user' ? styles.messageUser : styles.messageAssistant
                    ]}
                  >
                    
                    {message.role === 'assistant' ? (
                      <RenderHtml
                        contentWidth={contentWidth}
                        source={{ html }}
                        tagsStyles={assistantTagsStyles}
                        baseStyle={{ color: colors.primary950 }}
                      />
                    ) : (
                      <Text style={styles.messageContent}>{message.content}</Text>
                    )}
                  </View>
                );
              })}
            </ScrollView>
          </>
        ) : (
          <>
            {/* List View Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Chat History</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search conversations..."
                placeholderTextColor={colors.primary600}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  style={styles.clearSearchButton}
                  onPress={() => setSearchQuery('')}
                >
                  <Text style={styles.clearSearchText}>✕</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Sessions List */}
            <ScrollView style={styles.sessionsList}>
              {filteredSessions.length === 0 && !searchQuery && (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>No chat history yet</Text>
                  <Text style={styles.emptyStateSubtext}>
                    Start a conversation to see it here
                  </Text>
                </View>
              )}

              {filteredSessions.length === 0 && searchQuery && (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>
                    No results found for "{searchQuery}"
                  </Text>
                </View>
              )}

              {filteredSessions.map((session) => (
                <TouchableOpacity
                  key={session.id}
                  style={styles.sessionItem}
                  onPress={() => {
                    console.log('👆 [ChatHistory] Session item clicked');
                    console.log('📋 [ChatHistory] Session clicked:', session.id, session.type);
                    handleLoadSession(session);
                    if (session.type === 'text') {
                      onClose();
                    }
                  }}
                >
                  <View style={styles.sessionInfo}>
                    <View style={styles.sessionHeader}>
                      <Text style={styles.sessionTitle}>{session.title}</Text>
                      <View style={[
                        styles.typeBadge,
                        session.type === 'live' ? styles.typeBadgeLive : styles.typeBadgeText
                      ]}>
                        <Text style={styles.typeBadgeText}>
                          {session.type === 'live' ? 'Live' : 'Text'}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.sessionDate}>
                      {formatSessionDate(session.timestamp)}
                    </Text>
                    <Text style={styles.sessionPreview}>{session.preview}</Text>
                    <Text style={styles.sessionCount}>
                      {session.messageCount} messages
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteSession(session)}
                  >
                    <Text style={styles.deleteButtonText}>🗑️</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary50
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.primary100,
    borderBottomWidth: 1,
    borderBottomColor: colors.primary200
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.primary950
  },
  closeButton: {
    padding: 8,
    borderRadius: 8
  },
  closeButtonText: {
    fontSize: 24,
    color: colors.primary600,
    fontWeight: '600'
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    position: 'relative'
  },
  searchInput: {
    backgroundColor: colors.primary100,
    borderRadius: 12,
    padding: 12,
    paddingRight: 40,
    fontSize: 14,
    borderWidth: 1,
    borderColor: colors.primary200,
    color: colors.primary950
  },
  clearSearchButton: {
    position: 'absolute',
    right: 24,
    top: '50%',
    transform: [{ translateY: -12 }],
    padding: 8,
    borderRadius: 6
  },
  clearSearchText: {
    fontSize: 16,
    color: colors.primary600
  },
  sessionsList: {
    flex: 1,
    padding: 16
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    paddingHorizontal: 32
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.primary600,
    marginBottom: 8,
    textAlign: 'center'
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: colors.primary500,
    textAlign: 'center'
  },
  sessionItem: {
    backgroundColor: colors.primary100,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.primary200,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  sessionInfo: {
    flex: 1,
    marginRight: 12
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  sessionTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary950,
    marginRight: 8
  },
  typeBadge: {
    backgroundColor: colors.primary300,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primary800
  },
  sessionDate: {
    fontSize: 12,
    color: colors.primary700,
    marginBottom: 4
  },
  sessionPreview: {
    fontSize: 14,
    color: colors.primary800,
    marginBottom: 6
  },
  sessionCount: {
    fontSize: 12,
    color: colors.primary600,
    fontWeight: '500'
  },
  deleteButton: {
    padding: 8
  },
  deleteButtonText: {
    fontSize: 20
  },
  // Detail View Styles
  backButton: {
    padding: 8,
    borderRadius: 8
  },
  backButtonText: {
    fontSize: 16,
    color: colors.primary600,
    fontWeight: '600'
  },
  detailHeader: {
    padding: 20,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: colors.primary200
  },
  detailTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.primary950,
    marginBottom: 12
  },
  detailMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8
  },
  detailDate: {
    fontSize: 13,
    color: colors.primary700,
    flex: 1
  },
  detailBadge: {
    backgroundColor: colors.primary300,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12
  },
  detailBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary800
  },
  detailCount: {
    fontSize: 13,
    color: colors.primary600,
    fontWeight: '500'
  },
  messagesContainer: {
    flex: 1,
    padding: 16
  },
  messageItem: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1
  },
  messageUser: {
    backgroundColor: colors.primary100,
    borderColor: colors.primary300,
    marginLeft: 20
  },
  messageAssistant: {
    backgroundColor: '#FFFFFF',
    borderColor: colors.primary200,
    marginRight: 20
  },
  messageContent: {
    fontSize: 15,
    color: colors.primary950,
    lineHeight: 22
  }
});

export default ChatHistory;
