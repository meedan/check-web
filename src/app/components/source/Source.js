import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';
import SourceRoute from '../../relay/SourceRoute';
import SourceComponent from './SourceComponent';
import sourceFragment from '../../relay/sourceFragment';

const SourceContainer = Relay.createContainer(SourceComponent, {
  fragments: {
    source: () => sourceFragment
  }
});

class Source extends Component {
  render() {
    var route = new SourceRoute({ sourceId: this.props.params.sourceId });
    return (<Relay.RootContainer Component={SourceContainer} route={route} />);
  }
}

export default Source;
