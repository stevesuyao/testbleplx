

import React from 'react';
import { View, Text } from 'react-native';
import { connect } from 'react-redux';
import CharacteristicsList from '../containers/CharacteristicsList';
import Style from '../view/Style';
import * as ble from '../ble/BleActions';

const CharacteristicsComponent = props => (
  <View style={Style.component}>
    <CharacteristicsList />
    <Text>Device status: {props.state}</Text>
  </View>
);

export default connect(
  state => (
    {
      state: state.getIn(['ble', 'state']),
    }
  ),
  {
    selectCharacteristic: ble.selectCharacteristic,
  },
)(CharacteristicsComponent);
