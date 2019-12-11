import React, { Component } from 'react';
import Relay from 'react-relay/classic';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import Favicon from 'react-favicon';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { MuiThemeProvider as MuiThemeProviderNext, createMuiTheme } from '@material-ui/core/styles';
import rtlDetect from 'rtl-detect';
import merge from 'lodash.merge';
import isEqual from 'lodash.isequal';
import styled, { injectGlobal } from 'styled-components';
import Intercom from 'react-intercom';
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
import MeRoute from '../relay/MeRoute';

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
  invalidExpiredInvitation: {
    id: 'home.invalidExpiredInvitation',
    defaultMessage: 'Sorry, the invitation you received was expired. Please contact {supportEmail} if you think this is an error.',
  },
});

class HomeComponent extends Component {
  static routeSlug(children) {
    if (!(children && children.props.route)) {
      return null;
    }
    if (/\/media\/:mediaId/.test(children.props.route.path)) {
      return 'media';
    }
    if (/\/source\/:sourceId/.test(children.props.route.path)) {
      return 'source';
    }
    if (/^:team$/.test(children.props.route.path)) {
      return 'team';
    }
    if (/^check\/me\(\/:tab\)/.test(children.props.route.path)) {
      return 'me';
    }
    if (/^:team\/project\/:projectId\(\/:query\)/.test(children.props.route.path)) {
      return 'project';
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
      path: window.location.pathname,
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

  shouldComponentUpdate(nextProps, nextState) {
    return !isEqual(this.state, nextState) ||
    !isEqual(this.props, nextProps);
  }

  componentWillUpdate() {
    this.setContext();
  }

  setContext() {
    const context = new CheckContext(this);
    if (!this.state.token && !this.state.error) {
      context.startSession(this.props.user);
    }
    context.setContext();
    context.startNetwork(this.state.token);
  }

  getContext() {
    return new CheckContext(this).getContextStore();
  }

  handleDrawerToggle = () => this.setState({ open: !this.state.open });

  loginCallback() {
    window.location.assign(this.state.path);
    this.setState({ error: false, path: null });
  }

  resetMessage() {
    this.setState({ message: null });
  }

  render() {
    if (!this.state.sessionStarted) {
      return null;
    }

    const { children } = this.props;
    const routeSlug = HomeComponent.routeSlug(children);
    const muiThemeWithRtl = getMuiTheme(merge(
      muiThemeWithoutRtl,
      { isRtl: rtlDetect.isRtlLang(this.props.intl.locale) },
    ));
    const muiThemeNext = createMuiTheme(muiThemeV1);

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
          invitation_expired: messages.invalidExpiredInvitation,
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

    const user = this.getContext().currentUser;

    return (
      <MuiThemeProviderNext theme={muiThemeNext}>
        <MuiThemeProvider muiTheme={muiThemeWithRtl}>
          <span>
            {config.intercomAppId && user ?
              <Intercom
                appID={config.intercomAppId}
                user_id={user.dbid}
                email={user.email}
                name={user.name}
              /> : null
            }
            <Favicon url={`/images/logo/${config.appName}.ico`} animated={false} />
            <BrowserSupport />
            <DrawerNavigation
              variant="persistent"
              docked
              loggedIn={loggedIn}
              inTeamContext={inTeamContext}
              currentUserIsMember={currentUserIsMember}
              {...this.props}
            />
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
                  marginTop: '0',
                  position: 'fixed',
                  width: '100%',
                  zIndex: '1000',
                }}
              />
              <StyledContent inMediaPage={routeSlug === 'media'}>
                {children}
              </StyledContent>
            </StyledWrapper>
          </span>
        </MuiThemeProvider>
      </MuiThemeProviderNext>
    );
  }
}

HomeComponent.propTypes = {
  // https://github.com/yannickcr/eslint-plugin-react/issues/1389
  // eslint-disable-next-line react/no-typos
  intl: intlShape.isRequired,
};

HomeComponent.contextTypes = {
  store: PropTypes.object,
};

HomeComponent.childContextTypes = {
  setMessage: PropTypes.func,
};

const HomeContainer = Relay.createContainer(injectIntl(HomeComponent), {
  fragments: {
    user: () => Relay.QL`
      fragment on User {
        id
        dbid
        name
        token
        email
        is_admin
        accepted_terms
        last_accepted_terms_at
        name
        login
        permissions
        profile_image
        settings
        source_id
        team_ids
        user_teams
        current_project {
          dbid
          id
          title
          team {
            id
            dbid
            avatar
            name
            slug
          }
        }
        current_team {
          id
          dbid
          avatar
          name
          slug
          projects(first: 10000) {
            edges {
              node {
                id
                dbid
                title
                team {
                  id
                  dbid
                  avatar
                  name
                  slug
                }
              }
            }
          }
        }
      }
    `,
  },
});

// eslint-disable-next-line react/no-multi-comp
class Home extends Component {
  componentWillMount() {
    const context = new CheckContext(this);
    context.startNetwork(null);
  }

  // eslint-disable-next-line class-methods-use-this
  render() {
    const route = new MeRoute();

    return (
      <Relay.RootContainer
        Component={HomeContainer}
        route={route}
        renderFetched={data => (
          <HomeContainer
            location={this.props.location}
            params={this.props.params}
            {...data}
          >
            {this.props.children}
          </HomeContainer>
        )}
      />
    );
  }
}

Home.contextTypes = {
  store: PropTypes.object,
};

export default Home;
