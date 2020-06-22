import Relay from 'react-relay/classic';

class SearchRoute extends Relay.Route {
  static queries = {
    search: () => Relay.QL`query SearchQuery { search(query: $jsonEncodedQuery) }`,
    project: () => Relay.QL`query SearchProject { project(ids: $projectDbidCommaTeamDbid) }`,
  };
  static paramDefinitions = {
    jsonEncodedQuery: { required: true },
  };
  static routeName = 'SearchRoute';
}

export default SearchRoute;
