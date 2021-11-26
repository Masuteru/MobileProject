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
  View,
} from 'react-native';
import AudioRecorderPlayer, {
  AudioEncoderAndroidType,
  AudioSet,
  AudioSourceAndroidType,
  AVEncoderAudioQualityIOSType,
  AVEncodingOption,
  PlayBackType,
  RecordBackType,
} from 'react-native-audio-recorder-player';
import {Slider, Switch} from 'react-native-elements';
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
  playTime: string;
  duration: string;
  started: boolean;
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

class ArchivedMeeting extends Component<any, State> {
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

      playTime: '',

      isRecording: false,
      startTime: '00:00:00',
      duration: '',
      started: false,
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
                Archive: {this.state.meeting.name}
              </Text>
            </View>
            <View
              style={{
                borderTopWidth: 0.2,
                borderBottomWidth: 0.2,
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
                            />
                          ))}
                        </View>
                      </View>
                    </View>
                  </ScrollView>
                </View>
              </View>
            </View>
            <View style={{width: '90%'}}>
              <Slider
              
                value={this.state.currentPositionSec}
                maximumValue={this.state.currentDurationSec}
                onValueChange={value => {
                  this.seekAudio(value);
                }}
                thumbTintColor='#005F73'
                thumbStyle={{ height: 30, width: 30}}
              />
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
                <Text style={{fontSize: 50}}>{this.msToTime(this.state.currentPositionSec)}</Text>
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
                    onChange={() => this.setPlayState()}
                    style={{transform: [{scaleX: 1.7}, {scaleY: 1.7}]}}
                    color="#005F73"
                  />
                  <Text
                    style={{fontSize: 23, paddingRight: 10, paddingLeft: 10}}>
                    Playback
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
    try {
      const selectedMeeting = await AsyncStorage.getItem('selectedArchive');

      if (selectedMeeting) {
        let parsed = JSON.parse(selectedMeeting);
        this.setState({
          meeting: parsed.meeting,
          addedTags: parsed.addedTags,
        });

        console.log('state', this.state);
      }
    } catch (e) {}
    this.audioRecorderPlayer = new AudioRecorderPlayer();
  };

  componentDidMount() {
    const {navigation} = this.props;
    this.getPermissions();
    unsubscribe = navigation.addListener('focus', () => {
      //call your function that update component
      console.log('what');
      this.clearData();
      this.getData();
    });
  }

  clearData() {
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

      playTime: '',

      isRecording: false,
      startTime: '00:00:00',
      duration: '',
      started: false,
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

  setRecordingState() {
    if (this.state.recordSecs > 0) {
      if (this.state.isRecording) {
        this.onPauseRecord();
      } else {
        this.onResumeRecord();
      }
    } else {
      this.onStartRecord();
    }
  }

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
      '</h1> <h2>Participants: ' +
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

  private onStartPlay = async () => {
    console.log('onStartPlay');
    //? Custom path
    let dirs = RNFetchBlob.fs.dirs;
    const msg = await this.audioRecorderPlayer.startPlayer(dirs.DownloadDir + '/' + this.state.meeting.name + '.mp3');

    //? Default path
    // const msg = await this.audioRecorderPlayer.startPlayer();
    const volume = await this.audioRecorderPlayer.setVolume(1.0);
    console.log(`file: ${msg}`, `volume: ${volume}`);

    this.setState({isRecording: true, started: true});

    this.audioRecorderPlayer.addPlayBackListener((e: PlayBackType) => {
      this.setState({
        currentPositionSec: e.currentPosition,
        currentDurationSec: e.duration,
        playTime: this.audioRecorderPlayer.mmssss(
          Math.floor(e.currentPosition),
        ),
        duration: this.audioRecorderPlayer.mmssss(Math.floor(e.duration)),
      });
    });
  };

  private onPausePlay = async () => {
    this.setState({isRecording: false});
    await this.audioRecorderPlayer.pausePlayer();
  };

  private onResumePlay = async () => {
    this.setState({isRecording: true});
    await this.audioRecorderPlayer.resumePlayer();
  };

  setPlayState() {
    console.log(this.state.started)
    if (this.state.started) {
      if (this.state.isRecording) {
        this.onPausePlay();
      } else {
        this.onResumePlay();
      }
    } else {
      this.onStartPlay();
    }
  }

  private seekAudio(value: number) {
    let convertedValue = Math.floor(this.state.currentDurationSec / value)
    console.log(convertedValue)
    this.audioRecorderPlayer.seekToPlayer(convertedValue)
  }
}

export default ArchivedMeeting;
