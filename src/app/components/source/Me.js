import React from 'react';
import Relay from 'react-relay';
import MeRoute from '../../relay/MeRoute';
import UserComponent from './UserComponent';
import userFragment from '../../relay/userFragment';

const MeComponent = props => <UserComponent user={props.user} />;

const MeContainer = Relay.createContainer(MeComponent, {
  fragments: {
    user: () => userFragment,
  },
});

const Me = () => {
  const route = new MeRoute();
  return (<Relay.RootContainer Component={MeContainer} route={route} />);
};

export default Me;
