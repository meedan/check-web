import React from 'react';
import Relay from 'react-relay/classic';
import MediasLoading from '../components/media/MediasLoading';

const RelayContainer = props => (
  <Relay.RootContainer
    {...props}
    renderLoading={() => <MediasLoading theme="white" variant="page" size="large" />}
  />
);

export default RelayContainer;
