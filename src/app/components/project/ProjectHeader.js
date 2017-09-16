import React, { Component } from 'react';
import Relay from 'react-relay';
import { Link } from 'react-router';
import IconArrowBack from 'material-ui/svg-icons/navigation/arrow-back';
import IconButton from 'material-ui/IconButton';
import styled from 'styled-components';
import ProjectRoute from '../../relay/ProjectRoute';
import { black54, units, subheading2, ellipsisStyles } from '../../styles/js/variables';

class ProjectHeaderComponent extends Component {

  render() {
    const currentProject = this.props.project;

    const Title = styled.h3`
      font: ${subheading2};
      color: ${black54};
      ${ellipsisStyles}
      margin: 0 ${props => props.offset ? units(2) : '0'};
    `;
    const path = this.props.location
      ? this.props.location.pathname
      : window.location.pathname;
    const regexProject = /(.*\/project\/[0-9]+)/;
    const regexMedia = /\/media\/[0-9]/;
    const backUrl = (regexMedia.test(path)) ? path.match(regexProject)[1] : null;
    const isProjectSubpage = regexMedia.test(path);

    return (
      <div style={{ display: 'flex', alignItems: 'center', overflow: 'hidden' }}>

        {isProjectSubpage
          ? <IconButton
            containerElement={<Link to={backUrl} />}
            className="project-header__back-button"
          >
            <IconArrowBack color={black54} />
          </IconButton>
          : null}
        <Title offset={!isProjectSubpage}>{currentProject.title}</Title>
      </div>
    );
  }
}

ProjectHeaderComponent.contextTypes = {
  store: React.PropTypes.object,
};

const ProjectHeaderContainer = Relay.createContainer(ProjectHeaderComponent, {
  fragments: {
    project: () => Relay.QL`
      fragment on Project {
        title,
        description
      }
    `,
  },
});

class ProjectHeader extends Component {
  render() {
    if (this.props.params && this.props.params.projectId) {
      const route = new ProjectRoute({ contextId: this.props.params.projectId });
      return (<Relay.RootContainer
        Component={ProjectHeaderContainer}
        route={route}
      />);
    }
    return null;
  }
}

export default ProjectHeader;
