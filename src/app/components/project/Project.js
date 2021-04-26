import React from 'react';
import PropTypes from 'prop-types';
import { browserHistory } from 'react-router';
import Relay from 'react-relay/classic';
import ProjectActions from './ProjectActions';
import ProjectRoute from '../../relay/ProjectRoute';
import CheckContext from '../../CheckContext';
import MediasLoading from '../media/MediasLoading';
import Search from '../search/Search';
import { safelyParseJSON } from '../../helpers';
import NotFound from '../NotFound';

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
  }

  currentContext() {
    return this.getContext().getContextStore();
  }

  render() {
    const { project, routeParams } = this.props;

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
          listDescription={project.description}
          listActions={<ProjectActions project={project} />}
          teamSlug={routeParams.team}
          project={project}
          query={query}
          hideFields={['project', 'read']}
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
        team {
          id,
          dbid,
          slug,
          search_id,
          medias_count,
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
