import {Text, View} from 'react-native';
import React, {Component} from 'react';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {SpeedDial} from 'react-native-elements';
import {Slider} from 'react-native-elements/dist/slider/Slider';
import RNFetchBlob from 'rn-fetch-blob';
import AudioRecorderPlayer, {
  PlayBackType,
} from 'react-native-audio-recorder-player';
import {Icon} from 'react-native-elements/dist/icons/Icon';
import storage from '@react-native-firebase/storage';

interface State {
  isLoggingIn: boolean;
  recordSecs: number;
  recordTime: string;
  currentPositionSec: number;
  currentDurationSec: number;
  playTime: string;
  duration: string;
}

interface Props {}

class Tags extends Component<any, State> {
  private audioRecorderPlayer: AudioRecorderPlayer;
  private test = 'test';

  constructor(props: any) {
    super(props);
    console.log('porp', props);
    this.props.children;
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
    return (
      <SafeAreaProvider>
        <View
          style={{flex: 1, alignItems: 'stretch', justifyContent: 'center'}}>
          <Slider value={this.state.currentPositionSec} maximumValue={3392} onValueChange={value => {this.audioRecorderPlayer.seekToPlayer(value)}}/>
          <Text>CurrentPositionSec: {this.state.currentPositionSec}</Text>
          <Text>RecordTime: {this.state.recordTime}</Text>
          <Text>DurationSec: {this.state.currentDurationSec}</Text>
          <Text>Playtime: {this.state.playTime}</Text>
          <Text>Duration: {this.state.duration}</Text>
        </View>
        <Icon
          raised
          name="play"
          type="font-awesome"
          color="#f50"
          onPress={this.onStartPlay}
        />
        <Icon
          raised
          name="pause"
          type="font-awesome"
          color="#f50"
          onPress={this.onPause}
        />
      </SafeAreaProvider>
    );
  }

  componentDidMount = () => {
    this.audioRecorderPlayer.addPlayBackListener((e: PlayBackType) => {
      this.setState({
        currentPositionSec: e.currentPosition,
        currentDurationSec: e.duration,
        playTime: this.audioRecorderPlayer.mmssss(
          Math.floor(e.currentPosition),
        ),
        duration: this.audioRecorderPlayer.mmssss(Math.floor(e.duration)),
      });
      console.log('uhul');
    });
  }

  getConvertedDuration = () => {
    let time = this.state.duration;
    var a = time.split(':'); // split it at the colons

    // minutes are worth 60 seconds. Hours are worth 60 minutes.
    var seconds = (+a[0]) * 60 + (+a[1]); 
    console.log('here', seconds)
  }

  onStartPlay = async () => {
    
    
    let file = '/audio';
    const path = RNFetchBlob.fs.dirs.DownloadDir + file + '.mp4';
    // const msg = await this.audioRecorderPlayer.startPlayer(path);
    // const volume = await this.audioRecorderPlayer.setVolume(1.0);
    console.log(path);

    await this.audioRecorderPlayer.startPlayer(path);
    await this.audioRecorderPlayer.setVolume(1.0);

    console.log('ue');

    
  }

  onPause = async () => {
    this.audioRecorderPlayer.pausePlayer();
  }

  setPlaybackData = async () => {
    let file = '/audio';
    const path = RNFetchBlob.fs.dirs.DownloadDir + file + '.mp4';

     await this.audioRecorderPlayer.startPlayer(path);
     await this.audioRecorderPlayer.setVolume(1.0);
  }
}

export default Tags;