import AsyncStorage from '@react-native-async-storage/async-storage';
import {firebase} from '@react-native-firebase/database';
// import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import React, {Component} from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  ImageBackground,
  ListRenderItem,
  PermissionsAndroid,
  Platform,
  ScrollView,
  Text,
  TouchableOpacityBase,
  View,
} from 'react-native';
import AudioRecorderPlayer, {
  AudioEncoderAndroidType,
  AudioSet,
  AudioSourceAndroidType,
  AVEncoderAudioQualityIOSType,
  AVEncodingOption,
  RecordBackType,
} from 'react-native-audio-recorder-player';
import {Switch} from 'react-native-elements';
import {Chip} from 'react-native-elements/dist/buttons/Chip';
import {Divider} from 'react-native-elements/dist/divider/Divider';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import uuid from 'react-native-uuid';
import RNFetchBlob from 'rn-fetch-blob';
import MeetingDTO from '../interfaces/MeetingDTO';
import RNHTMLtoPDF from 'react-native-html-to-pdf';

interface State {
  recordSecs: number;
  recordTime: string;
  currentPositionSec: number;
  currentDurationSec: number;
  isRecording: boolean;
  startTime: string;
  meeting: MeetingDTO;
  customTags: Array<string>;
  addedTags: AddedTag[];
}

interface Props {
  navigation: any;
}

export interface AddedTag {
  time: string;
  tag: string;
}

interface AudioData {
  name: string;
  duration: string;
  fileId: string;
}

const getData = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem('selectedMeeting');
    const result = await AsyncStorage.getItem('customTags');
    console.log('ye2');
    if (jsonValue && result) {
      meeting: JSON.parse(jsonValue);
      customTags: JSON.parse(result);
    }
  } catch (e) {}
};

var meeting: MeetingDTO;

const screenWidth = Dimensions.get('screen').width;

var isRecording = false;

let tags: AddedTag[] = [];

let customTags: string[] = [];

let scrollView: FlatList | null;

let focusListener: any;

let unsubscribe: any;

var time: string;

const renderItem: ListRenderItem<AddedTag> = ({item}) => (
  <View
    style={{
      flexDirection: 'row',
      paddingBottom: 5,
      alignItems: 'center',
    }}>
    <Text style={{fontSize: 17, paddingRight: 10}}>{item.time}</Text>
    <Divider orientation="vertical" />
    <Chip
      containerStyle={{
        alignItems: 'baseline',
        paddingLeft: 10,
      }}
      buttonStyle={{
        minWidth: 70,
      }}
      title={item.tag}
    />
  </View>
);

class OngoingTags extends Component<any, State> {
  private audioRecorderPlayer: AudioRecorderPlayer;
  private interval: any;

  private recordSecs = 0;
  private recordTime = '';

  private audioSet: AudioSet = {
    AudioEncoderAndroid: AudioEncoderAndroidType.AAC,
    AudioSourceAndroid: AudioSourceAndroidType.MIC,
    AVEncoderAudioQualityKeyIOS: AVEncoderAudioQualityIOSType.high,
    AVNumberOfChannelsKeyIOS: 2,
    AVFormatIDKeyIOS: AVEncodingOption.aac,
  };

  private audioData: AudioData = {
    name: 'teste',
    duration: '',
    fileId: '',
  };

  private fbstorage = storage();

  constructor(props: Props) {
    super(props);

    this.state = {
      recordSecs: 0,
      recordTime: '00:00:00',
      currentPositionSec: 0,
      currentDurationSec: 0,
      meeting: {
        name: '',
        participants: [],
        subjects: [],
        date: '',
        time: '',
        isRecording: false,
      },
      addedTags: tags,
      customTags: customTags,

      isRecording: false,
      startTime: '00:00:00',
    };

    this.audioRecorderPlayer = new AudioRecorderPlayer();
    this.audioRecorderPlayer.setSubscriptionDuration(0.1); // optional. Default is 0.5

    // focusListener = this.props.navigation.addListener('focus', () => {
    //   this.getData();
    // });

    this.getData();
  }

