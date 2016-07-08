import Relay from 'react-relay';

class MeRoute extends Relay.Route {
  static queries = {
    me: () => Relay.QL`query User { me }`,
  };
  static paramDefinitions = {
  };
  static routeName = 'MeRoute';
};

export default MeRoute;
