import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {Component} from 'react';
import {View} from 'react-native';
import {Chip, Icon, Input, Text} from 'react-native-elements';
import {Button} from 'react-native-elements/dist/buttons/Button';
import {color} from 'react-native-elements/dist/helpers';
import MeetingDTO from '../interfaces/MeetingDTO';
import {Divider} from 'react-native-elements/dist/divider/Divider';

interface Props {
  tagsTitle: string;
  tagsOptions: Array<any>;
  participants?: Array<any>;
  subjects?: Array<any>;
  finishAdding?: any;
  cancel: any;
  tagMoment?: string;
}

interface State {
  currentData: Array<any>;
  customTags: Array<string>;
  tagsToAdd: Array<string>;
}

let currentData: Array<any>;

var particpantName = '';

export default class AddTagsModal extends Component<Props, State> {
  constructor(props: any) {
    super(props);
    // console.log('props', props);
    this.state = {
      currentData: [],
      customTags: [],
      tagsToAdd: [],
    };

    currentData = [];
    this.getCustomTags();
  }

  render() {
    return (
      <View style={{minHeight: 350, width: 350, alignItems: 'flex-start'}}>
        {/* <Text style={{fontSize: 20}}>Add tags at {this.props.tagMoment}</Text> */}
        <View>
          <Text style={{fontSize: 20}}>{this.props.tagsTitle}</Text>

          <View style={{flexDirection: 'row'}}>
            {this.props.tagsOptions.map((participant, index) => (
              <Chip
                key={index}
                containerStyle={{
                  alignItems: 'baseline',
                  paddingRight: 10,
                }}
                title={participant}
                iconRight
                onPress={() => this.addTag(participant)}
              />
            ))}
          </View>
        </View>
        <Text style={{fontSize: 20, paddingTop: 20}}>Selected :</Text>
        <View style={{flexDirection: 'row', paddingBottom: 10}}>
          {this.state.currentData.map((tag, index) => (
            <Chip
              key={index}
              containerStyle={{
                alignItems: 'baseline',
                paddingRight: 10,
              }}
              title={tag.name}
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
          {/* <Text style={{fontSize: 20}}>Custom tags:</Text>
          <View style={{flexDirection: 'row'}}>
            {this.state.customTags.map(tag => (
              <Chip
                containerStyle={{
                  alignItems: 'baseline',
                  paddingRight: 10,
                }}
                title={tag}
                iconRight
                onPress={() => this.addTag(tag)}
              />
            ))}
          </View>
          <Text style={{fontSize: 20}}>Added tags: </Text> */}
        </View>
        <View
          style={{
            flexDirection: 'row',
            width: 240,
            alignItems: 'center',
            paddingTop: 10,
          }}>
          <Input
            placeholder="Insert participant name"
            onChangeText={name => this.setParticipant(name)}
            leftIcon={
              <Icon name="user" type="font-awesome" size={24} color="black" />
            }
          />
          <View
            style={{
              flexDirection: 'row',

              justifyContent: 'center',
            }}>
            <Chip
              containerStyle={{width: 80}}
              title="Add new"
              iconRight
              onPress={() => this.addParticipant()}
            />
          </View>
        </View>
        <View
          style={{
            flexDirection: 'row',
            alignSelf: 'flex-end',
          }}>
          <Chip
            containerStyle={{
              alignItems: 'baseline',
              paddingRight: 10,
            }}
            buttonStyle={{
              backgroundColor: '#AE2012',
            }}
            title="Cancel"
            iconRight
            onPress={this.props.cancel}
          />
          <Chip
            containerStyle={{
              alignItems: 'baseline',
              paddingRight: 10,
            }}
            buttonStyle={{
              backgroundColor: '#0A9396',
            }}
            title="Confirm"
            iconRight
            onPress={this.saveEdit}
          />
        </View>
      </View>
    );
  }

  addTag = (tag: string) => {
    let tagToAdd = {
      name: tag,
    };
    currentData.push(tagToAdd);
    console.log(currentData);
    this.setState({currentData: currentData});
  };

  saveEdit = () => {
    this.props.finishAdding(currentData);
  };

  getCustomTags = async () => {
    const tags = await AsyncStorage.getItem('customTags');

    tags ? this.setState({customTags: JSON.parse(tags)}) : null;
    console.log(this.state.customTags);
  };

  private setParticipant = (event: string) => {
    particpantName = event;
  };

  private addParticipant = () => {
    console.log(particpantName);
    let participant = {
      name: particpantName,
    };
    // participant.name = particpantName;
    currentData.push(participant);
    this.setState({currentData: currentData});
  };
}
