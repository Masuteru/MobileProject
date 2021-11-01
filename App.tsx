import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import * as React from 'react';
import CustomTags from './src/screens/CustomTags';
import Meetings from './src/screens/Meetings';
import MeetingsList from './src/screens/MeetingsList';
import OngoingTags from './src/screens/OngoingTags';
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
          <Tab.Screen name="OngoingTags">{props => <OngoingTags {...props} extraData={'hi'} />}</Tab.Screen>
        {/* <Tab.Screen name="Recording">{props => <Recording {...props} extraData={'hi'} />}</Tab.Screen> */}
        <Tab.Screen name="Custom Tags" >{props => <CustomTags {...props} extraData={'hi'} />}</Tab.Screen>
        <Tab.Screen name="Meetings" >{props => <MeetingsList {...props} extraData={'hi'} />}</Tab.Screen>
        <Tab.Screen name="Create Meeting" >{props => <Meetings {...props} extraData={'hi'} />}</Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
  );
}
