import React from 'react';
import { graphql, commitMutation } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl } from 'react-intl';
import Dialog from '@material-ui/core/Dialog';
import Alert from './cds/alerts-and-prompts/Alert';
import ButtonMain from './cds/buttons-checkboxes-chips/ButtonMain';
import UserTosForm from './UserTosForm';
import { stringHelper } from '../customHelpers';
import AboutRoute from '../relay/AboutRoute';
import RelayContainer from '../relay/RelayContainer';
import dialogStyles from '../styles/css/dialog.module.css';

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
      <ButtonMain
        buttonProps={{
          id: 'tos__save',
        }}
        size="default"
        variant="contained"
        theme="brand"
        onClick={handleSubmit.bind(this)}
        disabled={!checkedTos}
        label={
          <FormattedMessage id="userTos.save" defaultMessage="Save" description="Button label for the user to save their review of the terms of service" />
        }
      />
    </div>,
  ];

  return (
    <React.Fragment>
      { message && <Alert variant="error" className={dialogStyles['dialog-alert']} content={message} /> }
      <UserTosForm
        user={user}
        showTitle
        termsLastUpdatedAt={about.terms_last_updated_at}
        handleCheckTos={handleCheckTos.bind(this)}
        checkedTos={checkedTos}
      />
      <div className={dialogStyles['dialog-actions']}>
        {actions}
      </div>
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
    <Dialog className={dialogStyles['dialog-window']} open={openDialog}>
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
