import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { Component } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Chip, Divider, Input, Overlay } from 'react-native-elements';
import { Icon } from 'react-native-elements/dist/icons/Icon';
import { SafeAreaProvider } from 'react-native-safe-area-context';

interface State {
  visible: boolean;
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: '#F194FF',
  },
  buttonClose: {
    backgroundColor: '#2196F3',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
});

interface State {
  name: string;
  visible: boolean;
  subVisible: boolean;
  participants: Array<any>;
  subjects: Array<any>;
}

var particpantName = '';
var subjectName = '';

class Meetings extends Component<any, State> {
  constructor(props: any) {
    super(props);
    this.state = {
      name: '',
      visible: false,
      subVisible: false,
      participants: [],
      subjects: [],
    };
  }

  public render() {
    return (
      <SafeAreaProvider>
        <Text style={{fontSize: 20}}>Name:</Text>
        <Input
          placeholder="Insert meeting name"
          onChangeText={name => this.setMeetingName(name)}
        />

        <Text style={{fontSize: 20}}>Participants:</Text>
        <View style={{flexDirection: 'row'}}>
          {this.state.participants.map(participant => (
            <Chip
              containerStyle={{alignItems: 'baseline', paddingRight: 10}}
              title={participant.name}
              icon={
                <Icon
                  size={20}
                  style={{fontSize: 100, paddingLeft: 5}}
                  name="close"
                  type="font-awesome"
                  color="white"
                  onPress={() => this.removeParticipant(participant)}
                />
              }
              iconRight
            />
          ))}
          <Overlay
            animationType="slide"
            isVisible={this.state.visible}
            onBackdropPress={this.toggleOverlay}>
            <View style={{height: 200, width: 300, alignItems: 'center'}}>
              <Input
                placeholder="Insert participant name"
                onChangeText={name => this.setParticipant(name)}
                leftIcon={
                  <Icon
                    name="user"
                    type="font-awesome"
                    size={24}
                    color="black"
                  />
                }
              />
              <View
                style={{
                  flexDirection: 'row',
                  width: 300,
                  justifyContent: 'center',
                }}>
                <Chip
                  containerStyle={{width: 80}}
                  title="CANCEL"
                  buttonStyle={{
                    backgroundColor: 'red',
                  }}
                  iconRight
                  onPress={this.toggleOverlay}
                />
                <Chip
                  containerStyle={{width: 80}}
                  title="ADD"
                  iconRight
                  onPress={this.addParticipant}
                />
              </View>
            </View>
          </Overlay>
          <Chip
            containerStyle={{alignItems: 'baseline'}}
            title="Add new"
            iconRight
            onPress={this.toggleOverlay}
          />
        </View>
        <Divider orientation="horizontal" />

        <Text style={{fontSize: 20}}>Subjects:</Text>
        <View style={{flexDirection: 'row'}}>
          {this.state.subjects.map(subject => (
            <Chip
              containerStyle={{alignItems: 'baseline', paddingRight: 10}}
              title={subject.name}
              icon={
                <Icon
                  size={20}
                  style={{fontSize: 100, paddingLeft: 5}}
                  name="close"
                  type="font-awesome"
                  color="white"
                  onPress={() => this.removeSubject(subject)}
                />
              }
              iconRight
            />
          ))}
          <Overlay
            animationType="slide"
            isVisible={this.state.subVisible}
            onBackdropPress={this.toggleSubjectOverlay}>
            <View style={{height: 200, width: 300, alignItems: 'center'}}>
              <Input
                placeholder="Insert subject name"
                onChangeText={name => this.setSubject(name)}
                leftIcon={
                  <Icon
                    name="user"
                    type="font-awesome"
                    size={24}
                    color="black"
                  />
                }
              />
              <View
                style={{
                  flexDirection: 'row',
                  width: 300,
                  justifyContent: 'center',
                }}>
                <Chip
                  containerStyle={{width: 80}}
                  title="CANCEL"
                  buttonStyle={{
                    backgroundColor: 'red',
                  }}
                  iconRight
                  onPress={this.toggleOverlay}
                />
                <Chip
                  containerStyle={{width: 80}}
                  title="ADD"
                  iconRight
                  onPress={this.addSubject}
                />
              </View>
            </View>
          </Overlay>
          <Chip
            containerStyle={{alignItems: 'baseline'}}
            title="Add new"
            iconRight
            onPress={this.toggleSubjectOverlay}
          />
        </View>
        <Divider orientation="horizontal" />
        <Chip
          containerStyle={{alignItems: 'baseline'}}
          title="Create Meeting"
          onPress={this.createMeeting}
        />
      </SafeAreaProvider>
    );
  }

  toggleOverlay = () => {
    this.setState({
      visible: !this.state.visible,
    });
  };

  toggleSubjectOverlay = () => {
    this.setState({
      subVisible: !this.state.subVisible,
    });
  };

  setMeetingName = (event: string) => {
    this.setState({name: event});
  };

  private setParticipant = (event: string) => {
    particpantName = event;
  };

  private removeParticipant = (e: any) => {
    this.setState({
      participants: this.state.participants.filter(function (person) {
        return person !== e;
      }),
    });
  };

  private addParticipant = () => {
    this.state.participants.push({name: particpantName});
    this.toggleOverlay();
  };

  private setSubject = (event: string) => {
    subjectName = event;
  };

  private removeSubject = (e: any) => {
    this.setState({
      subjects: this.state.subjects.filter(function (subject) {
        return subject !== e;
      }),
    });
  };

  private addSubject = () => {
    this.state.subjects.push({name: subjectName});
    this.toggleSubjectOverlay();
  };

  private createMeeting = () => {
    const meeting = {
      name: this.state.name,
      participants: this.state.participants,
      subjects: this.state.subjects
    }
    AsyncStorage.setItem(
      'meetings', JSON.stringify(meeting)
    )
  }
}

export default Meetings;
