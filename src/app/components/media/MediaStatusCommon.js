import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl, intlShape, FormattedMessage } from 'react-intl';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import MdLockOutline from 'material-ui/svg-icons/action/lock-outline';
import { can } from '../Can';
import CheckContext from '../../CheckContext';
import { getStatus, getStatusStyle, getErrorMessage, bemClass } from '../../helpers';
import { mediaStatuses, mediaLastStatus, stringHelper } from '../../customHelpers';
import { black16, units } from '../../styles/js/shared';
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

  handleStatusClick(clickedStatus) {
    const { media } = this.props;
    const store = new CheckContext(this).getContextStore();

    if (clickedStatus !== mediaLastStatus(media)) {
      if (MediaStatusCommon.isFinalStatus(media, clickedStatus)) {
        this.askForConfirmation(clickedStatus);
      } else {
        this.props.setStatus(this, store, media, clickedStatus, this.props.parentComponent, null);
      }
    }
  }

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

    const actions = [
      <FlatButton
        label={this.props.intl.formatMessage(globalStrings.cancel)}
        onClick={this.handleCancel.bind(this)}
      />,
      <FlatButton
        label={
          <FormattedMessage
            id="mediaStatusCommon.proceedAndSend"
            defaultMessage="Proceed and Send"
          />
        }
        className="media-status__proceed-send"
        primary
        onClick={this.handleConfirm.bind(this)}
      />,
    ];

    return (
      <div className={bemClass('media-status', this.canUpdate(), '--editable')}>
        {this.canUpdate() ?
          <DropDownMenu
            style={{
              height: 'auto',
              padding: 6,
              borderRadius: 5,
              backgroundColor: getStatusStyle(currentStatus, 'color'),
            }}
            value={currentStatus.label}
            underlineStyle={{ borderWidth: 0 }}
            iconStyle={{
              fill: black16, padding: 0, height: 0, top: 0, right: -16,
            }}
            labelStyle={styles.label}
            selectedMenuItemStyle={{ color: getStatusStyle(currentStatus, 'color') }}
            className={`media-status__label media-status__current${MediaStatusCommon.currentStatusToClass(mediaLastStatus(media))}`}
          >
            {statuses.map(status => (
              <MenuItem
                key={status.id}
                className={`${bemClass(
                  'media-status__menu-item',
                  mediaLastStatus(media) === status.id,
                  '--current',
                )} media-status__menu-item--${status.id.replace('_', '-')}`}
                onClick={status.can_change ? this.handleStatusClick.bind(this, status.id) : null}
                style={{
                  textTransform: 'uppercase',
                  color: status.can_change ? getStatusStyle(status, 'color') : 'gray',
                  cursor: status.can_change ? 'pointer' : 'not-allowed',
                }}
                value={status.label}
                primaryText={status.label}
                rightIcon={status.can_change ? null : <MdLockOutline />}
                disabled={!status.can_change}
              />))}
          </DropDownMenu>
          :
          <div style={Object.assign(styles.label, styles.readOnlyLabel)}>
            {currentStatus.label}
          </div>}
        <Dialog
          modal
          open={this.state.showConfirmation}
          actions={actions}
          onRequestClose={this.handleCancel.bind(this)}
          autoScrollBodyContent
        >
          <h4 style={{ marginBottom: units(2) }}>
            <FormattedMessage
              id="mediaStatusCommon.title"
              defaultMessage="Final Report"
            />
          </h4>
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
          <div style={{ marginTop: units(2), marginBottom: units(2) }}>
            <FlatButton
              label={
                <FormattedMessage
                  id="mediaStatusCommon.editReportBeforeSending"
                  defaultMessage="Edit report before sending"
                />
              }
              onClick={this.handleEdit.bind(this)}
              backgroundColor="#FBAA6D"
            />
          </div>
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
