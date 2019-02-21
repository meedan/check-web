import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl } from 'react-intl';
import IconMoreHoriz from 'material-ui/svg-icons/navigation/more-horiz';
import IconButton from 'material-ui/IconButton';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import styled from 'styled-components';
import rtlDetect from 'rtl-detect';
import { can } from '../Can';
import CheckContext from '../../CheckContext';

const StyledIconMenuWrapper = styled.div`
  margin-${props => (props.isRtl ? 'right' : 'left')}: auto;
`;

class MediaActions extends Component {
  handleEmbed() {
    const { media } = this.props;
    const { history } = new CheckContext(this).getContextStore();
    history.push(`/${media.team.slug}/project/${media.project_id}/media/${media.dbid}/embed`);
  }

  render() {
    const {
      media,
      handleEdit,
      handleMove,
      handleRefresh,
      handleSendToTrash,
      handleRestore,
      handleDeleteForever,
      handleAssign,
      handleStatusLock,
    } = this.props;
    const menuItems = [];

    if (can(media.permissions, 'update ProjectMedia') && !media.archived) {
      menuItems.push((
        <MenuItem
          key="mediaActions.edit"
          className="media-actions__edit"
          onClick={handleEdit}
        >
          <FormattedMessage id="mediaActions.edit" defaultMessage="Edit" />
        </MenuItem>));
    }

    if (can(media.permissions, 'restore ProjectMedia') && media.archived) {
      menuItems.push((
        <MenuItem
          key="mediaActions.restore"
          className="media-actions__restore"
          id="media-actions__restore"
          onClick={handleRestore}
        >
          <FormattedMessage id="mediaActions.restore" defaultMessage="Restore to project" />
        </MenuItem>));
    }

    if (can(media.permissions, 'administer Content') && !media.archived) {
      menuItems.push((
        <MenuItem
          key="mediaActions.move"
          className="media-actions__move"
          onClick={handleMove}
        >
          <FormattedMessage id="mediaActions.move" defaultMessage="Move" />
        </MenuItem>));

      if (media.url) {
        menuItems.push((
          <MenuItem
            key="mediaActions.refresh"
            className="media-actions__refresh"
            id="media-actions__refresh"
            onClick={handleRefresh}
          >
            <FormattedMessage id="mediaActions.refresh" defaultMessage="Refresh" />
          </MenuItem>));
      }
    }

    if (can(media.permissions, 'update ProjectMedia') && !media.archived) {
      if (!media.archived) {
        menuItems.push((
          <MenuItem
            key="mediaActions.sendToTrash"
            className="media-actions__send-to-trash"
            onClick={handleSendToTrash}
          >
            <FormattedMessage id="mediaActions.sendToTrash" defaultMessage="Send to trash" />
          </MenuItem>));
      }
    }

    if (can(media.permissions, 'embed ProjectMedia') &&
      !media.archived) {
      menuItems.push((
        <MenuItem
          key="mediaActions.embed"
          className="media-actions__embed"
          id="media-actions__embed"
          onClick={this.handleEmbed.bind(this)}
        >
          <FormattedMessage id="mediaActions.embed" defaultMessage="Embed" />
        </MenuItem>));
    }

    if (can(media.permissions, 'destroy ProjectMedia')) {
      menuItems.push((
        <MenuItem
          key="mediaActions.deleteForever"
          className="media-actions__delete-forever"
          id="media-actions__delete-forever"
          onClick={handleDeleteForever}
        >
          <FormattedMessage id="mediaActions.deleteForever" defaultMessage="Delete forever" />
        </MenuItem>));
    }

    if (can(media.permissions, 'update Status') && !media.archived) {
      menuItems.push((
        <MenuItem
          key="mediaActions.assign"
          className="media-actions__assign"
          onClick={handleAssign}
        >
          <FormattedMessage id="mediaActions.assignOrUnassign" defaultMessage="Assign / Unassign" />
        </MenuItem>));
    }

    if (can(media.permissions, 'lock Annotation') && !media.archived) {
      menuItems.push((
        <MenuItem
          key="mediaActions.lockStatus"
          className="media-actions__lock-status"
          onClick={handleStatusLock}
        >
          { media.last_status_obj.locked ?
            <FormattedMessage id="mediaActions.unlockStatus" defaultMessage="Unlock status" /> :
            <FormattedMessage id="mediaActions.lockStatus" defaultMessage="Lock status" />}
        </MenuItem>));
    }

    return menuItems.length ?
      <StyledIconMenuWrapper isRtl={rtlDetect.isRtlLang(this.props.intl.locale)}>
        <IconMenu
          className="media-actions"
          iconButtonElement={
            <IconButton>
              <IconMoreHoriz className="media-actions__icon" />
            </IconButton>}
        >
          {menuItems}
        </IconMenu>
      </StyledIconMenuWrapper>
      : null;
  }
}

MediaActions.contextTypes = {
  store: PropTypes.object,
};

export default injectIntl(MediaActions);
