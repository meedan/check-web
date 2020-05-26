import React from 'react';
import { FormattedMessage } from 'react-intl';
import FASlack from 'react-icons/lib/fa/slack';
import FAFacebook from 'react-icons/lib/fa/facebook-official';
import FATwitter from 'react-icons/lib/fa/twitter';
import MDEmail from 'react-icons/lib/md/email';
import { browserHistory, Link } from 'react-router';
import Button from '@material-ui/core/Button';
import ButtonBase from '@material-ui/core/ButtonBase';
import TextField from '@material-ui/core/TextField';
import Card from '@material-ui/core/Card';
import styled from 'styled-components';
import Message from './Message';
import UploadImage from './UploadImage';
import UserTosForm from './UserTosForm';
import { login, request } from '../redux/actions';
import { FormattedGlobalMessage } from './MappedMessage';
import { stringHelper } from '../customHelpers';
import { getErrorObjects } from '../helpers';
import CheckError from '../CheckError';
import {
  units,
  mediaQuery,
  caption,
  body2,
  title1,
  subheading2,
  black54,
  black38,
  black32,
  checkBlue,
  twitterBlue,
  facebookBlue,
  slackGreen,
  white,
  boxShadow,
  transitionSpeedFast,
  defaultBorderRadius,
} from '../styles/js/shared';

const StyledSubHeader = styled.h2`
  font: ${title1};
  font-weight: 600;
  color: ${black54};
  text-align: center;
  margin-top: ${units(2)};
`;

const StyledLabel = styled.div`
  font: ${subheading2};
  color: ${black32};
  margin-top: ${units(2)};
`;

const StyledEnhancedButton = styled(ButtonBase)`
  border: 0;
  width: ${units(39)};
  margin: ${units(2)} 0 0 !important;
  background-color: ${white} !important;
  height: 100%!important;
  padding: ${units(1)}!important;
  box-shadow: ${boxShadow(1)};
  transition: box-shadow ${transitionSpeedFast} ease-in-out;
  border-radius: ${defaultBorderRadius};
  text-align: ${props => props.theme.dir === 'rtl' ? 'right' : 'left'};

  &:hover {
    box-shadow: ${boxShadow(2)};
  }

  > div {
    height: ${units(6)};
  }

  ${mediaQuery.handheld`
    width: 100% !important;
  `}

  svg {
    width: ${units(3)};
    height: ${units(3)};
  }

  h4 {
    color: ${black38};
    font: ${caption};
    margin: 0;
  }

  h3 {
    color: ${checkBlue};
    font: ${body2};
    font-weight: 500;
    margin: 0;
  }
`;

const StyledCard = styled(Card)`
  padding: ${units(11)} ${units(15)} ${units(3)} !important;
  ${mediaQuery.handheld`
    padding: ${units(8)} ${units(4)} ${units(3)} !important;
  `}
`;

const BigButtons = styled.div`
  display: flex;
  flex-flow: row wrap;
  justify-content: space-between;
  align-items: center;
  margin: 0 0 ${units(3)};
`;

const styles = {
  logo: {
    margin: '0 auto',
    display: 'block',
  },
  buttonGroup: {
    marginTop: units(8),
  },
  primaryButton: {
    display: 'block',
    margin: `${units(2)} auto`,
    maxWidth: units(21),
  },
  secondaryButton: {
    display: 'block',
    color: black54,
    maxWidth: units(26),
    margin: `${units(2)} auto`,
  },
};

const Row = styled.div`
  display: flex;
  flex-flow: row nowrap;
`;

const Column = styled.div`
  display: flex;
  flex-flow: column nowrap;
  margin: ${units(0.5)} ${units(1)};
`;

const BigButton = ({
  className, icon, id, onClick, headerText, subheaderText,
}) => (
  <StyledEnhancedButton id={id} className={className} onClick={onClick}>
    <Row>
      <Column>
        {icon}
      </Column>
      <Column>
        <h3>{headerText}</h3>
        {subheaderText ?
          <h4>
            <FormattedMessage
              id="login.disclaimer"
              defaultMessage="We won’t publish without your permission"
            />
          </h4> : null
        }
      </Column>
    </Row>
  </StyledEnhancedButton>
);

