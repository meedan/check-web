import React from 'react';
import Relay from 'react-relay/classic';
import { QueryRenderer, graphql, commitMutation } from 'react-relay/compat';
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Card from '@material-ui/core/Card';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import styled from 'styled-components';
import Message from './Message';
import UserTosForm from './UserTosForm';
import { FormattedGlobalMessage } from './MappedMessage';
import GenericUnknownErrorMessage from './GenericUnknownErrorMessage';
import { stringHelper } from '../customHelpers';
import { getErrorMessageForRelayModernProblem } from '../helpers';
import {
  units,
  mediaQuery,
  ContentColumn,
} from '../styles/js/shared';

const StyledCard = styled(Card)`
  padding: ${units(11)} ${units(15)} ${units(3)} !important;
  ${mediaQuery.handheld`
    padding: ${units(8)} ${units(4)} ${units(3)} !important;
  `}
`;

const useStyles = makeStyles({
  logo: {
    margin: '0 auto',
    display: 'block',
  },
  primaryButton: {
    display: 'block',
    margin: `${units(2)} auto`,
  },
  bold: {
    fontWeight: 'bold',
  },
  topMargin: {
    marginTop: `${units(3)}`,
  },
});

const InviteNewAccountComponent = ({ user }) => {
  const [message, setMessage] = React.useState(null);
  const [name, setName] = React.useState(user.name);
  const [email, setEmail] = React.useState(user.email);
  const [password, setPassword] = React.useState('');
  const [passwordConfirmation, setPasswordConfirmation] = React.useState('');
  const [checkedTos, setCheckedTos] = React.useState(user.accepted_terms);
  const [checkedPp, setCheckedPp] = React.useState(user.accepted_terms);

  const { team_user: teamUser } = user;

  const onFormSubmit = (e) => {
    e.preventDefault();
    if (checkedTos && checkedPp) {
      const onFailure = (errors) => {
        const errorMessage = getErrorMessageForRelayModernProblem(errors) || <GenericUnknownErrorMessage />;
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
                accepted_terms
                current_team_id
                current_team {
                  id
                  dbid
                }
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
            completed_signup: false,
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
          id="inviteNewAccounttosMissing"
          defaultMessage="You must agree to the Terms of Service and Privacy Policy"
          description="Error message for check Terms and Privacy Privacy boxes"
        />
      );
      setMessage(errorMessage);
      window.scroll(0, 0);
    }
  };

  const handleCheckTos = () => {
    setCheckedTos(!checkedTos);
  };

  const handleCheckPp = () => {
    setCheckedPp(!checkedPp);
  };


  const classes = useStyles();

  return (
    <div className="login" id="login">
      <ContentColumn center>
        <StyledCard>
          <form onSubmit={(e) => { onFormSubmit(e); }} className="login__form">
            <FormattedGlobalMessage messageKey="appNameHuman">
              {appNameHuman => (
                <img
                  alt={appNameHuman}
                  width="120"
                  className={['login__icon', classes.logo].join(' ')}
                  src={stringHelper('LOGO_URL')}
                />
              )}
            </FormattedGlobalMessage>

            <Typography component="div" align="center" className={classes.topMargin}>
              <FormattedMessage
                id="inviteNewAccount.invitedBy"
                defaultMessage="{name} has invited you to join the workspace"
                values={{
                  name: teamUser.invited_by.name,
                }}
              />
            </Typography>
            <Typography component="div" align="center" className={classes.bold} paragraph="true">
              {teamUser.team.name}
            </Typography>
            <Typography component="div" align="center" paragraph="true">
              <FormattedHTMLMessage
                id="inviteNewAccount.createMessage"
                defaultMessage="You need to create an account for <b>{email}</b>"
                values={{
                  email: user.email,
                }}
                description="Inform your to create a new account for signup"
              />
            </Typography>

            <Message message={message} />

            <div className="login__email">
              <TextField
                margin="normal"
                fullWidth
                variant="outlined"
                type="email"
                name="email"
                value={email}
                className="login__email-input"
                onChange={(e) => { setEmail(e.target.value); }}
                label={
                  <FormattedMessage
                    id="inviteNewAccountemailLabel"
                    defaultMessage="Email"
                    description="Label for user email field"
                  />
                }
                disabled
              />
            </div>

            <div className="login__name">
              <TextField
                required
                margin="normal"
                fullWidth
                variant="outlined"
                name="name"
                value={name}
                className="login__name-input"
                onChange={(e) => { setName(e.target.value); }}
                label={
                  <FormattedMessage
                    id="inviteNewAccountnameLabel"
                    defaultMessage="Name"
                    description="Label for user name field"
                  />
                }
                autoFocus
              />
            </div>

            <div className="login__password">
              <TextField
                required
                margin="normal"
                fullWidth
                variant="outlined"
                type="password"
                name="password"
                value={password}
                className="login__password-input"
                onChange={(e) => { setPassword(e.target.value); }}
                label={
                  <FormattedMessage
                    id="inviteNewAccountpasswordLabel"
                    defaultMessage="Password (minimum 8 characters)"
                    description="Label for password field"
                  />
                }
              />
            </div>

            <div className="login__password-confirmation">
              <TextField
                required
                margin="normal"
                fullWidth
                variant="outlined"
                type="password"
                name="passwordConfirmation"
                value={passwordConfirmation}
                className="login__password-confirmation-input"
                onChange={(e) => { setPasswordConfirmation(e.target.value); }}
                label={
                  <FormattedMessage
                    id="inviteNewAccountpasswordConfirmLabel"
                    defaultMessage="Password confirmation"
                    description="Label for password confirmation field"
                  />
                }
              />
            </div>

            <UserTosForm
              user={{}}
              showTitle={false}
              handleCheckTos={handleCheckTos}
              handleCheckPp={handleCheckPp}
              checkedTos={checkedTos}
              checkedPp={checkedPp}
            />
            <div className="login__actions">
              <Button
                variant="contained"
                color="primary"
                type="submit"
                id="submit-register-or-login"
                className={['login__submit login__submit--register', classes.primaryButton].join(' ')}
              >
                <FormattedMessage
                  id="inviteNewAccount.createAccount"
                  defaultMessage="Create Account"
                  description="Submit button for create a new account"
                />
              </Button>
            </div>

          </form>
        </StyledCard>
      </ContentColumn>
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
          login
          accepted_terms
          team_user(team_slug: $teamSlug) {
            team {
              dbid
              name
              slug
            }
            invited_by {
              name
            }
          }
        }
      }
    `}
    variables={{
      teamSlug,
    }}
    render={({ error, props }) => {
      if (!error && props) {
        return <InviteNewAccountComponent user={props.me} />;
      }

      // TODO: We need a better error handling in the future, standardized with other components
      return null;
    }}
  />
);

InviteNewAccount.propTypes = {
  teamSlug: PropTypes.string.isRequired,
};

export default InviteNewAccount;
