import React from 'react';
import { connect } from 'react-redux';
import { Actions } from 'react-native-router-flux';
import ImmutableListView from '../view/ImmutableListView';
import * as ble from '../ble/BleActions';
import * as SceneConst from '../scene/Const';
import ServiceView from '../services/ServiceView';


const ServicesList = (props) => {
  const onRenderCell = (rowData) => {
    const serviceClicked = () => {
      props.selectService(props.deviceId, rowData.get('uuid'));
      Actions[SceneConst.CHARACTERISTICS_SCENE]();
    };

    return (
      <ServiceView
        characteristicsCount={rowData.get('characteristicsCount')}
        isPrimary={rowData.get('isPrimary')}
        uuid={rowData.get('uuid')}
        onClick={serviceClicked}
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
    return {
      deviceId,
      data: state.getIn(['ble', 'devices', deviceId, 'services']),
    };
  },
  {
    selectService: ble.selectService,
  },
)(ServicesList);