class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      type: 'login', // or 'register'
      image: null,
      message: null,
      name: '',
      email: '',
      password: '',
      otp_attempt: '',
      passwordConfirmation: '',
      checkedTos: false,
      checkedPp: false,
      showOtp: false,
    };
  }

  onFormSubmit(e) {
    e.preventDefault();

    if (this.state.type === 'login') {
      this.emailLogin();
    } else {
      this.registerEmail();
    }
  }

  handleImageChange = (file) => {
    this.setState({ image: file, message: null });
  }

  handleImageError = (file, message) => {
    this.setState({ image: null, message });
  }

  handleCheckTos() {
    this.setState({ checkedTos: !this.state.checkedTos });
  }

  handleCheckPp() {
    this.setState({ checkedPp: !this.state.checkedPp });
  }

  handleSwitchType() {
    const type = this.state.type === 'login' ? 'register' : 'login';
    this.setState({ type, registrationSubmitted: false, message: null }, () => {
      if (type === 'login') {
        this.inputEmail.focus();
      } else {
        this.inputName.focus();
      }
    });
  }

  emailLogin() {
    const params = {
      'api_user[email]': this.state.email,
      'api_user[password]': this.state.password,
      'api_user[otp_attempt]': this.state.otp_attempt,
    };

    const failureCallback = (transaction) => {
      const errors = getErrorObjects(transaction);
      const { message, code } = errors[0];
      const showOtp =
        (code === CheckError.codes.LOGIN_2FA_REQUIRED) ||
        this.state.showOtp;
      this.setState({ message, showOtp });
    };

    const successCallback = () => {
      this.setState({ message: null });
      this.props.loginCallback();
      browserHistory.push('/');
    };

    request('post', 'users/sign_in', failureCallback, successCallback, params);
  }

  registerEmail() {
    const params = {
      'api_user[email]': this.state.email,
      'api_user[name]': this.state.name,
      'api_user[password]': this.state.password,
      'api_user[password_confirmation]': this.state.passwordConfirmation,
      'api_user[image]': this.state.image,
    };

    const failureCallback = (transaction) => {
      const errors = getErrorObjects(transaction);
      const { message, code } = errors[0];
      if (code === CheckError.codes.UNAUTHORIZED) {
        this.setState({ registrationSubmitted: true });
      }
      this.setState({ message });
      window.scroll(0, 0);
    };

    const successCallback = () => {
      this.setState({ message: null });
      this.props.loginCallback();
      browserHistory.push(window.location.pathname);
    };

    if (this.state.checkedTos && this.state.checkedPp) {
      request('post', 'users', failureCallback, successCallback, params);
    } else {
      this.setState({
        message: <FormattedMessage id="login.tosMissing" defaultMessage="You must agree to the Terms of Service and Privacy Policy" />,
      });
      window.scroll(0, 0);
    }
  }

  oAuthLogin(provider) {
    login(provider, this.props.loginCallback);
  }

  handleFieldChange(e) {
    const state = {};
    state[e.target.name] = e.target.value;
    this.setState(state);
  }

  render() {
    return (
      <div className="login" id="login">
        <StyledCard>
          <form onSubmit={this.onFormSubmit.bind(this)} className="login__form">
            <FormattedGlobalMessage messageKey="appNameHuman">
              {appNameHuman => (
                <img
                  style={styles.logo}
                  alt={appNameHuman}
                  width="120"
                  className="login__icon"
                  src={stringHelper('LOGO_URL')}
                />
              )}
            </FormattedGlobalMessage>
            <StyledSubHeader className="login__heading">
              {this.state.type === 'login' ?
                <FormattedMessage
                  id="login.title"
                  defaultMessage="Sign in"
                /> :
                <FormattedMessage
                  id="login.registerTitle"
                  defaultMessage="Register"
                />}
            </StyledSubHeader>
            <Message message={this.state.message} />
            {this.state.registrationSubmitted ?
              null :
              <div>
                {this.state.type === 'login' ?
                  null :
                  <div className="login__name">
                    <TextField
                      margin="normal"
                      fullWidth
                      name="name"
                      value={this.state.name}
                      className="login__name-input"
                      inputRef={(i) => { this.inputName = i; }}
                      onChange={this.handleFieldChange.bind(this)}
                      label={<FormattedMessage id="login.nameLabel" defaultMessage="Your name" />}
                    />
                  </div>}

                <div className="login__email">
                  <TextField
                    margin="normal"
                    fullWidth
                    type="email"
                    name="email"
                    value={this.state.email}
                    className="login__email-input"
                    inputRef={(i) => { this.inputEmail = i; }}
                    onChange={this.handleFieldChange.bind(this)}
                    label={
                      <FormattedMessage id="login.emailLabel" defaultMessage="Email address" />
                    }
                    autoFocus
                  />
                </div>

                <div className="login__password">
                  <TextField
                    margin="normal"
                    fullWidth
                    type="password"
                    name="password"
                    value={this.state.password}
                    className="login__password-input"
                    onChange={this.handleFieldChange.bind(this)}
                    label={this.state.type === 'login' ? (
                      <FormattedMessage id="login.passwordInputHint" defaultMessage="Password" />
                    ) : (
                      <FormattedMessage
                        id="login.passwordLabel"
                        defaultMessage="Password (minimum 8 characters)"
                      />
                    )}
                  />
                </div>

                {this.state.type === 'login' && this.state.showOtp ?
                  <div className="login__otp_attempt">
                    <TextField
                      margin="normal"
                      fullWidth
                      name="otp_attempt"
                      value={this.state.otp_attempt}
                      className="login__otp_attempt-input"
                      onChange={this.handleFieldChange.bind(this)}
                      label={
                        <FormattedMessage
                          id="login.otpAttemptLabel"
                          defaultMessage="Two-Factor Authentication Token"
                        />
                      }
                    />
                  </div> : null}

                {this.state.type === 'login' ?
                  null :
                  <div className="login__password-confirmation">
                    <TextField
                      margin="normal"
                      fullWidth
                      type="password"
                      name="passwordConfirmation"
                      value={this.state.passwordConfirmation}
                      className="login__password-confirmation-input"
                      onChange={this.handleFieldChange.bind(this)}
                      label={
                        <FormattedMessage
                          id="login.passwordConfirmLabel"
                          defaultMessage="Password confirmation"
                        />
                      }
                    />
                  </div>}

                {this.state.type === 'login' ?
                  null :
                  <div>
                    <StyledLabel>
                      <FormattedMessage
                        id="login.profilePicture"
                        defaultMessage="Profile picture"
                      />
                    </StyledLabel>
                    <UploadImage
                      type="image"
                      value={this.state.image}
                      onChange={this.handleImageChange}
                      onError={this.handleImageError}
                    />
                    <UserTosForm
                      user={{}}
                      showTitle={false}
                      handleCheckTos={this.handleCheckTos.bind(this)}
                      handleCheckPp={this.handleCheckPp.bind(this)}
                      checkedTos={this.state.checkedTos}
                      checkedPp={this.state.checkedPp}
                    />
                  </div> }

                <div className="login__actions" style={styles.buttonGroup}>
                  <Button
                    variant="contained"
                    color="primary"
                    style={styles.primaryButton}
                    type="submit"
                    id="submit-register-or-login"
                    className={`login__submit login__submit--${this.state.type}`}
                  >
                    {this.state.type === 'login' ?
                      <FormattedMessage
                        id="login.signIn"
                        defaultMessage="SIGN IN"
                      /> :
                      <FormattedMessage
                        id="login.signUp"
                        defaultMessage="REGISTER"
                      />
                    }
                  </Button>
                  {this.state.type === 'login' ?
                    <span className="login__forgot-password">
                      <Link to="/check/user/password-reset">
                        <Button style={styles.secondaryButton}>
                          <FormattedMessage
                            id="loginEmail.lostPassword"
                            defaultMessage="Forgot password"
                          />
                        </Button>
                      </Link>
                    </span>
                    : null}
                </div>
              </div>}
          </form>
        </StyledCard>

        <BigButtons>
          <BigButton
            onClick={this.oAuthLogin.bind(this, 'slack')}
            id="slack-login"
            icon={<FASlack style={{ color: slackGreen }} className="logo" />}
            headerText={
              <FormattedMessage
                id="login.with"
                defaultMessage="Continue with {provider}"
                values={{ provider: 'Slack' }}
              />
            }
            subheaderText
          />

          <BigButton
            onClick={this.oAuthLogin.bind(this, 'twitter')}
            id="twitter-login"
            icon={<FATwitter style={{ color: twitterBlue }} className="logo" />}
            headerText={
              <FormattedMessage
                id="login.with"
                defaultMessage="Continue with {provider}"
                values={{ provider: 'Twitter' }}
              />
            }
            subheaderText
          />

          <BigButton
            onClick={this.oAuthLogin.bind(this, 'facebook')}
            id="facebook-login"
            icon={<FAFacebook style={{ color: facebookBlue }} className="logo" />}
            headerText={
              <FormattedMessage
                id="login.with"
                defaultMessage="Continue with {provider}"
                values={{ provider: 'Facebook' }}
              />
            }
            subheaderText
          />

          {this.state.type === 'login' ?
            <BigButton
              id="register-or-login"
              onClick={this.handleSwitchType.bind(this)}
              icon={<MDEmail style={{ color: black54 }} />}
              headerText={
                <FormattedMessage
                  id="login.newAccount"
                  defaultMessage="Create a new account with email"
                />
              }
              subheaderText={false}
            />
            :
            <BigButton
              id="register-or-login"
              onClick={this.handleSwitchType.bind(this)}
              icon={<MDEmail style={{ color: black54 }} />}
              headerText={
                <FormattedMessage
                  id="login.alreadyHasAccount"
                  defaultMessage="I already have an account"
                />
              }
              subheaderText={false}
            />}
        </BigButtons>
      </div>
    );
  }
}

export default Login;
