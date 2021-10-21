import AsyncStorage from '@react-native-async-storage/async-storage';
import {firebase} from '@react-native-firebase/database';
// import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import React, {Component} from 'react';
import {
  Dimensions,
  PermissionsAndroid,
  Platform,
  SafeAreaView,
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
  RecordBackType,
} from 'react-native-audio-recorder-player';
import {BottomSheet, Card, ListItem, Overlay} from 'react-native-elements';
import {Button} from 'react-native-elements/dist/buttons/Button';
import {Chip} from 'react-native-elements/dist/buttons/Chip';
import {Icon} from 'react-native-elements/dist/icons/Icon';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import uuid from 'react-native-uuid';
import RNFetchBlob from 'rn-fetch-blob';
import AddCommentModal from '../components/AddCommentModal';
import AddTagsModal from '../components/AddTagsModal';
import MeetingDTO from '../interfaces/MeetingDTO';

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
  addCommentVisible: boolean;
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
      addCommentVisible: false,
    };

    this.audioRecorderPlayer = new AudioRecorderPlayer();
    this.audioRecorderPlayer.setSubscriptionDuration(0.1); // optional. Default is 0.5

    this.getData();
  }

  public render() {
    return (
      <SafeAreaView>
        <View
          style={{
            height: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
          <Text style={{fontSize: 25, paddingBottom: 15, paddingTop: 15}}>
            Meeting: {this.state.meeting.name}
          </Text>

          <ScrollView
            style={{height: 200, width: '100%', backgroundColor: '#FBF8EF'}}>
            {this.state.points.map(point => (
              <Card>
                <Text style={{fontSize: 15}}>
                  {point.startTime} {point.attendee}
                </Text>
              </Card>
            ))}
          </ScrollView>

          {!this.state.isEditing ? (
            <Card containerStyle={{width: '90%'}}>
              <Text style={{fontSize: 17, paddingBottom: 15}}>
                Attendee: {this.state.currentAttendee}
              </Text>
              <Text style={{fontSize: 17, paddingBottom: 15}}>
                Subject: {this.state.currentSubject}
              </Text>
              <Text style={{fontSize: 17, paddingBottom: 15}}>
                Start time: {this.state.startTime}
              </Text>
              <View style={{flexDirection: 'row', justifyContent: 'flex-end'}}>
                <Chip
                  containerStyle={{
                    alignItems: 'baseline',
                    paddingRight: 10,
                    height: 40,
                  }}
                  titleStyle={{fontSize: 13}}
                  buttonStyle={{
                    backgroundColor: '#0A9396',
                  }}
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
                  titleStyle={{fontSize: 13}}
                  buttonStyle={{
                    backgroundColor: '#0A9396',
                  }}
                  title="Add comment"
                  iconRight
                  onPress={this.toggleCommentOverlay}
                />
                <Chip
                  containerStyle={{
                    alignItems: 'baseline',
                    paddingRight: 10,
                    height: 40,
                  }}
                  buttonStyle={{
                    backgroundColor: '#9B2226',
                  }}
                  titleStyle={{fontSize: 13}}
                  title="Finish subject"
                  iconRight
                  onPress={this.finishSubject}
                />
              </View>
            </Card>
          ) : (
            <Card containerStyle={{width: '90%'}}>
              <View
                style={{
                  alignItems: 'center',
                  flexDirection: 'row',
                  paddingBottom: 15,
                  height: 50,
                }}>
                <Text style={{fontSize: 15}}>Selected attendee: </Text>
                {this.state.currentAttendee ? (
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <Text style={{fontSize: 17, paddingRight: 10}}>
                      {this.state.currentAttendee}
                    </Text>
                    <Icon
                      size={25}
                      style={{fontSize: 100}}
                      name="edit"
                      type="evilicons"
                      color="#94D2BD"
                      onPress={this.toggleAddAttendant}
                    />
                  </View>
                ) : (
                  <Chip
                    containerStyle={{
                      alignItems: 'baseline',
                      paddingLeft: 5,
                    }}
                    buttonStyle={{
                      backgroundColor: '#94D2BD',
                      width: 80,
                    }}
                    titleStyle={{fontSize: 12}}
                    title="Select..."
                    iconRight
                    onPress={this.toggleAddAttendant}
                  />
                )}
              </View>
              <View
                style={{
                  alignItems: 'center',
                  flexDirection: 'row',
                  paddingBottom: 15,
                  height: 50,
                }}>
                <Text style={{fontSize: 15}}>Selected subject: </Text>
                {this.state.currentSubject ? (
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <Text style={{fontSize: 17, paddingRight: 10}}>
                      {this.state.currentSubject}
                    </Text>
                    <Icon
                      size={25}
                      style={{fontSize: 100}}
                      name="edit"
                      type="evilicons"
                      color="#94D2BD"
                      onPress={this.toggleAddSubject}
                    />
                  </View>
                ) : (
                  <Chip
                    containerStyle={{
                      alignItems: 'baseline',
                      paddingLeft: 15,
                    }}
                    buttonStyle={{
                      backgroundColor: '#94D2BD',
                      width: 80,
                    }}
                    titleStyle={{fontSize: 12}}
                    title="Select..."
                    iconRight
                    onPress={this.toggleAddSubject}
                  />
                )}
              </View>

              <View style={{alignItems: 'flex-end', width: '100%'}}>
                <Chip
                  containerStyle={{
                    alignItems: 'baseline',
                    paddingRight: 10,
                  }}
                  buttonStyle={{
                    backgroundColor: '#0A9396',
                    width: 80,
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
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Text style={{fontSize: 50}}>{this.state.recordTime}</Text>
            </View>
            <View
              style={{
                flexDirection: 'row',
                height: 80,
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
                    color="#0A9396"
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

          <Overlay
            animationType="slide"
            isVisible={this.state.addCommentVisible}
            onBackdropPress={this.toggleCommentOverlay}>
            <AddCommentModal
              tagMoment={this.state.tagMoment}
              finishAdding={this.addCommentToPoint}></AddCommentModal>
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
    this.setState({points: []});
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
    const path = dirs.DownloadDir + '/' + this.state.meeting.name + '.mp4';

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
    console.log('result', result);
    this.saveAudioInFirebase();
    this.audioRecorderPlayer.removeRecordBackListener();
  };

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

  private finishSubject = () => {
    let currentPoint = this.state.currentPoint;
    currentPoint.startTime = this.state.startTime;
    currentPoint.endTime = this.state.recordTime;
    currentPoint.attendee = this.state.currentAttendee;
    currentPoint.subject = this.state.currentSubject;

    let points = this.state.points;

    console.log('current', currentPoint);

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

    this.savePDFInFirebase();
  };

  private createHtml = () => {
    const {meeting, points} = this.state;
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
      points.map(point => {
        return (
          '<p>Attendee: ' +
          point.attendee +
          '</p> <p>Subject: ' +
          point.subject +
          '</p> <p>Start time: ' +
          point.startTime +
          '</p> <p>End time: ' +
          point.endTime +
          '</p> <p>Tags: <ul>' +
          point.tags.map(tag => {
            return (
              '<li>' + tag.tagTime + ' ' + tag.tagsName.toString() + '</li>'
            );
          }) +
          '</ul> <p>--------------------------------------------------------</p>'
        );
      });
    return htmlReport;
  };

  toggleCommentOverlay = () => {
    this.setState({
      addCommentVisible: !this.state.addCommentVisible,
      tagMoment: this.state.recordTime,
    });
  };

  addCommentToPoint = (comment: string) => {
    this.state.currentPoint.tags.push({
      tagsName: [comment],
      tagTime: this.state.tagMoment,
    });
    this.toggleCommentOverlay();
  };

  private savePDFInFirebase = async () => {
    let dirs = RNFetchBlob.fs.dirs;
    const path = dirs.DownloadDir + '/' + this.state.meeting.name + '.pdf';

    console.log(path);

    var fbstorage = storage();

    fbstorage
      .ref(this.state.meeting.name + 'pdf')
      .putFile(path)
      .then(result => {
        console.log('foi!', result);
      })
      .catch(error => {
        console.log('erro', error);
      });
  };
}

export default Recording;
