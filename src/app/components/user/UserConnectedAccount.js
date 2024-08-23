import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { FormattedMessage, injectIntl } from 'react-intl';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import ConfirmDialog from '../layout/ConfirmDialog';
import UserDisconnectLoginAccountMutation from '../../relay/mutations/UserDisconnectLoginAccountMutation';
import { login } from '../../redux/actions';
import SocialIcon from '../SocialIcon';
import AddIcon from '../../icons/add.svg';

class UserConnectedAccount extends Component {
  static renderLabel(userAction) {
    switch (userAction) {
    case 'connect':
      return <FormattedMessage defaultMessage="Connect" description="Button label for connecting an account" id="UserConnectedAccount.connectButton" />;
    case 'disconnect':
      return <FormattedMessage defaultMessage="Disconnect" description="Button label for disconnecting an account" id="UserConnectedAccount.disconnectButton" />;
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

    const confirmDialog = {
      title: <FormattedMessage
        defaultMessage="Disconnect account"
        description="Dialog title for disconnecting an account"
        id="UserConnectedAccount.disconnectAccountTitle"
      />,
      blurb: <FormattedMessage
        defaultMessage="Are you sure? This will disconnect login account."
        description="Confirmation to ensure the user knows they are disconnecting an account"
        id="UserConnectedAccount.disconnectAccountConfirmationText"
        tagName="p"
      />,
    };

    return (
      <>
        { provider.values.map((socialAccount, index) => {
          const userAction = (socialAccount.connected === true) ? 'disconnect' : 'connect';
          let disableDisconnect = false;
          if (userAction === 'disconnect' && socialAccount.allow_disconnect === false) {
            disableDisconnect = true;
          }
          return (
            <ListItem className="user-connect__list-item" key={`account-connect-disconnect-raw-${index.toString()}`}>
              <ListItemIcon className="user-connect__list-icon">
                <SocialIcon domain={this.props.provider.key} inColor />
              </ListItemIcon>
              <ListItemText primary={socialAccount.info} />
              <ListItemSecondaryAction>
                <ButtonMain
                  className="team-connect-account-button--disconnect"
                  disabled={disableDisconnect}
                  label={UserConnectedAccount.renderLabel(userAction)}
                  size="default"
                  theme="info"
                  variant="contained"
                  onClick={userAction === 'connect' ? this.handleUserClick.bind(this, userAction) : this.handleOpenDialog.bind(this)}
                />
                <ConfirmDialog
                  blurb={confirmDialog.blurb}
                  handleClose={this.handleCloseDialog.bind(this)}
                  handleConfirm={this.handleUserClick.bind(this, userAction, socialAccount.uid)}
                  open={this.state.dialogOpen}
                  title={confirmDialog.title}
                />
              </ListItemSecondaryAction>
            </ListItem>
          );
        })}
        { provider.add_another === true ?
          <ButtonMain
            className="team-connect-account-button--disconnect"
            iconLeft={<AddIcon />}
            label={
              <FormattedMessage defaultMessage="Add another account" description="Button label for the user to connect another account" id="UserConnectedAccount.addAnother" />
            }
            size="default"
            theme="text"
            variant="contained"
            onClick={this.handleUserClick.bind(this, 'connect')}
          />
          : null
        }
      </>
    );
  }
}
UserConnectedAccount.contextTypes = {
  store: PropTypes.object,
};
export default injectIntl(UserConnectedAccount);
