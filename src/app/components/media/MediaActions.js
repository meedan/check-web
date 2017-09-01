import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import IconMoreHoriz from 'material-ui/svg-icons/navigation/more-horiz';
import IconButton from 'material-ui/IconButton';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import config from 'config';
import { can } from '../Can';
import CheckContext from '../../CheckContext';

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
    const { media, handleEdit, handleMove, handleRefresh } = this.props;
    const menuItems = [];

    if (can(media.permissions, 'create Tag')) {
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

    if (config.appName === 'check') {
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

    return menuItems.length
      ? <div style={{ marginLeft: 'auto' }}>
        <IconMenu
          className="media-actions"
          iconButtonElement={<IconButton><IconMoreHoriz className="media-actions__icon" /></IconButton>}
        >
          {menuItems}
        </IconMenu>
      </div>
      : null;
  }
}

MediaActions.contextTypes = {
  store: React.PropTypes.object,
};

export default MediaActions;
