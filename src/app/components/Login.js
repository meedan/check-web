import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  FormattedMessage,
  defineMessages,
  injectIntl,
  intlShape,
} from 'react-intl';
import FASlack from 'react-icons/lib/fa/slack';
import FAFacebook from 'react-icons/lib/fa/facebook-official';
import FATwitter from 'react-icons/lib/fa/twitter';
import MDEmail from 'react-icons/lib/md/email';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import rtlDetect from 'rtl-detect';
import { Link } from 'react-router';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import EnhancedButton from 'material-ui/internal/EnhancedButton';
import { Card } from 'material-ui/Card';
import styled from 'styled-components';
import merge from 'lodash.merge';
import Message from './Message';
import UploadImage from './UploadImage';
import CheckContext from '../CheckContext';
import { login, request } from '../redux/actions';
import { mapGlobalMessage } from './MappedMessage';
import { stringHelper } from '../customHelpers';
import {
  muiThemeWithoutRtl,
  units,
  mediaQuery,
  caption,
  body2,
  title1,
  black54,
  black38,
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

const StyledEnhancedButton = styled(EnhancedButton)`
  border: 0;
  width: ${units(39)};
  margin: ${units(2)} 0 0 !important;
  background-color: ${white} !important;
  height: 100%!important;
  padding: ${units(1)}!important;
  box-shadow: ${boxShadow(1)};
  transition: box-shadow ${transitionSpeedFast} ease-in-out;
  border-radius: ${defaultBorderRadius};

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

const messages = defineMessages({
  passwordInputHint: {
    id: 'login.passwordInputHint',
    defaultMessage: 'Password',
  },
});

const Row = styled.div`
  display: flex;
  flex-flow: row nowrap;
`;

const Column = styled.div`
  display: flex;
  flex-flow: column nowrap;
  margin: ${units(0.5)} ${units(1)};
`;


class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      type: 'login', // or 'register'
      message: null,
      name: '',
      email: '',
      password: '',
      password_confirmation: '',
    };
  }

  componentDidMount() {
    this.focusFirstInput();
  }

  onFormSubmit(e) {
    e.preventDefault();

    if (this.state.type === 'login') {
      this.emailLogin();
    } else {
      this.registerEmail();
    }
  }

  onImage(file) {
    document.forms.register.image = file;
  }

  getHistory() {
    return new CheckContext(this).getContextStore().history;
  }

  handleSwitchType() {
    const type = this.state.type === 'login' ? 'register' : 'login';
    this.setState({ type }, () => this.focusFirstInput());
  }

  focusFirstInput() {
    const input = document.querySelector('.login input');
    if (input) {
      input.focus();
    }
  }

  emailLogin() {
    const history = this.getHistory();
    const params = {
      'api_user[email]': this.state.email,
      'api_user[password]': this.state.password,
    };

    const failureCallback = message => this.setState({ message });

    const successCallback = () => {
      this.setState({ message: null });
      this.props.loginCallback();
      history.push('/');
    };

    request('post', 'users/sign_in', failureCallback, successCallback, params);
  }

  registerEmail() {
    const history = this.getHistory();
    const form = document.forms.register;
    const params = {
      'api_user[email]': this.state.email,
      'api_user[name]': this.state.name,
      'api_user[password]': this.state.password,
      'api_user[password_confirmation]': this.state.password_confirmation,
      'api_user[image]': form.image,
    };

    const failureCallback = message => this.setState({ message });

    const successCallback = () => {
      this.setState({ message: null });
      this.props.loginCallback();
      history.push(window.location.pathname);
    };

    request('post', 'users', failureCallback, successCallback, params);
  }

  oAuthLogin(provider) {
    login(provider, this.props.loginCallback);
  }

  bemClass(baseClass, modifierBoolean, modifierSuffix) {
    return modifierBoolean
      ? [baseClass, baseClass + modifierSuffix].join(' ')
      : baseClass;
  }

  handleFieldChange(e) {
    const state = {};
    state[e.target.name] = e.target.value;
    this.setState(state);
  }

  render() {
    const muiThemeWithRtl = getMuiTheme(merge(muiThemeWithoutRtl, {
      isRtl: rtlDetect.isRtlLang(this.props.intl.locale),
    }));

    const locale = this.props.intl.locale;
    const isRtl = rtlDetect.isRtlLang(locale);
    const fromDirection = isRtl ? 'right' : 'left';

    const BigButton = ({
      className, icon, id, onClick, headerText, subheaderText,
    }) => (
      <StyledEnhancedButton
        id={id}
        className={className}
        onClick={onClick}
        style={{ textAlign: fromDirection }}
      >
        <Row>
          <Column>
            {icon}
          </Column>
          <Column>
            <h3>{headerText}</h3>
            { subheaderText ?
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

    return (
      <MuiThemeProvider muiTheme={muiThemeWithRtl}>
        <div className="login" id="login">
          <StyledCard>
            <form
              name={this.state.type}
              onSubmit={this.onFormSubmit.bind(this)}
              className="login__form"
            >
              <img
                style={styles.logo}
                alt={mapGlobalMessage(this.props.intl, 'appNameHuman')}
                width="120"
                className="login__icon"
                src={stringHelper('LOGO_URL')}
              />
              <StyledSubHeader className="login__heading">
                {this.state.type === 'login'
                  ? <FormattedMessage
                    id="login.title"
                    defaultMessage="Sign in"
                  />
                  : <FormattedMessage
                    id="login.registerTitle"
                    defaultMessage="Register"
                  />}
              </StyledSubHeader>
              <Message message={this.state.message} />
              {this.state.type === 'login'
                ? null
                : <div className="login__name">
                  <TextField
                    fullWidth
                    name="name"
                    value={this.state.name}
                    className="login__name-input"
                    onChange={this.handleFieldChange.bind(this)}
                    floatingLabelText={
                      <FormattedMessage
                        id="login.nameLabel"
                        defaultMessage="Your name"
                      />
                    }
                  />
                </div>}

              <div className="login__email">
                <TextField
                  fullWidth
                  type="email"
                  name="email"
                  value={this.state.email}
                  className="login__email-input"
                  id="login__email-input"
                  onChange={this.handleFieldChange.bind(this)}
                  floatingLabelText={
                    <FormattedMessage
                      id="login.emailLabel"
                      defaultMessage="Email address"
                    />
                  }
                />
              </div>

              <div className="login__password">
                <TextField
                  fullWidth
                  type="password"
                  name="password"
                  value={this.state.password}
                  className="login__password-input"
                  id="login__password-input"
                  onChange={this.handleFieldChange.bind(this)}
                  floatingLabelText={
                    this.state.type === 'login'
                      ? this.props.intl.formatMessage(messages.passwordInputHint)
                      : <FormattedMessage
                        id="login.passwordLabel"
                        defaultMessage="Password (minimum 8 characters)"
                      />
                  }
                />
              </div>

              {this.state.type === 'login'
                ? null
                : <div className="login__password-confirmation">
                  <TextField
                    fullWidth
                    type="password"
                    name="password_confirmation"
                    value={this.state.password_confirmation}
                    className="login__password-confirmation-input"
                    id="login__password-confirmation-input"
                    onChange={this.handleFieldChange.bind(this)}
                    floatingLabelText={
                      <FormattedMessage
                        id="login.passwordConfirmLabel"
                        defaultMessage="Password confirmation"
                      />
                    }
                  />
                </div>}

              {this.state.type === 'login'
                ? null
                : <UploadImage onImage={this.onImage.bind(this)} />}

              <div className="login__actions" style={styles.buttonGroup}>
                <RaisedButton
                  primary
                  style={styles.primaryButton}
                  type="submit"
                  id="submit-register-or-login"
                  className={`login__submit login__submit--${this.state.type}`}
                  label={
                    this.state.type === 'login'
                      ? <FormattedMessage
                        id="login.signIn"
                        defaultMessage="SIGN IN"
                      />
                      : <FormattedMessage
                        id="login.signUp"
                        defaultMessage="REGISTER"
                      />
                  }
                />
                {this.state.type === 'login'
                  ? <span className="login__forgot-password">
                    <Link to="/check/user/password-reset">
                      <FlatButton
                        style={styles.secondaryButton}
                        label={
                          <FormattedMessage
                            id="loginEmail.lostPassword"
                            defaultMessage="Forgot password"
                          />
                        }
                      />
                    </Link>
                  </span>
                  : null}
              </div>
            </form>
          </StyledCard>

          <BigButtons>
            <BigButton
              onClick={this.oAuthLogin.bind(this, 'slack')}
              id="slack-login"
              icon={<FASlack style={{ color: slackGreen }} className="logo" />}
              headerText={<FormattedMessage
                id="login.with"
                defaultMessage={'Continue with {provider}'}
                values={{ provider: 'Slack' }}
              />}
              subheaderText
            />

            <BigButton
              onClick={this.oAuthLogin.bind(this, 'twitter')}
              id="twitter-login"
              icon={<FATwitter style={{ color: twitterBlue }} className="logo" />}
              headerText={<FormattedMessage
                id="login.with"
                defaultMessage={'Continue with {provider}'}
                values={{ provider: 'Twitter' }}
              />}
              subheaderText
            />

            <BigButton
              onClick={this.oAuthLogin.bind(this, 'facebook')}
              id="facebook-login"
              icon={<FAFacebook style={{ color: facebookBlue }} className="logo" />}
              headerText={
                <FormattedMessage
                  id="login.with"
                  defaultMessage={'Continue with {provider}'}
                  values={{ provider: 'Facebook' }}
                />
              }
              subheaderText
            />

            {this.state.type === 'login'
              ? <BigButton
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

              : <BigButton
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
      </MuiThemeProvider>
    );
  }
}

Login.propTypes = {
  // https://github.com/yannickcr/eslint-plugin-react/issues/1389
  // eslint-disable-next-line react/no-typos
  intl: intlShape.isRequired,
};

Login.contextTypes = {
  store: PropTypes.object,
};

export default injectIntl(Login);
