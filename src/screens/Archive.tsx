import AsyncStorage from '@react-native-async-storage/async-storage';
import {firebase} from '@react-native-firebase/database';
import React, {Component} from 'react';
import {
  ImageBackground,
  PermissionsAndroid,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import {Card, Icon, Text} from 'react-native-elements';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import MeetingDTO from '../interfaces/MeetingDTO';
import {AddedTag} from './OngoingTags';

interface State {
  meetings: [{addedTags: AddedTag[]; meeting: MeetingDTO}];
  isRecording: boolean;
}

interface Props {
  navigation: any;
}

let meetings: any = [];

let textInput: TextInput | null;

let unsubscribe: any;

const styles = StyleSheet.create({
  card: {
    borderRadius: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 20,
      height: 20,
    },
    shadowOpacity: 0.8,
    shadowRadius: 8.84,
    elevation: 5,
  },
  recording: {
    borderWidth: 2,
    borderColor: '#BB3E03',
  },
  notRecording: {
    borderWidth: 0,
  },
});

class Archive extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    console.log(props);

    this.state = {
      meetings: meetings,
      isRecording: false,
    };

    this.getPermissions();
  }

  getPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        const grants = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        ]);

        if (
          grants['android.permission.WRITE_EXTERNAL_STORAGE'] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          grants['android.permission.READ_EXTERNAL_STORAGE'] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          grants['android.permission.RECORD_AUDIO'] ===
            PermissionsAndroid.RESULTS.GRANTED
        ) {
        } else {
          console.log('All required permissions not granted');
          return;
        }
      } catch (err) {
        console.warn(err);
        return;
      }
    }
  };

  componentDidMount() {
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
              Archive
            </Text>
            <ScrollView>
              {this.state.meetings.map((meeting, index) => (
                <Card
                  key={index}
                  containerStyle={[styles.notRecording, styles.card]}>
                  <View
                    style={{
                      flexDirection: 'row',
                      flex: 1,
                      alignItems: 'center',
                      height: 60,
                    }}>
                    <View
                      style={{
                        flexDirection: 'row',
                        flex: 1,
                        alignItems: 'center',
                      }}>
                      <View
                        style={{
                          alignItems: 'center',
                          justifyContent: 'space-evenly',
                          paddingRight: 20,
                        }}>
                        <Text style={{fontWeight: 'bold'}}>
                          {meeting.meeting.date}
                        </Text>
                        <Text style={{fontWeight: 'bold'}}>
                          {meeting.meeting.time}
                        </Text>
                      </View>
                      <Text style={{fontWeight: 'bold'}}>
                        {meeting.meeting.name}
                      </Text>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                      }}>
                      <Icon
                        name="clipboard"
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
          </View>
        </ImageBackground>
      </SafeAreaProvider>
    );
  }

  getData = async () => {
    const result = await AsyncStorage.getItem('archive');
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
      this.setState({meetings: meetings});
    }

    console.log(this.state.meetings);
  };

  // meet = async (meeting: MeetingDTO, index: number) => {
  //   await AsyncStorage.setItem('selectedMeeting', JSON.stringify(meeting));

  //   let meetings = this.state.meetings;

  //   meetings[index].isRecording = true;

  //   this.setState({meetings: meetings, isRecording: true});

  //   await AsyncStorage.setItem('meetings', JSON.stringify(meetings));

  //   this.props.navigation.navigate('OngoingTags');
  // };

  createMeeting = () => {
    this.props.navigation.navigate('CreateMeeting');
  };
}

export default Archive;
