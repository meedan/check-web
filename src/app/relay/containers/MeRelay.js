import React from 'react';
import Relay from 'react-relay';
import MeRoute from '../../relay/MeRoute';
import userFragment from '../../relay/userFragment';
import Me from '../../components/source/Me';

const MeContainer = Relay.createContainer(Me, {
  fragments: {
    user: () => userFragment,
  },
});

const MeRelay = () => {
  const route = new MeRoute();
  return (<Relay.RootContainer Component={MeContainer} route={route} />);
};

export default MeRelay;
