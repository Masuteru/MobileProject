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

const styles: any = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#455A64',
    flexDirection: 'column',
    alignItems: 'center',
  },
  titleTxt: {
    marginTop: 100,
    color: 'white',
    fontSize: 28,
  },
  viewRecorder: {
    marginTop: 40,
    width: '100%',
    alignItems: 'center',
  },
  recordBtnWrapper: {
    flexDirection: 'row',
  },
  viewPlayer: {
    marginTop: 60,
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  viewBarWrapper: {
    marginTop: 28,
    marginHorizontal: 28,
    alignSelf: 'stretch',
  },
  viewBar: {
    backgroundColor: '#ccc',
    height: 4,
    alignSelf: 'stretch',
  },
  viewBarPlay: {
    backgroundColor: 'white',
    height: 4,
    width: 0,
  },
  playStatusTxt: {
    marginTop: 8,
    color: '#ccc',
  },
  playBtnWrapper: {
    flexDirection: 'row',
    marginTop: 40,
  },
  btn: {
    borderColor: 'white',
    borderWidth: 1,
  },
  txt: {
    color: 'white',
    fontSize: 14,
    marginHorizontal: 8,
    marginVertical: 4,
  },
  txtRecordCounter: {
    marginTop: 32,
    color: 'white',
    fontSize: 20,
    textAlignVertical: 'center',
    fontWeight: '200',
    fontFamily: 'Helvetica Neue',
    letterSpacing: 3,
  },
  txtCounter: {
    marginTop: 12,
    color: 'white',
    fontSize: 20,
    textAlignVertical: 'center',
    fontWeight: '200',
    fontFamily: 'Helvetica Neue',
    letterSpacing: 3,
  },
});

interface State {
  isLoggingIn: boolean;
  recordSecs: number;
  recordTime: string;
  currentPositionSec: number;
  currentDurationSec: number;
  playTime: string;
  duration: string;
}

const screenWidth = Dimensions.get('screen').width;

class Recording2 extends Component<any, State> {
  private audioRecorderPlayer: AudioRecorderPlayer;

  constructor(props: any) {
    super(props);
    this.state = {
      isLoggingIn: false,
      recordSecs: 0,
      recordTime: '00:00:00',
      currentPositionSec: 0,
      currentDurationSec: 0,
      playTime: '00:00:00',
      duration: '00:00:00',
    };

    this.audioRecorderPlayer = new AudioRecorderPlayer();
    this.audioRecorderPlayer.setSubscriptionDuration(0.1); // optional. Default is 0.5
  }

  public render() {
    let playWidth =
      (this.state.currentPositionSec / this.state.currentDurationSec) *
      (screenWidth - 56);

    if (!playWidth) {
      playWidth = 0;
    }

    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.titleTxt}>Audio Recorder Player</Text>
        <Text style={styles.txtRecordCounter}>{this.state.recordTime}</Text>
        <View style={styles.viewRecorder}>
          <View style={styles.recordBtnWrapper}>
            <Text style={styles.btn} onPress={this.onStartRecord}>
              Record
            </Text>
            <Text
              style={[
                styles.btn,
                {
                  marginLeft: 12,
                },
              ]}
              onPress={this.onPauseRecord}>
              Pause
            </Text>
            <Text
              style={[
                styles.btn,
                {
                  marginLeft: 12,
                },
              ]}
              onPress={this.onResumeRecord}>
              Resume
            </Text>
            <Text
              style={[styles.btn, {marginLeft: 12}]}
              onPress={this.onStopRecord}>
              Stop
            </Text>
          </View>
        </View>
        <View style={styles.viewPlayer}>
          {/* <Slider
            style={{width: 200, height: 40}}
            minimumValue={0}
            maximumValue={300}
            minimumTrackTintColor="#FFFFFF"
            maximumTrackTintColor="#000000"
          /> */}
          <TouchableOpacity
            style={styles.viewBarWrapper}
            onPress={this.onStatusPress}>
            <View style={styles.viewBar}>
              <View style={[styles.viewBarPlay, {width: playWidth}]} />
            </View>
          </TouchableOpacity>
          <Text style={styles.txtCounter}>
            {this.state.playTime} / {this.state.duration}
          </Text>
          <View style={styles.playBtnWrapper}>
            <Text style={styles.btn} onPress={this.onStartPlay}>
              Play
            </Text>
            <Text
              style={[
                styles.btn,
                {
                  marginLeft: 12,
                },
              ]}
              onPress={this.onPausePlay}>
              Pause
            </Text>
            <Text
              style={[
                styles.btn,
                {
                  marginLeft: 12,
                },
              ]}
              onPress={this.onResumePlay}>
              Resume
            </Text>
            <Text
              style={[
                styles.btn,
                {
                  marginLeft: 12,
                },
              ]}
              onPress={this.onStopPlay}>
              Stop
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

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

