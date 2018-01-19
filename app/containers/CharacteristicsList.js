import React from 'react';
import { connect } from 'react-redux';
import { Actions } from 'react-native-router-flux';
import ImmutableListView from '../view/ImmutableListView';
import * as ble from '../ble/BleActions';
import * as SceneConst from '../scene/Const';
import CharacteristicView from '../characteristics/CharacteristicView';


const CharacteristicsList = (props) => {
  const onRenderCell = (rowData) => {
    const characteristicClicked = () => {
      props.selectCharacteristic(props.deviceId, props.serviceId, rowData.get('uuid'));
      Actions[SceneConst.CHARACTERISTIC_DETAILS_SCENE]();
    };

    return (
      <CharacteristicView
        isReadable={rowData.get('isReadable')}
        isWritable={rowData.get('isWritable')}
        isNotifiable={rowData.get('isNotifiable')}
        uuid={rowData.get('uuid')}
        value={rowData.get('value')}
        onClick={characteristicClicked}
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
  (state) => {
    const deviceId = state.getIn(['ble', 'selectedDeviceId']);
    const serviceId = state.getIn(['ble', 'selectedServiceId']);

    return {
      deviceId,
      serviceId,
      data: state.getIn(['ble', 'devices', deviceId, 'services', serviceId, 'characteristics']),
    };
  },
  {
    selectCharacteristic: ble.selectCharacteristic,
  },
)(CharacteristicsList);
