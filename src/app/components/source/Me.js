import React from 'react';
import Relay from 'react-relay';
import MeRoute from '../../relay/MeRoute';
import UserComponent from './UserComponent';
import userFragment from '../../relay/userFragment';

const MeContainer = Relay.createContainer(UserComponent, {
  fragments: {
    user: () => userFragment,
  },
});

const Me = (props) => {
  const route = new MeRoute();
  return (
    <Relay.RootContainer
      Component={MeContainer}
      route={route}
      renderFetched={data => <MeContainer {...props} {...data} />}
    />
  );
};

export default Me;
