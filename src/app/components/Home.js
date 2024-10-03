import React, { Component } from 'react';
import Relay from 'react-relay/classic';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl } from 'react-intl';
import { withRouter } from 'react-router';
import Favicon from 'react-favicon';
import isEqual from 'lodash.isequal';
import Intercom from 'react-intercom';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import MomentUtils from '@date-io/moment';
import * as Sentry from '@sentry/react';
import config from 'config'; // eslint-disable-line require-path-exists/exists
import LoginContainer from './login/LoginContainer';
import InviteNewAccount from './login/InviteNewAccount';
import BrowserSupport from './BrowserSupport';
import DrawerNavigation from './drawer/DrawerNavigation';
import { FlashMessageContext, FlashMessage, withSetFlashMessage } from './FlashMessage';
import UserTos from './UserTos';
import CheckContext from '../CheckContext';
import { withClientSessionId } from '../ClientSessionId';
import { stringHelper } from '../customHelpers';
import { bemClass } from '../helpers';
import MeRoute from '../relay/MeRoute';
import styles from './Home.module.css';

function buildLoginContainerMessage(flashMessage, error, childRoute, queryString) {
  let message = null;
  if (error) {
    message = flashMessage;

    // TODO Don't parse error messages because they may be l10n'd - use error codes instead.
    if (
      error &&
      message &&
      message.match && // Test `message` is a String, not a <FormattedMessage>
      message.match(/\{ \[Error: Request has been terminated/)
    ) {
      message = (
        <FormattedMessage
          defaultMessage="Sorry, an error occurred. Please refresh your browser and contact {supportEmail} if the condition persists."
          description="Generic error displayed when some error happens."
          id="home.somethingWrong"
          values={{ supportEmail: stringHelper('SUPPORT_EMAIL') }}
        />
      );
    }
  }

  if ('invitation_response' in queryString) {
    if (queryString.invitation_response === 'success') {
      if (queryString.msg === 'yes') {
        message = (
          <FormattedMessage
            defaultMessage="Welcome to Check. Please login with the password that you received in the welcome email."
            description="Message that appears after accepting an invitation to join the app."
            id="home.successInvitation"
          />
        );
      }
    } else {
      const values = { supportEmail: stringHelper('SUPPORT_EMAIL') };
      switch (queryString.invitation_response) {
      case 'invalidTeamInvitation': return (
        <FormattedMessage
          defaultMessage="Sorry, the workspace to which you were invited was not found. Please contact {supportEmail} if you think this is an error."
          description="Error message displayed when an invitation to join the app doesn't work."
          id="home.invalidTeamInvitation"
          values={values}
        />
      );
      case 'invalidNoInvitation': return (
        <FormattedMessage
          defaultMessage="Sorry, the invitation you received was not found. Please contact {supportEmail} if you think this is an error."
          description="Error message displayed when an invitation to join the app doesn't work."
          id="home.invalidNoInvitation"
          values={values}
        />
      );
      case 'invalidExpiredInvitation': return (
        <FormattedMessage
          defaultMessage="Sorry, the invitation you received was expired. Please contact {supportEmail} if you think this is an error."
          description="Error message displayed when an invitation to join the app doesn't work."
          id="home.invalidExpiredInvitation"
          values={values}
        />
      );
      default: return (
        <FormattedMessage
          defaultMessage="Sorry, an error occurred while processing your invitation. Please contact {supportEmail}."
          description="Error message displayed when an invitation to join the app doesn't work."
          id="home.invalidInvitation"
          values={values}
        />
      );
      }
    }
  }
  return message;
}

class HomeComponent extends Component {
  static routeSlug(children) {
    if (!(children && children.props.route)) {
      return null;
    }
    if (/\/feed\/:feedId\/cluster\/:clusterId/.test(children.props.route.path)) {
      return 'feed-item';
    }
    if (/\/feed\/[0-9]+\/feed/.test(window.location.pathname)) {
      return 'feed';
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
      path: window.location.pathname,
    };
  }

  UNSAFE_componentWillMount() {
    this.setContext();
  }

  componentDidMount() {
    const currentRoute = this.props.router.routes[this.props.router.routes.length - 1];
    this.props.router.setRouteLeaveHook(
      currentRoute,
      () => {
        if (window.inFlightMutationRequests > 0) {
          return this.props.intl.formatMessage({
            id: 'home.navAwayDuringRequest',
            defaultMessage: 'You have pending requests to the server. Do you wish to continue to a new page? Your work will not be saved.',
            description: 'This is a prompt that appears when a user tries to exit a page before saving their work.',
          });
        }
        return true;
      },
    );

    // Init sentry if a user is logged in
    if (this.props.me && config.sentryDsn) {
      const { dbid, email, name } = this.props.me;
      Sentry.init({
        dsn: config.sentryDsn,
        environment: config.sentryEnvironment || 'none',
        integrations: [
          new Sentry.Replay(),
        ],
        // Session Replay - Sentry recommends sending a full replay when errors occur
        replaysOnErrorSampleRate: 1.0,
        initialScope: {
          tags: {
            language: navigator.language,
          },
          user: {
            userAgent: window.navigator.userAgent,
            windowSize: {
              height: window.screen.availHeight,
              width: window.screen.availWidth,
            },
            name,
            email,
            id: dbid,
          },
        },
      });
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return !isEqual(this.state, nextState) ||
    !isEqual(this.props, nextProps);
  }

  componentWillUpdate() {
    this.setContext();
  }

  setContext() {
    const { clientSessionId, setFlashMessage } = this.props;
    const context = new CheckContext(this);
    if (!this.state.token && !this.state.error) {
      context.startSession(this.props.me, clientSessionId, setFlashMessage);
    }
    context.setContext();
    context.startNetwork(this.state.token, clientSessionId, setFlashMessage);
  }

  getContext() {
    return new CheckContext(this).getContextStore();
  }

  loginCallback() {
    if (
      this.state.path === '/check/user/password-change' ||
      /^\/check\/user\/confirm/.test(this.state.path)
    ) {
      window.location.assign('/');
    } else {
      window.location.assign(this.state.path);
    }
    this.setState({ error: false, path: null });
  }

  render() {
    if (!this.state.sessionStarted) {
      return null;
    }

    const { children, location } = this.props;
    const routeSlug = HomeComponent.routeSlug(children);

    const routeIsPublic = children && children.props.route.public;
    const routeIsSplash = children && children.props.route.splash;

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
                )}
              />
            )}
          </FlashMessageContext.Consumer>
        );
      }
      return null;
    }

    const user = this.props.me || {};
    const loggedIn = !!this.state.token;
    const teamSlugFromUrl = window.location.pathname.match(/^\/([^/]+)/);
    const userTeamSlug = ((user.current_team && user.current_team.slug) ?
      user.current_team.slug : null);
    const teamSlug = (teamSlugFromUrl && teamSlugFromUrl[1] !== 'check' ? teamSlugFromUrl[1] : null) || userTeamSlug;
    const inTeamContext = Boolean(teamSlug);

    const currentUserIsMember = (() => {
      if (inTeamContext && loggedIn) {
        if (user.is_admin) {
          return true;
        }
        const teams = JSON.parse(user.user_teams);
        const team = teams[teamSlug] || {};
        return team.status === 'member';
      }
      return false;
    })();

    if (loggedIn && !user.completed_signup) {
      return (
        <InviteNewAccount teamSlug={teamSlug} />
      );
    }

    let userTiplines = '';
    if (user && user.current_team && user.current_team.team_bot_installation && user.current_team.team_bot_installation.smooch_enabled_integrations) {
      userTiplines = Object.keys(user.current_team.team_bot_installation.smooch_enabled_integrations).join(', ');
    }

    return (
      <React.Fragment>
        <MuiPickersUtilsProvider utils={MomentUtils}>
          {config.intercomAppId && user.dbid && window.parent === window ?
            <Intercom
              appID={config.intercomAppId}
              check_workspace={teamSlug}
              data={(user && user.current_team) ? user.current_team.get_data_report_url : ''}
              email={user.email}
              name={user.name}
              tipline={userTiplines}
              user_id={user.dbid}
            /> : null
          }
          <Favicon animated={false} url={`/images/logo/${config.appName}.ico`} />
          <BrowserSupport />
          <UserTos user={user} />
          <div
            className={[
              styles.wrapper,
              bemClass('home', routeSlug, `--${routeSlug}`),
            ].join(' ')}
          >
            {loggedIn && !routeIsSplash ? (
              <DrawerNavigation
                currentUserIsMember={currentUserIsMember}
                inTeamContext={inTeamContext}
                loggedIn={loggedIn}
                teamSlug={teamSlug}
                {...this.props}
                user={this.props.me}
              />
            ) : null}
            <main className={styles.main}>
              <FlashMessage />
              <div className={`${styles.mainContentWrapper} route__${routeSlug}`}>
                {children}
              </div>
            </main>
          </div>
        </MuiPickersUtilsProvider>
      </React.Fragment>
    );
  }
}

