import React from 'react';
import { graphql, commitMutation, QueryRenderer } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl } from 'react-intl';
import Dialog from '@material-ui/core/Dialog';
import Alert from './cds/alerts-and-prompts/Alert';
import ButtonMain from './cds/buttons-checkboxes-chips/ButtonMain';
import Loader from './cds/loading/Loader';
import ErrorBoundary from './error/ErrorBoundary';
import UserTosForm from './UserTosForm';
import { stringHelper } from '../customHelpers';
import dialogStyles from '../styles/css/dialog.module.css';

const UserTosComponent = ({ about, setOpenDialog, user }) => {
  const [checkedTos, setCheckedTos] = React.useState(false);
  const [message, setMessage] = React.useState('');

  const handleCheckTos = () => {
    setCheckedTos(!checkedTos);
  };

  const handleSubmit = () => {
    const onSuccess = () => {
      setOpenDialog(false);
    };
    const onFailure = () => {
      setMessage(<FormattedMessage defaultMessage="Sorry, an error occurred. Please try again and contact {supportEmail} if the condition persists." description="Message displayed in error notification when an operation fails unexpectedly" id="global.unknownError" values={{ supportEmail: stringHelper('SUPPORT_EMAIL') }} />);
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
            id: user.id,
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
      setMessage(<FormattedMessage defaultMessage="You must agree to the Terms of Service and Privacy Policy" description="Message to the user that they must review the application terms of service" id="userTos.validation" />);
    }
  };

  const actions = [
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events
    <div style={{ cursor: 'pointer' }} onClick={handleValidate.bind(this)}>
      <ButtonMain
        buttonProps={{
          id: 'tos__save',
        }}
        disabled={!checkedTos}
        label={
          <FormattedMessage defaultMessage="Save" description="Button label for the user to save their review of the terms of service" id="userTos.save" />
        }
        size="default"
        theme="info"
        variant="contained"
        onClick={() => handleSubmit()}
      />
    </div>,
  ];

  return (
    <React.Fragment>
      { message && <Alert className={dialogStyles['dialog-alert']} content={message} variant="error" /> }
      <UserTosForm
        checkedTos={checkedTos}
        handleCheckTos={handleCheckTos.bind(this)}
        showTitle
        termsLastUpdatedAt={about.terms_last_updated_at}
        user={user}
      />
      <div className={dialogStyles['dialog-actions']}>
        {actions}
      </div>
    </React.Fragment>
  );
};

UserTosComponent.propTypes = {
  about: PropTypes.object.isRequired,
  setOpenDialog: PropTypes.func.isRequired,
  user: PropTypes.object.isRequired,
};


const UserTos = ({ user }) => {
  // Fix: remove debug and add back !user.accepted_terms
  const [openDialog, setOpenDialog] = React.useState(user && user.dbid && !user.accepted_terms);
  return (
    <Dialog className={dialogStyles['dialog-window']} open={openDialog}>
      <ErrorBoundary component="UserTos">
        <QueryRenderer
          environment={Relay.Store}
          query={graphql`
            query UserTosQuery {
              about {
                terms_last_updated_at
              }
            }
          `}
          render={({ error, props }) => {
            if (!error && props) {
              return <UserTosComponent about={props.about} setOpenDialog={setOpenDialog} user={user} />;
            }
            return <Loader size="large" theme="white" variant="page" />;
          }}
        />
      </ErrorBoundary>
    </Dialog>
  );
};

export default injectIntl(UserTos);
