import React, { Component, PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import Relay from 'react-relay';
import ProjectRoute from './ProjectRoute';
import Can from '../components/Can';
import CheckContext from '../CheckContext';
import { bemClass } from '../helpers';

class ProjectMenu extends Component {
  handleEditClick() {
    const overlay = document.querySelector('.header-actions__menu-overlay--active')
    if (overlay) {
      overlay.click(); // TODO: better way to clear overlay e.g. passing fn from HeaderActions
    }

    const history = new CheckContext(this).getContextStore().history;
    const editPath = `${window.location.pathname.match(/.*\/project\/\d+/)[0]}/edit`;
    history.push(editPath);
  }

  render() {
    const { project } = this.props;

    return (
      <Can permissions={project.permissions} permission="update Project">
        <li className="project-menu / header-actions__menu-item" onClick={this.handleEditClick.bind(this)}>
          <FormattedMessage id="projectMenuRelay.editProject" defaultMessage="Edit project" />
        </li>
      </Can>
    );
  }
}

ProjectMenu.contextTypes = {
  store: React.PropTypes.object,
};

const ProjectMenuContainer = Relay.createContainer(ProjectMenu, {
  fragments: {
    project: () => Relay.QL`
      fragment on Project {
        id,
        dbid,
        title,
        description,
        permissions,
        get_slack_channel,
        team {
          id,
          dbid,
          slug,
          permissions,
          get_slack_notifications_enabled
        }
      }
    `,
  }
});

class ProjectMenuRelay extends Component {
  render() {
    if (this.props.params && this.props.params.projectId) {
      const route = new ProjectRoute({ contextId: this.props.params.projectId });
      return (<Relay.RootContainer Component={ProjectMenuContainer} route={route} />);
    }
    else {
      return null;
    }
  }
}

export default ProjectMenuRelay;
