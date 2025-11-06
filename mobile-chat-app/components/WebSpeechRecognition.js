import React, { useRef, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

const WebSpeechRecognition = ({ onResult, onEnd, onError, isListening }) => {
  const webViewRef = useRef(null);

  useEffect(() => {
    if (webViewRef.current) {
      if (isListening) {
        webViewRef.current.injectJavaScript('startRecognition();');
      } else {
        webViewRef.current.injectJavaScript('stopRecognition();');
      }
    }
  }, [isListening]);

  const handleMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      switch (data.type) {
        case 'result':
          onResult && onResult(data.transcript, data.isFinal);
          break;
        case 'end':
          onEnd && onEnd();
          break;
        case 'error':
          onError && onError(data.error);
          break;
        case 'ready':
          console.log('✅ Web Speech API ready');
          break;
        default:
          console.log('Unknown message type:', data.type);
      }
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  };

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { margin: 0; padding: 0; }
      </style>
    </head>
    <body>
      <script>
        let recognition = null;
        let isRecognizing = false;

        // Initialize Web Speech API
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
          const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
          recognition = new SpeechRecognition();
          
          // Configure recognition
          recognition.continuous = false; // Stop after user finishes
          recognition.interimResults = true; // Get real-time results
          recognition.lang = 'en-US';
          recognition.maxAlternatives = 1;

          // Handle results (real-time)
          recognition.onresult = (event) => {
            const result = event.results[event.results.length - 1];
            const transcript = result[0].transcript;
            const isFinal = result.isFinal;
            
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'result',
              transcript: transcript,
              isFinal: isFinal
            }));
          };

          // Handle end
          recognition.onend = () => {
            isRecognizing = false;
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'end'
            }));
          };

          // Handle errors
          recognition.onerror = (event) => {
            isRecognizing = false;
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'error',
              error: event.error
            }));
          };

          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'ready'
          }));
        } else {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'error',
            error: 'Speech recognition not supported'
          }));
        }

        // Functions to control recognition
        window.startRecognition = () => {
          if (recognition && !isRecognizing) {
            try {
              recognition.start();
              isRecognizing = true;
            } catch (e) {
              console.error('Start error:', e);
            }
          }
        };

        window.stopRecognition = () => {
          if (recognition && isRecognizing) {
            try {
              recognition.stop();
              isRecognizing = false;
            } catch (e) {
              console.error('Stop error:', e);
            }
          }
        };
      </script>
    </body>
    </html>
  `;

  return (
    <View style={styles.hidden}>
      <WebView
        ref={webViewRef}
        source={{ html: htmlContent }}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback={true}
        style={styles.hidden}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  hidden: {
    width: 0,
    height: 0,
    opacity: 0
  }
});

export default WebSpeechRecognition;
