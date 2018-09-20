import Relay from 'react-relay/classic';

class AboutRoute extends Relay.Route {
  static queries = {
    about: () => Relay.QL`query About { about }`,
  };
  static paramDefinitions = {
  };
  static routeName = 'AboutRoute';
}

export default AboutRoute;
