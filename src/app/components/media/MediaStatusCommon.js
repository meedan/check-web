import React, { Component } from 'react';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import { can } from '../Can';
import CheckContext from '../../CheckContext';
import { getStatus, getStatusStyle } from '../../helpers';
import { mediaStatuses, mediaLastStatus } from '../../customHelpers';
import { black16, units } from '../../styles/js/shared';

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
      message: null,
    };
  }

  canUpdate() {
    return !this.props.readonly && can(this.props.media.permissions, 'create Status');
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

  handleStatusClick(clickedStatus) {
    const { media } = this.props;
    const store = new CheckContext(this).getContextStore();

    if (clickedStatus !== mediaLastStatus(media)) {
      this.props.setStatus(this, store, media, clickedStatus, this.props.parentComponent, null);
    }
  }

  fail(transaction) {
    const error = transaction.getError();
    let message = this.props.intl.formatMessage(messages.error);
    try {
      const json = JSON.parse(error.source);
      if (json.error) {
        message = json.error;
      }
    } catch (e) {
      // Do nothing.
    }
    this.setState({ message });
  }

  success() {
    // this.setState({ message: 'Status updated.' });
  }

  render() {
    const { media } = this.props;
    const statuses = JSON.parse(mediaStatuses(media)).statuses;
    const currentStatus = getStatus(mediaStatuses(media), mediaLastStatus(media));

    const styles = {
      label: {
        height: units(3),
        lineHeight: units(3),
        paddingLeft: 0,
        textTransform: 'uppercase',
        color: getStatusStyle(currentStatus, 'color'),
      },
    };

    return (
      <div className={this.bemClass('media-status', this.canUpdate(), '--editable')}>
        <span className="media-status__message">{this.state.message}</span>

        {this.canUpdate()
          ? <DropDownMenu
            style={{ height: units(3) }}
            value={currentStatus.label}
            underlineStyle={{ borderWidth: 0 }}
            iconStyle={{ fill: black16, padding: 0, height: 0, top: 0 }}
            labelStyle={styles.label}
            selectedMenuItemStyle={{ color: getStatusStyle(currentStatus, 'color') }}
            className={`media-status__label media-status__current${this.currentStatusToClass(
                mediaLastStatus(media),
              )}`}
          >
            {statuses.map(status =>
              <MenuItem
                key={status.id}
                className={`${this.bemClass(
                    'media-status__menu-item',
                    mediaLastStatus(media) === status.id,
                    '--current',
                  )} media-status__menu-item--${status.id.replace('_', '-')}`}
                onClick={this.handleStatusClick.bind(that, status.id)}
                style={{ textTransform: 'uppercase', color: getStatusStyle(status, 'color') }}
                value={status.label}
                primaryText={status.label}
              />,
              )}
          </DropDownMenu>
          : <div style={styles.label}>
            {currentStatus.label}
          </div>}
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
