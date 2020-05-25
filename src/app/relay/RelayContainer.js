import React from 'react';
import Relay from 'react-relay/classic';
import CircularProgress from '../components/CircularProgress';

const RelayContainer = props => (
  <Relay.RootContainer
    {...props}
    renderLoading={() => <CircularProgress />}
  />
);

export default RelayContainer;
