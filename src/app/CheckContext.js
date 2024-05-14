import Relay from 'react-relay/classic';
import { browserHistory } from 'react-router';
import config from 'config'; // eslint-disable-line require-path-exists/exists
import { SET_CONTEXT } from './redux/ActionTypes';
import CheckNetworkLayer from './CheckNetworkLayer';

function redirectToPreviousPageOr(path) {
  const previousPage = window.storage.getValue('previousPage');
  window.storage.set('previousPage', '');
  if (previousPage && previousPage !== '') {
    browserHistory.push(previousPage);
  } else {
    browserHistory.push(path);
  }
}

// Verify if user is logged in, if so, start a session
// and set the context based on session information

class CheckContext {
  constructor(caller) {
    this.caller = caller;
  }

  getContextStore(store_) {
    const store = store_ || this.caller.context.store;
    return store.getState().app.context || {};
  }

  setContextStore(data, store_) {
    const store = store_ || this.caller.context.store;
    const newContext = Object.assign({}, this.getContextStore(store));
    newContext.type = SET_CONTEXT;
    Object.getOwnPropertyNames(data).forEach((key) => {
      const value = data[key];
      if (value === null) {
        delete newContext[key];
      } else {
        newContext[key] = value;
      }
    });
    store.dispatch(newContext);
  }

  startNetwork(token, clientSessionId, setFlashMessage) {
    this.setContextStore({});
    Relay.injectNetworkLayer(new CheckNetworkLayer(config.relayPath, {
      setFlashMessage,
      team: () => {
        const team = window.location.pathname.match(/^\/([^/]+)/);
        if (team && team[1] !== 'check') {
          return team[1];
        }
        return '';
      },
      get headers() {
        const { relayHeaders: headers } = config;
        if (token) {
          headers['X-Check-Token'] = token;
        }
        headers['X-Check-Client'] = clientSessionId;
        return headers;
      },
    }));
  }

  startSession(user, clientSessionId, setFlashMessage) {
    const newState = { sessionStarted: true };

    let userData = user;

    if (user) {
      userData = Object.assign({}, user);
      userData.teams = userData.user_teams;
    }

    if (userData && userData.token) {
      if (window.opener && config.extensionUrls) {
        config.extensionUrls.forEach((uri) => {
          if (!/^moz-extension/.test(uri) || navigator.userAgent.indexOf('Firefox') > -1) {
            window.opener.postMessage('loggedIn', uri);
          }
        });
      }
      newState.token = userData.token;
      this.startNetwork(userData.token, clientSessionId, setFlashMessage);
    } else {
      newState.error = true;
    }

    this.setContextStore({ currentUser: userData });
    this.maybeRedirect(this.caller.props.location.pathname, userData);
    this.setContext();

    this.caller.setState(newState);
  }

  getTeamSlug() {
    try {
      return this.caller.props.params.team;
    } catch (e) {
      return null;
    }
  }

  // Get context team and project from URL
  setContext() {
    if (this.caller.props.params) {
      const slug = this.getTeamSlug();
      const newContext = {};
      const currentContext = this.getContextStore();
      if (slug && (!currentContext.team || currentContext.team.slug !== slug)) {
        newContext.team = { slug };
      }
      if (this.caller.props.params.projectId && !currentContext.project) {
        newContext.project = { dbid: parseInt(this.caller.props.params.projectId, 10) };
      }
      this.setContextStore(newContext);
    }
  }

  // Set context team and project from information from the backend
  setContextAndRedirect(team, project) {
    let path = '';
    const newContext = {};
    if (team) {
      newContext.team = team;
      path += `/${team.slug}/all-items`;
    }
    if (project) {
      newContext.project = project;
      path += `/project/${project.dbid}`;
    }
    this.setContextStore(newContext);

    redirectToPreviousPageOr(path);
  }

  // When accessing Check root, redirect to a friendlier location if needed:
  // - if user was on a previous page before logging in, go to that previous page
  // - if no team, go to `/check/me/workspaces`
  // - if team go to team root all items
  maybeRedirect(location, userData) {
    if (location !== '/' || this.getTeamSlug() || !userData) return;

    const userCurrentTeam = userData.current_team;
    if (!userCurrentTeam) {
      redirectToPreviousPageOr('/check/me/workspaces');
      return;
    }
    this.setContextAndRedirect(userCurrentTeam, null);
  }
}

export default CheckContext;
