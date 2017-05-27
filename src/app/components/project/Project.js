import React, { Component, PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import Relay from 'react-relay';
import { Link } from 'react-router';
import DocumentTitle from 'react-document-title';
import ProjectRoute from '../../relay/ProjectRoute';
import ProjectHeader from './ProjectHeader';
import { CreateProjectMedia } from '../media';
import Can from '../Can';
import config from 'config';
import { pageTitle } from '../../helpers';
import CheckContext from '../../CheckContext';
import ContentColumn from '../layout/ContentColumn';
import MediasLoading from '../media/MediasLoading';
import Search from '../Search';

const pageSize = 20;

class ProjectComponent extends Component {
  getContext() {
    const context = new CheckContext(this);
    return context;
  }

  currentContext() {
    return this.getContext().getContextStore();
  }

  setContextProject() {
    const context = this.getContext(),
      currentContext = this.currentContext(),
      newContext = {};

    newContext.project = this.props.project;

    let notFound = false;
    if (!currentContext.team || currentContext.team.slug != this.props.project.team.slug) {
      newContext.team = this.props.project.team;
      notFound = true;
    }

    context.setContextStore(newContext);

    if (notFound) {
      currentContext.history.push('/check/404');
    }
  }

  componentDidMount() {
    this.setContextProject();
  }

  componentDidUpdate() {
    this.setContextProject();
  }

  render() {
    const that = this;
    const project = this.props.project;
    const title = pageTitle(project.title, false, this.currentContext().team);

    return (
      <DocumentTitle title={title}>
        <div className="project">
          { project.description && project.description.trim().length ? (
            <div className="project__description">
              <p className="project__description-container">{project.description}</p>
            </div>
          ) : null }
          <Can permissions={project.permissions} permission="create Media">
            <CreateProjectMedia projectComponent={that} />
          </Can>

          <ContentColumn>
            <Search team={project.team.slug} project={project} query={this.props.params.query || '{}'} fields={['status', 'sort', 'tags']} title={title} />
          </ContentColumn>

        </div>
      </DocumentTitle>
    );
  }
}

ProjectComponent.contextTypes = {
  store: React.PropTypes.object,
};

const ProjectContainer = Relay.createContainer(ProjectComponent, {
  initialVariables: {
    contextId: null,
  },
  fragments: {
    project: ({ Component, contextId }) => Relay.QL`
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
          search_id
        },
      }
    `,
  },
});

class Project extends Component {
  render() {
    const projectId = this.props.params.projectId;
    const route = new ProjectRoute({ contextId: parseInt(projectId) });
    return (
      <Relay.RootContainer
        Component={ProjectContainer}
        route={route}
        renderFetched={data => <ProjectContainer {...this.props} {...data} />}
        renderLoading={function () {
          return (<MediasLoading />);
        }}
      />
    );
  }
}

export default Project;
