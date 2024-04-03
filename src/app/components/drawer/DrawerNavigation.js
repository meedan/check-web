import React from 'react';
import Relay from 'react-relay/classic';
import FindPublicTeamRoute from '../../relay/FindPublicTeamRoute';
import teamPublicFragment from '../../relay/teamPublicFragment';
import DrawerRail from './DrawerRail';
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

const getBooleanPref = (key, fallback) => {
  const inStore = window.storage.getValue(key);
  if (inStore === null) return fallback;
  return (inStore === 'true'); // we are testing against the string value of 'true' because `localStorage` only stores string values, and casts `true` as `'true'`
};

const DrawerNavigation = (props) => {
  const [drawerOpen, setDrawerOpen] = React.useState(getBooleanPref('drawer.isOpen', true));
  const [drawerType, setDrawerType] = React.useState('tipline');

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
              drawerType={drawerType}
              onDrawerOpenChange={setDrawerOpen}
              onDrawerTypeChange={setDrawerType}
              {...props}
              {...data}
            />)
          }
        />
        { drawerOpen ?
          <Relay.RootContainer
            Component={DrawerNavigationContainer}
            route={route}
            renderFetched={
              data => (<DrawerNavigationContainer
                drawerOpen={drawerOpen}
                drawerType={drawerType}
                {...props}
                {...data}
              />)
            }
          /> : null }
      </>
    );
  }

  return <><DrawerRail {...props} /><DrawerNavigationComponent {...props} /></>;
};

export default DrawerNavigation;
