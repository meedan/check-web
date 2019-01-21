import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl';
import { ListItem } from 'material-ui/List';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';
import FASlack from 'react-icons/lib/fa/slack';
import FAFacebook from 'react-icons/lib/fa/facebook-official';
import FATwitter from 'react-icons/lib/fa/twitter';
import rtlDetect from 'rtl-detect';
import UserDisconnectLoginAccountMutation from '../../relay/mutations/UserDisconnectLoginAccountMutation';
import { login } from '../../redux/actions';
import {
  FlexRow,
  Text,
  slackGreen,
  twitterBlue,
  facebookBlue,
} from '../../styles/js/shared';

const messages = defineMessages({
  disconnectAccount: {
    id: 'UserConnectedAccount.disconnectAccount',
    defaultMessage: 'Disconnect Account',
  },
  typeHere: {
    id: 'UserConnectedAccount.typeHere',
    defaultMessage: 'Type here',
  },
  confirmError: {
    id: 'UserConnectedAccount.confirmError',
    defaultMessage: 'You should type "confirm"',
  },
});

class UserConnectedAccount extends Component {
  static renderLabel(userAction) {
    switch (userAction) {
    case 'connect':
      return <FormattedMessage id="UserConnectedAccount.connectButton" defaultMessage="Connect" />;
    case 'disconnect':
      return <FormattedMessage id="UserConnectedAccount.disconnectButton" defaultMessage="Disconnect" />;
    default:
      return null;
    }
  }

  constructor(props) {
    super(props);
    this.state = {
      dialogOpen: false,
      confirmationError: false,
    };
  }

  handleOpenDialog() {
    this.setState({
      dialogOpen: true,
      confirmationError: false,
    });
  }

  handleCloseDialog() {
    this.setState({
      dialogOpen: false,
      confirmationError: false,
    });
  }

  handleUserClick(userAction) {
    if (userAction === 'connect') {
      login(this.props.provider.key, this.props.loginCallback);
    } else if (userAction === 'disconnect') {
      const { value: confirmValue } = document.getElementById('disconnect-user-account_confirm');
      if (confirmValue && confirmValue.toUpperCase() === 'CONFIRM') {
        this.setState({ confirmationError: false });
        this.handleCloseDialog();
        this.handleRequestDisconnectAccount();
      } else {
        this.setState({ confirmationError: true });
      }
    }
  }

  handleRequestDisconnectAccount() {
    const onFailure = () => {
    };
    const onSuccess = () => {
    };
    const { user, provider } = this.props;
    Relay.Store.commitUpdate(
      new UserDisconnectLoginAccountMutation({
        user,
        provider,
      }),
      { onSuccess, onFailure },
    );
  }

  socialIcon() {
    switch (this.props.provider.key) {
    case 'twitter':
      return <FATwitter style={{ color: twitterBlue }} className="logo" />;
    case 'slack':
      return <FASlack style={{ color: slackGreen }} className="logo" />;
    case 'facebook':
      return <FAFacebook style={{ color: facebookBlue }} className="logo" />;
    default:
      return null;
    }
  }

  render() {
    const { provider } = this.props;

    const userAction = (provider.connected === true) ? 'disconnect' : 'connect';

    let disableDisconnect = false;
    if (userAction === 'disconnect' && provider.allow_disconnect === false) {
      disableDisconnect = true;
    }

    const isRtl = rtlDetect.isRtlLang(this.props.intl.locale);

    const direction = {
      from: isRtl ? 'right' : 'left',
      to: isRtl ? 'left' : 'right',
    };

    const buttonStyle = {
      minWidth: 350,
      textAlign: direction.to,
    };

    return (
      <ListItem
        className="team-connected_accounts"
        key={provider.key}
        disabled
        leftIcon={this.socialIcon()}
        style={{ padding: '8px 61px' }}
      >
        <FlexRow>
          <Text ellipsis>
            {provider.key} {provider.info}
          </Text>
          <FlatButton
            hoverColor="transparent"
            style={buttonStyle}
            label={UserConnectedAccount.renderLabel(userAction)}
            primary
            onClick={userAction === 'connect' ? this.handleUserClick.bind(this, userAction) : this.handleOpenDialog.bind(this)}
            className="team-connect-account-button--disconnect"
            disabled={disableDisconnect}
          />
          <Dialog
            className="disconnect-account__dialog"
            open={this.state.dialogOpen}
            onClose={this.handleCloseDialog.bind(this)}
            fullWidth
          >
            <DialogTitle>{this.props.intl.formatMessage(messages.disconnectAccount)}</DialogTitle>
            <DialogContent>
              <p>
                <FormattedMessage
                  id="UserConnectedAccount.disconnectAccountConfirmationText"
                  defaultMessage='Are you sure? This will disconnect login account. Type "confirm" if you want to proceed.'
                />
              </p>
              <TextField
                id="disconnect-user-account_confirm"
                key="disconnect-account-confirm-input"
                className="disconnect-account-confirm-input"
                placeholder={this.props.intl.formatMessage(messages.typeHere)}
                error={this.state.confirmationError}
                helperText={this.state.confirmationError ? this.props.intl.formatMessage(messages.confirmError) : ''}
                margin="normal"
              />
            </DialogContent>
            <DialogActions>
              <FlatButton
                label={
                  <FormattedMessage id="disconnectAccount.cancel" defaultMessage="Cancel" />
                }
                primary
                onClick={this.handleCloseDialog.bind(this)}
              />,
              <RaisedButton
                label={
                  <FormattedMessage
                    id="disconnectAccount.delete"
                    defaultMessage="Delete"
                  />
                }
                primary
                onClick={this.handleUserClick.bind(this, userAction)}
              />
            </DialogActions>
          </Dialog>
        </FlexRow>
      </ListItem>
    );
  }
}
UserConnectedAccount.contextTypes = {
  store: PropTypes.object,
};
export default injectIntl(UserConnectedAccount);
