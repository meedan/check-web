import React from 'react';
import PropTypes from 'prop-types';
import { browserHistory } from 'react-router';
import Relay from 'react-relay/classic';
import { graphql } from 'react-relay/compat';
import { FormattedMessage } from 'react-intl';
import FolderOpenIcon from '@material-ui/icons/FolderOpen';
import ProjectRoute from '../../relay/ProjectRoute';
import CheckContext from '../../CheckContext';
import MediasLoading from '../media/MediasLoading';
import Search from '../search/Search';
import { safelyParseJSON } from '../../helpers';
import NotFound from '../NotFound';
import ProjectActions from '../drawer/Projects/ProjectActions';

class ProjectComponent extends React.PureComponent {
  componentDidMount() {
    this.setContextProject();
  }

  componentDidUpdate() {
    this.setContextProject();
  }

  getContext() {
    return new CheckContext(this);
  }

  setContextProject() {
    if (!this.props.project) {
      return false;
    }

    const context = this.getContext();
    const currentContext = this.currentContext();
    const newContext = {};

    newContext.project = this.props.project;

    let notFound = false;
    if (!currentContext.team || currentContext.team.slug !== this.props.project.team.slug) {
      newContext.team = this.props.project.team;
      notFound = true;
    }
    if (currentContext.team && !currentContext.team.projects) {
      newContext.team = this.props.project.team;
    }

    context.setContextStore(newContext);

    if (notFound) {
      browserHistory.push('/check/not-found');
    }

    return true;
  }

  currentContext() {
    return this.getContext().getContextStore();
  }

  render() {
    const { project, routeParams } = this.props;

    if (!project) {
      return null;
    }

    const query = {
      ...safelyParseJSON(routeParams.query, {}),
      projects: [project.dbid],
    };

    return (
      <div className="project">
        <Search
          searchUrlPrefix={`/${routeParams.team}/project/${routeParams.projectId}`}
          mediaUrlPrefix={`/${routeParams.team}/project/${routeParams.projectId}/media`}
          title={project.title}
          icon={<FolderOpenIcon />}
          listDescription={project.description}
          listActions={
            <ProjectActions
              isMoveable
              object={project}
              name={<FormattedMessage id="project.name" defaultMessage="folder" />}
              updateMutation={graphql`
                mutation ProjectUpdateProjectMutation($input: UpdateProjectInput!) {
                  updateProject(input: $input) {
                    project {
                      id
                      title
                      description
                    }
                  }
                }
              `}
              deleteMessage={
                <FormattedMessage
                  id="project.deleteMessage"
                  defaultMessage='The folder will be deleted for everyone in this workspace. All items in the folder will still be accessible in the "All items" folder'
                />
              }
              deleteMutation={graphql`
                mutation ProjectDestroyProjectMutation($input: DestroyProjectInput!) {
                  destroyProject(input: $input) {
                    deletedId
                    team {
                      id
                    }
                  }
                }
              `}
            />
          }
          teamSlug={routeParams.team}
          project={project}
          query={query}
          page="folder"
          hideFields={['projects']}
        />
      </div>
    );
  }
}

ProjectComponent.contextTypes = {
  store: PropTypes.object,
};

const ProjectContainer = Relay.createContainer(ProjectComponent, {
  initialVariables: {
    projectId: null,
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
        medias_count,
        project_group_id,
        team {
          id,
          dbid,
          slug,
          search_id,
          medias_count,
          permissions,
          verification_statuses,
          public_team {
            id,
            trash_count,
          }
        }
      }
    `,
  },
});

const Project = ({ routeParams, ...props }) => {
  const route = new ProjectRoute({ projectId: routeParams.projectId });
  return (
    <Relay.RootContainer
      Component={ProjectContainer}
      route={route}
      renderFetched={data => (
        /* TODO make GraphQL Projects query filter by Team
         * ... in the meantime, we can fake an error by showing "Not Found" when the
         * Project exists but is in a different Team than the one the user asked for
         * in the URL.
         */
        (data.project && data.project.team && data.project.team.slug !== routeParams.team)
          ? <NotFound />
          : <ProjectContainer routeParams={routeParams} {...props} {...data} />
      )}
      renderLoading={() => <MediasLoading />}
    />
  );
};

Project.propTypes = {
  routeParams: PropTypes.shape({
    team: PropTypes.string.isRequired,
    projectId: PropTypes.string.isRequired,
    query: PropTypes.string, // JSON-encoded value; can be empty/null/invalid
  }).isRequired,
};

export default Project;
