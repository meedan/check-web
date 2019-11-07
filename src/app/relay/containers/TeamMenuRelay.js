import React from 'react';
import Relay from 'react-relay/classic';
import TeamNodeRoute from '../TeamNodeRoute';
import TeamMenu from '../../components/team/TeamMenu';

const TeamMenuContainer = Relay.createContainer(TeamMenu, {
  fragments: {
    team: () => Relay.QL`
      fragment on Team {
        id,
        dbid,
        name,
        slug,
        permissions,
      }
    `,
  },
});

const TeamMenuRelay = (props) => {
  if (props.team) {
    const route = new TeamNodeRoute({ id: props.team.team_graphql_id });
    return (
      <Relay.RootContainer
        Component={TeamMenuContainer}
        route={route}
        renderFetched={data => <TeamMenuContainer {...props} {...data} />}
      />
    );
  }
  return null;
};

export default TeamMenuRelay;
