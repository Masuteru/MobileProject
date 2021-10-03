import AudioRecorderPlayer, {
  AVEncoderAudioQualityIOSType,
  AVEncodingOption,
  AudioEncoderAndroidType,
  AudioSet,
  AudioSourceAndroidType,
  PlayBackType,
  RecordBackType,
} from 'react-native-audio-recorder-player';
import {
  Dimensions,
  PermissionsAndroid,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native';
import React, {Component} from 'react';
import Slider from '@react-native-community/slider';
// import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import RNFetchBlob from 'rn-fetch-blob';
import uuid from 'react-native-uuid';
import {Icon} from 'react-native-elements/dist/icons/Icon';
import database from '@react-native-firebase/database';
import {Chip} from 'react-native-elements/dist/buttons/Chip';
import {Button} from 'react-native-elements/dist/buttons/Button';
import MeetingDTO from '../interfaces/MeetingDTO';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  BottomSheet,
  Card,
  Input,
  ListItem,
  Overlay,
} from 'react-native-elements';
import ChipIterator from '../components/AddTagsModal';
import AddTagsModal from '../components/AddTagsModal';
import RNHTMLtoPDF from 'react-native-html-to-pdf'

interface State {
  isLoggingIn: boolean;
  recordSecs: number;
  recordTime: string;
  currentPositionSec: number;
  currentDurationSec: number;
  isRecording: boolean;
  currentAttendee: string;
  currentSubject: string;
  startTime: string;
  visible: boolean;

  tagMoment: string;

  points: Point[];

  currentPoint: {
    attendee: string;
    subject: string;
    startTime: string;
    endTime: string;
    tags: [
      {
        tagsName: string[];
        tagTime: string;
      },
    ];
  };

  meeting: MeetingDTO;
  addAttVisible: boolean;
  addSubVisible: boolean;
  isEditing: boolean;
}

interface AudioData {
  name: string;
  duration: string;
  fileId: string;
}

interface Point {
  attendee: string;
  subject: string;
  startTime: string;
  endTime: string;
  tags: [
    {
      tagsName: string[];
      tagTime: string;
    },
  ];
}

const screenWidth = Dimensions.get('screen').width;

var isRecording = false;

class Recording extends Component<any, State> {
  private audioRecorderPlayer: AudioRecorderPlayer;
  private points: Point[];

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
  // private fbDatabase = database();

  constructor(props: any) {
    super(props);

    this.points = [];

    this.state = {
      isLoggingIn: false,
      recordSecs: 0,
      recordTime: '00:00:00',
      currentPositionSec: 0,
      currentDurationSec: 0,
      meeting: {
        name: '',
        participants: [],
        subjects: [],
      },
      currentAttendee: '',
      currentSubject: '',
      isRecording: false,
      startTime: '00:00:00',
      visible: false,
      tagMoment: '00:00:00',
      points: this.points,
      currentPoint: {
        attendee: '',
        subject: '',
        startTime: '',
        endTime: '',
        tags: [
          {
            tagsName: [],
            tagTime: '',
          },
        ],
      },
      addAttVisible: false,
      addSubVisible: false,
      isEditing: true,
    };

    this.audioRecorderPlayer = new AudioRecorderPlayer();
    this.audioRecorderPlayer.setSubscriptionDuration(0.1); // optional. Default is 0.5
  }

