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
} from 'react-native';
import React, {Component} from 'react';
import Slider from '@react-native-community/slider';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import RNFetchBlob from 'rn-fetch-blob';
import uuid from 'react-native-uuid';
import {Icon} from 'react-native-elements/dist/icons/Icon';
import database from '@react-native-firebase/database';
import {Chip} from 'react-native-elements/dist/buttons/Chip';
import {Button} from 'react-native-elements/dist/buttons/Button';
import MeetingDTO from '../interfaces/MeetingDTO';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

  meeting: MeetingDTO;
}

interface AudioData {
  name: string;
  duration: string;
  fileId: string;
}

const screenWidth = Dimensions.get('screen').width;

var isRecording = false;

class Recording extends Component<any, State> {
  private audioRecorderPlayer: AudioRecorderPlayer;

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
  private fbDatabase = database();

  constructor(props: any) {
    super(props);
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
      startTime: '',
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
          <View>
            <View>
              <Text style={{fontSize: 20}}>
                Meeting: {this.state.meeting.name}
              </Text>
              <Text style={{fontSize: 20}}>Participants:</Text>
              <View style={{flexDirection: 'row'}}>
                {this.state.meeting.participants.map(
                  (participant
                  ) => (
                    <Chip
                      containerStyle={{
                        alignItems: 'baseline',
                        paddingRight: 10,
                      }}
                      title={participant.name}
                      iconRight
                      onPress={() => this.setState({currentAttendee: participant.name})}
                    />
                  ),
                )}
              </View>
            </View>
            <Text style={{fontSize: 20}}>Subjects:</Text>
            <View style={{flexDirection: 'row'}}>
              {this.state.meeting.subjects.map(subject => (
                <Chip
                  containerStyle={{alignItems: 'baseline', paddingRight: 10}}
                  title={subject.name}
                  iconRight
                  onPress={() => this.setState({currentSubject: subject.name})}
                />
              ))}
            </View>
          </View>

          
          <Text style={{fontSize: 20}}>Current attendee: {this.state.currentAttendee}</Text>
          <Text style={{fontSize: 20}}>Current subject: {this.state.currentSubject}</Text>
          <Text style={{fontSize: 20}}>Start time: {this.state.startTime}</Text>

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
                    onPress={this.saveAudioInFirebase}
                  />
                }
              />
            </View>
          </View>
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

        console.log('write external stroage', grants);

        if (
          grants['android.permission.WRITE_EXTERNAL_STORAGE'] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          grants['android.permission.READ_EXTERNAL_STORAGE'] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          grants['android.permission.RECORD_AUDIO'] ===
            PermissionsAndroid.RESULTS.GRANTED
        ) {
          console.log('permissions granted');
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

  private onStatusPress = (e: any) => {
    const touchX = e.nativeEvent.locationX;
    console.log(`touchX: ${touchX}`);
    const playWidth =
      (this.state.currentPositionSec / this.state.currentDurationSec) *
      (screenWidth - 56);
    console.log(`currentPlayWidth: ${playWidth}`);

    const currentPosition = Math.round(this.state.currentPositionSec);

    if (playWidth && playWidth < touchX) {
      const addSecs = Math.round(currentPosition + 1000);
      this.audioRecorderPlayer.seekToPlayer(addSecs);
      console.log(`addSecs: ${addSecs}`);
    } else {
      const subSecs = Math.round(currentPosition - 1000);
      this.audioRecorderPlayer.seekToPlayer(subSecs);
      console.log(`subSecs: ${subSecs}`);
    }
  };

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

    this.setState({isRecording: true, startTime: this.state.recordTime});

    this.audioRecorderPlayer.addRecordBackListener((e: RecordBackType) => {
      console.log('record-back', e);
      this.setState({
        recordSecs: e.currentPosition,
        recordTime: this.audioRecorderPlayer.mmssss(
          Math.floor(e.currentPosition),
        ),
      });
    });

    
    console.log(`uri: ${uri}`);
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
    this.setState({startTime: this.state.recordTime, isRecording: true})
  };

  private onStopRecord = async () => {
    const result = await this.audioRecorderPlayer.stopRecorder();
    this.audioRecorderPlayer.removeRecordBackListener();
    console.log(result);
  };

  private saveAudioInFirebase = async () => {
    let dirs = RNFetchBlob.fs.dirs;
    const path = dirs.DocumentDir + '/' + this.audioData.fileId + '.mp4';

    const newReference = database().ref('/audioData').push();

    newReference.set(this.audioData).then(() => {
      this.fbstorage
        .ref(this.audioData.fileId)
        .putFile(path)
        .then(result => {
          console.log('foi!', result);
        })
        .catch(error => {
          console.log('erro', error);
        });
    });
  };
}

export default Recording;
