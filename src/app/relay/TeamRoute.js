import Relay from 'react-relay';

class TeamRoute extends Relay.Route {
  static queries = {
    team: () => Relay.QL`query Team { team(id: $teamId) }`,
  };
  static paramDefinitions = {
    teamId: { required: true }
  };
  static routeName = 'TeamRoute';
};

export default TeamRoute;
