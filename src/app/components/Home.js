import React, { Component } from 'react';
import Relay from 'react-relay/classic';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import Favicon from 'react-favicon';
import {
  MuiThemeProvider as MuiThemeProviderNext,
  createMuiTheme,
} from '@material-ui/core/styles';
import rtlDetect from 'rtl-detect';
import isEqual from 'lodash.isequal';
import styled, { createGlobalStyle } from 'styled-components';
import Intercom from 'react-intercom';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import MomentUtils from '@date-io/moment';
import config from 'config'; // eslint-disable-line require-path-exists/exists
import Header from './Header';
import LoginContainer from './LoginContainer';
import BrowserSupport from './BrowserSupport';
import CheckContext from '../CheckContext';
import DrawerNavigation from './DrawerNavigation';
import { bemClass } from '../helpers';
import { FlashMessageContext, FlashMessage } from './FlashMessage';
import { withClientSessionId } from '../ClientSessionId';
import {
  muiThemeV1,
  gutterMedium,
  units,
} from '../styles/js/shared';
import { layout, typography, localeAr, removeYellowAutocomplete } from '../styles/js/global';
import { stringHelper } from '../customHelpers';
import { mapGlobalMessage } from './MappedMessage';
import MeRoute from '../relay/MeRoute';

// Global styles
const GlobalStyle = createGlobalStyle([`
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
  margin-${props => (props.isRtl ? 'right' : 'left')}: ${units(32)};
`;

const StyledContent = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  padding-top: ${gutterMedium};
  padding-bottom: ${props => (props.inMediaPage ? '0' : 'gutterMedium')};
  width: 100%;
  background-color: white;
`;

const messages = defineMessages({
  needRegister: {
    id: 'home.needRegister',
    defaultMessage:
      'First you need to register. Once registered, you can request to join the workspace.',
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
    defaultMessage: 'Sorry, the workspace to which you were invited was not found. Please contact {supportEmail} if you think this is an error.',
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

function buildLoginContainerMessage(flashMessage, error, childRoute, queryString, intl) {
  let message = null;
  if (error) {
    message = flashMessage;

    // TODO Don't parse error messages because they may be l10n'd - use error codes instead.
    if (!message && /^[^/]+\/join$/.test(childRoute.path)) {
      message = intl.formatMessage(messages.needRegister);
    }

    // TODO Don't parse error messages because they may be l10n'd - use error codes instead.
    if (error && message && message.match(/\{ \[Error: Request has been terminated/)) {
      message = intl.formatMessage(messages.somethingWrong, { supportEmail: stringHelper('SUPPORT_EMAIL') });
    }
  }

  if ('invitation_response' in queryString) {
    if (queryString.invitation_response === 'success') {
      if (queryString.msg === 'yes') {
        message = intl.formatMessage(
          messages.successInvitation,
          { appName: mapGlobalMessage(intl, 'appNameHuman') },
        );
      }
    } else {
      const invitationErrors = {
        invalid_team: messages.invalidTeamInvitation,
        no_invitation: messages.invalidNoInvitation,
        invitation_expired: messages.invalidExpiredInvitation,
      };
      message = intl.formatMessage(
        Object.keys(invitationErrors).includes(queryString.invitation_response) ?
          invitationErrors[queryString.invitation_response] :
          messages.invalidInvitation,
        { supportEmail: stringHelper('SUPPORT_EMAIL') },
      );
    }
  }
  return message;
}

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
      token: null,
      error: false,
      sessionStarted: false,
      open: false,
      path: window.location.pathname,
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
      context.startSession(this.props.user, this.props.clientSessionId);
    }
    context.setContext();
    context.startNetwork(this.state.token, this.props.clientSessionId);
  }

  getContext() {
    return new CheckContext(this).getContextStore();
  }

  handleDrawerToggle = () => this.setState({ open: !this.state.open });

  loginCallback() {
    if (this.state.path !== '/check/user/password-change' &&
      this.state.path !== '/check/user/confirmed') {
      window.location.assign(this.state.path);
    } else {
      window.location.assign('/');
    }
    this.setState({ error: false, path: null });
  }

  render() {
    if (!this.state.sessionStarted) {
      return null;
    }

    const isRtl = rtlDetect.isRtlLang(this.props.intl.locale);

    const { children, location, intl } = this.props;
    const routeSlug = HomeComponent.routeSlug(children);

    const muiThemeNext = createMuiTheme(muiThemeV1);

    const routeIsPublic = children && children.props.route.public;
    if (!routeIsPublic && !this.state.token) {
      if (this.state.error) {
        return (
          <FlashMessageContext.Consumer>
            {flashMessage => (
              <LoginContainer
                loginCallback={this.loginCallback.bind(this)}
                message={buildLoginContainerMessage(
                  flashMessage,
                  this.state.error,
                  children.props.route,
                  location.query,
                  intl,
                )}
              />
            )}
          </FlashMessageContext.Consumer>
        );
      }
      return null;
    }

    const user = this.getContext().currentUser || {};
    const loggedIn = !!this.state.token;
    const teamSlugFromUrl = window.location.pathname.match(/^\/([^/]+)/);
    const teamSlug = (teamSlugFromUrl && teamSlugFromUrl[1] !== 'check' ? teamSlugFromUrl[1] : null);
    const userTeamSlug = ((user.current_team && user.current_team.slug) ?
      user.current_team.slug : null);
    const inTeamContext = !!(teamSlug || userTeamSlug);

    const currentUserIsMember = (() => {
      if (inTeamContext && loggedIn) {
        if (user.is_admin) {
          return true;
        }
        const teams = JSON.parse(user.teams);
        const team = teams[teamSlug] || {};
        return team.status === 'member';
      }
      return false;
    })();

    const showDrawer = !/\/media\/[0-9]+/.test(window.location.pathname);

    return (
      <React.Fragment>
        <GlobalStyle />
        <MuiPickersUtilsProvider utils={MomentUtils}>
          <MuiThemeProviderNext theme={muiThemeNext}>
            <React.Fragment>
              {config.intercomAppId && user.dbid ?
                <Intercom
                  appID={config.intercomAppId}
                  user_id={user.dbid}
                  email={user.email}
                  name={user.name}
                  alignment={isRtl ? 'left' : 'right'}
                /> : null
              }
              <Favicon url={`/images/logo/${config.appName}.ico`} animated={false} />
              <BrowserSupport />
              { showDrawer ?
                <DrawerNavigation
                  variant="persistent"
                  docked
                  loggedIn={loggedIn}
                  teamSlug={teamSlug || userTeamSlug}
                  inTeamContext={inTeamContext}
                  currentUserIsMember={currentUserIsMember}
                  {...this.props}
                /> : null }
              <StyledWrapper
                isRtl={isRtl}
                className={bemClass('home', routeSlug, `--${routeSlug}`)}
                style={showDrawer ? {} : { margin: 0 }}
              >
                <Header
                  drawerToggle={this.handleDrawerToggle.bind(this)}
                  loggedIn={loggedIn}
                  pageType={routeSlug}
                  inTeamContext={inTeamContext}
                  currentUserIsMember={currentUserIsMember}
                  {...this.props}
                />
                <FlashMessage />
                <StyledContent
                  inMediaPage={routeSlug === 'media'}
                  className="content-wrapper"
                >
                  {children}
                </StyledContent>
              </StyledWrapper>
            </React.Fragment>
          </MuiThemeProviderNext>
        </MuiPickersUtilsProvider>
      </React.Fragment>
    );
  }
}

HomeComponent.propTypes = {
  // https://github.com/yannickcr/eslint-plugin-react/issues/1389
  // eslint-disable-next-line react/no-typos
  clientSessionId: PropTypes.string.isRequired,
  intl: intlShape.isRequired,
};

HomeComponent.contextTypes = {
  store: PropTypes.object,
};

const HomeContainer = Relay.createContainer(injectIntl(withClientSessionId(HomeComponent)), {
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
    context.startNetwork(null, this.props.clientSessionId);
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

Home.propTypes = {
  clientSessionId: PropTypes.string.isRequired,
};

Home.contextTypes = {
  store: PropTypes.object,
};

export default withClientSessionId(Home);
