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
  recordSecs: number;
  recordTime: string;
  currentPositionSec: number;
  currentDurationSec: number;
  isRecording: boolean;
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

class OngoingTags extends Component<any, State> {
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

  constructor(props: any) {
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
      },


      isRecording: false,
      startTime: '00:00:00',




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
            alignItems: 'center',
          }}>
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
                  />
                }
              />
            </View>
          </View>


          <Card containerStyle={{width: '90%'}}>
          <Text style={{fontSize: 17, paddingBottom: 15}}>
                Participants: 
              </Text>
          </Card>





        </View>
      </SafeAreaView>
    );
  }

  componentDidMount = async () => {

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
}


export default OngoingTags;
