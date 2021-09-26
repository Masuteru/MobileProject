import {Text} from 'react-native';
import * as React from 'react';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {SpeedDial} from 'react-native-elements';

let open: boolean;

function setOpen(open: boolean) {
  open = !open;
}

export default function Tags() {
  return (
    <SafeAreaProvider>
      <SpeedDial
        isOpen={open}
        icon={{name: 'edit', color: '#fff'}}
        openIcon={{name: 'close', color: '#fff'}}
        onOpen={() => setOpen(!open)}
        onClose={() => setOpen(!open)}>
        {' '}
        <SpeedDial.Action
          icon={{name: 'add', color: '#fff'}}
          title="Add"
          onPress={() => console.log('Add Something')}
        />{' '}
        <SpeedDial.Action
          icon={{name: 'delete', color: '#fff'}}
          title="Delete"
          onPress={() => console.log('Delete Something')}
        />
      </SpeedDial>
    </SafeAreaProvider>
  );
}
