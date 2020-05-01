import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import { browserHistory } from 'react-router';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import styled from 'styled-components';
import { can } from '../Can';
import CheckContext from '../../CheckContext';
import { getStatus, getErrorMessage, bemClass } from '../../helpers';
import { mediaStatuses, mediaLastStatus, stringHelper } from '../../customHelpers';
import { withSetFlashMessage } from '../FlashMessage';

const messages = defineMessages({
  error: {
    id: 'mediaStatus.error',
    defaultMessage: 'Sorry, an error occurred while updating the status. Please try again and contact {supportEmail} if the condition persists.',
  },
});

const ReadOnlyStatusLabel = styled.div`
  color: black;
`;

const StyledMediaStatus = styled.div`
  display: flex;
  align-items: center;
`;

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

  handleChange = (e) => {
    const statusId = e.target.value;
    this.handleStatusClick(statusId);
  };

  render() {
    const { media } = this.props;
    const { statuses } = mediaStatuses(media);
    const currentStatus = getStatus(mediaStatuses(media), mediaLastStatus(media));

    return (
      <StyledMediaStatus className="media-status">
        {this.canUpdate() ? (
          <FormControl variant="outlined">
            <Select
              className={`media-status__label media-status__current${MediaStatusCommon.currentStatusToClass(mediaLastStatus(media))}`}
              onChange={this.handleChange}
              value={currentStatus.id}
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
                  value={status.id}
                >
                  <span style={{ color: status.style.color }}>
                    {status.label}
                  </span>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        ) : (
          <ReadOnlyStatusLabel>{currentStatus.label}</ReadOnlyStatusLabel>
        )}
      </StyledMediaStatus>
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
