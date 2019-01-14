import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { FormattedMessage, injectIntl } from 'react-intl';
import { ListItem } from 'material-ui/List';
import FlatButton from 'material-ui/FlatButton';
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

class UserConnectedAccount extends Component {
  static renderLabel(userAction) {
    switch (userAction) {
    case 'connect':
      return <FormattedMessage id="userPrivacy.connectButton" defaultMessage="Connect" />;
    case 'disconnect':
      return <FormattedMessage id="userPrivacy.disconnectButton" defaultMessage="Disconnect" />;
    default:
      return null;
    }
  }

  handleUserClick(userAction) {
    if (userAction === 'connect') {
      login(this.props.provider, this.props.loginCallback);
    } else if (userAction === 'disconnect') {
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
  }

  socialIcon() {
    switch (this.props.provider) {
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
    const userProviders = this.props.user.providers;
    let userAction = 'connect';
    if (userProviders.includes(this.props.provider) === true) {
      userAction = 'disconnect';
    }
    const isRtl = rtlDetect.isRtlLang(this.props.intl.locale);

    const direction = {
      from: isRtl ? 'right' : 'left',
      to: isRtl ? 'left' : 'right',
    };

    const buttonStyle = {
      minWidth: 400,
      textAlign: direction.to,
    };

    return (
      <ListItem
        className="team-connected_accounts"
        key={this.props.provider}
        disabled
        leftIcon={this.socialIcon()}
        style={{ padding: '8px 61px' }}
      >
        <FlexRow>
          <Text ellipsis>
            {this.props.provider}
          </Text>
          <FlatButton
            hoverColor="transparent"
            style={buttonStyle}
            label={UserConnectedAccount.renderLabel(userAction)}
            primary
            onClick={this.handleUserClick.bind(this, userAction)}
            className="team-connect-account-button--disconnect"
          />
        </FlexRow>
      </ListItem>
    );
  }
}
UserConnectedAccount.contextTypes = {
  store: PropTypes.object,
};
export default injectIntl(UserConnectedAccount);
