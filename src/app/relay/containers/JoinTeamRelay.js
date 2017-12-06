import React from 'react';
import Relay from 'react-relay';
import teamPublicFragment from '../teamPublicFragment';
import PublicTeamRoute from '../PublicTeamRoute';
import JoinTeam from '../../components/team/JoinTeam';

const JoinTeamContainer = Relay.createContainer(JoinTeam, {
  fragments: {
    team: () => teamPublicFragment,
  },
});

const JoinTeamRelay = (props) => {
  const teamSlug = (props.params && props.params.team) ? props.params.team : '';
  const route = new PublicTeamRoute({ teamSlug });
  return (<Relay.RootContainer Component={JoinTeamContainer} route={route} />);
};

export default JoinTeamRelay;
