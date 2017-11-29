import React from 'react';
import Relay from 'react-relay';
import TeamRoute from '../TeamRoute';
import teamFragment from '../teamFragment';
import Team from '../../components/team/Team';

const TeamContainer = Relay.createContainer(Team, {
  initialVariables: {
    pageSize: 20,
  },
  fragments: {
    team: () => teamFragment,
  },
});

const TeamRelay = (props) => {
  const slug = props.params.team || '';
  const route = new TeamRoute({ teamSlug: slug });
  return (<Relay.RootContainer Component={TeamContainer} route={route} />);
};

export default TeamRelay;
