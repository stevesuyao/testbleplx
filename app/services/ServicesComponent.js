// @flow
import React from 'react';
import { View, Text } from 'react-native';
import { connect } from 'react-redux';
import ServicesList from '../containers/ServicesList';

import Style from '../view/Style';

type Props = {
  state: string,
}

const ServicesComponent = (props:Props) =>
  (
    <View style={Style.component}>
      <ServicesList />
      <Text>Device status: {props.state}</Text>
    </View>
  );

export default connect(state => ({
  state: state.getIn(['ble', 'state']),
}))(ServicesComponent);
