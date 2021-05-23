import React from 'react';
import Relay from 'react-relay/classic';
import MeRoute from '../../relay/MeRoute';
import UserComponent from './UserComponent';
import userFragment from '../../relay/userFragment';
import MediasLoading from '../media/MediasLoading';

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
      renderLoading={() => <MediasLoading />}
      renderFetched={data => <MeContainer {...props} {...data} />}
    />
  );
};

export default Me;
