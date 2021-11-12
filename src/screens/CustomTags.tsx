import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {Component} from 'react';
import {ImageBackground, ScrollView, TextInput, View} from 'react-native';
import {Card, Chip, Icon, Input, Text} from 'react-native-elements';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import MeetingDTO from '../interfaces/MeetingDTO';

interface State {
  tags: Array<string>;
  tagToAdd: string;
  people: Array<string>;
  peopleToAdd: string;
}

let tags: Array<string> = [];
let people: Array<string> = [];

let textInput: TextInput | null;
let peopleInput: TextInput | null;

let unsubscribe: any;

class CustomTags extends Component<any, State> {
  constructor(props: any) {
    super(props);

    this.state = {
      tags: tags,
      people: people,
      tagToAdd: '',
      peopleToAdd: '',
    };

    console.log(props);

    this.getData();
  }

  componentDidMount() {
    const {navigation} = this.props;
    unsubscribe = navigation.addListener('focus', () => {
      this.getData();
    });
  }

  componentWillUnmount() {
    unsubscribe();
  }

  public render() {
    return (
      <SafeAreaProvider>
        <ImageBackground
          source={require('../assets/bg.jpg')}
          resizeMode="cover"
          style={{flex: 1}}>
          <View style={{backgroundColor: 'rgba(255, 255, 255, 0.8)', flex: 1}}>
            <Text
              style={{
                fontSize: 30,
                paddingLeft: 15,
                paddingTop: 15,
                paddingBottom: 15,
                fontWeight: 'bold',
              }}>
              Tags
            </Text>
            <ScrollView>
              <Card>
                <Text style={{fontSize: 20, paddingTop: 15, paddingBottom: 15}}>
                  People:
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    paddingBottom: 20,
                    flexWrap: 'wrap',
                  }}>
                  {this.state.people.map((tag, index) => (
                    <Chip
                      key={index}
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
                          onPress={() => this.removePeople(tag)}
                        />
                      }
                    />
                  ))}
                </View>
                <View style={{flexDirection: 'row'}}>
                  <Input
                    ref={input => {
                      peopleInput = input;
                    }}
                    placeholder="Insert name"
                    onChangeText={name => this.setState({peopleToAdd: name})}
                    style={{}}
                    containerStyle={{
                      flex: 1,
                    }}
                    leftIcon={
                      <Icon
                        name="tag"
                        type="font-awesome"
                        size={24}
                        color="black"
                      />
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
                    onPress={() => this.addPeople()}
                  />
                </View>
              </Card>

              <Card>
                <Text style={{fontSize: 20, paddingTop: 15, paddingBottom: 15}}>
                  Custom tags:
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    paddingBottom: 20,
                    flexWrap: 'wrap',
                  }}>
                  {this.state.tags.map((tag, index) => (
                    <Chip
                      key={index}
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
                    style={{}}
                    containerStyle={{
                      flex: 1,
                    }}
                    leftIcon={
                      <Icon
                        name="tag"
                        type="font-awesome"
                        size={24}
                        color="black"
                      />
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
              </Card>
            </ScrollView>
          </View>
        </ImageBackground>
      </SafeAreaProvider>
    );
  }

  getData = async () => {
    const result = await AsyncStorage.getItem('customTags');
    const people = await AsyncStorage.getItem('people');

    console.log(result, people);

    if (result) {
      this.setState({tags: JSON.parse(result)});
    }

    if (people) {
      this.setState({people: JSON.parse(people)});
    }
  };

  addCustomTag = async () => {
    let tags = this.state.tags;
    tags.push(this.state.tagToAdd);
    this.setState({tags: tags, tagToAdd: ''});
    await AsyncStorage.setItem('customTags', JSON.stringify(this.state.tags));

    textInput ? textInput.clear() : null;
  };

  addPeople = async () => {
    let people = this.state.people;
    people.push(this.state.peopleToAdd);
    this.setState({people: people, peopleToAdd: ''});
    await AsyncStorage.setItem('people', JSON.stringify(people));

    peopleInput ? peopleInput.clear() : null;
  };

  removeTag = async (tag: string) => {
    let tagsToAdd = this.state.tags.filter(function (subject) {
      return subject !== tag;
    });

    console.log(tagsToAdd);

    // this.setState(prevState => ({
    //   tags: [...prevState.tags, tag],
    // }));

    this.setState({tags: tagsToAdd});

    console.log(this.state.tags);
    await AsyncStorage.setItem('customTags', JSON.stringify(tagsToAdd));
  };

  removePeople = async (tag: string) => {
    let people = this.state.people.filter(function (subject) {
      return subject !== tag;
    });
    this.setState({people: people});
    await AsyncStorage.setItem('people', JSON.stringify(this.state.people));
  };
}

export default CustomTags;
