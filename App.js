import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import WelcomeScreen from './WelcomeScreen';
import QuestionScreen from './QuestionScreen';
import LoadingScreen from './LoadingScreen';
import ChatScreen from './ChatScreen';
import HowStellarisWorksScreen from './HowStellarisWorksScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Welcome" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Questions" component={QuestionScreen} />
        <Stack.Screen name="Loading" component={LoadingScreen} />
        <Stack.Screen name="Chat" component={ChatScreen} />
        <Stack.Screen name="HowStellarisWorks" component={HowStellarisWorksScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}