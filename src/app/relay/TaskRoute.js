import Relay from 'react-relay';

class TaskRoute extends Relay.Route {
  static queries = {
    task: () => Relay.QL`query Task { task(id: $id) }`,
  };
  static paramDefinitions = {
    id: { required: true },
  };
  static routeName = 'TaskRoute';
}

export default TaskRoute;
