import React from 'react';
import Relay from 'react-relay';
import PublicTeamRoute from '../PublicTeamRoute';
import teamPublicFragment from '../teamPublicFragment';
import TeamHeader from '../../components/team/TeamHeader';

const TeamPublicHeaderContainer = Relay.createContainer(TeamHeader, {
  fragments: {
    team: () => teamPublicFragment,
  },
});

const TeamPublicHeaderRelay = (props) => {
  const teamSlug = (props.params && props.params.team) ? props.params.team : '';
  const route = new PublicTeamRoute({ teamSlug });
  return (
    <Relay.RootContainer
      Component={TeamPublicHeaderContainer}
      route={route}
      renderFetched={data => <TeamPublicHeaderContainer {...props} {...data} />}
    />
  );
};

export default TeamPublicHeaderRelay;
