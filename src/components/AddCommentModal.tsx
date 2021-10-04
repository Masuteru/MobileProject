import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {Component} from 'react';
import {View} from 'react-native';
import {Chip, Icon, Text} from 'react-native-elements';
import { Button } from 'react-native-elements/dist/buttons/Button';
import { color } from 'react-native-elements/dist/helpers';
import { Input } from 'react-native-elements/dist/input/Input';
import MeetingDTO from '../interfaces/MeetingDTO';

interface Props {
  finishAdding: any;
  tagMoment: string;
}

interface State {
  comment: string;
}

let currentData: Array<string>;




export default class AddCommentModal extends Component<Props, State> {

  

  constructor(props: any) {
    super(props);
    // console.log('props', props);
    this.state = {
      comment: '',
    };
  }

  render() {
    return (
      <View style={{minHeight: 350, width: 300}}>
        <Text style={{fontSize: 20}}>Add comment at {this.props.tagMoment}</Text>
        <Input numberOfLines={5} onChangeText={text => this.setState({comment: text})}></Input>
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
                  title="Cancel"
                  iconRight
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
                  onPress={() => this.saveComment()}
                />
              </View>
      </View>
    );
  }

saveComment = () => {
  this.props.finishAdding(this.state.comment)
}
  


}
