import AsyncStorage from '@react-native-async-storage/async-storage';
import {firebase} from '@react-native-firebase/database';
import React, {Component} from 'react';
import {ImageBackground, ScrollView, TextInput, View} from 'react-native';
import {Card, Icon, Text} from 'react-native-elements';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import MeetingDTO from '../interfaces/MeetingDTO';

interface State {
  meetings: MeetingDTO[];
}

interface Props {
  navigation: any;
}

let meetings: MeetingDTO[] = [];

let textInput: TextInput | null;

let unsubscribe: any;

class MeetingsList extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    console.log(props);

    this.state = {
      meetings: meetings,
    };

    // this.getData();
  }

  componentDidMount() {
    console.log('hete rif');
    const {navigation} = this.props;
    unsubscribe = navigation.addListener('focus', () => {
      this.getData();
    });
  }

  componentWillUnmount() {
    unsubscribe();
  }

  public render() {
    return (
      <SafeAreaProvider>
        <ImageBackground
          source={require('../assets/bg.jpg')}
          resizeMode="cover"
          style={{flex: 1}}>
          <View style={{flex: 1, backgroundColor: 'rgba(255, 255, 255, 0.8)'}}>
            <Text
              style={{
                fontSize: 30,
                paddingLeft: 15,
                paddingTop: 15,
                paddingBottom: 15,
                fontWeight: 'bold',
              }}>
              Meetings
            </Text>
            <ScrollView>
              {this.state.meetings.map(meeting => (
                <Card>
                  <View
                    style={{
                      flexDirection: 'row',
                      flex: 1,
                      alignItems: 'center',
                      height: 60,
                    }}>
                    <View style={{flexDirection: 'row', flex: 1}}>
                      <Text style={{fontWeight: 'bold'}}>{meeting.date}</Text>
                      <Text style={{fontWeight: 'bold'}}>{meeting.name}</Text>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                      }}>
                      <Icon
                        name="microphone"
                        type="font-awesome"
                        color="#BB3E03"
                        size={30}
                        onPress={() => this.meet(meeting)}
                      />
                      <Icon
                        name="edit"
                        type="font-awesome"
                        color="#005F73"
                        size={30}
                        containerStyle={{paddingLeft: 20}}
                      />
                    </View>
                  </View>
                </Card>
              ))}
              <View style={{height: 90}}></View>
            </ScrollView>
            <View style={{position: 'absolute', bottom: 15, right: 15}}>
              <Icon
                raised
                name="plus"
                size={30}
                type="font-awesome"
                reverse={true}
                color="#0A9396"
                onPress={() => this.createMeeting()}
              />
            </View>
          </View>
        </ImageBackground>
      </SafeAreaProvider>
    );
  }

  getData = async () => {
    const result = await AsyncStorage.getItem('meetings');
    // firebase
    //   .database()
    //   .ref('/meetings')
    //   .once('value')
    //   .then(snapshot => {
    //     meetings = snapshot.val();
    //   });
    if (result) {
      this.setState({meetings: JSON.parse(result)});
      // if (this.state.meetings.length === 0) {
      //   firebase
      //     .database()
      //     .ref('/meetings')
      //     .once('value')
      //     .then(snapshot => {
      //       meetings = snapshot.val();
      //     });
      // }
    } else {
      this.setState({meetings: meetings})
    }
  };

  meet = async (meeting: MeetingDTO) => {
    await AsyncStorage.setItem('selectedMeeting', JSON.stringify(meeting));

    this.props.navigation.navigate('OngoingTags');
  };

  createMeeting = () => {
    console.log('he');
    this.props.navigation.navigate('CreateMeeting');
  };
}

export default MeetingsList;
