import React, { Component, PropTypes } from 'react';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import Relay from 'react-relay';
import Can, { can } from '../Can';
import CheckContext from '../../CheckContext';
import MdArrowDropDown from 'react-icons/lib/md/arrow-drop-down';
import FaCircle from 'react-icons/lib/fa/circle';
import FaCircleO from 'react-icons/lib/fa/circle-o';
import { getStatus, getStatusStyle } from '../../helpers';
import { mediaStatuses, mediaLastStatus } from '../../customHelpers';

const messages = defineMessages({
  error: {
    id: 'mediaStatus.error',
    defaultMessage: "We're sorry, but we encountered an error trying to update the status.",
  },
});

class MediaStatusCommon extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isMediaStatusMenuOpen: false,
      message: null,
    };
  }

  canUpdate() {
    return !this.props.readonly && can(this.props.media.permissions, 'create Status');
  }

  toggleMediaStatusMenu() {
    const newState = this.canUpdate() ? !this.state.isMediaStatusMenuOpen : false;
    this.setState({ isMediaStatusMenuOpen: newState });
  }

  bemClass(baseClass, modifierBoolean, modifierSuffix) {
    return modifierBoolean ? [baseClass, baseClass + modifierSuffix].join(' ') : baseClass;
  }

  currentStatusToClass(status) {
    if (status === '') {
      return '';
    }
    return ` media-status__current--${status.toLowerCase().replace(/[ _]/g, '-')}`;
  }

  handleStatusClick(clickedStatus, r) {
    const { media } = this.props;
    const store = new CheckContext(this).getContextStore();

    if (clickedStatus !== mediaLastStatus(media)) {
      this.props.setStatus(this, store, media, clickedStatus);
    }
  }

  fail(transaction) {
    const that = this;
    const error = transaction.getError();
    let message = this.props.intl.formatMessage(messages.error);
    try {
      const json = JSON.parse(error.source);
      if (json.error) {
        message = json.error;
      }
    } catch (e) { }
    that.setState({ message });
  }

  success(response) {
    // this.setState({ message: 'Status updated.' });
  }

  render() {
    const that = this;
    const { media } = this.props;
    const statuses = JSON.parse(mediaStatuses(media)).statuses;
    const status = getStatus(mediaStatuses(media), mediaLastStatus(media));

    return (
      <div className={this.bemClass('media-status', this.canUpdate(), '--editable')} onClick={this.toggleMediaStatusMenu.bind(this)}>
        <div className={this.bemClass('media-status__overlay', this.state.isMediaStatusMenuOpen, '--active')} onClick={this.toggleMediaStatusMenu.bind(this)} />

        <div className={`media-status__current${this.currentStatusToClass(mediaLastStatus(media))}`} style={{ color: getStatusStyle(status, 'color') }}>
          <span className="media-status__label media-status__label--current">{status.label}</span>
          {this.canUpdate() ?
            <MdArrowDropDown className="media-status__caret" />
            : null
          }
          <span className="media-status__message">{this.state.message}</span>
        </div>

        {this.canUpdate() ?
          <ul className={this.bemClass('media-status__menu', this.state.isMediaStatusMenuOpen, '--active')}>
            {statuses.map(status => (
              <li className={`${that.bemClass('media-status__menu-item', (mediaLastStatus(media) === status.id), '--current')} media-status__menu-item--${status.id.replace('_', '-')}`} onClick={that.handleStatusClick.bind(that, status.id)} style={{ color: getStatusStyle(status, 'color') }}>

                <FaCircle className="media-status__icon media-status__icon--radio-button-selected" />

                <FaCircleO className="media-status__icon media-status__icon--radio-button" />

                <span className="media-status__label">{status.label}</span>
              </li>
              ))}
          </ul>
          : null
        }
      </div>
    );
  }
}

MediaStatusCommon.propTypes = {
  intl: intlShape.isRequired,
};

MediaStatusCommon.contextTypes = {
  store: React.PropTypes.object,
};

export default injectIntl(MediaStatusCommon);
