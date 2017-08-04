import React, { Component } from 'react';
import Relay from 'react-relay';
import styled from 'styled-components';
import ProjectRoute from '../../relay/ProjectRoute';
import { black54, subheading2, ellipsisStyles } from '../../styles/js/variables';

class ProjectHeaderComponent extends Component {

  render() {
    const currentProject = this.props.project;

    const Title = styled.h3`
      font: ${subheading2};
      color: ${black54};
      ${ellipsisStyles}
    `;

    return (<Title>{currentProject.title}</Title>);
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
