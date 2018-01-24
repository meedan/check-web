import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import Relay from 'react-relay';
import IconEdit from 'material-ui/svg-icons/image/edit';
import ProjectRoute from '../ProjectRoute';
import Can from '../../components/Can';
import CheckContext from '../../CheckContext';
import { SmallerStyledIconButton } from '../../styles/js/shared';

class ProjectMenu extends Component {
  handleEditClick() {
    const { history } = new CheckContext(this).getContextStore();
    history.push(`${window.location.pathname.match(/.*\/project\/\d+/)[0]}/edit`);
  }

  render() {
    const { project } = this.props;

    const editProjectButton = (
      <SmallerStyledIconButton
        onClick={this.handleEditClick.bind(this)}
        tooltip={<FormattedMessage id="projectMenuRelay.editProject" defaultMessage="Edit project" />}
      >
        <IconEdit />
      </SmallerStyledIconButton>
    );

    return (
      <Can permissions={project.permissions} permission="update Project">
        <div
          key="projectMenuRelay.editProject"
          className="project-menu"
        >
          {editProjectButton}
        </div>
      </Can>
    );
  }
}

ProjectMenu.contextTypes = {
  store: PropTypes.object,
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
        team {
          id,
          dbid,
          slug,
          permissions,
          limits
        }
      }
    `,
  },
});

const ProjectMenuRelay = (props) => {
  if (props.params && props.params.projectId) {
    const route = new ProjectRoute({ contextId: props.params.projectId });
    return <Relay.RootContainer Component={ProjectMenuContainer} route={route} />;
  }
  return null;
};

export default ProjectMenuRelay;
