import Relay from 'react-relay/classic';

class BotRoute extends Relay.Route {
  static queries = {
    bot: () => Relay.QL`query TeamBot { team_bot(id: $id) }`,
  };
  static paramDefinitions = {
    id: { required: true },
  };
  static routeName = 'BotRoute';
}

export default BotRoute;
