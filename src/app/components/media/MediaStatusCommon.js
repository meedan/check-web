import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl, intlShape, FormattedMessage } from 'react-intl';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import ListItemText from '@material-ui/core/ListItemText';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import MdLockOutline from '@material-ui/icons/LockOutline';
import rtlDetect from 'rtl-detect';
import { can } from '../Can';
import CheckContext from '../../CheckContext';
import { getStatus, getStatusStyle, getErrorMessage, bemClass } from '../../helpers';
import { mediaStatuses, mediaLastStatus, stringHelper } from '../../customHelpers';
import { AlignOpposite, units, black87 } from '../../styles/js/shared';
import globalStrings from '../../globalStrings';

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

  static isFinalStatus(media, status) {
    let isFinal = false;
    mediaStatuses(media).statuses.forEach((st) => {
      if (st.id === status && parseInt(st.completed, 10) === 1) {
        isFinal = true;
      }
    });
    return isFinal;
  }

  constructor(props) {
    super(props);
    this.state = {
      showConfirmation: false,
      currentStatus: null,
    };
  }

  canUpdate() {
    return !this.props.readonly && can(this.props.media.permissions, 'update Status');
  }

  askForConfirmation(currentStatus) {
    this.setState({ showConfirmation: true, currentStatus });
  }

  handleCancel() {
    this.setState({ showConfirmation: false });
  }

  handleConfirm() {
    const { media, parentComponent } = this.props;
    const store = new CheckContext(this).getContextStore();
    this.setState({ showConfirmation: false });
    this.props.setStatus(this, store, media, this.state.currentStatus, parentComponent, null);
  }

  handleEdit() {
    const { media } = this.props;
    const { history } = new CheckContext(this).getContextStore();
    const projectPart = media.project_id ? `/project/${media.project_id}` : '';
    this.setState({ showConfirmation: false });
    history.push(`/${media.team.slug}${projectPart}/media/${media.dbid}/embed`);
  }

  handleStatusClick = (clickedStatus, smoochBotInstalled) => {
    const { media } = this.props;
    const store = new CheckContext(this).getContextStore();

    if (clickedStatus !== mediaLastStatus(media)) {
      if (MediaStatusCommon.isFinalStatus(media, clickedStatus) && smoochBotInstalled) {
        this.askForConfirmation(clickedStatus);
      } else {
        this.props.setStatus(this, store, media, clickedStatus, this.props.parentComponent, null);
      }
    }
  };

  fail = (transaction) => {
    const fallbackMessage = this.props.intl.formatMessage(messages.error, { supportEmail: stringHelper('SUPPORT_EMAIL') });
    const message = getErrorMessage(transaction, fallbackMessage);
    this.context.setMessage(message);
  };

  // eslint-disable-next-line class-methods-use-this
  success() {
    // Do nothing. This is here because the child status component calls it.
  }

  render() {
    const { media } = this.props;
    const { statuses } = mediaStatuses(media);
    const currentStatus = getStatus(mediaStatuses(media), mediaLastStatus(media));

    const isRtl = rtlDetect.isRtlLang(this.props.intl.locale);
    const fromDirection = isRtl ? 'right' : 'left';

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

    let smoochBotInstalled = false;
    if (media.team && media.team.team_bot_installations) {
      media.team.team_bot_installations.edges.forEach((edge) => {
        if (edge.node.team_bot.identifier === 'smooch') {
          smoochBotInstalled = true;
        }
      });
    }

    const handleChange = (e) => {
      const status = e.target.value;
      if (status.can_change) {
        this.handleStatusClick(status.id, smoochBotInstalled);
      }
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
                disabled={!status.can_change}
                style={{ minWidth: units(20), height: units(4.5), padding: `${units(0.5)} ${units(2)}` }}
              >
                <ListItemText
                  style={{ padding: 0 }}
                  primary={
                    <span
                      style={{
                        textTransform: 'uppercase',
                        color: status.can_change ? getStatusStyle(status, 'color') : 'gray',
                        cursor: status.can_change ? 'pointer' : 'not-allowed',
                        display: 'flex',
                      }}
                    >
                      {status.label}
                      <AlignOpposite fromDirection={fromDirection}>
                        {status.can_change ? null : <MdLockOutline />}
                      </AlignOpposite>
                    </span>
                  }
                />
              </MenuItem>))}
          </Select>
          :
          <div style={Object.assign(styles.label, styles.readOnlyLabel)}>
            {currentStatus.label}
          </div>}
        <Dialog
          open={this.state.showConfirmation}
          onClose={this.handleCancel.bind(this)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <FormattedMessage
              id="mediaStatusCommon.title"
              defaultMessage="Final Report"
            />
          </DialogTitle>
          <DialogContent>
            { media.demand && media.demand > 0 ?
              <FormattedMessage
                id="mediaStatusCommon.confirmationMessageWithValue"
                defaultMessage="You are about to send a report to the {value} people who requested this item."
                values={{
                  value: media.demand,
                }}
              /> :
              <FormattedMessage
                id="mediaStatusCommon.confirmationMessage"
                defaultMessage="You are about to send a report to all people who requested this item."
              /> }
          </DialogContent>
          <DialogActions>
            <Button
              onClick={this.handleCancel.bind(this)}
            >
              {this.props.intl.formatMessage(globalStrings.cancel)}
            </Button>
            <Button
              className="media-status__proceed-send"
              color="primary"
              onClick={this.handleConfirm.bind(this)}
            >
              <FormattedMessage
                id="mediaStatusCommon.proceedAndSend"
                defaultMessage="Proceed and Send"
              />
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

MediaStatusCommon.propTypes = {
  // https://github.com/yannickcr/eslint-plugin-react/issues/1389
  // eslint-disable-next-line react/no-typos
  intl: intlShape.isRequired,
};

MediaStatusCommon.contextTypes = {
  store: PropTypes.object,
  setMessage: PropTypes.func,
};

export default injectIntl(MediaStatusCommon);
