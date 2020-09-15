import React from 'react';
import PropTypes from 'prop-types';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import { FormattedMessage } from 'react-intl';
import IconMoreVert from '@material-ui/icons/MoreVert';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemText from '@material-ui/core/ListItemText';
import { can } from '../Can';

class MediaActionsMenuButton extends React.PureComponent {
  static propTypes = {
    projectMedia: PropTypes.shape({
      id: PropTypes.string.isRequired,
      permissions: PropTypes.string.isRequired,
      archived: PropTypes.bool.isRequired,
      last_status_obj: PropTypes.shape({
        locked: PropTypes.bool.isRequired,
      }).isRequired,
      media: PropTypes.shape({
        url: PropTypes.string,
      }).isRequired,
    }).isRequired,
    handleRefresh: PropTypes.func.isRequired,
    handleSendToTrash: PropTypes.func.isRequired,
    handleRestore: PropTypes.func.isRequired,
    handleAssign: PropTypes.func.isRequired,
    handleStatusLock: PropTypes.func.isRequired,
  };

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

  render() {
    const {
      projectMedia,
      handleRefresh,
      handleSendToTrash,
      handleRestore,
      handleAssign,
      handleStatusLock,
    } = this.props;
    const menuItems = [];

    if (can(projectMedia.permissions, 'update ProjectMedia') && !projectMedia.archived) {
      if (projectMedia.media.url) {
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

    if (can(projectMedia.permissions, 'update Status') && !projectMedia.archived) {
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

    if (can(projectMedia.permissions, 'lock Annotation') && !projectMedia.archived) {
      menuItems.push((
        <MenuItem
          key="mediaActions.lockStatus"
          className="media-actions__lock-status"
          onClick={() => this.handleActionAndClose(handleStatusLock)}
        >
          <ListItemText
            primary={projectMedia.last_status_obj.locked ?
              <FormattedMessage id="mediaActions.unlockStatus" defaultMessage="Unlock status" /> :
              <FormattedMessage id="mediaActions.lockStatus" defaultMessage="Lock status" />}
          />
        </MenuItem>));
    }

    if (can(projectMedia.permissions, 'update ProjectMedia') && !projectMedia.archived) {
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

    if (can(projectMedia.permissions, 'restore ProjectMedia') && projectMedia.archived) {
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

    return menuItems.length ? (
      <div>
        <IconButton
          tooltip={<FormattedMessage id="mediaActions.tooltip" defaultMessage="Item actions" />}
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
      </div>
    ) : null;
  }
}

export default createFragmentContainer(MediaActionsMenuButton, {
  projectMedia: graphql`
    fragment MediaActionsMenuButton_projectMedia on ProjectMedia {
      id
      permissions
      archived
      media {
        url
      }
      last_status_obj {
        locked
      }
    }
  `,
});