HomeComponent.propTypes = {
  // https://github.com/yannickcr/eslint-plugin-react/issues/1389
  // eslint-disable-next-line react/no-typos
  clientSessionId: PropTypes.string.isRequired,
  setFlashMessage: PropTypes.func.isRequired,
};

HomeComponent.contextTypes = {
  store: PropTypes.object,
};

const ConnectedHomeComponent = withSetFlashMessage(withClientSessionId(withRouter(injectIntl(HomeComponent))));

const HomeContainer = Relay.createContainer(ConnectedHomeComponent, {
  fragments: {
    me: () => Relay.QL`
      fragment on Me {
        id
        dbid
        name
        token
        email
        is_admin
        accepted_terms
        last_accepted_terms_at
        completed_signup
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
          get_data_report_url
          verification_statuses
          team_bot_installation(bot_identifier: "smooch") {
            smooch_enabled_integrations
          }
          projects(first: 1) {
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
  UNSAFE_componentWillMount() {
    const context = new CheckContext(this);
    const { clientSessionId, setFlashMessage } = this.props;
    context.startNetwork(null, clientSessionId, setFlashMessage);
  }

  // eslint-disable-next-line class-methods-use-this
  render() {
    const route = new MeRoute();

    return (
      <Relay.RootContainer
        Component={HomeContainer}
        renderFetched={data => (
          <HomeContainer
            location={this.props.location}
            params={this.props.params}
            {...data}
          >
            {this.props.children}
          </HomeContainer>
        )}
        route={route}
      />
    );
  }
}

Home.propTypes = {
  clientSessionId: PropTypes.string.isRequired,
  setFlashMessage: PropTypes.func.isRequired,
};

Home.contextTypes = {
  store: PropTypes.object,
};

export default withSetFlashMessage(withClientSessionId(Home));
