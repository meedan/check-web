import Relay from 'react-relay/classic';

class TeamNodeRoute extends Relay.Route {
  static queries = {
    team: () => Relay.QL`query Node { node(id: $id) }`,
  };
  static paramDefinitions = {
    id: { required: false },
  };
  static routeName = 'TeamNodeRoute';
}

export default TeamNodeRoute;
