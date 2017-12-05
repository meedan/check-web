import React from 'react';
import Relay from 'react-relay';
import TeamRoute from '../../relay/TeamRoute';
import teamFragment from '../../relay/teamFragment';
import DrawerProjects from '../../components/drawer/DrawerProjects';

const DrawerProjectsContainer = Relay.createContainer(DrawerProjects, {
  initialVariables: {
    pageSize: 10000,
  },
  fragments: {
    team: () => teamFragment,
  },
});

const DrawerProjectsRelay = (props) => {
  const route = new TeamRoute({ teamSlug: props.team });
  return (
    <Relay.RootContainer
      Component={DrawerProjectsContainer}
      route={route}
      renderFetched={data => <DrawerProjectsContainer {...props} {...data} />}
    />
  );
};

export default DrawerProjectsRelay;
