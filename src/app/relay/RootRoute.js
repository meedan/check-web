import Relay from 'react-relay';

class RootRoute extends Relay.Route {
  static queries = {
    root: () => Relay.QL`query Root { root }`, 
  };
  static paramDefinitions = {};
  static routeName = 'RootRoute';
};

export default RootRoute;
