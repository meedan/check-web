import Relay from 'react-relay';

class ContactRoute extends Relay.Route {
  static queries = {
    contact: () => Relay.QL`query Contact { contact(team_id: $teamId) }`,
  };
  static paramDefinitions = {
    teamId: { required: true }
  };
  static routeName = 'ContactRoute';
};

export default ContactRoute;
