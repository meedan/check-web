import React, { Component } from 'react';
import Relay from 'react-relay/classic';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl } from 'react-intl';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import Button from '@material-ui/core/Button';
import styled from 'styled-components';
import { mapGlobalMessage } from './MappedMessage';
import UserTosForm from './UserTosForm';
import Message from './Message';
import globalStrings from '../globalStrings';
import { stringHelper } from '../customHelpers';
import AboutRoute from '../relay/AboutRoute';
import RelayContainer from '../relay/RelayContainer';
import UpdateUserMutation from '../relay/mutations/UpdateUserMutation';

const PointerDiv = styled.div`
  cursor: pointer;
`;

const StyledLink = styled.a`
  text-decoration: underline;
`;

class UserTosComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      checkedTos: false,
      checkedPp: false,
    };
  }

  handleCheckTos() {
    this.setState({ checkedTos: !this.state.checkedTos });
  }

  handleCheckPp() {
    this.setState({ checkedPp: !this.state.checkedPp });
  }

  handleSubmit() {
    const onFailure = () => {
      this.setState({
        message: this.props.intl.formatMessage(
          globalStrings.unknownError,
          { supportEmail: stringHelper('SUPPORT_EMAIL') },
        ),
      });
    };

    if (this.state.checkedTos && this.state.checkedPp) {
      Relay.Store.commitUpdate(
        new UpdateUserMutation({
          current_user_id: this.props.user.id,
          accept_terms: true,
        }),
        { onFailure },
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
    const { user, about } = this.props;

    const actions = [
      // eslint-disable-next-line jsx-a11y/click-events-have-key-events
      <PointerDiv onClick={this.handleValidate.bind(this)}>
        <Button
          id="tos__save"
          color="primary"
          onClick={this.handleSubmit.bind(this)}
          disabled={!this.state.checkedTos || !this.state.checkedPp}
        >
          <FormattedMessage id="userTos.save" defaultMessage="Save" />
        </Button>
      </PointerDiv>,
    ];

    const communityGuidelinesLink = (
      <StyledLink
        target="_blank"
        rel="noopener noreferrer"
        href="https://meedan.com/en/community_guidelines/"
      >
        <FormattedMessage id="userTos.commGuidelinesLink" defaultMessage="Community Guidelines" />
      </StyledLink>
    );

    return (
      <React.Fragment>
        <DialogContent>
          <Message message={this.state.message} />
          <UserTosForm
            user={user}
            showTitle
            termsLastUpdatedAt={about.terms_last_updated_at}
            handleCheckTos={this.handleCheckTos.bind(this)}
            handleCheckPp={this.handleCheckPp.bind(this)}
            checkedTos={this.state.checkedTos}
            checkedPp={this.state.checkedPp}
          />
          { user && !user.last_accepted_terms_at ?
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
      </React.Fragment>
    );
  }
}

UserTosComponent.propTypes = {
  user: PropTypes.object.isRequired,
  about: PropTypes.object.isRequired,
};

const UserTosContainer = Relay.createContainer(injectIntl(UserTosComponent), {
  fragments: {
    about: () => Relay.QL`
      fragment on About {
        terms_last_updated_at
      }
    `,
  },
});

const UserTos = (props) => {
  const route = new AboutRoute();
  const { user } = props;
  const openDialog = user && user.dbid && !user.accepted_terms;

  return (
    <Dialog open={openDialog}>
      <RelayContainer
        Component={UserTosContainer}
        route={route}
        renderFetched={data =>
          <UserTosContainer user={user} {...data} />
        }
      />
    </Dialog>
  );
};

export default UserTos;
