import React from 'react';
import Relay from 'react-relay/classic';
import MediasLoading from '../components/media/MediasLoading';

const RelayContainer = props => (
  <Relay.RootContainer
    {...props}
    renderLoading={() => <MediasLoading size="large" theme="white" variant="page" />}
  />
);

export default RelayContainer;
