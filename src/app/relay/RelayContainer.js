import React from 'react';
import Relay from 'react-relay';
import CircularProgress from 'material-ui/CircularProgress';
import { black16, units } from '../styles/js/shared';

const RelayContainer = (props) => {
  const params = Object.assign({}, props);
  const style = {
    margin: `${units(1)} 0`,
    overflow: 'hidden',
    width: '100%',
    textAlign: 'center',
  };
  const loaderprops = Object.assign({ color: black16, style }, params.loaderProps);
  delete params.loaderProps;

  return (
    <Relay.RootContainer
      {...params}
      renderLoading={() => <CircularProgress {...loaderprops} />}
    />
  );
};

export default RelayContainer;
