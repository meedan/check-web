import Relay from 'react-relay/classic';
import config from 'config'; // eslint-disable-line require-path-exists/exists
import { SET_CONTEXT } from './redux/ActionTypes';
import { request } from './redux/actions';
import CheckNetworkLayer from './CheckNetworkLayer';

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

  startNetwork(token) {
    const context = this.getContextStore();
    const { history } = context;
    const clientSessionId = context.clientSessionId || (`browser-${Date.now()}${parseInt(Math.random() * 1000000, 10)}`);
    this.setContextStore({ clientSessionId });
    Relay.injectNetworkLayer(new CheckNetworkLayer(config.relayPath, {
      caller: this.caller,
      history,
      team: () => {
        const { team } = this.getContextStore();
        if (team) {
          return team.slug;
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

  startSession() {
    // Failed login
    const failureCallback = (errorMessage) => {
      this.caller.setState({ message: errorMessage, error: true, sessionStarted: true });
    };

    // Successful login
    const successCallback = (userData) => {
      const newState = { sessionStarted: true };

      if (config.extensionUrls && userData && userData.token) {
        if (window.opener) {
          config.extensionUrls.forEach((uri) => {
            window.opener.postMessage(`loggedIn:${userData.token}`, uri);
          });
        }
        newState.token = userData.token;
        this.startNetwork(userData.token);
      } else {
        newState.error = true;
      }

      this.setContextStore({ currentUser: userData });

      if (userData && !userData.accepted_terms) {
        this.getContextStore().history.push('/check/user/terms-of-service');
      } else {
        this.maybeRedirect(this.caller.props.location.pathname, userData);
        this.setContext();
      }

      this.caller.setState(newState);
    };

    let headers = {};
    if (window.parent !== window) {
      const token = window.location.search.replace(/^\?token=/, '');
      if (token) {
        headers = { 'X-Check-Token': token };
      }
    }

    request('get', 'me', failureCallback, successCallback, null, headers);
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
      path += `/${team.slug}`;
    }
    if (project) {
      newContext.project = project;
      path += `/project/${project.dbid}`;
    }
    this.setContextStore(newContext);

    this.redirectToPreviousPageOr(path);
  }

  // When accessing Check root, redirect to a friendlier location if needed:
  // - if user was on a previous page before logging in, go to that previous page
  // - if no team, go to `/check/teams/find`
  // - if team but no current project, go to team root
  // - if team and current project, go to project page
  maybeRedirect(location, userData) {
    if (location !== '/' || this.getTeamSlug() || !userData) return;

    const userCurrentTeam = userData.current_team;
    if (!userCurrentTeam) {
      this.redirectToPreviousPageOr('/check/teams/find');
      return;
    }
    const project = userData.current_project || userCurrentTeam.projects[0];
    if (project && project.dbid) {
      this.setContextAndRedirect(project.team, project);
    } else {
      this.setContextAndRedirect(userCurrentTeam, null);
    }
  }

  redirectToPreviousPageOr(path) {
    const previousPage = window.storage.getValue('previousPage');
    if (previousPage && previousPage !== '') {
      window.storage.set('previousPage', '');
      this.getContextStore().history.push(previousPage);
    } else {
      this.getContextStore().history.push(path);
    }
  }
}

export default CheckContext;
