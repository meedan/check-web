import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import ProjectActions from './ProjectActions';
import ProjectRoute from '../../relay/ProjectRoute';
import PageTitle from '../PageTitle';
import CheckContext from '../../CheckContext';
import MediasLoading from '../media/MediasLoading';
import Search from '../search/Search';
import UpdateUserMutation from '../../relay/mutations/UpdateUserMutation';

class ProjectComponent extends Component {
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

    if (currentContext.currentUser &&
       (!currentContext.project || currentContext.project.dbid !== this.props.project.dbid)) {
      Relay.Store.commitUpdate(
        new UpdateUserMutation({
          current_project_id: this.props.project.dbid,
          current_user_id: currentContext.currentUser.id,
        }),
        { onSuccess: () => {}, onFailure: () => {} },
      );
    }

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
      currentContext.history.push('/check/not-found');
    }
  }

  currentContext() {
    return this.getContext().getContextStore();
  }

  render() {
    const { project } = this.props;

    return (
      <PageTitle prefix={project.title} skipTeam={false} team={this.currentContext().team}>
        <div className="project">
          <Search
            listName={project.title}
            listDescription={project.description}
            listActions={<ProjectActions project={project} />}
            team={project.team.slug}
            page="project"
            project={project}
            query={this.props.params.query || '{}'}
            fields={['date', 'keyword', 'status', 'sort', 'tags', 'show', 'dynamic', 'bulk', 'rules']}
          />
        </div>
      </PageTitle>
    );
  }
}

ProjectComponent.contextTypes = {
  store: PropTypes.object,
};

const ProjectContainer = Relay.createContainer(ProjectComponent, {
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
        medias_count,
        team {
          id,
          dbid,
          slug,
          search_id,
          medias_count,
          verification_statuses,
          translation_statuses,
          public_team {
            id,
            trash_count,
          }
        }
      }
    `,
  },
});

const Project = (props) => {
  const route = new ProjectRoute({ contextId: props.params.projectId });
  return (
    <Relay.RootContainer
      Component={ProjectContainer}
      route={route}
      renderFetched={data => <ProjectContainer {...props} {...data} />}
      renderLoading={() => <MediasLoading />}
    />
  );
};

export default Project;