    const audioSet: AudioSet = {
      AudioEncoderAndroid: AudioEncoderAndroidType.AAC,
      AudioSourceAndroid: AudioSourceAndroidType.MIC,
      AVEncoderAudioQualityKeyIOS: AVEncoderAudioQualityIOSType.high,
      AVNumberOfChannelsKeyIOS: 2,
      AVFormatIDKeyIOS: AVEncodingOption.aac,
    };

    console.log('audioSet', audioSet);

    let dirs = RNFetchBlob.fs.dirs;
    const path = dirs.DocumentDir + '/audio.mp4';

    console.log(path)

    //? Custom path
    const uri = await this.audioRecorderPlayer.startRecorder(path, audioSet);

    //? Default path
    // const uri = await this.audioRecorderPlayer.startRecorder(
    //   undefined,
    //   audioSet,
    // );

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
    try {
      await this.audioRecorderPlayer.pauseRecorder();
    } catch (err) {
      console.log('pauseRecord', err);
    }
  };

  private onResumeRecord = async () => {
    await this.audioRecorderPlayer.resumeRecorder();
  };

  private onStopRecord = async () => {
    const result = await this.audioRecorderPlayer.stopRecorder();
    this.audioRecorderPlayer.removeRecordBackListener();
    this.setState({
      recordSecs: 0,
    });
    console.log(result);
  };

  private onStartPlay = async () => {
    console.log('onStartPlay');

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

    //? Custom path
    // const msg = await this.audioRecorderPlayer.startPlayer(this.path);

    console.log(RNFetchBlob.fs.dirs.DownloadDir + '/audio.mp4')

    const path = RNFetchBlob.fs.dirs.DownloadDir + '/audio.mp4';

    //? Default path
    const msg = await this.audioRecorderPlayer.startPlayer(path);
    const volume = await this.audioRecorderPlayer.setVolume(1.0);
    console.log(`file: ${msg}`, `volume: ${volume}`);

    // const uri = await this.audioRecorderPlayer.startRecorder(path, audioSet);

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
    await this.audioRecorderPlayer.pausePlayer();
  };

  private onResumePlay = async () => {
    await this.audioRecorderPlayer.resumePlayer();

    storage()
      .ref('tryingto')
      .getDownloadURL()
      .then(result => {
        console.log(result);

        const {config, fs} = RNFetchBlob;
        let PictureDir = fs.dirs.DownloadDir + '/audio.mp4'; // this is the pictures directory. You can check the available directories in the wiki.
        let options = {
          fileCache: true,
          addAndroidDownloads: {
            useDownloadManager: true, // setting it to true will use the device's native download manager and will be shown in the notification bar.
            notification: false,
            path: PictureDir, // this is the path where your downloaded file will live in
            description: 'Downloading image.',
          },
        };

        console.log('lets')
        
        config(options)
          .fetch('GET', result)
          .then(res => {
            console.log(res);
          })
          .catch(error => {
            console.log(error);
          });
      });
  };

  private onStopPlay = async () => {
    console.log('onStopPlay');
    // this.audioRecorderPlayer.stopPlayer();
    // this.audioRecorderPlayer.removePlayBackListener();

    let dirs = RNFetchBlob.fs.dirs;
    const path = dirs.DocumentDir + '/audio.mp4';

    var fbstorage = storage();

    fbstorage
      .ref('tryingto')
      .putFile(path)
      .then(result => {
        console.log('foi!', result);
      })
      .catch(error => {
        console.log('erro', error);
      });
  };
}

export default Recording2;
