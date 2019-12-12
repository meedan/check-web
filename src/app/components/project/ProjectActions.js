import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl } from 'react-intl';
import IconMoreHoriz from 'material-ui/svg-icons/navigation/more-horiz';
import IconButton from 'material-ui/IconButton';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import styled from 'styled-components';
import rtlDetect from 'rtl-detect';
import ProjectAssignment from './ProjectAssignment';
import { can } from '../Can';
import CheckContext from '../../CheckContext';

const StyledIconMenuWrapper = styled.div`
  margin-${props => (props.isRtl ? 'right' : 'left')}: auto;
`;

class ProjectActions extends Component {
  state = {
    anchorEl: null,
    openAssignPopup: false,
  };

  handleEdit = () => {
    const { history } = new CheckContext(this).getContextStore();
    history.push(`${window.location.pathname.match(/.*\/project\/\d+/)[0]}/edit`);
  };

  handleClick = (event) => {
    this.setState({ anchorEl: event.currentTarget });
  };

  handleAssign = () => {
    this.setState({ openAssignPopup: true });
  };

  handleAssignClose = () => {
    this.setState({ openAssignPopup: false });
  };

  render() {
    const {
      project,
    } = this.props;

    const menuItems = [];

    if (can(project.permissions, 'update Project')) {
      menuItems.push((
        <MenuItem
          key="projectActions.edit"
          className="project-actions__edit"
          onClick={this.handleEdit}
        >
          <FormattedMessage id="ProjectActions.edit" defaultMessage="Edit" />
        </MenuItem>));
    }

    if (can(project.permissions, 'update Project')) {
      menuItems.push((
        <MenuItem
          key="projectActions.assign"
          className="project-actions__assign"
          onClick={this.handleAssign}
        >
          <FormattedMessage id="projectActions.assignOrUnassign" defaultMessage="Assign / Unassign" />
        </MenuItem>));
    }

    return menuItems.length ?
      <StyledIconMenuWrapper isRtl={rtlDetect.isRtlLang(this.props.intl.locale)}>
        <IconMenu
          onClick={this.handleClick}
          className="project-actions"
          iconButtonElement={
            <IconButton
              tooltip={
                <FormattedMessage id="ProjectActions.tooltip" defaultMessage="List actions" />
              }
            >
              <IconMoreHoriz className="project-actions__icon" />
            </IconButton>}
        >
          {menuItems}
        </IconMenu>
        {
          this.state.openAssignPopup ?
            <ProjectAssignment
              anchorEl={this.state.anchorEl}
              onDismiss={this.handleAssignClose}
              project={project}
            />
            : null
        }
      </StyledIconMenuWrapper>
      : null;
  }
}

ProjectActions.contextTypes = {
  store: PropTypes.object,
};

export default injectIntl(ProjectActions);
