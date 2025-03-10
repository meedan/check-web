import React from 'react';
import Relay from 'react-relay/classic';
import { browserHistory } from 'react-router';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Drawer from '@material-ui/core/Drawer';
import DrawerRail from './DrawerRail';
import ErrorBoundary from '../error/ErrorBoundary';
import DrawerContent from './index.js';
import styles from './Drawer.module.css';

const getBooleanPref = (key, fallback) => {
  const inStore = window.storage.getValue(key);
  if (inStore === null) return fallback;
  return (inStore === 'true'); // we are testing against the string value of 'true' because `localStorage` only stores string values, and casts `true` as `'true'`
};

const DrawerNavigation = (parentProps) => {
  const [drawerOpen, setDrawerOpen] = React.useState(getBooleanPref('drawer.isOpen', true));
  const [drawerType, setDrawerType] = React.useState('');

  React.useEffect(() => {
    if (drawerType === 'bot') {
      setDrawerOpen(false);
    }
  }, [drawerType]);

  if (parentProps.teamSlug) {
    const { teamSlug } = parentProps;

    return (
      <>
        <ErrorBoundary component="DrawerNavigation">
          <QueryRenderer
            environment={Relay.Store}
            query={graphql`
              query DrawerNavigationQuery($teamSlug: String!) {
                find_public_team(slug: $teamSlug) {
                  dbid
                  ...DrawerRail_team
                }
              }
            `}
            render={({ error, props }) => {
              if (!error && props) {
                if (!props.find_public_team.dbid) {
                  browserHistory.push('/check/not-found');
                }
                return (
                  <>
                    <DrawerRail
                      currentUserIsMember={parentProps.currentUserIsMember}
                      drawerOpen={drawerOpen}
                      drawerType={drawerType}
                      team={props.find_public_team}
                      onDrawerOpenChange={setDrawerOpen}
                      onDrawerTypeChange={setDrawerType}
                    />
                    <Drawer
                      anchor="left"
                      className={[styles.drawer, drawerOpen ? styles.drawerOpen : styles.drawerClosed].join(' ')}
                      open={Boolean(drawerOpen)}
                      variant="persistent"
                    >
                      {parentProps.currentUserIsMember ? (
                        <DrawerContent drawerType={drawerType} />
                      ) : null }
                    </Drawer>
                  </>
                );
              }
              return null;
            }}
            variables={{
              teamSlug,
            }}
          />
        </ErrorBoundary>
      </>
    );
  }

  return <><DrawerRail {...parentProps} /></>;
};

export default DrawerNavigation;
