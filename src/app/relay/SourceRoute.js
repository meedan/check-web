import Relay from 'react-relay';

class SourceRoute extends Relay.Route {
  static queries = {
    source: () => Relay.QL`query ProjectSource { project_source(ids: $ids) }`,
  };
  static paramDefinitions = {
    ids: { required: true },
  };
  static routeName = 'SourceRoute';
}

export default SourceRoute;
