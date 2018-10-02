import React, { Component } from 'react';
import Relay from 'react-relay/classic';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl } from 'react-intl';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import UpdateUserMutation from '../relay/mutations/UpdateUserMutation';
import CheckContext from '../CheckContext';
import { mapGlobalMessage } from './MappedMessage';
import UserTosForm from './UserTosForm';
import Message from './Message';

class UserTos extends Component {
  constructor(props) {
    super(props);
    this.state = {
      checkedTos: false,
      checkedPp: false,
    };
  }

  getCurrentUser() {
    return new CheckContext(this).getContextStore().currentUser;
  }

  handleCheckTos() {
    this.setState({ checkedTos: !this.state.checkedTos });
  }

  handleCheckPp() {
    this.setState({ checkedPp: !this.state.checkedPp });
  }

  handleSubmit() {
    const currentUser = this.getCurrentUser();

    const onSubmit = () => {
      window.location.assign(window.location.origin);
    };

    if (this.state.checkedTos && this.state.checkedPp) {
      Relay.Store.commitUpdate(
        new UpdateUserMutation({
          current_user_id: currentUser.id,
          accept_terms: true,
        }),
        { onSuccess: onSubmit, onFailure: onSubmit },
      );
    }
  }

  handleValidate() {
    if (!this.state.checkedTos || !this.state.checkedPp) {
      this.setState({
        message: <FormattedMessage id="userTos.validation" defaultMessage="You must agree to the Terms of Service and Privacy Policy" />,
      });
    }
  }

  render() {
    const actions = [
      // eslint-disable-next-line jsx-a11y/click-events-have-key-events
      <div onClick={this.handleValidate.bind(this)} style={{ cursor: 'pointer' }}>
        <FlatButton
          id="tos__save"
          label={<FormattedMessage id="userTos.save" defaultMessage="Save" />}
          primary
          keyboardFocused
          onClick={this.handleSubmit.bind(this)}
          disabled={!this.state.checkedTos || !this.state.checkedPp}
        />
      </div>,
    ];

    const linkStyle = {
      textDecoration: 'underline',
    };

    const user = this.getCurrentUser();

    const communityGuidelinesLink = (
      <a
        target="_blank"
        rel="noopener noreferrer"
        style={linkStyle}
        href="https://meedan.com/en/community_guidelines/"
      >
        <FormattedMessage id="userTos.commGuidelinesLink" defaultMessage="Community Guidelines" />
      </a>
    );

    return (
      <div>
        <Dialog
          actions={actions}
          modal={false}
          open
        >
          <Message message={this.state.message} />
          <UserTosForm
            user={user}
            showTitle
            handleCheckTos={this.handleCheckTos.bind(this)}
            handleCheckPp={this.handleCheckPp.bind(this)}
            checkedTos={this.state.checkedTos}
            checkedPp={this.state.checkedPp}
          />
          { !user.last_accepted_terms_at ?
            <p>
              <FormattedMessage
                id="userTos.commGuidelines"
                defaultMessage="We ask that you also read our {communityGuidelinesLink} for using {appName}."
                values={{
                  communityGuidelinesLink,
                  appName: mapGlobalMessage(this.props.intl, 'appNameHuman'),
                }}
              />
            </p> : null }
        </Dialog>
      </div>
    );
  }
}

UserTos.contextTypes = {
  store: PropTypes.object,
};

export default injectIntl(UserTos);
