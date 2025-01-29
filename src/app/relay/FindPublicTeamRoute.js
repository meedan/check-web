import Relay from 'react-relay/classic';

class FindPublicTeamRoute extends Relay.Route {
  static queries = {
    team: () => Relay.QL`query FindPublicTeam { find_public_team(slug: $teamSlug) }`,
  };
  static paramDefinitions = {
    teamSlug: { required: true },
  };
  static routeName = 'FindPublicTeamRoute';
}

export default FindPublicTeamRoute;
