/* eslint-disable relay/unused-fields */
import React from 'react';
import Relay from 'react-relay/classic';
import { QueryRenderer, graphql } from 'react-relay/compat';
import DrawerRail from './DrawerRail';
import DrawerNavigationComponent from './DrawerNavigationComponent';
import FindPublicTeamRoute from '../../relay/FindPublicTeamRoute';
import teamPublicFragment from '../../relay/teamPublicFragment';
import ErrorBoundary from '../error/ErrorBoundary';

const DrawerNavigationContainer = Relay.createContainer(DrawerNavigationComponent, {
  fragments: {
    team: () => teamPublicFragment,
  },
});

const getBooleanPref = (key, fallback) => {
  const inStore = window.storage.getValue(key);
  if (inStore === null) return fallback;
  return (inStore === 'true'); // we are testing against the string value of 'true' because `localStorage` only stores string values, and casts `true` as `'true'`
};

const DrawerNavigation = (parentProps) => {
  const [drawerOpen, setDrawerOpen] = React.useState(getBooleanPref('drawer.isOpen', true));
  const [drawerType, setDrawerType] = React.useState('tipline');

  React.useEffect(() => {
    if (drawerType === 'bot') {
      setDrawerOpen(false);
    }
  }, [drawerType]);

  if (parentProps.teamSlug) {
    const { teamSlug } = parentProps;

    const route = new FindPublicTeamRoute({ teamSlug });

    console.log(teamSlug); //eslint-disable-line

    return (
      <>
        <ErrorBoundary component="DrawerNavigation">
          <QueryRenderer
            environment={Relay.Store}
            query={graphql`
              query DrawerNavigationQuery($teamSlug: String!) {
                find_public_team(slug: $teamSlug) {
                  id,
                  name,
                  avatar,
                  dbid,
                  private,
                  slug,
                  team_graphql_id,
                  trash_count,
                  spam_count,
                  pusher_channel,
                }
              }
            `}
            render={({ error, props }) => {
              if (!error && props) {
                return (
                  <DrawerRail
                    currentUserIsMember={parentProps.currentUserIsMember}
                    drawerOpen={drawerOpen}
                    drawerType={drawerType}
                    team={props.find_public_team}
                    onDrawerOpenChange={setDrawerOpen}
                    onDrawerTypeChange={setDrawerType}
                  />
                );
              }
              return null;
            }}
            variables={{
              teamSlug,
            }}
          />
        </ErrorBoundary>
        <Relay.RootContainer
          Component={DrawerNavigationContainer}
          renderFetched={
            data => (<DrawerNavigationContainer
              drawerOpen={drawerOpen}
              drawerType={drawerType}
              {...parentProps}
              {...data}
            />)
          }
          route={route}
        />
      </>
    );
  }

  return <><DrawerRail {...parentProps} /><DrawerNavigationComponent {...parentProps} /></>;
};

export default DrawerNavigation;
