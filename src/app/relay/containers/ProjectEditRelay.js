import React from 'react';
import { injectIntl } from 'react-intl';
import Relay from 'react-relay';
import ProjectRoute from '../../relay/ProjectRoute';
import ProjectEdit from '../../components/project/ProjectEdit';

const ProjectEditContainer = Relay.createContainer(injectIntl(ProjectEdit), {
  initialVariables: {
    contextId: null,
  },
  fragments: {
    project: () => Relay.QL`
      fragment on Project {
        id,
        dbid,
        title,
        description,
        permissions,
        team {
          id,
          dbid,
          slug
        }
      }
    `,
  },
});

const ProjectEditRelay = (props) => {
  const route = new ProjectRoute({ contextId: parseInt(props.params.projectId, 10) });
  return (
    <Relay.RootContainer
      Component={ProjectEditContainer}
      route={route}
    />
  );
};

export default ProjectEditRelay;
