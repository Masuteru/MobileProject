import {Text, View} from 'react-native';
import React, {Component} from 'react';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {SpeedDial} from 'react-native-elements';
import {Slider} from 'react-native-elements/dist/slider/Slider';
import RNFetchBlob from 'rn-fetch-blob';
import AudioRecorderPlayer, { PlayBackType } from 'react-native-audio-recorder-player';
import { Icon } from 'react-native-elements/dist/icons/Icon';

interface State {
  isLoggingIn: boolean;
  recordSecs: number;
  recordTime: string;
  currentPositionSec: number;
  currentDurationSec: number;
  playTime: string;
  duration: string;
}

class Meetings extends Component<any, State> {
  public audioRecorderPlayer: AudioRecorderPlayer;

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
    return (
      <SafeAreaProvider>
        <View
          style={{flex: 1, alignItems: 'stretch', justifyContent: 'center'}}>
          
          <Slider
            value={this.state.currentPositionSec}
            
          />
          <Text>Value: {this.state.currentPositionSec}</Text>
        </View>
        <Icon  raised  name='heartbeat'  type='font-awesome'  color='#f50'  onPress={this.onStartPlay} />
      </SafeAreaProvider>
    );
  }

  private async onStartPlay() {
    let file = '/audio';
    const path = RNFetchBlob.fs.dirs.DownloadDir + file + '.mp4';
    // const msg = await this.audioRecorderPlayer.startPlayer(path);
    // const volume = await this.audioRecorderPlayer.setVolume(1.0);
    console.log(path)

    await this.audioRecorderPlayer.startPlayer(path);
    await this.audioRecorderPlayer.setVolume(1.0);

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
  }
}

export default Meetings
