

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  View,
  ListView,
} from 'react-native';
import Immutable from 'immutable';
import ImmutablePropTypes from 'react-immutable-proptypes';

const renderSeparator = (section, row) => (
  <View
    key={`${section}-${row}`}
    style={{ height: 2 }}
  />
);

export default class ImmutableListView extends Component {
  constructor(props) {
    super(props);
    const ds = new ListView.DataSource({
      rowHasChanged: (r1, r2) => !Immutable.is(r1, r2),
    });

    this.state = { dataSource: ds.cloneWithRows(this.props.data.toObject()) };
  }

  static propTypes = {
    data: ImmutablePropTypes.iterable.isRequired,
    onRenderCell: PropTypes.func.isRequired,
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      dataSource: this.state.dataSource.cloneWithRows(nextProps.data.toObject()),
    });
  }

  render() {
    return (
      <ListView
        dataSource={this.state.dataSource}
        renderRow={this.props.onRenderCell}
        renderSeparator={renderSeparator}
        enableEmptySections
      />
    );
  }
}
