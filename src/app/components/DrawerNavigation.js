import React from 'react';
import Relay from 'react-relay/classic';
import FindPublicTeamRoute from '../relay/FindPublicTeamRoute';
import teamPublicFragment from '../relay/teamPublicFragment';
import DrawerNavigationComponent from './DrawerNavigationComponent';

const DrawerNavigationContainer = Relay.createContainer(DrawerNavigationComponent, {
  fragments: {
    team: () => teamPublicFragment,
  },
});

const DrawerNavigation = (props) => {
  if (props.teamSlug) {
    const { teamSlug } = props;

    const route = new FindPublicTeamRoute({ teamSlug });

    return (
      <Relay.RootContainer
        Component={DrawerNavigationContainer}
        route={route}
        renderFetched={
          data => (<DrawerNavigationContainer
            {...props}
            {...data}
          />)
        }
      />
    );
  }

  return <DrawerNavigationComponent {...props} />;
};

export default DrawerNavigation;
