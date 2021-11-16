import {AddedTag} from '../screens/OngoingTags';

interface MeetingDTO {
  name: string;
  participants: Array<any>;
  subjects: Array<any>;
  date: string;
  time: string;
  isRecording?: boolean;
  archive?: boolean;
  addedTags?: AddedTag[];
}

export default MeetingDTO;
