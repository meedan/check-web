import React from 'react';
import Relay from 'react-relay/classic';
import TeamRoute from '../../relay/TeamRoute';
import TeamComponent from './TeamComponent';
import teamFragment from '../../relay/teamFragment';

const TeamContainer = Relay.createContainer(TeamComponent, {
  initialVariables: {
    pageSize: 20,
  },
  fragments: {
    team: () => teamFragment,
  },
});

const Team = (props) => {
  const slug = props.params.team || '';
  if (slug === '') {
    return null;
  }
  const route = new TeamRoute({ teamSlug: slug });
  return (
    <Relay.RootContainer
      Component={TeamContainer}
      route={route}
      renderFetched={data => <TeamContainer {...props} {...data} />}
    />
  );
};

export default Team;
