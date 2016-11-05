import Relay from 'react-relay';

class PublicTeamRoute extends Relay.Route {
  static queries = {
    team: () => Relay.QL`query PublicTeam { public_team }`,
  };
  static paramDefinitions = {};
  static routeName = 'PublicTeamRoute';
};

export default PublicTeamRoute;
