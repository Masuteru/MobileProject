import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {Component} from 'react';
import {TextInput, View} from 'react-native';
import {Chip, Icon, Input, Text} from 'react-native-elements';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import MeetingDTO from '../interfaces/MeetingDTO';

interface State {
  tags: Array<string>;
  tagToAdd: string;
}

let tags: Array<any> = [];

let textInput: TextInput | null;

class CustomTags extends Component<any, State> {
  constructor(props: any) {
    super(props);

    this.state = {
      tags: tags,
      tagToAdd: '',
    };

    console.log(props);

    this.getData();
  }

  componentDidMount = () => {
    this.getData();
  };

  public render() {
    return (
      <SafeAreaProvider>
        <View>
          <Text style={{fontSize: 20, paddingTop: 15, paddingBottom: 15}}>
            People:
          </Text>
          <View
            style={{flexDirection: 'row', paddingBottom: 60, flexWrap: 'wrap'}}>
            {this.state.tags.map(tag => (
              <Chip
                containerStyle={{
                  alignItems: 'baseline',
                  paddingRight: 10,
                  paddingBottom: 10,
                }}
                buttonStyle={{
                  minWidth: 80,
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
                    onPress={() => this.removeTag(tag)}
                  />
                }
              />
            ))}
          </View>
        </View>
        <View>
          <Text style={{fontSize: 20, paddingTop: 15, paddingBottom: 15}}>
            Custom tags:
          </Text>
          <View
            style={{flexDirection: 'row', paddingBottom: 60, flexWrap: 'wrap'}}>
            {this.state.tags.map(tag => (
              <Chip
                containerStyle={{
                  alignItems: 'baseline',
                  paddingRight: 10,
                  paddingBottom: 10,
                }}
                buttonStyle={{
                  minWidth: 80,
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
                    onPress={() => this.removeTag(tag)}
                  />
                }
              />
            ))}
          </View>
          <View style={{flexDirection: 'row'}}>
            <Input
              ref={input => {
                textInput = input;
              }}
              placeholder="Insert tag name"
              onChangeText={name => this.setState({tagToAdd: name})}
              style={{
                width: 1,
              }}
              containerStyle={{
                width: 300,
              }}
              leftIcon={
                <Icon name="tag" type="font-awesome" size={24} color="black" />
              }
            />
            <Chip
              containerStyle={{
                alignItems: 'baseline',
                paddingRight: 10,
              }}
              buttonStyle={{
                backgroundColor: '#0A9396',
                width: 80,
              }}
              title="Add new"
              iconRight
              onPress={() => this.addCustomTag()}
            />
          </View>
        </View>
      </SafeAreaProvider>
    );
  }

  getData = async () => {
    const result = await AsyncStorage.getItem('customTags');
    if (result) {
      this.setState({tags: JSON.parse(result)});
    }
  };

  addCustomTag = () => {
    let tags = this.state.tags;
    tags.push(this.state.tagToAdd);
    this.setState({tags: tags, tagToAdd: ''});
    AsyncStorage.setItem('customTags', JSON.stringify(this.state.tags));

    textInput ? textInput.clear() : null;
  };

  removeTag = (tag: string) => {
    let tags = this.state.tags.filter(function (subject) {
      return subject !== tag;
    });
    this.setState({tags: tags});
    AsyncStorage.setItem('customTags', JSON.stringify(this.state.tags));
  };
}

export default CustomTags;
