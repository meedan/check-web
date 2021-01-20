import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { browserHistory } from 'react-router';
import Button from '@material-ui/core/Button';
import Popover from '@material-ui/core/Popover';
import MenuItem from '@material-ui/core/MenuItem';
import { makeStyles } from '@material-ui/core/styles';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import LockIcon from '@material-ui/icons/Lock';
import ChatBubbleOutlineIcon from '@material-ui/icons/ChatBubbleOutline';
import styled from 'styled-components';
import { can } from '../Can';
import CheckContext from '../../CheckContext';
import { getStatus, getErrorMessage, bemClass, getCurrentProjectId } from '../../helpers';
import { stringHelper } from '../../customHelpers';
import { withSetFlashMessage } from '../FlashMessage';

const StyledMediaStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const useStyles = makeStyles({
  statusLabel: props => ({
    color: props.color,
    textTransform: 'uppercase',
  }),
});

const StatusLabel = (props) => {
  const classes = useStyles(props);

  return (
    <span className={classes.statusLabel}>
      {props.children}
    </span>
  );
};

class MediaStatusCommon extends Component {
  static currentStatusToClass(status) {
    if (status === '') return '';
    return `media-status__current--${status.toLowerCase().replace(/[ _]/g, '-')}`;
  }

  state = {};

  canUpdate() {
    return !this.props.readonly && can(this.props.media.permissions, 'update Status');
  }

  handleCloseMenu = () => {
    this.setState({ anchorEl: null });
  };

  handleEdit() {
    const { media } = this.props;
    const projectId = getCurrentProjectId(media.project_ids);
    const projectPart = projectId ? `/project/${projectId}` : '';
    browserHistory.push(`/${media.team.slug}${projectPart}/media/${media.dbid}/embed`);
  }

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
        id="mediaStatus.error"
        defaultMessage="Sorry, an error occurred while updating the status. Please try again and contact {supportEmail} if the condition persists."
        values={{ supportEmail: stringHelper('SUPPORT_EMAIL') }}
      />
    );
    const message = getErrorMessage(transaction, fallbackMessage);
    this.props.setFlashMessage(message);
  };

  // eslint-disable-next-line class-methods-use-this
  success() {
    // Do nothing. This is here because the child status component calls it.
  }

  render() {
    const { media } = this.props;
    const { statuses } = media.team.verification_statuses;
    const currentStatus = getStatus(media.team.verification_statuses, media.last_status);

    return (
      <StyledMediaStatus className="media-status">
        <Button
          className={`media-status__label media-status__current ${MediaStatusCommon.currentStatusToClass(media.last_status)}`}
          style={{ backgroundColor: currentStatus.style.color, color: 'white', minHeight: 41 }}
          variant="contained"
          disableElevation
          onClick={e => this.setState({ anchorEl: e.currentTarget })}
          disabled={!this.canUpdate()}
          startIcon={currentStatus.should_send_message ? <ChatBubbleOutlineIcon /> : null}
          endIcon={this.canUpdate() ? <KeyboardArrowDownIcon /> : <LockIcon />}
        >
          {currentStatus.label}
        </Button>
        <Popover
          anchorEl={this.state.anchorEl}
          open={Boolean(this.state.anchorEl)}
          onClose={this.handleCloseMenu}
          anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
        >
          {statuses.map(status => (
            <MenuItem
              key={status.id}
              className={`${bemClass(
                'media-status__menu-item',
                media.last_status === status.id,
                '--current',
              )} media-status__menu-item--${status.id.replace('_', '-')}`}
              onClick={() => this.handleStatusClick(status.id)}
            >
              <StatusLabel color={status.style.color}>
                <StyledMediaStatus>
                  {status.label}
                  {status.should_send_message ? <ChatBubbleOutlineIcon /> : null}
                </StyledMediaStatus>
              </StatusLabel>
            </MenuItem>
          ))}
        </Popover>
      </StyledMediaStatus>
    );
  }
}

MediaStatusCommon.propTypes = {
  setFlashMessage: PropTypes.func.isRequired,
};

MediaStatusCommon.contextTypes = {
  store: PropTypes.object,
};

export default withSetFlashMessage(MediaStatusCommon);
