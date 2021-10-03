import React, {Component} from 'react';
import {View} from 'react-native';
import {Chip, Icon, Text} from 'react-native-elements';
import { Button } from 'react-native-elements/dist/buttons/Button';
import { color } from 'react-native-elements/dist/helpers';
import MeetingDTO from '../interfaces/MeetingDTO';

interface Props {
  participants: Array<any>;
  subjects: Array<any>;
  finishAdding: any;
  tagMoment: string;
}

interface State {
  currentData: Array<string>;
}

let currentData: Array<string>;



export default class AddTagsModal extends Component<Props, State> {

  

  constructor(props: any) {
    super(props);
    // console.log('props', props);
    this.state = {
      currentData: [],
    };

    currentData = [];
  }

  render() {

    

    return (
      <View style={{minHeight: 350, width: 300, alignItems: 'center'}}>
        <Text style={{fontSize: 20}}>Add tags at {this.props.tagMoment}</Text>
        <View>
          <View>
            <Text style={{fontSize: 20}}>Participants:</Text>

            <View style={{flexDirection: 'row'}}>
              {this.props.participants.map(participant => (
                <Chip
                  containerStyle={{
                    alignItems: 'baseline',
                    paddingRight: 10,
                  }}
                  title={participant.name}
                  iconRight
                  onPress={() => this.addTag(participant.name)}
                />
              ))}
            </View>
          </View>
          <Text style={{fontSize: 20}}>Subjects:</Text>
          <View style={{flexDirection: 'row'}}>
            {this.props.subjects.map(subject => (
              <Chip
                containerStyle={{
                  alignItems: 'baseline',
                  paddingRight: 10,
                }}
                title={subject.name}
                iconRight
                onPress={() => this.addTag(subject.name)}
              />
            ))}
          </View>
          <Text style={{fontSize: 20}}>Added tags: </Text>
          <View style={{flexDirection: 'row'}}>
            {this.state.currentData.map(tag => (
              <Chip
                containerStyle={{
                  alignItems: 'baseline',
                  paddingRight: 10,
                }}
                title={tag}
                iconRight
                icon={
                  <Icon
                    size={20}
                    style={{fontSize: 100, paddingLeft: 5}}
                    name="close"
                    type="font-awesome"
                    color="white"
                    //   onPress={() => this.removeTag(participant)}
                  />
                }
              />
            ))}
          </View>
          <Chip
            containerStyle={{
              alignItems: 'baseline',
              paddingRight: 10,
            }}
            buttonStyle={{
              backgroundColor: 'green'
            }}
            title="Add tags"
            iconRight
            onPress={this.saveEdit}
          />
        </View>
      </View>
    );
  }

  addTag = (tag: string) => {
    currentData.push(tag);
    console.log(currentData)
    this.setState({currentData: currentData});
    // console.log(this.state);
  };

  saveEdit = () => {
    this.props.finishAdding(currentData)
  }


}
