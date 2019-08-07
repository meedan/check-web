import React from 'react';
import Relay from 'react-relay/classic';
import TeamRoute from '../../relay/TeamRoute';
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
          get_max_number_of_members,
          get_suggested_tags,
          pusher_channel,
          public_team_id,
          translation_statuses,
          verification_statuses,
          source_verification_statuses,
        }
      `,
    },
  });

  const teamSlug = props.params && props.params.team ? props.params.team : '';
  const route = new TeamRoute({ teamSlug });

  return (
    <Relay.RootContainer
      Component={TeamHeaderContainer}
      route={route}
      renderFetched={data => <TeamHeaderContainer {...props} {...data} />}
    />
  );
};

export default TeamHeader;
