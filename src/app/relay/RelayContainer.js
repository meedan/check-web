import React from 'react';
import Relay from 'react-relay';
import CircularProgress from '../components/CircularProgress';

const RelayContainer = (props) => {
  const params = Object.assign({}, props);
  const loaderprops = Object.assign({}, params.loaderProps);
  delete params.loaderProps;

  return (
    <Relay.RootContainer
      {...params}
      renderLoading={() => <CircularProgress {...loaderprops} />}
    />
  );
};

export default RelayContainer;
