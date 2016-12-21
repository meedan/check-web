import Relay from 'react-relay';

class ProjectRoute extends Relay.Route {
  static queries = {
    project: (Component, contextId) => Relay.QL`
      query Project {
        project(id: $contextId) {
          ${Component.getFragment('project', contextId)}
        }
      }
    `,
  };

  static paramDefinitions = {
    contextId: { required: true },
  };

  static routeName = 'ProjectRoute';
}

export default ProjectRoute;
