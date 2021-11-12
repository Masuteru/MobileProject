import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import * as React from 'react';
import {Icon} from 'react-native-elements';
import CreateMeeting from './src/screens/CreateMeeting';
import CustomTags from './src/screens/CustomTags';
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
  const Nav = createNativeStackNavigator();

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarHideOnKeyboard: true,
        }}>
        <Tab.Screen
          name="Meetings"
          options={{
            tabBarIcon: ({focused}) => {
              return (
                <Icon
                  name="comments"
                  type="font-awesome"
                  color={focused ? '#005F73' : 'gray'}
                />
              );
            },
          }}>
          {props => <MeetingsList {...props} />}
        </Tab.Screen>
        <Tab.Screen options={{tabBarButton: () => null}} name="OngoingTags">
          {props => <OngoingTags {...props} extraData={'hi'} />}
        </Tab.Screen>
        <Tab.Screen
          name="Tags"
          options={{
            tabBarIcon: ({focused}) => {
              return (
                <Icon
                  name="tag"
                  type="font-awesome"
                  color={focused ? '#005F73' : 'gray'}
                />
              );
            },
          }}>
          {props => <CustomTags {...props} extraData={'hi'} />}
        </Tab.Screen>
        <Tab.Screen name="CreateMeeting" options={{tabBarButton: () => null}}>
          {props => <CreateMeeting {...props} />}
        </Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
  );
}
