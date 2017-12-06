import React from 'react';
import Relay from 'react-relay';
import ProjectRoute from '../../relay/ProjectRoute';
import ProjectHeader from '../../components/project/ProjectHeader';

const ProjectHeaderContainer = Relay.createContainer(ProjectHeader, {
  fragments: {
    project: () => Relay.QL`
      fragment on Project {
        title,
        description
      }
    `,
  },
});

const ProjectHeaderRelay = (props) => {
  if (props.params && props.params.projectId) {
    const route = new ProjectRoute({ contextId: props.params.projectId });
    return (<Relay.RootContainer
      Component={ProjectHeaderContainer}
      route={route}
    />);
  }
  return null;
};

export default ProjectHeaderRelay;
