// @flow
import React from 'react';
import { connect } from 'react-redux';
import { Actions } from 'react-native-router-flux';
import ImmutableListView from '../view/ImmutableListView';
import * as ble from '../ble/BleActions';
import * as SceneConst from '../scene/Const';
import ScannedDeviceView from '../scanning/ScannedDeviceView';

type Props = {
  data: any
}

const DevicesList = (props: Props) => {
  const onRenderCell = (rowData) => {
    const connectToDevice = () => {
      props.changeDeviceState(rowData.get('uuid'), ble.DEVICE_STATE_CONNECT);
      Actions[SceneConst.SERVICES_SCENE]();
    };
    return (
      <ScannedDeviceView
        name={rowData.get('name')}
        uuid={rowData.get('uuid')}
        rssi={rowData.get('rssi')}
        onClick={connectToDevice}
      />
    );
  };

  return (
    <ImmutableListView
      data={props.data}
      onRenderCell={onRenderCell}
    />
  );
};


export default connect(
  state => ({
    data: state.getIn(['ble', 'devices']),
  }),
  { changeDeviceState: ble.changeDeviceState },
)(DevicesList);
