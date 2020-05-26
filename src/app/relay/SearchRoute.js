import Relay from 'react-relay/classic';

class SearchRoute extends Relay.Route {
  static queries = {
    search: () => Relay.QL`query Search { search(query: $jsonEncodedQuery) }`,
  };
  static paramDefinitions = {
    jsonEncodedQuery: { required: true },
  };
  static routeName = 'SearchRoute';
}

export default SearchRoute;
