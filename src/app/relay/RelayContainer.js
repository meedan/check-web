import React from 'react';
import Relay from 'react-relay/classic';
import Loader from '../components/cds/loading/Loader';

const RelayContainer = props => (
  <Relay.RootContainer
    {...props}
    renderLoading={() => <Loader size="large" theme="white" variant="page" />}
  />
);

export default RelayContainer;
