import Relay from 'react-relay';
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
      history,
      team: () => {
        const { team } = this.getContextStore();
        if (team) {
          return team.slug;
        }
        return '';
      },
      get headers() {
        const { headers } = config;
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

      if (userData) {
        newState.token = userData.token;
        this.startNetwork(userData.token);
      } else {
        newState.error = true;
      }

      this.setContextStore({ currentUser: userData });

      this.maybeRedirect(this.caller.props.location.pathname, userData);
      this.setContext();

      this.caller.setState(newState);
    };

    request('get', 'me', failureCallback, successCallback);
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
    this.getContextStore().history.push(path);
  }

  // When accessing Check root, redirect to a friendlier location if needed:
  // - if no team, go to `/check/teams/new`
  // - if team but no current project, go to team root
  // - if team and current project, go to project page
  maybeRedirect(location, userData) {
    if (location !== '/' || this.getTeamSlug() || !userData) return;

    const userCurrentTeam = userData.current_team;
    if (!userCurrentTeam) {
      this.getContextStore().history.push('/check/teams/new');
      return;
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
