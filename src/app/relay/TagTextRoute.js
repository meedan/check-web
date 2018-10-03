import Relay from 'react-relay/classic';

class TagTextRoute extends Relay.Route {
  static queries = {
    tag_text: () => Relay.QL`query TagText { tag_text(id: $id) }`,
  };
  static paramDefinitions = {
    id: { required: true },
  };
  static routeName = 'TagTextRoute';
}

export default TagTextRoute;
