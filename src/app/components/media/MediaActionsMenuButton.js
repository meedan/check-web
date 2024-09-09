/* eslint-disable relay/unused-fields, react/sort-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import { FormattedMessage, injectIntl, defineMessages } from 'react-intl';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemText from '@material-ui/core/ListItemText';
import { can } from '../Can';
import CheckArchivedFlags from '../../CheckArchivedFlags';
import IconMoreVert from '../../icons/more_vert.svg';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';

const messages = defineMessages({
  tooltip: {
    id: 'mediaActions.tooltip',
    defaultMessage: 'Item actions',
    description: 'Button to call of the menu of actions that can be performed on an item',
  },
});

class MediaActionsMenuButton extends React.PureComponent {
  static propTypes = {
    projectMedia: PropTypes.shape({
      id: PropTypes.string.isRequired,
      permissions: PropTypes.string.isRequired,
      archived: PropTypes.number.isRequired,
      last_status_obj: PropTypes.shape({
        locked: PropTypes.bool.isRequired,
      }).isRequired,
      media: PropTypes.shape({
        url: PropTypes.string,
      }).isRequired,
    }).isRequired,
    handleSendToTrash: PropTypes.func.isRequired,
    handleSendToSpam: PropTypes.func.isRequired,
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

  handleActionAndClose = (e, callback) => {
    if (callback) {
      callback(e);
    }
    this.handleCloseMenu();
  };

  render() {
    const {
      handleAssign,
      handleItemHistory,
      handleSendToSpam,
      handleSendToTrash,
      handleStatusLock,
      isParent,
      projectMedia,
    } = this.props;
    const menuItems = [];

    if (isParent) {
      if (can(projectMedia.permissions, 'update Status') && [CheckArchivedFlags.NONE, CheckArchivedFlags.UNCONFIRMED].includes(projectMedia.archived)) {
        menuItems.push((
          <MenuItem
            className="media-actions__assign"
            key="mediaActions.assign"
            onClick={e => this.handleActionAndClose(e, handleAssign)}
          >
            <ListItemText
              primary={
                <FormattedMessage defaultMessage="Assign to…" description="Menu item to select a team to assign item" id="mediaActions.assignOrUnassign" />
              }
            />
          </MenuItem>));
      }

      if (can(projectMedia.permissions, 'lock Annotation') && projectMedia.archived === CheckArchivedFlags.NONE) {
        menuItems.push((
          <MenuItem
            className="media-actions__lock-status"
            key="mediaActions.lockStatus"
            onClick={e => this.handleActionAndClose(e, handleStatusLock)}
          >
            <ListItemText
              primary={projectMedia.last_status_obj?.locked ?
                <FormattedMessage defaultMessage="Unlock status" description="Menu item to unlock an item status so it can be changed" id="mediaActions.unlockStatus" /> :
                <FormattedMessage defaultMessage="Lock status" description="Menu item to lock an item status so it cannot be changed" id="mediaActions.lockStatus" />}
            />
          </MenuItem>));
      }

      if (can(projectMedia.permissions, 'update ProjectMedia') && (
        projectMedia.archived === CheckArchivedFlags.NONE ||
        projectMedia.archived === CheckArchivedFlags.UNCONFIRMED
      )) {
        menuItems.push((
          <MenuItem
            className="media-actions__send-to-trash"
            key="mediaActions.sendToTrash"
            onClick={e => this.handleActionAndClose(e, handleSendToTrash)}
          >
            <ListItemText
              primary={<FormattedMessage defaultMessage="Send to Trash" description="Menu item to move the current item to the trash list" id="mediaActions.sendToTrash" />}
            />
          </MenuItem>));
        menuItems.push((
          <MenuItem
            className="media-actions__send-to-spam"
            key="mediaActions.sendToSpam"
            onClick={e => this.handleActionAndClose(e, handleSendToSpam)}
          >
            <ListItemText
              primary={<FormattedMessage defaultMessage="Mark as Spam" description="Menu item to move the current item to the spam list" id="mediaActions.sendToSpam" />}
            />
          </MenuItem>));
      }
    }

    menuItems.push((
      <MenuItem
        className="media-actions__history"
        id="media-actions__history"
        key="mediaActions.history"
        onClick={e => this.handleActionAndClose(e, handleItemHistory)}
      >
        <ListItemText
          primary={<FormattedMessage defaultMessage="Item history" description="Menu item to view the history of changes to the item" id="mediaActions.history" />}
        />
      </MenuItem>
    ));
    return menuItems.length ? (
      <>
        <ButtonMain
          buttonProps={{
            id: 'media-actions-menu-button__icon-button',
          }}
          iconCenter={<IconMoreVert className="media-actions__icon" />}
          size="default"
          theme="text"
          title={this.props.intl.formatMessage(messages.tooltip)}
          variant="outlined"
          onClick={this.handleOpenMenu}
        />
        <Menu
          anchorEl={this.state.anchorEl}
          className="media-actions"
          open={Boolean(this.state.anchorEl)}
          onClose={this.handleCloseMenu}
        >
          {menuItems}
        </Menu>
      </>
    ) : null;
  }
}

// eslint-disable-next-line import/no-unused-modules
export { MediaActionsMenuButton };
export default createFragmentContainer(injectIntl(MediaActionsMenuButton), {
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
