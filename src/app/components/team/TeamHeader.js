import React from 'react';
import Relay from 'react-relay/classic';
import TeamNodeRoute from '../../relay/TeamNodeRoute';
import TeamHeaderComponent from './TeamHeaderComponent';

const TeamHeader = (props) => {
  const TeamHeaderContainer = Relay.createContainer(TeamHeaderComponent, {
    initialVariables: {
      pageSize: 10000,
    },
    fragments: {
      team: () => Relay.QL`
        fragment on Team {
          id,
          dbid,
          name,
          avatar,
          description,
          slug,
          permissions,
          get_suggested_tags,
          pusher_channel,
          public_team_id,
          verification_statuses,
        }
      `,
    },
  });

  const id = props.team ? props.team.team_graphql_id : '';
  const route = new TeamNodeRoute({ id });

  return (
    <Relay.RootContainer
      Component={TeamHeaderContainer}
      route={route}
      renderFetched={data => <TeamHeaderContainer {...props} {...data} />}
    />
  );
};

export default TeamHeader;
