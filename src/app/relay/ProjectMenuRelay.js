import React from 'react';
import Relay from 'react-relay';
import ProjectRoute from './ProjectRoute';
import ProjectMenu from '../components/project/ProjectMenu';

const ProjectMenuContainer = Relay.createContainer(ProjectMenu, {
  fragments: {
    project: () => Relay.QL`
      fragment on Project {
        id,
        dbid,
        title,
        description,
        permissions,
        get_slack_channel,
        team {
          id,
          dbid,
          slug,
          permissions,
          limits,
          get_slack_notifications_enabled
        }
      }
    `,
  },
});

const ProjectMenuRelay = (props) => {
  if (props.params && props.params.projectId) {
    const route = new ProjectRoute({ contextId: props.params.projectId });
    return <Relay.RootContainer Component={ProjectMenuContainer} route={route} />;
  }
  return null;
};

export default ProjectMenuRelay;
