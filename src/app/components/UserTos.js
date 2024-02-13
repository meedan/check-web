import React from 'react';
import { graphql, commitMutation } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl } from 'react-intl';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import Button from '@material-ui/core/Button';
import { mapGlobalMessage } from './MappedMessage';
import UserTosForm from './UserTosForm';
import Message from './Message';
import { stringHelper } from '../customHelpers';
import AboutRoute from '../relay/AboutRoute';
import RelayContainer from '../relay/RelayContainer';

const UserTosComponent = (props) => {
  const [checkedTos, setCheckedTos] = React.useState(false);
  const [message, setMessage] = React.useState('');

  const handleCheckTos = () => {
    setCheckedTos(!checkedTos);
  };

  const handleSubmit = () => {
    const onSuccess = () => {
    };
    const onFailure = () => {
      setMessage(<FormattedMessage id="global.unknownError" defaultMessage="Sorry, an error occurred. Please try again and contact {supportEmail} if the condition persists." description="Message displayed in error notification when an operation fails unexpectedly" values={{ supportEmail: stringHelper('SUPPORT_EMAIL') }} />);
    };
    if (checkedTos) {
      commitMutation(Relay.Store, {
        mutation: graphql`
          mutation UserTosUpdateUserMutation($input: UpdateUserInput!) {
            updateUser(input: $input) {
              me {
                accepted_terms
              }
            }
          }
        `,
        variables: {
          input: {
            id: props.user.id,
            accept_terms: true,
          },
        },
        onCompleted: onSuccess,
        onError: onFailure,
      });
    }
  };

  const handleValidate = () => {
    if (!checkedTos) {
      setMessage(<FormattedMessage id="userTos.validation" defaultMessage="You must agree to the Terms of Service and Privacy Policy" description="Message to the user that they must review the application terms of service" />);
    }
  };
  const { user, about } = props;

  const actions = [
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events
    <div onClick={handleValidate.bind(this)} style={{ cursor: 'pointer' }}>
      <Button
        id="tos__save"
        color="primary"
        onClick={handleSubmit.bind(this)}
        disabled={!checkedTos}
      >
        <FormattedMessage id="userTos.save" defaultMessage="Save" description="Button label for the user to save their review of the terms of service" />
      </Button>
    </div>,
  ];

  const linkStyle = {
    textDecoration: 'underline',
  };

  const communityGuidelinesLink = (
    <a
      target="_blank"
      rel="noopener noreferrer"
      style={linkStyle}
      href="https://meedan.com/en/community_guidelines/"
    >
      <FormattedMessage id="userTos.commGuidelinesLink" defaultMessage="Community Guidelines" description="Link text to take the user to the application community guidelines at the Meedan website" />
    </a>
  );

  return (
    <React.Fragment>
      <DialogContent>
        <Message message={message} />
        <UserTosForm
          user={user}
          showTitle
          termsLastUpdatedAt={about.terms_last_updated_at}
          handleCheckTos={handleCheckTos.bind(this)}
          checkedTos={checkedTos}
        />
        { user && !user.last_accepted_terms_at ?
          <p>
            <FormattedMessage
              id="userTos.commGuidelines"
              defaultMessage="We ask that you also read our {communityGuidelinesLink} for using {appName}."
              description="Message to encourage the user to read the application community guidelines document"
              values={{
                communityGuidelinesLink,
                appName: mapGlobalMessage(props.intl, 'appNameHuman'),
              }}
            />
          </p> : null }
      </DialogContent>
      <DialogActions>
        {actions}
      </DialogActions>
    </React.Fragment>
  );
};

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
