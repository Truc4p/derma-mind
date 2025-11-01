import React from 'react';
import { StatusBar, LogBox } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AIDermatologist from './components/AIDermatologist';

// Suppress defaultProps warnings from react-native-render-html
LogBox.ignoreLogs([
  'Support for defaultProps will be removed',
  'TRenderEngineProvider: Support for defaultProps',
  'MemoizedTNodeRenderer: Support for defaultProps',
  'TNodeChildrenRenderer: Support for defaultProps',
]);

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
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}
