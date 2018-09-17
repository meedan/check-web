import React from 'react';
import Relay from 'react-relay/classic';
import teamPublicFragment from '../../relay/teamPublicFragment';
import PublicTeamRoute from '../../relay/PublicTeamRoute';
import JoinTeamComponent from './JoinTeamComponent';

const JoinTeamContainer = Relay.createContainer(JoinTeamComponent, {
  fragments: {
    team: () => teamPublicFragment,
  },
});

const JoinTeam = (props) => {
  const teamSlug = (props.params && props.params.team) ? props.params.team : '';
  const route = new PublicTeamRoute({ teamSlug });
  return (<Relay.RootContainer Component={JoinTeamContainer} route={route} />);
};

export default JoinTeam;
