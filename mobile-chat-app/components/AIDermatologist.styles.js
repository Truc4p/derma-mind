import { StyleSheet, Platform } from 'react-native';

// Color palette matching the Vue frontend - Pink/Rose theme
export const colors = {
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
  primary950: '#3E0E21',
  white: '#FFFFFF',
  gray100: '#F3F4F6',
  gray400: '#9CA3AF',
  gray700: '#374151',
  gray800: '#1e293b',
  red500: '#EF4444',
  red50: '#FEF2F2'
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary50
  },
  chatContainer: {
    flex: 1
  },
  chatContent: {
    padding: 16,
    paddingBottom: 20
  },
  
  // Welcome Section
  welcomeSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 600
  },
  welcomeCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    maxWidth: 700,
    width: '100%'
  },
  welcomeHeader: {
    padding: 20,
    backgroundColor: colors.primary100,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: colors.primary200,
    alignItems: 'center'
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primary800,
    margin: 0
  },
  welcomeText: {
    fontSize: 15,
    color: colors.primary700,
    marginBottom: 16,
    lineHeight: 22
  },
  
  // Capabilities Grid
  capabilitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20
  },
  capabilityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    padding: 12,
    backgroundColor: colors.primary50,
    borderRadius: 8,
    marginBottom: 12
  },
  capabilityText: {
    fontSize: 14,
    color: colors.primary700,
    fontWeight: '500',
    flex: 1
  },
  
  // Sample Questions
  sampleQuestions: {
    borderTopWidth: 1,
    borderTopColor: colors.primary200,
    paddingTop: 16
  },
  sampleTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primary700,
    marginBottom: 12
  },
  sampleQuestionBtn: {
    width: '100%',
    padding: 12,
    backgroundColor: colors.primary50,
    borderWidth: 1,
    borderColor: colors.primary200,
    borderRadius: 8,
    marginBottom: 8
  },
  sampleQuestionText: {
    fontSize: 14,
    color: colors.primary700
  },
  
  // Messages
  message: {
    flexDirection: 'row',
    marginBottom: 16
  },
  messageUser: {
    justifyContent: 'flex-end'
  },
  messageAssistant: {
    justifyContent: 'flex-start'
  },
  messageContent: {
    maxWidth: '80%',
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2
  },
  messageContentUser: {
    backgroundColor: colors.primary500
  },
  messageContentAssistant: {
    backgroundColor: colors.white
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8
  },
  messageTime: {
    fontSize: 12,
    color: colors.gray400
  },
  messageTimeUser: {
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'right'
  },
  
  // Voice Button
  voiceButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary100,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    borderWidth: 1,
    borderColor: colors.primary200
  },
  voiceButtonActive: {
    backgroundColor: colors.primary500,
    borderColor: colors.primary600
  },
  voiceButtonIcon: {
    fontSize: 16
  },
  
  // Typing Indicator
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary400,
    marginHorizontal: 2
  },
  
  // Input Area
  inputContainer: {
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 16
  },
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 8
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary200,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 10,
    elevation: 2
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary800
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end'
  },
  textInput: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: colors.primary200,
    borderRadius: 12,
    fontSize: 16,
    backgroundColor: colors.white,
    marginRight: 12
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary500,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  sendButtonDisabled: {
    opacity: 0.5
  }
});

// Markdown styles for messages
export const markdownStyles = {
  assistant: {
    body: {
      fontSize: 15,
      lineHeight: 24,
      color: colors.gray800
    },
    heading1: {
      fontSize: 22,
      fontWeight: '600',
      color: colors.primary800,
      marginTop: 16,
      marginBottom: 8
    },
    heading2: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.primary800,
      marginTop: 14,
      marginBottom: 6
    },
    heading3: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.primary800,
      marginTop: 12,
      marginBottom: 4
    },
    heading4: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.primary800,
      marginTop: 10,
      marginBottom: 4
    },
    paragraph: {
      marginBottom: 12,
      fontSize: 15,
      lineHeight: 24,
      color: colors.gray800
    },
    strong: {
      fontWeight: '600',
      color: colors.primary800
    },
    em: {
      fontStyle: 'italic'
    },
    bullet_list: {
      marginBottom: 12
    },
    ordered_list: {
      marginBottom: 12,
    },
    list_item: {
      marginBottom: 4,
      fontSize: 15,
      lineHeight: 24
    },
    code_inline: {
      backgroundColor: colors.primary100,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 3,
      fontSize: 14,
      fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace'
    },
    code_block: {
      backgroundColor: colors.primary100,
      padding: 12,
      borderRadius: 6,
      fontSize: 14,
      fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
      marginBottom: 12
    },
    blockquote: {
      backgroundColor: colors.primary50,
      borderLeftWidth: 3,
      borderLeftColor: colors.primary400,
      paddingLeft: 16,
      paddingVertical: 8,
      marginBottom: 12
    },
    table: {
      borderWidth: 1,
      borderColor: colors.primary200,
      marginBottom: 12
    },
    tr: {
      borderBottomWidth: 1,
      borderColor: colors.primary200,
      flexDirection: 'row'
    },
    th: {
      flex: 1,
      padding: 8,
      fontWeight: '600',
      backgroundColor: colors.primary100
    },
    td: {
      flex: 1,
      padding: 8
    }
  },
  user: {
    body: {
      fontSize: 15,
      lineHeight: 24,
      color: colors.white
    },
    heading1: {
      fontSize: 22,
      fontWeight: '600',
      color: colors.white,
      marginTop: 16,
      marginBottom: 8
    },
    heading2: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.white,
      marginTop: 14,
      marginBottom: 6
    },
    heading3: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.white,
      marginTop: 12,
      marginBottom: 4
    },
    heading4: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.white,
      marginTop: 10,
      marginBottom: 4
    },
    paragraph: {
      marginBottom: 12,
      fontSize: 15,
      lineHeight: 24,
      color: colors.white
    },
    strong: {
      fontWeight: '600',
      color: colors.white
    },
    em: {
      fontStyle: 'italic',
      color: colors.white
    },
    bullet_list: {
      marginBottom: 12,
      color: colors.white
    },
    ordered_list: {
      marginBottom: 12,
      color: colors.white
    },
    list_item: {
      marginBottom: 4,
      fontSize: 15,
      lineHeight: 24,
      color: colors.white
    },
    code_inline: {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 3,
      fontSize: 14,
      fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
      color: colors.white
    },
    code_block: {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      padding: 12,
      borderRadius: 6,
      fontSize: 14,
      fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
      marginBottom: 12,
      color: colors.white
    },
    blockquote: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderLeftWidth: 3,
      borderLeftColor: colors.white,
      paddingLeft: 16,
      paddingVertical: 8,
      marginBottom: 12
    },
    table: {
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.3)',
      marginBottom: 12
    },
    tr: {
      borderBottomWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.3)',
      flexDirection: 'row'
    },
    th: {
      flex: 1,
      padding: 8,
      fontWeight: '600',
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      color: colors.white
    },
    td: {
      flex: 1,
      padding: 8,
      color: colors.white
    }
  }
};
