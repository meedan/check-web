import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import Favicon from 'react-favicon';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { MuiThemeProvider as MuiThemeProviderNext, createMuiTheme } from '@material-ui/core/styles';
import rtlDetect from 'rtl-detect';
import merge from 'lodash.merge';
import styled, { injectGlobal } from 'styled-components';
import config from 'config'; // eslint-disable-line require-path-exists/exists
import Header from './Header';
import LoginContainer from './LoginContainer';
import BrowserSupport from './BrowserSupport';
import CheckContext from '../CheckContext';
import DrawerNavigation from './DrawerNavigation';
import { bemClass } from '../helpers';
import Message from './Message';
import {
  muiThemeWithoutRtl,
  muiThemeV1,
  gutterMedium,
} from '../styles/js/shared';
import { layout, typography, localeAr, removeYellowAutocomplete } from '../styles/js/global';
import { stringHelper } from '../customHelpers';
import { mapGlobalMessage } from './MappedMessage';

// Global styles
injectGlobal([`
  ${layout}
  ${typography}
  ${localeAr}
  ${removeYellowAutocomplete}
`]);

const StyledWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  position: relative;
`;

const StyledContent = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  padding-top: ${gutterMedium};
  padding-bottom: ${props => (props.inMediaPage ? '0' : gutterMedium)};
  width: 100%;
`;

const messages = defineMessages({
  needRegister: {
    id: 'home.needRegister',
    defaultMessage:
      'First you need to register. Once registered, you can request to join the team.',
  },
  somethingWrong: {
    id: 'home.somethingWrong',
    defaultMessage: 'Sorry, an error occurred. Please refresh your browser and contact {supportEmail} if the condition persists.',
  },
  successInvitation: {
    id: 'home.successInvitation',
    defaultMessage: 'Welcome to {appName}. Please login with the password that you received in the welcome email.',
  },
  invalidInvitation: {
    id: 'home.invalidInvitation',
    defaultMessage: 'Sorry, an error occurred while processing your invitation. Please contact {supportEmail}.',
  },
  invalidTeamInvitation: {
    id: 'home.invalidTeamInvitation',
    defaultMessage: 'Sorry, the team to which you were invited was not found. Please contact {supportEmail} if you think this is an error.',
  },
  invalidNoInvitation: {
    id: 'home.invalidNoInvitation',
    defaultMessage: 'Sorry, the invitation you received was not found. Please contact {supportEmail} if you think this is an error.',
  },
  invalidTokenInvitation: {
    id: 'home.invalidTokenInvitation',
    defaultMessage: 'Sorry, the invitation you received is invalid. Please contact {supportEmail} if you think this is an error.',
  },
});

class Home extends Component {
  static routeSlug(children) {
    if (!(children && children.props.route)) {
      return null;
    }
    // TODO Other pages as needed
    if (/\/media\/:mediaId/.test(children.props.route.path)) {
      return 'media';
    }
    if (/\/source\/:sourceId/.test(children.props.route.path)) {
      return 'source';
    }
    if (/^:team$/.test(children.props.route.path)) {
      return 'team';
    }
    return null;
  }

  constructor(props) {
    super(props);

    this.state = {
      message: null,
      token: null,
      error: false,
      sessionStarted: false,
      open: false,
    };
  }

  getChildContext() {
    return {
      setMessage: (message) => {
        this.setState({ message });
      },
    };
  }

  componentWillMount() {
    this.setContext();
  }

  componentWillUpdate() {
    this.setContext();
  }

  setContext() {
    const context = new CheckContext(this);
    if (!this.state.token && !this.state.error) {
      context.startSession();
    }
    context.maybeRedirect(this.props.location.pathname, context.getContextStore().userData);
    context.setContext();
    context.startNetwork(this.state.token);
  }

  getContext() {
    return new CheckContext(this).getContextStore();
  }

  handleDrawerToggle = () => this.setState({ open: !this.state.open });

  loginCallback() {
    this.setState({ error: false });
    window.location.assign(window.location.origin);
  }

  resetMessage() {
    this.setState({ message: null });
  }

