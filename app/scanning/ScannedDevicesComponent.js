// @flow
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { connect } from 'react-redux';

import ButtonView from '../view/ButtonView';
import DevicesList from '../containers/DevicesList';
import * as ble from '../ble/BleActions';
import Style from '../view/Style';

const styles = StyleSheet.create({
  title: {
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

type Props = {
  stopScan: bool,
  scanning: bool,
  startScan: (any) => any,
}

const ScannedDevicesComponent = (props: Props) =>
  (
    <View style={Style.component}>
      <DevicesList />
      <View style={styles.buttonRow}>
        <ButtonView
          onClick={props.startScan}
          disabled={props.scanning}
          text="Start scanning"
          color="#beffc6"
        />
        <ButtonView
          onClick={props.stopScan}
          disabled={!props.scanning}
          text="Stop scanning"
          color="#ffcbdc"
        />
      </View>
    </View>
  );

export default connect(
  state => ({
    scanning: state.getIn(['ble', 'scanning']),
  }),
  {
    startScan: ble.startScan,
    stopScan: ble.stopScan,
  },
)(ScannedDevicesComponent);
