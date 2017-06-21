import React, { Component, PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import MdMoreHoriz from 'react-icons/lib/md/more-horiz';
import { can } from '../Can';
import config from 'config';
import CheckContext from '../../CheckContext';

class MediaActions extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isMenuOpen: false,
    };
  }

  toggleMenu() {
    this.setState({ isMenuOpen: !this.state.isMenuOpen });
  }

  bemClass(baseClass, modifierBoolean, modifierSuffix) {
    return modifierBoolean ? [baseClass, baseClass + modifierSuffix].join(' ') : baseClass;
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
      menuItems.push(<li className="media-actions__menu-item" onClick={handleEdit}><FormattedMessage id="mediaActions.edit" defaultMessage="Edit..." /></li>);
    }

    if (can(media.permissions, 'update ProjectMedia')) {
      menuItems.push(<li className="media-actions__menu-item" onClick={handleMove}><FormattedMessage id="mediaActions.move" defaultMessage="Move..." /></li>);
      if (media.url) {
        menuItems.push(<li className="media-actions__menu-item" id="media-actions__refresh" onClick={handleRefresh}><FormattedMessage id="mediaActions.refresh" defaultMessage="Refresh" /></li>);
      }
    }

    if (!media.team.private && config.appName === 'check') {
      menuItems.push(<li className="media-actions__menu-item" id="media-actions__embed" onClick={this.handleEmbed.bind(this)}><FormattedMessage id="mediaActions.embed" defaultMessage="Embed..." /></li>);
    }

    return menuItems.length ? (
      <div className={this.bemClass('media-actions', this.state.isMenuOpen, '--active')}>
        <MdMoreHoriz className="media-actions__icon" onClick={this.toggleMenu.bind(this)} />
        <div className={this.bemClass('media-actions__overlay', this.state.isMenuOpen, '--active')} onClick={this.toggleMenu.bind(this)} />
        <ul className={this.bemClass('media-actions__menu', this.state.isMenuOpen, '--active')}>
          {menuItems}
        </ul>
      </div>
    ) : null;
  }
}

MediaActions.contextTypes = {
  store: React.PropTypes.object,
};

export default MediaActions;