  render() {
    const { children } = this.props;
    const routeSlug = Home.routeSlug(children);
    const muiThemeWithRtl = getMuiTheme(merge(
      muiThemeWithoutRtl,
      { isRtl: rtlDetect.isRtlLang(this.props.intl.locale) },
    ));
    const muiThemeNext = createMuiTheme(muiThemeV1);

    if (!this.state.sessionStarted) {
      return null;
    }

    let message = null;
    if (this.state.error) {
      ({ message } = this.state);

      // TODO Don't parse error messages because they may be l10n'd - use error codes instead.
      if (!message && /^[^/]+\/join$/.test(children.props.route.path)) {
        message = this.props.intl.formatMessage(messages.needRegister);
      }

      // TODO Don't parse error messages because they may be l10n'd - use error codes instead.
      if (this.state.error && message && message.match(/\{ \[Error: Request has been terminated/)) {
        message = this.props.intl.formatMessage(messages.somethingWrong, { supportEmail: stringHelper('SUPPORT_EMAIL') });
      }
    }

    if ('invitation_response' in this.props.location.query) {
      if (this.props.location.query.invitation_response === 'success') {
        if (this.props.location.query.msg === 'yes') {
          message = this.props.intl.formatMessage(
            messages.successInvitation,
            { appName: mapGlobalMessage(this.props.intl, 'appNameHuman') },
          );
        }
      } else {
        const invitationErrors = {
          invalid_team: messages.invalidTeamInvitation,
          no_invitation: messages.invalidNoInvitation,
          invalid_invitation: messages.invalidTokenInvitation,
        };
        message = this.props.intl.formatMessage(
          Object.keys(invitationErrors).includes(this.props.location.query.invitation_response) ?
            invitationErrors[this.props.location.query.invitation_response] :
            messages.invalidInvitation,
          { supportEmail: stringHelper('SUPPORT_EMAIL') },
        );
      }
    }

    const routeIsPublic = children && children.props.route.public;
    if (!routeIsPublic && !this.state.token) {
      if (this.state.error) {
        return <LoginContainer loginCallback={this.loginCallback.bind(this)} message={message} />;
      }
      return null;
    }

    // @chris with @alex 2017-10-3
    //
    // TODO Fix currentUserIsMember function.
    // context.currentUser.teams keys are actually the team names, not slugs

    const inTeamContext = !!this.props.params.team;
    const loggedIn = !!this.state.token;

    const currentUserIsMember = (() => {
      if (inTeamContext && loggedIn) {
        const user = this.getContext().currentUser;
        if (user.is_admin) {
          return true;
        }
        const teams = JSON.parse(user.teams);
        const team = teams[this.props.params.team] || {};
        return team.status === 'member';
      }
      return false;
    })();

    return (
      <MuiThemeProviderNext theme={muiThemeNext}>
        <MuiThemeProvider muiTheme={muiThemeWithRtl}>
          <span>
            <Favicon url={`/images/logo/${config.appName}.ico`} animated={false} />
            <BrowserSupport />
            <StyledWrapper className={bemClass('home', routeSlug, `--${routeSlug}`)}>
              <Header
                drawerToggle={this.handleDrawerToggle.bind(this)}
                loggedIn={loggedIn}
                inTeamContext={inTeamContext}
                pageType={routeSlug}
                currentUserIsMember={currentUserIsMember}
                {...this.props}
              />
              <Message
                message={this.state.message}
                onClick={this.resetMessage.bind(this)}
                className="home__message"
                style={{
                  position: 'fixed',
                  width: '100%',
                  zIndex: '1000',
                }}
              />
              <StyledContent inMediaPage={routeSlug === 'media'}>
                {children}
              </StyledContent>
            </StyledWrapper>
            { this.state.open ? <DrawerNavigation
              docked={false}
              open={this.state.open}
              drawerToggle={this.handleDrawerToggle.bind(this)}
              onRequestChange={open => this.setState({ open })}
              loggedIn={loggedIn}
              inTeamContext={inTeamContext}
              currentUserIsMember={currentUserIsMember}
              {...this.props}
            /> : null }
          </span>
        </MuiThemeProvider>
      </MuiThemeProviderNext>
    );
  }
}

Home.propTypes = {
  // https://github.com/yannickcr/eslint-plugin-react/issues/1389
  // eslint-disable-next-line react/no-typos
  intl: intlShape.isRequired,
};

Home.contextTypes = {
  store: PropTypes.object,
};

Home.childContextTypes = {
  setMessage: PropTypes.func,
};

export default injectIntl(Home);
