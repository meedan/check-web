import React, { Component } from 'react';
import styled from 'styled-components';
import CreateProjectMedia from '../media/CreateMedia';
import Can from '../Can';
import PageTitle from '../PageTitle';
import CheckContext from '../../CheckContext';
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

class Project extends Component {
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
      currentContext.history.push('/check/404');
    }
  }

  currentContext() {
    return this.getContext().getContextStore();
  }

  render() {
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
            <CreateProjectMedia projectComponent={this} />
          </Can>

          <ContentColumn noPadding>
            <Search team={project.team.slug} project={project} query={this.props.params.query || '{}'} fields={['status', 'sort', 'tags', 'show']} />
          </ContentColumn>

        </ProjectWrapper>
      </PageTitle>
    );
  }
}

Project.contextTypes = {
  store: React.PropTypes.object,
};

export default Project;
