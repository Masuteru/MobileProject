import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import * as React from 'react';
import Recording from './src/screens/Recording';
import Tags from './src/screens/Tags';

function RecordScreen() {
  return <Recording></Recording>;
}

function TagsScreen() {
  return <Tags></Tags>;
}

export default function App() {
  const Tab = createBottomTabNavigator();

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
        }}>
        <Tab.Screen name="Recording" component={RecordScreen} />
        <Tab.Screen name="Tags" component={TagsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
