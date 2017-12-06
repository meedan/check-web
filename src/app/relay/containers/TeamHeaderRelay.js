import React from 'react';
import Relay from 'react-relay';
import TeamRoute from '../TeamRoute';
import teamFragment from '../teamFragment';
import TeamHeader from '../../components/team/TeamHeader';

const TeamHeaderRelay = (props) => {
  const TeamHeaderContainer = Relay.createContainer(TeamHeader, {
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

export default TeamHeaderRelay;
