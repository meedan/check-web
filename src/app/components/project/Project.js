import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import styled from 'styled-components';
import ProjectActions from './ProjectActions';
import ProjectRoute from '../../relay/ProjectRoute';
import PageTitle from '../PageTitle';
import CheckContext from '../../CheckContext';
import ParsedText from '../ParsedText';
import MediasLoading from '../media/MediasLoading';
import Search from '../search/Search';
import { Row, units, display1, ContentColumn } from '../../styles/js/shared';
import UpdateUserMutation from '../../relay/mutations/UpdateUserMutation';

const ProjectWrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  height: 100%;
  overflow-y: visible;
  padding: 0 ${units(2)}};
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
    const view = this.props.route.view || window.storage.getValue('view-mode') || 'list';
    window.storage.set('view-mode', view);

    return (
      <PageTitle prefix={project.title} skipTeam={false} team={this.currentContext().team}>
        <ProjectWrapper className="project">
          <ContentColumn wide={view === 'dense'}>
            <Row>
              <div style={{ font: display1 }} className="project__title">
                <ParsedText text={project.title} />
              </div>
              <ProjectActions project={project} />
            </Row>
            {project.description && project.description.trim().length ?
              <div style={{ margin: `0 ${units(1)} ${units(1)}` }} className="project__description">
                <ParsedText text={project.description} />
              </div>
              : null}
          </ContentColumn>
          <Search
            team={project.team.slug}
            project={project}
            query={this.props.params.query || '{}'}
            fields={['date', 'keyword', 'status', 'sort', 'tags', 'show', 'dynamic', 'bulk', 'rules']}
            view={view}
          />
        </ProjectWrapper>
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
        team {
          id,
          dbid,
          slug,
          search_id,
          verification_statuses,
          translation_statuses,
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