  public render() {
    return (
      <SafeAreaView>
        <View
          style={{
            height: '100%',
            display: 'flex',
            justifyContent: 'space-between',
          }}>
          <Text style={{fontSize: 20}}>Meeting: {this.state.meeting.name}</Text>

          <ScrollView style={{height: 200, backgroundColor: 'purple'}}>
            {this.state.points.map(point => (
              <Card>
                <Text style={{fontSize: 15}}>
                  Current attendee: {point.attendee}
                </Text>
                <Text style={{fontSize: 15}}>
                  Current subject: {point.subject}
                </Text>
                <Text style={{fontSize: 15}}>
                  Start time: {point.startTime}
                </Text>
                <Text style={{fontSize: 15}}>End time: {point.endTime}</Text>
              </Card>
            ))}
          </ScrollView>

          {!this.state.isEditing ? (
            <Card>
              <Text style={{fontSize: 15}}>
                Attendee: {this.state.currentAttendee}
              </Text>
              <Text style={{fontSize: 15}}>
                Subject: {this.state.currentSubject}
              </Text>
              <Text style={{fontSize: 15}}>
                Start time: {this.state.startTime}
              </Text>
              <View style={{flexDirection: 'row'}}>
                <Chip
                  containerStyle={{
                    alignItems: 'baseline',
                    paddingRight: 10,
                    height: 40,
                  }}
                  titleStyle={{fontSize: 13}}
                  title="Add tag"
                  iconRight
                  onPress={this.toggleOverlay}
                />
                <Chip
                  containerStyle={{
                    alignItems: 'baseline',
                    paddingRight: 10,
                    height: 40,
                  }}
                  buttonStyle={{
                    backgroundColor: 'red',
                  }}
                  titleStyle={{fontSize: 13}}
                  title="Finish subject"
                  iconRight
                  onPress={this.finishSubject}
                />
              </View>
            </Card>
          ) : (
            <Card>
              <Text style={{fontSize: 15}}>
                Selected attendee:
                {this.state.currentAttendee ? (
                  <View style={{flexDirection: 'row'}}>
                    <Text>{this.state.currentAttendee}</Text>
                    <Icon
                      size={20}
                      style={{fontSize: 100}}
                      name="edit"
                      type="font-awesome"
                      color="red"
                      onPress={this.toggleAddAttendant}
                    />
                  </View>
                ) : (
                  <Chip
                    containerStyle={{
                      alignItems: 'baseline',
                      paddingRight: 10,
                      height: 40,
                    }}
                    buttonStyle={{
                      backgroundColor: 'red',
                    }}
                    titleStyle={{fontSize: 12}}
                    title="Select..."
                    iconRight
                    onPress={this.toggleAddAttendant}
                  />
                )}
              </Text>
              <Text style={{fontSize: 15}}>
                Selected subject:{' '}
                {this.state.currentSubject ? (
                  <View style={{flexDirection: 'row'}}>
                    <Text>{this.state.currentSubject}</Text>
                    <Icon
                      size={20}
                      style={{fontSize: 100}}
                      name="edit"
                      type="font-awesome"
                      color="red"
                      onPress={this.toggleAddSubject}
                    />
                  </View>
                ) : (
                  <Chip
                    containerStyle={{
                      alignItems: 'baseline',
                      paddingRight: 10,
                      height: 40,
                    }}
                    buttonStyle={{
                      backgroundColor: 'red',
                    }}
                    titleStyle={{fontSize: 12}}
                    title="Select..."
                    iconRight
                    onPress={this.toggleAddSubject}
                  />
                )}
              </Text>
              <Text style={{fontSize: 15}}>
                Start time: {this.state.startTime}
              </Text>
              <View style={{flexDirection: 'row'}}>
                <Chip
                  containerStyle={{
                    alignItems: 'baseline',
                    paddingRight: 10,
                    height: 40,
                  }}
                  buttonStyle={{
                    backgroundColor: 'green',
                  }}
                  titleStyle={{fontSize: 13}}
                  title="Set"
                  iconRight
                  onPress={() => this.setState({isEditing: false})}
                />
              </View>
            </Card>
          )}

          <View style={{}}>
            <View
              style={{
                flexDirection: 'row',
                alignContent: 'center',
                justifyContent: 'center',
                width: '100%',
              }}>
              <Text style={{fontSize: 50}}>{this.state.recordTime}</Text>
            </View>
            <View
              style={{
                flexDirection: 'row',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: 100,
                width: '100%',
              }}>
              {this.state.isRecording ? (
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
                      color="red"
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
                      color="red"
                      onPress={
                        this.state.recordSecs > 0
                          ? this.onResumeRecord
                          : this.onStartRecord
                      }
                    />
                  }
                />
              )}
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
                    name="stop"
                    type="font-awesome"
                    color="black"
                    onPress={this.onStopRecord}
                  />
                }
              />
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
                    name="save"
                    type="font-awesome"
                    color="#f50"
                    onPress={this.createPDF}
                  />
                }
                onPress={this.createPDF}
              />
            </View>
          </View>

          <Overlay
            animationType="slide"
            isVisible={this.state.visible}
            onBackdropPress={this.toggleOverlay}>
            <AddTagsModal
              participants={this.state.meeting.participants}
              subjects={this.state.meeting.subjects}
              tagMoment={this.state.tagMoment}
              finishAdding={this.addTagsToPoint}></AddTagsModal>
          </Overlay>

          <BottomSheet
            isVisible={this.state.addAttVisible}
            containerStyle={{backgroundColor: 'rgba(0.5, 0.25, 0, 0.2)'}}>
            {this.state.meeting.participants.map((l, i) => (
              <ListItem key={i} onPress={() => this.addAttendee(l.name)}>
                <ListItem.Content>
                  <ListItem.Title>{l.name}</ListItem.Title>
                </ListItem.Content>
              </ListItem>
            ))}
            <ListItem
              containerStyle={{backgroundColor: 'red'}}
              onPress={() => this.setState({addAttVisible: false})}>
              <ListItem.Content>
                <ListItem.Title style={{color: 'white'}}>
                  {'Cancel'}
                </ListItem.Title>
              </ListItem.Content>
            </ListItem>
          </BottomSheet>

          <BottomSheet
            isVisible={this.state.addSubVisible}
            containerStyle={{backgroundColor: 'rgba(0.5, 0.25, 0, 0.2)'}}>
            {this.state.meeting.subjects.map((l, i) => (
              <ListItem key={i} onPress={() => this.addSubject(l.name)}>
                <ListItem.Content>
                  <ListItem.Title>{l.name}</ListItem.Title>
                </ListItem.Content>
              </ListItem>
            ))}
            <ListItem
              containerStyle={{backgroundColor: 'red'}}
              onPress={() => this.setState({addSubVisible: false})}>
              <ListItem.Content>
                <ListItem.Title style={{color: 'white'}}>
                  {'Cancel'}
                </ListItem.Title>
              </ListItem.Content>
            </ListItem>
          </BottomSheet>
        </View>
      </SafeAreaView>
    );
  }

  componentDidMount = async () => {
    this.getData();

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

  getData = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('meetings');
      if (jsonValue) {
        this.setState({
          meeting: JSON.parse(jsonValue),
        });
      }
    } catch (e) {}
  };

  toggleAddAttendant = () => {
    this.setState({
      addAttVisible: !this.state.addAttVisible,
    });
  };

  toggleAddSubject = () => {
    this.setState({
      addSubVisible: !this.state.addSubVisible,
    });
  };

  toggleOverlay = () => {
    this.setState({
      visible: !this.state.visible,
      tagMoment: this.state.recordTime,
    });
  };

  addTagsToPoint = (data: Array<string>) => {
    this.state.currentPoint.tags.push({
      tagsName: data,
      tagTime: this.state.tagMoment,
    });
    this.toggleOverlay();
  };

  addTag = () => {};

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
    const path = dirs.DocumentDir + '/' + id.toString() + '.mp4';

    this.audioData.fileId = id.toString();

    const uri = await this.audioRecorderPlayer.startRecorder(
      path,
      this.audioSet,
    );

    this.audioRecorderPlayer.addRecordBackListener((e: RecordBackType) => {
      this.setState({
        recordSecs: e.currentPosition,
        recordTime: this.audioRecorderPlayer.mmssss(
          Math.floor(e.currentPosition),
        ),
      });
    });

    this.setState({isRecording: true, startTime: this.state.recordTime});
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
    this.audioRecorderPlayer.removeRecordBackListener();
  };

  private saveAudioInFirebase = async () => {
    let dirs = RNFetchBlob.fs.dirs;
    const path = dirs.DocumentDir + '/' + this.audioData.fileId + '.mp4';

    // const newReference = database().ref('/audioData').push();

    // newReference.set(this.audioData).then(() => {
    //   this.fbstorage
    //     .ref(this.audioData.fileId)
    //     .putFile(path)
    //     .then(result => {
    //       console.log('foi!', result);
    //     })
    //     .catch(error => {
    //       console.log('erro', error);
    //     });
    // });
  };

  private finishSubject = () => {
    let currentPoint = this.state.currentPoint;
    currentPoint.startTime = this.state.startTime;
    currentPoint.endTime = this.state.recordTime;
    currentPoint.attendee = this.state.currentAttendee;
    currentPoint.subject = this.state.currentSubject;

    let points = this.state.points;

    console.log('current', currentPoint)

    points.push(currentPoint);
    this.setState({points});
    this.clearCurrentPoint();
    console.log(this.state.points);
  };

  private clearCurrentPoint = () => {
    this.setState({
      currentPoint: {
        attendee: '',
        subject: '',
        startTime: '',
        endTime: '',
        tags: [
          {
            tagsName: [],
            tagTime: '',
          },
        ],
      },
      isEditing: true,
    });
  };

  private addAttendee = (name: string) => {
    this.setState({currentAttendee: name, addAttVisible: false});
  };

  private addSubject = (name: string) => {
    this.setState({currentSubject: name, addSubVisible: false});
  };

  private createPDF = async () => {
    let options = {
      html: this.createHtml(),
      fileName: 'test',
      directory: RNFetchBlob.fs.dirs.DownloadDir,
    };

    console.log('si');

    let file = await RNHTMLtoPDF.convert(options)
    console.log(file.filePath);
    // alert(file.filePath);
  }

  private createHtml = () => {
    const { meeting, points } = this.state;
    const htmlReport = '<h1>Meeting: ' + meeting.name + '</h1> <h2>Participants: ' + meeting.participants.map(participant => {
      return participant.name
    }) + 
    '</h2> <p>--------------------------------------------------------</p>' + points.map(point => {
      return '<p>Attendee: ' + point.attendee + '</p> <p>Subject: ' + point.subject + '</p> <p>Attendee: ' + point.attendee + '</p>'
    })
    return htmlReport
  }
}

export default Recording;
