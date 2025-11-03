import React from 'react';
import { StatusBar, LogBox } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AIDermatologist from './components/AIDermatologist';
import LiveChatAI from './components/LiveChatAI';

// Suppress defaultProps warnings from react-native-render-html library
// These are expected warnings with React 18.2.0 and will be fixed in future library updates
LogBox.ignoreLogs([
  'Warning: TRenderEngineProvider: Support for defaultProps',
  'Warning: MemoizedTNodeRenderer: Support for defaultProps',
  'Warning: TNodeChildrenRenderer: Support for defaultProps',
  'Warning: bound renderChildren: Support for defaultProps',
]);

// Filter console.error for defaultProps warnings (React Native shows these as ERROR in terminal)
const originalError = console.error;
console.error = (...args) => {
  if (
    typeof args[0] === 'string' &&
    args[0].includes('Support for defaultProps')
  ) {
    return;
  }
  originalError(...args);
};

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#A44A6B" />
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerStyle: {
              backgroundColor: '#A44A6B'
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
              fontSize: 18
            },
            headerShadowVisible: false,
            contentStyle: {
              backgroundColor: '#FDFBF7'
            }
          }}
        >
          <Stack.Screen
            name="AIDermatologist"
            component={AIDermatologist}
            options={{
              title: 'AI Dermatologist',
              headerShown: true
            }}
          />
          <Stack.Screen
            name="LiveChatAI"
            component={LiveChatAI}
            options={{
              title: 'Live Chat with AI',
              headerShown: false,
              presentation: 'fullScreenModal'
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}
