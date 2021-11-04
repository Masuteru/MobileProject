import AsyncStorage from '@react-native-async-storage/async-storage';
import {firebase} from '@react-native-firebase/database';
// import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import {useFocusEffect} from '@react-navigation/core';
import React, {Component, ElementRef, useEffect, useState} from 'react';
import {
  Dimensions,
  FlatList,
  ImageBackground,
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
import {Divider} from 'react-native-elements/dist/divider/Divider';
import {Icon} from 'react-native-elements/dist/icons/Icon';
import {TextElement} from 'react-native-elements/dist/text/Text';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import {SafeAreaProvider} from 'react-native-safe-area-context';
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
  customTags: Array<string>;
  addedTags: AddedTag[];
}

interface Props {
  navigation: any;
}

interface AddedTag {
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
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              flex: 1,
            }}>
            <View>
              <View
                style={{
                  flexDirection: 'row',
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
                    <Icon name="save" type="font-awesome" color="#0A9396" />
                  }
                />
              </View>
            </View>

            <View
              style={{
                paddingTop: 10,
                paddingBottom: 10,
                paddingLeft: 10,
                width: '100%',
                flex: 1,
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
              }}>
              <View
                style={{
                  flexDirection: 'row',
                }}>
                <ScrollView horizontal>
                  <FlatList
                  windowSize={10}
                    ref={ref => {
                      scrollView = ref;
                    }}
                    onContentSizeChange={() => {
                      scrollView
                        ? scrollView.scrollToEnd({animated: true})
                        : null;
                    }}
                    data={this.state.addedTags}
                    renderItem={({item}) => (
                      <View
                        style={{
                          flexDirection: 'row',
                          paddingBottom: 5,
                          alignItems: 'center',
                        }}>
                        <Text style={{fontSize: 17, paddingRight: 10}}>
                          {item.time}
                        </Text>
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
                    )}></FlatList>
                </ScrollView>
                <View style={{width: '50%', borderLeftWidth: 0.2}}>
                  <ScrollView>
                    <View>
                      <Text
                        style={{
                          fontSize: 17,
                          paddingBottom: 10,
                          textAlign: 'center',
                        }}>
                        Participants:
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
                    <View>
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
                                paddingRight: 10,
                                paddingTop: 3,
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
                                paddingRight: 10,
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

      console.log(this.state);
    } catch (e) {}
  };

  componentDidMount() {
    const {navigation} = this.props;
    this.getPermissions();
    unsubscribe = navigation.addListener('focus', () => {
      //call your function that update component
      console.log('what');
      this.getData();
    });
  }

  componentWillUnmount() {
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
    let tags = this.state.addedTags;

    let tag: AddedTag = {
      time: this.state.recordTime,
      tag: tagName,
    };

    tags.push(tag);

    this.setState({addedTags: tags});
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
    ).catch(error => {
      console.log('erro', error)
    });

    this.audioRecorderPlayer.addRecordBackListener((e: RecordBackType) => {
      this.setState({
        recordSecs: e.currentPosition,
        recordTime: this.msToTime(e.currentPosition),
        // recordTime: this.audioRecorderPlayer.mmssss(
        //   Math.floor(e.currentPosition),
        // ),
      });
    });

    this.setState({isRecording: true, startTime: this.state.recordTime});
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
