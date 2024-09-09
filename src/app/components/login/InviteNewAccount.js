import React from 'react';
import Relay from 'react-relay/classic';
import { QueryRenderer, graphql, commitMutation } from 'react-relay/compat';
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import PropTypes from 'prop-types';
import cx from 'classnames/bind';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import TextField from '../cds/inputs/TextField';
import Alert from '../cds/alerts-and-prompts/Alert';
import UserTosForm from '../UserTosForm';
import { FormattedGlobalMessage } from '../MappedMessage';
import GenericUnknownErrorMessage from '../GenericUnknownErrorMessage';
import { stringHelper } from '../../customHelpers';
import { getErrorMessageForRelayModernProblem } from '../../helpers';
import inputStyles from '../../styles/css/inputs.module.css';
import styles from './login.module.css';

const InviteNewAccountComponent = ({ user }) => {
  const [message, setMessage] = React.useState(null);
  const [name, setName] = React.useState(user.name);
  const [email, setEmail] = React.useState(user.email);
  const [password, setPassword] = React.useState('');
  const [passwordConfirmation, setPasswordConfirmation] = React.useState('');
  const [checkedTos, setCheckedTos] = React.useState(user.accepted_terms);

  const { team_user: teamUser } = user;

  const onFormSubmit = (e) => {
    e.preventDefault();
    if (checkedTos) {
      const onFailure = (errors) => {
        const errorMessage = getErrorMessageForRelayModernProblem(errors)[0].message || <GenericUnknownErrorMessage />;
        setMessage(errorMessage);
      };

      const onSuccess = () => {
        window.location.reload();
      };

      commitMutation(Relay.Store, {
        mutation: graphql`
          mutation InviteNewAccountUpdateUserMutation($input: UpdateUserInput!) {
            updateUser(input: $input) {
              user {
                id
                dbid
              }
            }
          }
        `,
        variables: {
          input: {
            id: user.id,
            name,
            password,
            accept_terms: true,
            current_team_id: teamUser.team.dbid,
            completed_signup: true,
          },
        },
        onError: onFailure,
        onCompleted: ({ data, errors }) => {
          if (errors) {
            return onFailure(errors);
          }
          return onSuccess(data);
        },
      });
    } else {
      const errorMessage = (
        <FormattedMessage
          defaultMessage="You must agree to the Terms of Service and Privacy Policy"
          description="Error message for check Terms and Privacy Privacy boxes"
          id="inviteNewAccounttosMissing"
        />
      );
      setMessage(errorMessage);
      window.scroll(0, 0);
    }
  };

  const handleCheckTos = () => {
    setCheckedTos(!checkedTos);
  };

  return (
    <div className={styles['login-wrapper']}>
      <div className={styles['login-container']}>
        <div className={cx('login', styles['login-form'])} id="login">
          <form className="login__form" onSubmit={(e) => { onFormSubmit(e); }}>
            <FormattedGlobalMessage messageKey="appNameHuman">
              {appNameHuman => (
                <img
                  alt={appNameHuman}
                  className={cx('login__icon', styles['login-logo'])}
                  src={stringHelper('LOGO_URL')}
                  width="120"
                />
              )}
            </FormattedGlobalMessage>
            <div className={styles['login-form-invited']}>
              <p>
                <FormattedMessage
                  defaultMessage="{name} has invited you to join the workspace:"
                  description="Message to the current user about who has invited them to join this workspace"
                  id="inviteNewAccount.invitedBy"
                  values={{
                    name: teamUser?.invited_by?.name,
                  }}
                />
                <br />
                <strong>{teamUser?.team?.name}</strong>
              </p>
              <FormattedHTMLMessage
                defaultMessage="You need to create an account for <strong>{email}</strong>"
                description="Inform your to create a new account for signup"
                id="inviteNewAccount.createMessage"
                tagName="p"
                values={{
                  email: user.email,
                }}
              />
            </div>
            {message &&
              <Alert
                className={styles['login-form-alert']}
                content={message}
                variant="error"
              />
            }

            <div className={inputStyles['form-fieldset']}>
              <TextField
                className={cx('int-login__email-input', inputStyles['form-fieldset-field'])}
                componentProps={{
                  type: 'email',
                  name: 'email',
                }}
                disabled
                label={
                  <FormattedMessage
                    defaultMessage="Email"
                    description="Label for user email field"
                    id="inviteNewAccountemailLabel"
                  />
                }
                required
                value={email}
                onChange={(e) => { setEmail(e.target.value); }}
              />

              <TextField
                autoFocus
                className={cx('login__name-input', inputStyles['form-fieldset-field'])}
                componentProps={{
                  name: 'name',
                }}
                label={
                  <FormattedMessage
                    defaultMessage="Name"
                    description="Label for user name field"
                    id="inviteNewAccountnameLabel"
                  />
                }
                required
                value={name}
                onChange={(e) => { setName(e.target.value); }}
              />

              <TextField
                className={cx('int-login__password-input', inputStyles['form-fieldset-field'])}
                componentProps={{
                  type: 'password',
                  name: 'password',
                }}
                label={
                  <FormattedMessage
                    defaultMessage="Password (minimum 8 characters)"
                    description="Label for password field"
                    id="inviteNewAccountpasswordLabel"
                  />
                }
                required
                value={password}
                onChange={(e) => { setPassword(e.target.value); }}
              />

              <TextField
                className={cx('int-login__password-confirmation-input', inputStyles['form-fieldset-field'])}
                componentProps={{
                  type: 'password',
                  name: 'passwordConfirmation',
                }}
                label={
                  <FormattedMessage
                    defaultMessage="Password confirmation"
                    description="Label for password confirmation field"
                    id="inviteNewAccountpasswordConfirmLabel"
                  />
                }
                required
                value={passwordConfirmation}
                onChange={(e) => { setPasswordConfirmation(e.target.value); }}
              />
            </div>
            <div className={cx(styles['login-agree-terms'])}>
              <UserTosForm
                checkedTos={checkedTos}
                handleCheckTos={handleCheckTos}
                showTitle={false}
                user={{}}
              />
            </div>
            <div className="login__actions">
              <ButtonMain
                buttonProps={{
                  id: 'submit-register-or-login',
                  type: 'submit',
                }}
                className={cx('login__submit', 'login__submit--register')}
                label={
                  <FormattedMessage
                    defaultMessage="Create Account"
                    description="Submit button for create a new account"
                    id="inviteNewAccount.createAccount"
                  />
                }
                size="default"
                theme="info"
                variant="contained"
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const InviteNewAccount = ({ teamSlug }) => (
  <QueryRenderer
    environment={Relay.Store}
    query={graphql`
      query InviteNewAccountQuery($teamSlug: String!) {
        me {
          id
          dbid
          name
          email
          accepted_terms
          team_user(team_slug: $teamSlug) {
            team {
              dbid
              name
            }
            invited_by {
              name
            }
          }
        }
      }
    `}
    render={({ error, props }) => {
      if (!error && props) {
        return <InviteNewAccountComponent user={props.me} />;
      }

      // TODO: We need a better error handling in the future, standardized with other components
      return null;
    }}
    variables={{
      teamSlug,
    }}
  />
);

InviteNewAccount.propTypes = {
  teamSlug: PropTypes.string.isRequired,
};

// eslint-disable-next-line import/no-unused-modules
export { InviteNewAccountComponent };
export default InviteNewAccount;
