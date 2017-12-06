import React from 'react';
import Relay from 'react-relay';
import ProjectRoute from '../../relay/ProjectRoute';
import Project from '../../components/project/Project';
import MediasLoading from '../../components/media/MediasLoading';

const ProjectContainer = Relay.createContainer(Project, {
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
        search_id,
        team {
          id,
          dbid,
          slug,
          search_id,
          projects(first: 10000) {
            edges {
              node {
                id,
                dbid,
                title
              }
            }
          }
        }
      }
    `,
  },
});

const ProjectRelay = (props) => {
  const route = new ProjectRoute({ contextId: parseInt(props.params.projectId, 10) });
  return (
    <Relay.RootContainer
      Component={ProjectContainer}
      route={route}
      renderFetched={data => <ProjectContainer {...props} {...data} />}
      renderLoading={() => <MediasLoading />}
    />
  );
};

export default ProjectRelay;
