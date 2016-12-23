import Relay from 'react-relay';
import { SET_CONTEXT } from './constants/ActionTypes';
import { request } from './actions/actions';
import CheckdeskNetworkLayer from './CheckdeskNetworkLayer';
import config from 'config';

// Verify if user is logged in, if so, start a session and set the context based on session information

class CheckContext {
  constructor(caller) {
    this.caller = caller;
  }

  getContextStore(store) {
    if (!store) {
      store = this.caller.context.store;
    }
    return store.getState().app.context || {};
  }

  setContextStore(data, store) {
    if (!store) {
      store = this.caller.context.store;
    }
    const newContext = Object.assign({}, this.getContextStore(store));
    newContext.type = SET_CONTEXT;
    for (const key in data) {
      const value = data[key];
      if (value === null) {
        delete newContext[key];
      } else {
        newContext[key] = value;
      }
    }
    store.dispatch(newContext);
  }

  startNetwork(token) {
    const history = this.getContextStore().history;
    Relay.injectNetworkLayer(new CheckdeskNetworkLayer(config.relayPath, {
      history: history,
      get headers() {
        const headers = config.relayHeaders;
        if (token) {
          headers['X-Check-Token'] = token;
        }
        return headers;
      },
    }));
  }

  startSession() {
    const caller = this.caller;
    const state = caller.state;
    const that = this;

    // Failed login
    const failureCallback = function (errorMessage) {
      caller.setState({ message: errorMessage, error: true });
    };

    // Successful login
    const successCallback = function (userData) {
      const newState = {};

      if (userData) {
        newState.token = userData.token;
        that.startNetwork(userData.token);
      } else {
        newState.error = true;
      }

      that.setContextStore({ currentUser: userData });

      that.maybeRedirect(caller.props.location.pathname, userData);
      that.setContext();

      caller.setState(newState);
    };

    request('get', 'me', failureCallback, successCallback);
  }

  getSubdomain() {
    const host = window.location.host;
    const regexp = new RegExp(`^([a-zA-Z0-9\\-]+)\\.${config.selfHost}`);
    let subdomain = null;
    if (regexp.test(host)) {
      subdomain = host.match(regexp)[1];
    }
    return subdomain;
  }

  // Get context team and project from URL
  setContext() {
    if (this.caller.props.params) {
      const subdomain = this.getSubdomain();
      const newContext = {};
      const currentContext = this.getContextStore();
      if (subdomain != null && !currentContext.team) {
        newContext.team = { subdomain: subdomain };
      }
      if (this.caller.props.params.projectId && !currentContext.project) {
        newContext.project = { dbid: parseInt(this.caller.props.params.projectId) };
      }
      this.setContextStore(newContext);
    }
  }

  // Set context team and project from information from the backend
  setContextAndRedirect(team, project) {
    let path = `${window.location.protocol}//`;
    const newContext = {};
    if (team) {
      newContext.team = team;
      path += `${team.subdomain}.`;
    }
    path += config.selfHost;
    if (project) {
      newContext.project = project;
      path += `/project/${project.dbid}`;
    }
    this.setContextStore(newContext);
    window.location.href = path;
  }

  // When accessing Check root, redirect to a friendlier location if needed:
  // - if no team, go to `/teams/new`
  // - if team but no current project, go to team root
  // - if team and current project, go to project page
  maybeRedirect(location, userData) {
    if (location !== '/' || this.getSubdomain() || !userData) return;

    const userCurrentTeam = userData.current_team;
    if (!userCurrentTeam) {
      return this.getContextStore().history.push('/teams/new');
    }
    const project = userCurrentTeam.projects[0];
    if (project && project.dbid) {
      this.setContextAndRedirect(userCurrentTeam, project);
    } else {
      this.setContextAndRedirect(userCurrentTeam, null);
    }
  }
}

export default CheckContext;
