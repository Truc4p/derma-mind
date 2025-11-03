import React, { useState, useEffect } from 'react';
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
  Alert
} from 'react-native';
import { liveChatStorage } from '../services/api';

const { width, height } = Dimensions.get('window');

const LiveChatHistory = ({ visible, onClose, onLoadSession, currentSessionId }) => {
  const [chatSessions, setChatSessions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (visible) {
      loadAllSessions();
    }
  }, [visible]);

  const loadAllSessions = async () => {
    try {
      // Load all sessions from storage
      const sessions = await liveChatStorage.loadAllSessions();
      
      // If no sessions but we have history, migrate it
      if (sessions.length === 0) {
        const allHistory = await liveChatStorage.loadLiveChatHistory();
        if (allHistory.length > 0) {
          const session = {
            id: 'current',
            title: generateSessionTitle(allHistory),
            preview: generateSessionPreview(allHistory),
            timestamp: new Date().toISOString(),
            messages: allHistory,
            messageCount: allHistory.length
          };
          setChatSessions([session]);
          // Save as session for future
          await liveChatStorage.saveSession('current', session);
        } else {
          setChatSessions([]);
        }
      } else {
        // Sort by timestamp, newest first
        const sorted = sessions.sort((a, b) => 
          new Date(b.timestamp) - new Date(a.timestamp)
        );
        setChatSessions(sorted);
      }
    } catch (error) {
      console.error('Failed to load sessions:', error);
      setChatSessions([]);
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

  const handleDeleteSession = async (sessionId) => {
    Alert.alert(
      'Delete Conversation',
      'Delete this conversation? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await liveChatStorage.deleteSession(sessionId);
            // Reload sessions
            loadAllSessions();
            
            // If it was the only session, close modal
            if (chatSessions.length === 1) {
              onClose();
            }
          }
        }
      ]
    );
  };

  const filteredSessions = chatSessions.filter(session => {
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
        {/* Header */}
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
            placeholderTextColor="#9CA3AF"
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
              style={[
                styles.sessionItem,
                session.id === currentSessionId && styles.sessionItemActive
              ]}
              onPress={() => {
                onLoadSession(session);
                onClose();
              }}
            >
              <View style={styles.sessionInfo}>
                <Text style={styles.sessionTitle}>{session.title}</Text>
                <Text style={styles.sessionDate}>
                  {formatSessionDate(session.timestamp)}
                </Text>
                <Text style={styles.sessionPreview}>{session.preview}</Text>
                <Text style={styles.sessionCount}>
                  💬 {session.messageCount} messages
                </Text>
              </View>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteSession(session.id)}
              >
                <Text style={styles.deleteButtonText}>🗑️</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F3F4F6',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937'
  },
  closeButton: {
    padding: 8,
    borderRadius: 8
  },
  closeButtonText: {
    fontSize: 24,
    color: '#6366F1',
    fontWeight: '600'
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    position: 'relative'
  },
  searchInput: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 12,
    paddingRight: 40,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    color: '#1F2937'
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
    color: '#9CA3AF'
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
    color: '#9CA3AF',
    marginBottom: 8,
    textAlign: 'center'
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#D1D5DB',
    textAlign: 'center'
  },
  sessionItem: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  sessionItemActive: {
    backgroundColor: '#EEF2FF',
    borderColor: '#A5B4FC',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  sessionInfo: {
    flex: 1,
    marginRight: 12
  },
  sessionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4
  },
  sessionDate: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4
  },
  sessionPreview: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 6
  },
  sessionCount: {
    fontSize: 12,
    color: '#6366F1',
    fontWeight: '500'
  },
  deleteButton: {
    padding: 8
  },
  deleteButtonText: {
    fontSize: 20
  }
});

export default LiveChatHistory;
