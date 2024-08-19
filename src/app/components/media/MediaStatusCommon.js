/* eslint-disable react/sort-prop-types */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Popover from '@material-ui/core/Popover';
import MenuItem from '@material-ui/core/MenuItem';
import cx from 'classnames/bind';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import { can } from '../Can';
import CheckContext from '../../CheckContext';
import { getStatus, getErrorMessage, bemClass } from '../../helpers';
import { stringHelper } from '../../customHelpers';
import { withSetFlashMessage } from '../FlashMessage';
import ChatBubbleIcon from '../../icons/chat_bubble.svg';
import ChatBubbleFilledIcon from '../../icons/chat_bubble_filled.svg';
import ChevronDownIcon from '../../icons/chevron_down.svg';
import EllipseIcon from '../../icons/ellipse.svg';
import LockIcon from '../../icons/lock.svg';
import styles from './media.module.css';

const StatusLabel = props => (
  <span className={styles['status-label']}>
    <EllipseIcon style={{ color: props.color }} />
    {props.children}
  </span>
);

class MediaStatusCommon extends Component {
  static currentStatusToClass(status) {
    if (status === '') return '';
    return `media-status__current--${status.toLowerCase().replace(/[ _]/g, '-')}`;
  }

  state = {};

  canUpdate() {
    return (!this.props.readonly && can(this.props.media.permissions || '{}', 'update Status') && !this.props.media.last_status_obj?.locked)
      || this.props.quickAdd;
  }

  handleCloseMenu = () => {
    this.setState({ anchorEl: null });
  };

  handleStatusClick = (clickedStatus) => {
    const { media } = this.props;
    const store = new CheckContext(this).getContextStore();

    this.setState({ anchorEl: null });

    if (clickedStatus !== media.last_status) {
      this.props.setStatus(this, store, media, clickedStatus, this.props.parentComponent, null);
    }
  };

  fail = (transaction) => {
    const fallbackMessage = (
      <FormattedMessage
        defaultMessage="Sorry, an error occurred while updating the status. Please try again and contact {supportEmail} if the condition persists."
        description="Error message displayed when a status change fails"
        id="mediaStatus.error"
        values={{ supportEmail: stringHelper('SUPPORT_EMAIL') }}
      />
    );
    const message = getErrorMessage(transaction, fallbackMessage);
    this.props.setFlashMessage(message, 'error');
  };

  // eslint-disable-next-line class-methods-use-this
  success() {
    // Do nothing. This is here because the child status component calls it.
  }

  render() {
    const { media } = this.props;
    const { statuses } = media.team.verification_statuses;
    const currentStatus = getStatus(media.team.verification_statuses, media.last_status || this.props.currentStatus);

    return (
      <div className={cx('media-status', styles['media-status-wrapper'])}>
        <ButtonMain
          className={`media-status__label media-status__current ${MediaStatusCommon.currentStatusToClass(media.last_status || this.props.currentStatus)}`}
          customStyle={{ borderColor: currentStatus?.style?.color }}
          disabled={!this.canUpdate()}
          iconLeft={currentStatus.should_send_message ? <ChatBubbleFilledIcon style={{ color: currentStatus?.style?.color }} /> : <EllipseIcon style={{ color: currentStatus?.style?.color }} />}
          iconRight={this.canUpdate() ? <ChevronDownIcon /> : <LockIcon style={{ color: currentStatus?.style?.color }} />}
          label={currentStatus.label}
          size="default"
          theme="text"
          variant="outlined"
          onClick={e => this.setState({ anchorEl: e.currentTarget })}
        />
        <Popover
          anchorEl={this.state.anchorEl}
          anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
          open={Boolean(this.state.anchorEl)}
          onClose={this.handleCloseMenu}
        >
          {statuses.map(status => (
            <MenuItem
              className={`${bemClass(
                'media-status__menu-item',
                media.last_status === status.id || this.props.currentStatus === status.id,
                '--current',
              )} media-status__menu-item--${status.id.replace('_', '-')}`}
              key={status.id}
              onClick={() => this.handleStatusClick(status.id)}
            >
              <StatusLabel color={status.style.color}>
                {status.should_send_message ? <ChatBubbleIcon /> : null}
                {status.label}
              </StatusLabel>
            </MenuItem>
          ))}
        </Popover>
      </div>
    );
  }
}

MediaStatusCommon.propTypes = {
  setFlashMessage: PropTypes.func.isRequired,
  quickAdd: PropTypes.bool,
  currentStatus: PropTypes.string,
};

MediaStatusCommon.defaultProps = {
  quickAdd: false,
  currentStatus: 'undetermined',
};

MediaStatusCommon.contextTypes = {
  store: PropTypes.object,
};

export default withSetFlashMessage(MediaStatusCommon);
