import React, { Component } from 'react';
import Relay from 'react-relay';
import styled from 'styled-components';
import ProjectRoute from '../../relay/ProjectRoute';
import { CreateProjectMedia } from '../media';
import Can from '../Can';
import PageTitle from '../PageTitle';
import CheckContext from '../../CheckContext';
import MediasLoading from '../media/MediasLoading';
import Search from '../Search';
import { ContentColumn, units } from '../../styles/js/shared';

const ProjectWrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  height: 100%;
  overflow-y: visible;
  padding: 0 ${units(2)} ${units(5)};
  position: relative;
  width: 100%;
`;

class ProjectComponent extends Component {

  componentDidMount() {
    this.setContextProject();
  }

  componentDidUpdate() {
    this.setContextProject();
  }

  getContext() {
    const context = new CheckContext(this);
    return context;
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
      currentContext.history.push('/check/404');
    }
  }

  currentContext() {
    return this.getContext().getContextStore();
  }

  render() {
    const that = this;
    const project = this.props.project;

    return (
      <PageTitle prefix={project.title} skipTeam={false} team={this.currentContext().team}>
        <ProjectWrapper className="project">
          {project.description && project.description.trim().length
            ? <div style={{ margin: `0 ${units(1)} ${units(1)}` }} className="project__description">
              <p>{project.description}</p>
            </div>
            : null}
          <Can permissions={project.permissions} permission="create Media">
            <CreateProjectMedia projectComponent={that} />
          </Can>

          <ContentColumn noPadding>
            <Search team={project.team.slug} project={project} query={this.props.params.query || '{}'} fields={['status', 'sort', 'tags', 'show']} />
          </ContentColumn>

        </ProjectWrapper>
      </PageTitle>
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

class Project extends Component {
  render() {
    const projectId = this.props.params.projectId;
    const route = new ProjectRoute({ contextId: parseInt(projectId, 10) });
    return (
      <Relay.RootContainer
        Component={ProjectContainer}
        route={route}
        renderFetched={data => <ProjectContainer {...this.props} {...data} />}
        renderLoading={function () {
          return <MediasLoading />;
        }}
      />
    );
  }
}

export default Project;