  public render() {
    return (
      <SafeAreaProvider>
        <ImageBackground
          source={require('../assets/bg.jpg')}
          resizeMode="cover"
          style={{flex: 1}}>
          <View
            style={{
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              flex: 1,
            }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                width: '100%',
                alignItems: 'center',
                paddingTop: 5,
                paddingBottom: 5,
              }}>
              <Text
                style={{
                  fontSize: 19,
                  paddingLeft: 10,
                  fontWeight: 'bold',
                }}>
                {this.state.meeting.name}
              </Text>
              <Chip
                containerStyle={{
                  alignItems: 'baseline',
                  paddingRight: 5,
                }}
                buttonStyle={{
                  backgroundColor: '#BB3E03',
                }}
                title={'Finish Meeting'}
                onPress={() => this.confirmFinishMeeting()}
              />
            </View>
            <View
              style={{
                borderTopWidth: 0.2,
                paddingLeft: 10,
                width: '100%',
                flex: 1,
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  height: '100%',
                }}>
                <ScrollView horizontal>
                  <FlatList
                    windowSize={10}
                    removeClippedSubviews={true}
                    ref={ref => {
                      scrollView = ref;
                    }}
                    onContentSizeChange={() => {
                      scrollView
                        ? scrollView.scrollToEnd({animated: true})
                        : null;
                    }}
                    data={this.state.addedTags}
                    renderItem={renderItem}></FlatList>
                </ScrollView>
                <View style={{width: '50%', borderLeftWidth: 0.2}}>
                  <ScrollView>
                    <View style={{borderBottomWidth: 0.2}}>
                      <Text
                        style={{
                          fontSize: 17,
                          paddingBottom: 10,
                          textAlign: 'center',
                        }}>
                        Participants
                      </Text>

                      <View
                        style={{
                          flexDirection: 'row',
                          flexWrap: 'wrap',
                          justifyContent: 'center',
                        }}>
                        {this.state.meeting.participants.map(
                          (participant, i) => (
                            <Chip
                              key={i}
                              containerStyle={{
                                alignItems: 'baseline',
                                paddingRight: 3,
                                paddingTop: 3,
                                paddingBottom: 3,
                              }}
                              title={participant.name}
                              onPress={() => this.addTag(participant.name)}
                            />
                          ),
                        )}
                      </View>
                    </View>
                    <View style={{borderBottomWidth: 0.2}}>
                      <View>
                        <Text
                          style={{
                            fontSize: 17,
                            paddingBottom: 10,
                            textAlign: 'center',
                          }}>
                          Subjects:
                        </Text>
                        <View
                          style={{
                            flexDirection: 'row',
                            flexWrap: 'wrap',
                            justifyContent: 'center',
                          }}>
                          {this.state.meeting.subjects.map((subject, i) => (
                            <Chip
                              key={i}
                              containerStyle={{
                                alignItems: 'baseline',
                                paddingRight: 5,
                                paddingTop: 3,
                                paddingBottom: 3,
                              }}
                              title={subject.name}
                              onPress={() => this.addTag(subject.name)}
                            />
                          ))}
                        </View>
                      </View>
                    </View>
                    <View>
                      <View>
                        <Text
                          style={{
                            fontSize: 17,
                            paddingBottom: 10,
                            textAlign: 'center',
                          }}>
                          Custom tags:
                        </Text>
                        <View
                          style={{
                            flexDirection: 'row',
                            flexWrap: 'wrap',
                            justifyContent: 'center',
                          }}>
                          {this.state.customTags.map((tag, i) => (
                            <Chip
                              key={i}
                              containerStyle={{
                                alignItems: 'baseline',
                                paddingRight: 5,
                                paddingBottom: 3,
                              }}
                              title={tag}
                              onPress={() => this.addTag(tag)}
                            />
                          ))}
                        </View>
                      </View>
                    </View>
                  </ScrollView>
                </View>
              </View>
            </View>

            <View
              style={{
                flexDirection: 'row',
                width: '100%',
                justifyContent: 'space-evenly',
                alignItems: 'center',
                height: 100,
                borderTopWidth: 0.2,
              }}>
              <View
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Text style={{fontSize: 50}}>{this.state.recordTime}</Text>
              </View>
              <View>
                <View
                  style={{
                    justifyContent: 'space-evenly',
                    alignItems: 'center',
                    borderRadius: 4,
                    height: '100%',
                  }}>
                  <Switch
                    value={this.state.isRecording}
                    onChange={() => this.setRecordingState()}
                    style={{transform: [{scaleX: 1.7}, {scaleY: 1.7}]}}
                    color="#AE2012"
                  />
                  <Text
                    style={{fontSize: 23, paddingRight: 10, paddingLeft: 10}}>
                    Rec
                  </Text>
                </View>
                {/* {this.state.isRecording ? (
                  <Button
                    raised
                    type="solid"
                    containerStyle={{
                      height: 60,
                      width: 60,
                      borderRadius: 200,
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                    icon={
                      <Icon
                        size={40}
                        style={{fontSize: 100}}
                        name="pause"
                        type="font-awesome"
                        color="#001219"
                        onPress={this.onPauseRecord}
                      />
                    }
                  />
                ) : (
                  <Button
                    raised
                    type="solid"
                    containerStyle={{
                      height: 60,
                      width: 60,
                      borderRadius: 200,
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                    icon={
                      <Icon
                        size={40}
                        style={{fontSize: 100}}
                        name="circle"
                        type="font-awesome"
                        color="#AE2012"
                        onPress={
                          this.state.recordSecs > 0
                            ? this.onResumeRecord
                            : this.onStartRecord
                        }
                      />
                    }
                  />
                )} */}
                {/* <Button
                  raised
                  type="solid"
                  containerStyle={{
                    height: 60,
                    width: 60,
                    borderRadius: 200,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginLeft: 20,
                    marginRight: 20,
                  }}
                  icon={
                    <Icon
                      name="stop"
                      type="font-awesome"
                      color="#001219"
                      onPress={this.onStopRecord}
                    />
                  }
                /> */}
                {/* <Button
                  raised
                  type="solid"
                  containerStyle={{
                    height: 60,
                    width: 60,
                    borderRadius: 200,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                  icon={
                    <Icon name="save" type="font-awesome" color="#0A9396" />
                  }
                /> */}
              </View>
            </View>
          </View>
        </ImageBackground>
      </SafeAreaProvider>
    );
  }

  getData = async () => {
    console.log('entrou');
    try {
      console.log('try');
      console.log('1');

      const customTags = await AsyncStorage.getItem('customTags');
      const selectedMeeting = await AsyncStorage.getItem('selectedMeeting');
      console.log('2');

      if (selectedMeeting) {
        this.setState({
          meeting: JSON.parse(selectedMeeting),
        });
      }
      console.log('3');
      if (customTags) {
        this.setState({
          customTags: JSON.parse(customTags),
        });
      }
      console.log('4');

    } catch (e) {}

    this.audioRecorderPlayer = new AudioRecorderPlayer();
  };

  componentDidMount() {
    const {navigation} = this.props;
    this.getPermissions();
    unsubscribe = navigation.addListener('focus', () => {
      //call your function that update component
      console.log('what');
      this.getData();
      this.audioRecorderPlayer
    });
  }

  componentWillUnmount() {
    clearInterval(this.interval);
    unsubscribe();
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

  // componentDidMount = async () => {
  //   this.getData();

  // if (Platform.OS === 'android') {
  //   try {
  //     const grants = await PermissionsAndroid.requestMultiple([
  //       PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
  //       PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
  //       PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
  //     ]);

  //     if (
  //       grants['android.permission.WRITE_EXTERNAL_STORAGE'] ===
  //         PermissionsAndroid.RESULTS.GRANTED &&
  //       grants['android.permission.READ_EXTERNAL_STORAGE'] ===
  //         PermissionsAndroid.RESULTS.GRANTED &&
  //       grants['android.permission.RECORD_AUDIO'] ===
  //         PermissionsAndroid.RESULTS.GRANTED
  //     ) {
  //     } else {
  //       console.log('All required permissions not granted');
  //       return;
  //     }
  //   } catch (err) {
  //     console.warn(err);
  //     return;
  //   }
  // }
  // };

  addTag = (tagName: string) => {
    // let tags = this.state.addedTags;

    let tag: AddedTag = {
      time: this.state.recordTime,
      tag: tagName,
    };

    // tags.push(tag);

    this.setState(prevState => ({
      addedTags: [...prevState.addedTags, tag],
    }));

    // this.setState({addedTags: tags});
  };

  // getData = async () => {
  //   this.setState({points: []});
  //   try {
  //     const jsonValue = await AsyncStorage.getItem('meetings');
  //     if (jsonValue) {
  //       this.setState({
  //         meeting: JSON.parse(jsonValue),
  //       });
  //     }
  //   } catch (e) {}
  // };

  private onStartRecord = async () => {
    // const audioSet: AudioSet = {
    //   AudioEncoderAndroid: AudioEncoderAndroidType.AAC,
    //   AudioSourceAndroid: AudioSourceAndroidType.MIC,
    //   AVEncoderAudioQualityKeyIOS: AVEncoderAudioQualityIOSType.high,
    //   AVNumberOfChannelsKeyIOS: 2,
    //   AVFormatIDKeyIOS: AVEncodingOption.aac,
    // };

    let dirs = RNFetchBlob.fs.dirs;
    const id = uuid.v4();
    const path = dirs.DownloadDir + '/' + this.state.meeting.name + '.mp3';

    this.audioData.fileId = id.toString();

    const uri = await this.audioRecorderPlayer
      .startRecorder(path, this.audioSet)
      .catch(error => {
        console.log('erro', error);
      });

      console.log('ue')

    this.audioRecorderPlayer.addRecordBackListener((e: RecordBackType) => {
      this.setState({
        // this.recordSecs = e.currentPosition;
        // this.recordTime = this.msToTime(e.currentPosition);
        // console.log('guys', this.recordTime, this.recordSecs);
        // console.log('state', this.state);
        recordSecs: e.currentPosition,
        recordTime: this.msToTime(e.currentPosition),
      });
    });

    this.setState({isRecording: true, startTime: this.state.recordTime});

    // this.interval = setInterval(() => this.setState({ recordSecs: this.recordSecs, recordTime: this.recordTime }), 1000);
  };

  private msToTime = (duration: number) => {
    let seconds = Math.floor((duration / 1000) % 60),
      minutes = Math.floor((duration / (1000 * 60)) % 60),
      hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

    let hoursC = hours < 10 ? '0' + hours : hours,
      minutesC = minutes < 10 ? '0' + minutes : minutes,
      secondsC = seconds < 10 ? '0' + seconds : seconds;

    return hoursC + ':' + minutesC + ':' + secondsC;
  };

  private onPauseRecord = async () => {
    this.setState({isRecording: false});
    try {
      await this.audioRecorderPlayer.pauseRecorder();
    } catch (err) {
      console.log('pauseRecord', err);
    }
  };

  private onResumeRecord = async () => {
    await this.audioRecorderPlayer.resumeRecorder();
    this.setState({startTime: this.state.recordTime, isRecording: true});
  };

  private onStopRecord = async () => {
    const result = await this.audioRecorderPlayer.stopRecorder();
    console.log('result', result);
    this.saveAudioInFirebase();
    this.audioRecorderPlayer.removeRecordBackListener();
  };

  setRecordingState() {

    console.log('state', this.state.isRecording)


    if (this.state.recordSecs > 0) {
      if (this.state.isRecording) {
        console.log('pause')
        this.onPauseRecord();
      } else {
        console.log('resume')
        this.onResumeRecord();
      }
    } else {
      console.log('gsdlkjh')
      this.onStartRecord();
    }
  }

  confirmFinishMeeting() {
    Alert.alert('Are you sure you want to finish the meeting?', undefined, [
      {
        text: 'No',
      },
      {text: 'Yes', onPress: () => this.finishMeeting()},
    ]);
  }

  finishMeeting = async () => {
    const result = await this.audioRecorderPlayer.stopRecorder();
    this.audioRecorderPlayer.removeRecordBackListener();
    console.log('result', result);
    await this.createPDF();

    Alert.alert(
      'Meeting finished, audio and document saved in storage',
      undefined,
      [{text: 'Ok', onPress: () => this.props.navigation.navigate('Meetings')}],
    );

    let finishedMeeting = {
      meeting: this.state.meeting,
      addedTags: this.state.addedTags,
    };

    let archivied = await AsyncStorage.getItem('archive');

    if (archivied) {
      let parsedArchive = JSON.parse(archivied);
      parsedArchive.push(finishedMeeting);
      await AsyncStorage.setItem('archive', JSON.stringify(parsedArchive));
    } else {
      let newArchive = [];
      newArchive.push(finishedMeeting);
      await AsyncStorage.setItem('archive', JSON.stringify(newArchive));
    }

    this.removeMeeting();
  };

  removeMeeting = async () => {
    const selectedMeeting = await AsyncStorage.getItem('selectedMeeting');
    const meetings = await AsyncStorage.getItem('meetings');

    if (selectedMeeting && meetings) {
      const newList = JSON.parse(meetings);
      const newItem = JSON.parse(selectedMeeting);

      newList.splice(newList.indexOf(newItem), 1);

      await AsyncStorage.setItem('meetings', JSON.stringify(newList));
    }

    await AsyncStorage.removeItem('selectedMeeting');

    this.cleanAndExit();
  };

  cleanAndExit() {
    this.setState({
      recordSecs: 0,
      recordTime: '00:00:00',
      currentPositionSec: 0,
      currentDurationSec: 0,
      meeting: {
        name: '',
        participants: [],
        subjects: [],
        date: '',
        time: '',
        isRecording: false,
      },
      addedTags: tags,
      customTags: customTags,

      isRecording: false,
      startTime: '00:00:00',
    });
    this.props.navigation.navigate('Meetings');
  }

  private saveAudioInFirebase = async () => {
    let dirs = RNFetchBlob.fs.dirs;
    const path = dirs.DownloadDir + '/' + this.state.meeting.name + '.mp4';

    const newReference = firebase.database().ref('/audioData').push();

    var fbstorage = storage();

    fbstorage
      .ref(this.state.meeting.name + 'audio')
      .putFile(path)
      .then(result => {
        console.log('foi!', result);
      })
      .catch(error => {
        console.log('erro', error);
      });
  };

  private createPDF = async () => {
    let dirs = RNFetchBlob.fs.dirs;
    const path = dirs.DownloadDir;

    console.log(path);

    let options = {
      html: this.createHtml(),
      fileName: this.state.meeting.name,
      directory: '/Download/',
    };

    console.log('si');

    // RNFetchBlob.fs.createFile(path + 'asd.txt', this.createHtml(), 'base64');

    let file = await RNHTMLtoPDF.convert(options);
    console.log(file.filePath);
    // alert(file.filePath);

    // this.savePDFInFirebase();
  };

  private createHtml = () => {
    const {meeting, addedTags} = this.state;
    const htmlReport =
      '<h1>Meeting: ' +
      meeting.name +
      '</h1> \n <h2>Participants: \n' +
      (meeting.participants.map(participant => {
        return participant.name;
      }) +
        ' ') +
      '<h2>Subjects: ' +
      (meeting.subjects.map(subject => {
        return subject.name + ' ';
      }) +
        ' ') +
      '</h2> <p>--------------------------------------------------------</p>' +
      addedTags.map(point => {
        return '<p>' + point.time + ' - ' + point.tag + '</p>';
      }) +
      '</ul> <p>--------------------------------------------------------</p>';
    return htmlReport;
  };
}

export default OngoingTags;
