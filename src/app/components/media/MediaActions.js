import React, { Component } from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import IconMoreHoriz from 'material-ui/svg-icons/navigation/more-horiz';
import IconButton from 'material-ui/IconButton';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import styled from 'styled-components';
import config from 'config';
import rtlDetect from 'rtl-detect';
import { can } from '../Can';
import CheckContext from '../../CheckContext';

const StyledIconMenuWrapper = styled.div`
  margin-${props => (props.isRtl ? 'right' : 'left')}: auto;
`;

class MediaActions extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isMenuOpen: false,
    };
  }

  handleEmbed() {
    const media = this.props.media;
    const history = new CheckContext(this).getContextStore().history;
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
    } = this.props;

    const menuItems = [];

    if (can(media.permissions, 'update ProjectMedia')) {
      menuItems.push(
        <MenuItem
          key="mediaActions.edit"
          className="media-actions__edit"
          onClick={handleEdit}
        >
          <FormattedMessage id="mediaActions.edit" defaultMessage="Edit" />
        </MenuItem>,
      );
    }

    if (can(media.permissions, 'restore ProjectMedia') && media.archived) {
      menuItems.push(
        <MenuItem
          key="mediaActions.restore"
          className="media-actions__restore"
          id="media-actions__restore"
          onClick={handleRestore}
        >
          <FormattedMessage id="mediaActions.restore" defaultMessage="Restore to project" />
        </MenuItem>,
      );
    }

    if (can(media.permissions, 'update ProjectMedia')) {
      menuItems.push(
        <MenuItem
          key="mediaActions.move"
          className="media-actions__move"
          onClick={handleMove}
        >
          <FormattedMessage id="mediaActions.move" defaultMessage="Move" />
        </MenuItem>,
      );

      if (!media.archived) {
        menuItems.push(
          <MenuItem
            key="mediaActions.sendToTrash"
            className="media-actions__send-to-trash"
            onClick={handleSendToTrash}
          >
            <FormattedMessage id="mediaActions.sendToTrash" defaultMessage="Send to trash" />
          </MenuItem>,
        );
      }

      if (media.url) {
        menuItems.push(
          <MenuItem
            key="mediaActions.refresh"
            className="media-actions__refresh"
            id="media-actions__refresh"
            onClick={handleRefresh}
          >
            <FormattedMessage id="mediaActions.refresh" defaultMessage="Refresh" />
          </MenuItem>,
        );
      }
    }

    if (config.appName === 'check' && can(media.permissions, 'embed ProjectMedia')) {
      menuItems.push(
        <MenuItem
          key="mediaActions.embed"
          className="media-actions__embed"
          id="media-actions__embed"
          onClick={this.handleEmbed.bind(this)}
        >
          <FormattedMessage id="mediaActions.embed" defaultMessage="Embed" />
        </MenuItem>,
      );
    }

    if (can(media.permissions, 'destroy ProjectMedia')) {
      menuItems.push(
        <MenuItem
          key="mediaActions.deleteForever"
          className="media-actions__delete-forever"
          id="media-actions__delete-forever"
          onClick={handleDeleteForever}
        >
          <FormattedMessage id="mediaActions.deleteForever" defaultMessage="Delete forever" />
        </MenuItem>,
      );
    }

    return menuItems.length
      ? <StyledIconMenuWrapper isRtl={rtlDetect.isRtlLang(this.props.intl.locale)}>
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
  store: React.PropTypes.object,
};

export default injectIntl(MediaActions);
