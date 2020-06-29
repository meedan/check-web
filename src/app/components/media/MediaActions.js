import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import { FormattedMessage, injectIntl } from 'react-intl';
import IconMoreVert from '@material-ui/icons/MoreVert';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemText from '@material-ui/core/ListItemText';
import styled from 'styled-components';
import rtlDetect from 'rtl-detect';
import { can } from '../Can';
import { getCurrentProjectId } from '../../helpers';

const StyledIconMenuWrapper = styled.div`
  margin-${props => (props.isRtl ? 'right' : 'left')}: auto;
`;

class MediaActions extends Component {
  state = {
    anchorEl: null,
  };

  handleOpenMenu = (e) => {
    this.setState({ anchorEl: e.currentTarget });
  };

  handleCloseMenu = () => {
    this.setState({ anchorEl: null });
  };

  handleActionAndClose = (callback) => {
    this.handleCloseMenu();
    if (callback) {
      callback();
    }
  };

  handleEmbed() {
    const { media } = this.props;
    const projectId = getCurrentProjectId(media.project_ids);
    const projectPart = projectId ? `/project/${projectId}` : '';
    browserHistory.push(`/${media.team.slug}${projectPart}/media/${media.dbid}/embed`);
  }

  render() {
    const {
      media,
      handleEdit,
      handleMove,
      handleRefresh,
      handleSendToTrash,
      handleAddToList,
      handleRemoveFromList,
      handleRestore,
      handleAssign,
      handleStatusLock,
    } = this.props;
    const menuItems = [];

    const currentProjectId = getCurrentProjectId(media.project_ids);
    const showRemoveFromList = media.project_ids.indexOf(currentProjectId) > -1;

    if (can(media.permissions, 'update ProjectMedia') && !media.archived && handleEdit) {
      menuItems.push((
        <MenuItem
          key="mediaActions.edit"
          className="media-actions__edit"
          onClick={() => this.handleActionAndClose(handleEdit)}
        >
          <ListItemText
            primary={
              <FormattedMessage id="mediaActions.edit" defaultMessage="Edit title and description" />
            }
          />
        </MenuItem>));
    }

    if (can(media.permissions, 'update ProjectMedia') && !media.archived) {
      if ((media.url || media.media.url) && handleRefresh) {
        menuItems.push((
          <MenuItem
            key="mediaActions.refresh"
            className="media-actions__refresh"
            id="media-actions__refresh"
            onClick={() => this.handleActionAndClose(handleRefresh)}
          >
            <ListItemText
              primary={
                <FormattedMessage id="mediaActions.refresh" defaultMessage="Refresh" />
              }
            />
          </MenuItem>));
      }
    }

    if (can(media.permissions, 'update Status') && !media.archived && handleAssign) {
      menuItems.push((
        <MenuItem
          key="mediaActions.assign"
          className="media-actions__assign"
          onClick={() => this.handleActionAndClose(handleAssign)}
        >
          <ListItemText
            primary={
              <FormattedMessage id="mediaActions.assignOrUnassign" defaultMessage="Assignment" />
            }
          />
        </MenuItem>));
    }

    if (can(media.permissions, 'lock Annotation') && !media.archived && handleStatusLock) {
      menuItems.push((
        <MenuItem
          key="mediaActions.lockStatus"
          className="media-actions__lock-status"
          onClick={() => this.handleActionAndClose(handleStatusLock)}
        >
          <ListItemText
            primary={media.last_status_obj.locked ?
              <FormattedMessage id="mediaActions.unlockStatus" defaultMessage="Unlock status" /> :
              <FormattedMessage id="mediaActions.lockStatus" defaultMessage="Lock status" />}
          />
        </MenuItem>));
    }

    if (can(media.permissions, 'update ProjectMedia') && !media.archived && handleSendToTrash) {
      menuItems.push((
        <MenuItem
          key="mediaActions.sendToTrash"
          className="media-actions__send-to-trash"
          onClick={() => this.handleActionAndClose(handleSendToTrash)}
        >
          <ListItemText
            primary={<FormattedMessage id="mediaActions.sendToTrash" defaultMessage="Send to trash" />}
          />
        </MenuItem>));
    }

    if (can(media.permissions, 'restore ProjectMedia') && media.archived && handleRestore) {
      menuItems.push((
        <MenuItem
          key="mediaActions.restore"
          className="media-actions__restore"
          id="media-actions__restore"
          onClick={() => this.handleActionAndClose(handleRestore)}
        >
          <ListItemText
            primary={<FormattedMessage id="mediaActions.restore" defaultMessage="Restore from trash" />}
          />
        </MenuItem>));
    }

    if (can(media.permissions, 'update ProjectMedia') && !media.archived) {
      if (handleMove) {
        menuItems.push((
          <MenuItem
            key="mediaActions.move"
            className="media-actions__move"
            onClick={() => this.handleActionAndClose(handleMove)}
          >
            <ListItemText
              primary={<FormattedMessage id="mediaActions.move" defaultMessage="Move" />}
            />
          </MenuItem>));
      }
    }

    if (can(media.permissions, 'update ProjectMedia') && !media.archived && handleAddToList) {
      menuItems.push((
        <MenuItem
          key="mediaActions.addToList"
          className="media-actions__add-to-list"
          onClick={() => this.handleActionAndClose(handleAddToList)}
        >
          <ListItemText
            primary={<FormattedMessage id="mediaActions.addToList" defaultMessage="Add to list" />}
          />
        </MenuItem>));
    }

    if (can(media.permissions, 'update ProjectMedia') &&
      !media.archived &&
      handleRemoveFromList &&
      showRemoveFromList) {
      menuItems.push((
        <MenuItem
          key="mediaActions.removeFromList"
          className="media-actions__remove-from-list"
          onClick={() => this.handleActionAndClose(handleRemoveFromList)}
        >
          <ListItemText
            primary={<FormattedMessage id="mediaActions.removeFromList" defaultMessage="Remove from list" />}
          />
        </MenuItem>));
    }

    return menuItems.length ?
      <StyledIconMenuWrapper
        isRtl={rtlDetect.isRtlLang(this.props.intl.locale)}
      >
        <IconButton
          tooltip={
            <FormattedMessage id="mediaActions.tooltip" defaultMessage="Item actions" />
          }
          onClick={this.handleOpenMenu}
        >
          <IconMoreVert className="media-actions__icon" />
        </IconButton>
        <Menu
          className="media-actions"
          anchorEl={this.state.anchorEl}
          open={Boolean(this.state.anchorEl)}
          onClose={this.handleCloseMenu}
        >
          {menuItems}
        </Menu>
      </StyledIconMenuWrapper>
      : null;
  }
}

export default injectIntl(MediaActions);
