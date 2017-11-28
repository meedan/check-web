import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import IconEdit from 'material-ui/svg-icons/image/edit';
import { SmallerStyledIconButton } from '../../styles/js/shared';
import Can from '../Can';
import CheckContext from '../../CheckContext';

class ProjectMenu extends Component {
  handleEditClick() {
    const history = new CheckContext(this).getContextStore().history;
    const editPath = `${window.location.pathname.match(/.*\/project\/\d+/)[0]}/edit`;
    history.push(editPath);
  }

  render() {
    const { project } = this.props;

    const editProjectButton = (<SmallerStyledIconButton
      onClick={this.handleEditClick.bind(this)}
      tooltip={<FormattedMessage id="projectMenuRelay.editProject" defaultMessage="Edit project" />}
    >
      <IconEdit />
    </SmallerStyledIconButton>);

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
  store: React.PropTypes.object,
};

export default ProjectMenu;
