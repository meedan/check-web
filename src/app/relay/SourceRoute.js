import Relay from 'react-relay';

class SourceRoute extends Relay.Route {
  static queries = {
    source: () => Relay.QL`query Source { source(id: $sourceId) }`, 
  };
  static paramDefinitions = {
    sourceId: { required: true }
  };
  static routeName = 'SourceRoute';
};

export default SourceRoute;
