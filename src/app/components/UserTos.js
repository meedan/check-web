import React, { Component } from 'react';
import Relay from 'react-relay/classic';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl } from 'react-intl';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import Button from '@material-ui/core/Button';
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
        <Button
          id="tos__save"
          color="primary"
          onClick={this.handleSubmit.bind(this)}
          disabled={!this.state.checkedTos || !this.state.checkedPp}
        >
          <FormattedMessage id="userTos.save" defaultMessage="Save" />
        </Button>
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
        <Dialog open={this.props.open}>
          <DialogContent>
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
          </DialogContent>
          <DialogActions>
            {actions}
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

UserTos.contextTypes = {
  store: PropTypes.object,
};

export default injectIntl(UserTos);
