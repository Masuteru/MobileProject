import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {Component} from 'react';
import {View} from 'react-native';
import {Chip, Icon, Text} from 'react-native-elements';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import  MeetingDTO  from '../interfaces/MeetingDTO'

interface State {
  meetings: MeetingDTO;
}

class MeetingsList extends Component<any, State> {

  constructor(props: any) {
    super(props);
    this.state = {
      meetings: {
        name: '',
        participants: [],
        subjects: [],
      }
    }
    console.log(props)
    this.getData();
  }

  componentDidMount = () => {
    this.getData();
  };

  public render() {
    return (
      <SafeAreaProvider>
        <View>
        <Text style={{fontSize: 20}}>Meeting: {this.state.meetings.name}</Text>
        <Text style={{fontSize: 20}}>Participants:</Text>
        {this.state.meetings.participants.map((participant: { name: string | React.ReactElement<{}, string | React.JSXElementConstructor<any>> | undefined; }) => (
            <Chip
              containerStyle={{alignItems: 'baseline', paddingRight: 10}}
              title={participant.name}
              iconRight
            />
          ))}
        </View>
      </SafeAreaProvider>
    );
  }

  getData = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('meetings');
      if (jsonValue) {
        this.setState({
          meetings: JSON.parse(jsonValue)
        })
      }
      
    } catch (e) {}
  };
}

export default MeetingsList;
