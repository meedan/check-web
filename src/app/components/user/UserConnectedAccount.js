import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { FormattedMessage, injectIntl } from 'react-intl';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Button from '@material-ui/core/Button';
import ConfirmDialog from '../layout/ConfirmDialog';
import UserDisconnectLoginAccountMutation from '../../relay/mutations/UserDisconnectLoginAccountMutation';
import { login } from '../../redux/actions';
import SocialIcon from '../SocialIcon';
import { FlexRow } from '../../styles/js/shared';

class UserConnectedAccount extends Component {
  static renderLabel(userAction) {
    switch (userAction) {
    case 'connect':
      return <FormattedMessage id="UserConnectedAccount.connectButton" defaultMessage="Connect" description="Button label for connecting an account" />;
    case 'disconnect':
      return <FormattedMessage id="UserConnectedAccount.disconnectButton" defaultMessage="Disconnect" description="Button label for disconnecting an account" />;
    default:
      return null;
    }
  }

  static loginCallback() {
    window.location.assign(window.location.href);
  }

  constructor(props) {
    super(props);
    this.state = { dialogOpen: false };
  }

  handleOpenDialog() {
    this.setState({ dialogOpen: true });
  }

  handleCloseDialog() {
    this.setState({ dialogOpen: false });
  }

  handleUserClick(userAction, uid = '') {
    if (userAction === 'connect') {
      login(this.props.provider.key, UserConnectedAccount.loginCallback.bind(this));
    } else if (userAction === 'disconnect') {
      this.handleRequestDisconnectAccount(uid);
      this.setState({ dialogOpen: false });
    }
  }

  handleRequestDisconnectAccount(uid) {
    const onFailure = () => {
    };
    const onSuccess = () => {
    };
    const { provider } = this.props;
    Relay.Store.commitUpdate(
      new UserDisconnectLoginAccountMutation({
        provider,
        uid,
      }),
      { onSuccess, onFailure },
    );
  }

  render() {
    const { provider } = this.props;
    const buttonStyle = {
      color: 'var(--brandMain)',
    };
    const confirmDialog = {
      title: <FormattedMessage
        id="UserConnectedAccount.disconnectAccountTitle"
        defaultMessage="Disconnect account"
        description="Dialog title for disconnecting an account"
      />,
      blurb: <FormattedMessage
        id="UserConnectedAccount.disconnectAccountConfirmationText"
        defaultMessage="Are you sure? This will disconnect login account."
        description="Confirmation to ensure the user knows they are disconnecting an account"
      />,
    };

    return (
      <div style={{ listStyleType: 'none' }} >
        { provider.values.map((socialAccount, index) => {
          const userAction = (socialAccount.connected === true) ? 'disconnect' : 'connect';
          let disableDisconnect = false;
          if (userAction === 'disconnect' && socialAccount.allow_disconnect === false) {
            disableDisconnect = true;
          }
          return (
            <ListItem className="user-connect__list-item" key={`account-connect-disconnect-raw-${index.toString()}`}>
              <ListItemIcon className="user-connect__list-icon">
                <SocialIcon inColor domain={this.props.provider.key} />
              </ListItemIcon>
              <ListItemText style={{ minWidth: '500px', padding: '0px' }} primary={socialAccount.info} />
              <ListItemSecondaryAction>
                <Button
                  style={disableDisconnect === false ? buttonStyle : {}}
                  onClick={userAction === 'connect' ? this.handleUserClick.bind(this, userAction) : this.handleOpenDialog.bind(this)}
                  className="team-connect-account-button--disconnect"
                  disabled={disableDisconnect}
                >
                  {UserConnectedAccount.renderLabel(userAction)}
                </Button>
                <ConfirmDialog
                  open={this.state.dialogOpen}
                  title={confirmDialog.title}
                  blurb={confirmDialog.blurb}
                  handleClose={this.handleCloseDialog.bind(this)}
                  handleConfirm={this.handleUserClick.bind(this, userAction, socialAccount.uid)}
                />
              </ListItemSecondaryAction>
            </ListItem>
          );
        })}
        { provider.add_another === true ?
          <FlexRow style={{ padding: '0px 10px' }} >
            <Button
              style={buttonStyle}
              onClick={this.handleUserClick.bind(this, 'connect')}
              className="team-connect-account-button--disconnect"
            >
              <FormattedMessage id="UserConnectedAccount.addAnother" defaultMessage="Add another account" description="Button label for the user to connect another account" />
            </Button>
          </FlexRow>
          : null}
      </div>
    );
  }
}
UserConnectedAccount.contextTypes = {
  store: PropTypes.object,
};
export default injectIntl(UserConnectedAccount);
