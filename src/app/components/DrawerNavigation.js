import React from 'react';
import Relay from 'react-relay/classic';
import FindPublicTeamRoute from '../relay/FindPublicTeamRoute';
import teamPublicFragment from '../relay/teamPublicFragment';
import DrawerRail from './drawer/DrawerRail';
import DrawerNavigationComponent from './DrawerNavigationComponent';

const DrawerNavigationContainer = Relay.createContainer(DrawerNavigationComponent, {
  fragments: {
    team: () => teamPublicFragment,
  },
});

const DrawerRailContainer = Relay.createContainer(DrawerRail, {
  fragments: {
    team: () => teamPublicFragment,
  },
});

const DrawerNavigation = (props) => {
  const [drawerOpen, setDrawerOpen] = React.useState(true);

  if (props.teamSlug) {
    const { teamSlug } = props;

    const route = new FindPublicTeamRoute({ teamSlug });

    return (
      <>
        <Relay.RootContainer
          Component={DrawerRailContainer}
          route={route}
          renderFetched={
            data => (<DrawerRailContainer
              drawerOpen={drawerOpen}
              onDrawerOpenChange={setDrawerOpen}
              {...props}
              {...data}
            />)
          }
        />
        <Relay.RootContainer
          Component={DrawerNavigationContainer}
          route={route}
          renderFetched={
            data => (<DrawerNavigationContainer
              drawerOpen={drawerOpen}
              {...props}
              {...data}
            />)
          }
        />
      </>
    );
  }

  return <><DrawerRail {...props} /><DrawerNavigationComponent {...props} /></>;
};

export default DrawerNavigation;
