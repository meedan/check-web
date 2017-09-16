import React, { Component } from 'react';
import Relay from 'react-relay';
import { Link } from 'react-router';
import IconArrowBack from 'material-ui/svg-icons/navigation/arrow-back';
import IconButton from 'material-ui/IconButton';
import ProjectRoute from '../../relay/ProjectRoute';
import { HeaderTitle, black54 } from '../../styles/js/variables';

class ProjectHeaderComponent extends Component {

  render() {
    const currentProject = this.props.project;
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
        <HeaderTitle offset={!isProjectSubpage}>{currentProject.title}</HeaderTitle>
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
