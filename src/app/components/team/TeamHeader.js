import React from 'react';
import Relay from 'react-relay';
import TeamRoute from '../../relay/TeamRoute';
import teamFragment from '../../relay/teamFragment';
import TeamHeaderComponent from './TeamHeaderComponent';

const TeamHeader = (props) => {
  const TeamHeaderContainer = Relay.createContainer(TeamHeaderComponent, {
    initialVariables: {
      pageSize: 10000,
    },
    fragments: {
      team: () => teamFragment,
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
