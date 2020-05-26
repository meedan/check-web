import Relay from 'react-relay/classic';

class ProjectRoute extends Relay.Route {
  static queries = {
    project: () => Relay.QL`
      query Project { project(id: $projectId) }
    `,
  };

  static paramDefinitions = {
    projectId: { required: true },
  };

  static routeName = 'ProjectRoute';
}

export default ProjectRoute;
