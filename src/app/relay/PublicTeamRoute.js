import Relay from 'react-relay/classic';

class PublicTeamRoute extends Relay.Route {
  static queries = {
    team: () => Relay.QL`query PublicTeam { public_team(slug: $teamSlug) }`,
  };
  static paramDefinitions = {
    teamSlug: { required: false },
  };
  static routeName = 'PublicTeamRoute';
}

export default PublicTeamRoute;
