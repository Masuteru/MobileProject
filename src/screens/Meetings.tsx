import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {Component} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import DatePicker from 'react-native-date-picker';
import {Chip, Divider, Input, Overlay} from 'react-native-elements';
import {Icon} from 'react-native-elements/dist/icons/Icon';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import RNFetchBlob from 'rn-fetch-blob';
import RNHTMLtoPDF from 'react-native-html-to-pdf';

const styles = StyleSheet.create({
  rowView: {
    paddingLeft: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chip: {
    paddingLeft: 10,
  },
});

interface State {
  name: string;
  visible: boolean;
  subVisible: boolean;
  participants: Array<any>;
  subjects: Array<any>;
  date: Date;
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
      date: new Date(),
    };
  }

  public render() {
    return (
      <SafeAreaProvider>
        <View style={styles.rowView}>
          <Text style={{fontSize: 20}}>Name:</Text>
          <Input
            containerStyle={{maxWidth: '80%', paddingTop: 10}}
            style={{paddingTop: 10}}
            placeholder="Insert meeting name"
            onChangeText={name => this.setMeetingName(name)}
          />
        </View>
        <Divider
          orientation="horizontal"
          style={{paddingTop: 15, marginBottom: 15}}
        />

        <DatePicker
          date={this.state.date}
          onDateChange={() => this.setDate()}
        />

        <View style={styles.rowView}>
          <Text style={{fontSize: 20}}>Participants: </Text>
          <Chip
            containerStyle={{alignItems: 'baseline'}}
            title="Add new"
            iconRight
            onPress={this.toggleOverlay}
          />
        </View>
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
        </View>

        <Divider
          orientation="horizontal"
          style={{paddingTop: 15, marginBottom: 15}}
        />
        <View style={styles.rowView}>
          <Text style={{fontSize: 20}}>Subjects: </Text>
          <Chip
            containerStyle={{alignItems: 'baseline'}}
            title="Add new"
            iconRight
            onPress={this.toggleSubjectOverlay}
          />
        </View>
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
        </View>
        <Divider
          orientation="horizontal"
          style={{paddingTop: 15, marginBottom: 15}}
        />
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'flex-end',
            width: '100%',
          }}>
          <Chip
            containerStyle={{alignItems: 'baseline'}}
            title="Create PDF"
            onPress={this.createPDF}
          />
          <Chip
            containerStyle={{alignItems: 'baseline'}}
            title="Create Meeting"
            onPress={this.createMeeting}
          />
        </View>
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
      subjects: this.state.subjects,
      date:
        this.state.date.toLocaleDateString() +
        ' ' +
        this.state.date.toLocaleTimeString(),
    };
    AsyncStorage.setItem('meetings', JSON.stringify(meeting));
  };

  setDate = () => {
    console.log('DAta', this.state.date);
    console.log(this.state.date.toLocaleTimeString());
  };

  private createPDF = async () => {
    let options = {
      html: this.createHtml(),
      fileName: 'Meeting: ' + this.state.name,
      directory: RNFetchBlob.fs.dirs.DownloadDir,
    };

    console.log('si');

    let file = await RNHTMLtoPDF.convert(options);
    console.log(file.filePath);
    // alert(file.filePath);
  };

  private createHtml = () => {
    const meeting = {
      name: this.state.name,
      participants: this.state.participants,
      subjects: this.state.subjects,
      date:
        this.state.date.toLocaleDateString() +
        ' - ' +
        this.state.date.toLocaleTimeString(),
    };

    const htmlReport =
      '<h1>Meeting: ' +
      meeting.name +
      '</h1><h2>Date: ' +
      meeting.date +
      '</h2> <h2>Participants: ' +
      (meeting.participants.map(participant => {
        return participant.name;
      }) +
        ' ') +
      '<h2>Subjects: ' +
      (meeting.subjects.map(subject => {
        return subject.name + ' ';
      }) +
        ' ') +
      '</h2>';

    return htmlReport;
  };
}

export default Meetings;
