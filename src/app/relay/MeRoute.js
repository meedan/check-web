import Relay from 'react-relay/classic';

class MeRoute extends Relay.Route {
  static queries = {
    me: () => Relay.QL`query Me { me }`,
  };
  static paramDefinitions = {
  };
  static routeName = 'MeRoute';
}

export default MeRoute;
