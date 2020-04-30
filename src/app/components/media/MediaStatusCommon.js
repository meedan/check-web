import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import { browserHistory } from 'react-router';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import ListItemText from '@material-ui/core/ListItemText';
import { can } from '../Can';
import CheckContext from '../../CheckContext';
import { getStatus, getStatusStyle, getErrorMessage, bemClass } from '../../helpers';
import { mediaStatuses, mediaLastStatus, stringHelper } from '../../customHelpers';
import { units, black87 } from '../../styles/js/shared';
import { withSetFlashMessage } from '../FlashMessage';

const messages = defineMessages({
  error: {
    id: 'mediaStatus.error',
    defaultMessage: 'Sorry, an error occurred while updating the status. Please try again and contact {supportEmail} if the condition persists.',
  },
});

class MediaStatusCommon extends Component {
  static currentStatusToClass(status) {
    if (status === '') return '';
    return ` media-status__current--${status.toLowerCase().replace(/[ _]/g, '-')}`;
  }

  canUpdate() {
    return !this.props.readonly && can(this.props.media.permissions, 'update Status');
  }

  handleEdit() {
    const { media } = this.props;
    const projectPart = media.project_id ? `/project/${media.project_id}` : '';
    browserHistory.push(`/${media.team.slug}${projectPart}/media/${media.dbid}/embed`);
  }

  handleStatusClick = (clickedStatus) => {
    const { media } = this.props;
    const store = new CheckContext(this).getContextStore();

    if (clickedStatus !== mediaLastStatus(media)) {
      this.props.setStatus(this, store, media, clickedStatus, this.props.parentComponent, null);
    }
  };

  fail = (transaction) => {
    const fallbackMessage = this.props.intl.formatMessage(messages.error, { supportEmail: stringHelper('SUPPORT_EMAIL') });
    const message = getErrorMessage(transaction, fallbackMessage);
    this.props.setFlashMessage(message);
  };

  // eslint-disable-next-line class-methods-use-this
  success() {
    // Do nothing. This is here because the child status component calls it.
  }

  render() {
    const { media } = this.props;
    const { statuses } = mediaStatuses(media);
    const currentStatus = getStatus(mediaStatuses(media), mediaLastStatus(media));

    const styles = {
      label: {
        height: units(3),
        lineHeight: units(3),
        paddingLeft: 0,
        color: this.props.readonly ? '#000' : '#fff',
      },
      readOnlyLabel: {
        height: 36,
        lineHeight: '36px',
      },
    };

    const handleChange = (e) => {
      const status = e.target.value;
      this.handleStatusClick(status.id);
    };

    return (
      <div className={bemClass('media-status', this.canUpdate(), '--editable')}>
        {this.canUpdate() ?
          <Select
            className={`media-status__label media-status__current${MediaStatusCommon.currentStatusToClass(mediaLastStatus(media))}`}
            input={<OutlinedInput style={{ border: black87 }} />}
            onChange={handleChange}
            value={currentStatus}
            style={{
              minWidth: units(18),
              height: units(4.5),
            }}
            margin="dense"
          >
            {statuses.map(status => (
              <MenuItem
                key={status.id}
                className={`${bemClass(
                  'media-status__menu-item',
                  mediaLastStatus(media) === status.id,
                  '--current',
                )} media-status__menu-item--${status.id.replace('_', '-')}`}
                value={status}
                style={{ minWidth: units(20), height: units(4.5), padding: `${units(0.5)} ${units(2)}` }}
              >
                <ListItemText
                  style={{ padding: 0 }}
                  primary={
                    <span
                      style={{
                        textTransform: 'uppercase',
                        color: getStatusStyle(status, 'color'),
                        cursor: 'pointer',
                        display: 'flex',
                      }}
                    >
                      {status.label}
                    </span>
                  }
                />
              </MenuItem>))}
          </Select>
          :
          <div style={Object.assign(styles.label, styles.readOnlyLabel)}>
            {currentStatus.label}
          </div>}
      </div>
    );
  }
}

MediaStatusCommon.propTypes = {
  // https://github.com/yannickcr/eslint-plugin-react/issues/1389
  // eslint-disable-next-line react/no-typos
  intl: intlShape.isRequired,
  setFlashMessage: PropTypes.func.isRequired,
};

MediaStatusCommon.contextTypes = {
  store: PropTypes.object,
};

export default withSetFlashMessage(injectIntl(MediaStatusCommon));
