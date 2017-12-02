import React from 'react';
import Relay from 'react-relay';
import PublicTeamRoute from '../relay/PublicTeamRoute';
import teamPublicFragment from '../relay/teamPublicFragment';
import DrawerNavigationComponent from './DrawerNavigationComponent';

const DrawerNavigation = (props) => {
  // TODO @chris with @alex 2017-10-3
  //
  // Problem:
  //
  // The current implementation breaks in some cases with a Relay error:
  //   `Server response was missing for query 'team'`
  // This happens when the Drawer tries to load for a private team context with a non-member user.
  //
  // Alex and Caio's approach:
  // - We'll load the teamPublicFragment by default
  // - In DrawerNavigationComponent we'll decide if we'll need the Project List (drawer/Projects.js)
  // - Project list is contained in its own Relay which queries Team type

  if (props.inTeamContext) {
    const DrawerNavigationContainer = Relay.createContainer(DrawerNavigationComponent, {
      fragments: {
        team: () => teamPublicFragment,
      },
    });

    const teamSlug = props.params.team;

    const route = new PublicTeamRoute({ teamSlug });

    return (
      <Relay.RootContainer
        Component={DrawerNavigationContainer}
        route={route}
        renderFetched={
          data => <DrawerNavigationContainer
            {...props}
            {...data}
          />
        }
      />
    );
  }

  return (<DrawerNavigationComponent {...props} />);
};

export default DrawerNavigation;
