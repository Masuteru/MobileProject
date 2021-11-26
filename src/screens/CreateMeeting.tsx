import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {Component} from 'react';
import {
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import DatePicker from 'react-native-date-picker';
import {Chip, Divider, Input, Overlay} from 'react-native-elements';
import {Icon} from 'react-native-elements/dist/icons/Icon';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import RNFetchBlob from 'rn-fetch-blob';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import MeetingDTO from '../interfaces/MeetingDTO';
import {firebase} from '@react-native-firebase/database';
import AddTagsModal from '../components/AddTagsModal';

const styles = StyleSheet.create({
  rowView: {
    paddingLeft: 10,
    paddingBottom: 15,
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
  tags: Array<string>;
  people: Array<string>;
}

interface Props {
  navigation: any;
}

var particpantName = '';
var subjectName = '';

let unsubscribe: any;

let textInput: TextInput | null;

class CreateMeeting extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      name: '',
      visible: false,
      subVisible: false,
      participants: [],
      subjects: [],
      date: new Date(),
      tags: [],
      people: [],
    };
  }

  public render() {
    return (
      <SafeAreaProvider>
        <ImageBackground
          source={require('../assets/bg.jpg')}
          resizeMode="cover"
          style={{flex: 1}}>
          <View style={{flex: 1, backgroundColor: 'rgba(255, 255, 255, 0.9)'}}>
            <Text
              style={{
                fontSize: 30,
                paddingLeft: 15,
                paddingTop: 15,
                fontWeight: 'bold',
              }}>
              Create meeting
            </Text>
            <ScrollView>
              <View style={styles.rowView}>
                <Text style={{fontSize: 20}}>Name:</Text>
                <Input
                  ref={input => {
                    textInput = input;
                  }}
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
              <View style={{justifyContent: 'center', flexDirection: 'row'}}>
                <DatePicker
                  date={this.state.date}
                  onDateChange={() => this.setDate()}
                />
              </View>
              <Divider
                orientation="horizontal"
                style={{paddingTop: 15, marginBottom: 15}}
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
                {this.state.participants.map((participant, index) => (
                  <Chip
                    key={index}
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
                  <AddTagsModal
                    tagsTitle="Saved names: "
                    tagsOptions={this.state.people}
                    finishAdding={this.addParticipants}
                    cancel={this.toggleOverlay}></AddTagsModal>
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
                {this.state.subjects.map((subject, index) => (
                  <Chip
                    key={index}
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
                  <AddTagsModal
                    tagsTitle="Custom tags: "
                    tagsOptions={this.state.tags}
                    finishAdding={this.addSubjects}
                    cancel={this.toggleSubjectOverlay}></AddTagsModal>
                  {/* <View style={{height: 200, width: 300, alignItems: 'center'}}>
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
                </View> */}
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
                {/* <Chip
                containerStyle={{alignItems: 'baseline'}}
                title="Create PDF"
                onPress={this.createPDF}
              /> */}
                <Chip
                  containerStyle={{alignItems: 'baseline'}}
                  title="Cancel"
                  buttonStyle={{backgroundColor: '#AE2012'}}
                  onPress={this.return}
                />
                <Chip
                  containerStyle={{alignItems: 'baseline', paddingLeft: 15}}
                  title="Create Meeting"
                  buttonStyle={{backgroundColor: '#0A9396'}}
                  onPress={this.createMeeting}
                />
              </View>
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

  clearData = () => {
    this.setState({
      name: '',
      visible: false,
      subVisible: false,
      participants: [],
      subjects: [],
      date: new Date(),
    });
    textInput ? textInput.clear() : null;
  };

  componentDidMount() {
    const {navigation} = this.props;
    unsubscribe = navigation.addListener('focus', () => {
      this.getData();
      this.clearData();
    });
  }

  componentWillUnmount() {
    unsubscribe();
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

  private createMeeting = async () => {
    const meeting: MeetingDTO = {
      name: this.state.name,
      participants: this.state.participants,
      subjects: this.state.subjects,
      date: this.state.date.toLocaleDateString(),
      time: this.state.date.toLocaleTimeString(),
    };

    let result = await AsyncStorage.getItem('meetings');
    let meetings: MeetingDTO[] = [];

    if (result) {
      meetings = JSON.parse(result);
    }

    meetings.push(meeting);

    await AsyncStorage.setItem('meetings', JSON.stringify(meetings));

    firebase.database().ref('/meetings').push(meeting);

    this.createPDF();

    this.props.navigation.goBack();
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

  private return = () => {
    this.props.navigation.goBack();
  };

  addParticipants = (data: Array<any>) => {
    this.setState({participants: data});
    this.toggleOverlay();
  };

  addSubjects = (data: Array<any>) => {
    this.setState({subjects: data});
    this.toggleSubjectOverlay();
  };
}

export default CreateMeeting;
