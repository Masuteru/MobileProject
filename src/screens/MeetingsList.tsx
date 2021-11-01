import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {Component} from 'react';
import {TextInput, View} from 'react-native';
import {Button, Chip, Icon, Input, Text} from 'react-native-elements';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import MeetingDTO from '../interfaces/MeetingDTO';

interface State {
  meetings: MeetingDTO[];
}

let meetings: MeetingDTO[] = [];

let textInput: TextInput | null;

class MeetingsList extends Component<any, State> {
  constructor(props: any) {
    super(props);

    this.state = {
      meetings: meetings,
    };

    this.getData();
  }

  componentDidMount = () => {
    this.getData();
  };

  public render() {
    return (
      <SafeAreaProvider>
        <View>
          <Text style={{fontSize: 20, paddingTop: 15, paddingBottom: 15}}>
            Meetings:
          </Text>
          <View
            style={{flexDirection: 'row', paddingBottom: 60, flexWrap: 'wrap'}}>
            <Text>Date: </Text>
            <Text>Name: </Text>
          </View>
          <View>
            {this.state.meetings.map(meeting => (
              <View style={{flexDirection: 'row', paddingBottom: 60, flexWrap: 'wrap'}}>
                <Text>{meeting.date}</Text>
                <Text>{meeting.name}</Text>
              </View>
            ))}
          </View>
        </View>
      </SafeAreaProvider>
    );
  }

  getData = async () => {
    const result = await AsyncStorage.getItem('meetings');
    if (result) {
      this.setState({meetings: JSON.parse(result)});
    }
  };
}

export default MeetingsList;
