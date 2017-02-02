import Relay from 'react-relay';

class TeamRoute extends Relay.Route {
  static queries = {
    team: () => Relay.QL`query Team { team(slug: $teamSlug) }`,
  };
  static paramDefinitions = {
    teamSlug: { required: false },
  };
  static routeName = 'TeamRoute';
}

export default TeamRoute;
