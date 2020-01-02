import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Provider } from 'react-redux';
import { Router, Route, browserHistory, IndexRoute } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';
import ReactGA from 'react-ga';
import { IntlProvider } from 'react-intl';
import deepEqual from 'deep-equal';
import ifvisible from 'ifvisible.js';
import config from 'config'; // eslint-disable-line require-path-exists/exists
import App from './App';
import RootLocale from './RootLocale';
import NotFound from './NotFound';
import AccessDenied from './AccessDenied';
import UserAlreadyConfirmed from './UserAlreadyConfirmed';
import UserConfirmed from './UserConfirmed';
import UserUnconfirmed from './UserUnconfirmed';
import UserPasswordChange from './UserPasswordChange';
import UserPasswordReset from './UserPasswordReset';
import UserTos from './UserTos';
import Source from './source/Source';
import User from './source/User';
import Me from './source/Me';
import Team from './team/Team';
import AddTeamPage from './team/AddTeamPage';
import JoinTeam from './team/JoinTeam';
import Teams from './team/Teams';
import Trash from './team/Trash';
import Dashboard from './layout/Dashboard';
import ProjectMediaSearch from './media/MediaSearch';
import MediaEmbed from './media/MediaEmbed';
import MediaTasks from './media/MediaTasks';
import Memebuster from './memebuster/Memebuster';
import Project from './project/Project';
import ProjectEdit from './project/ProjectEdit';
import Search from './search/Search';
import BotGarden from './BotGarden';
import Bot from './Bot';
import CheckContext from '../CheckContext';
import { safelyParseJSON } from '../helpers';

class Root extends Component {
  static logPageView() {
    if (config.googleAnalyticsCode) {
      ReactGA.set({ page: window.location.pathname, anonymizeIp: true });
      ReactGA.pageview(window.location.pathname);
    }
  }

  static pusherLog(message) {
    if (config.pusherDebug) {
      // eslint-disable-next-line no-console
      console.log(`[Pusher] ${message}`);
    }
  }

  static processPusherMessage(data, run) {
    const checkPusher = window.CheckPusher;
    const message = safelyParseJSON(data.message, {});
    const eventName = message.pusherEvent;
    const callbacks = {};
    message.pusherChannels.forEach((channel) => {
      if (checkPusher.currentChannels[channel] &&
        checkPusher.currentChannels[channel][eventName]) {
        Object.keys(checkPusher.currentChannels[channel][eventName]).forEach((component) => {
          const { id, callback } =
            checkPusher.currentChannels[channel][eventName][component](data, false);
          if (id && callback) {
            if (run) {
              checkPusher.callbacksToRun[id] = callback;
            } else {
              callbacks[id] = callback;
            }
          }
          Root.pusherLog(`Calling callback for channel ${channel} and event ${eventName} for component ${component}, which is currently mounted and focused`);
        });
      } else if (checkPusher.subscribedChannels[channel]) {
        if (!checkPusher.queue[channel]) {
          checkPusher.queue[channel] = {};
        }
        if (!checkPusher.queue[channel][eventName]) {
          checkPusher.queue[channel][eventName] = [];
        }
        checkPusher.subscribedChannels[channel].forEach((component) => {
          const eventData = Object.assign({ component }, data);
          const eventFinder = x => (deepEqual(x, eventData));
          if (checkPusher.queue[channel][eventName].find(eventFinder)) {
            Root.pusherLog(`Not adding event ${eventName} to the queue of channel ${channel} because it is already there`);
          } else {
            checkPusher.queue[channel][eventName].push(eventData);
            Root.pusherLog(`Adding event ${eventName} to queue of channel ${channel} for component ${component}`);
          }
        });
      } else {
        Root.pusherLog(`Ignoring event ${eventName} for channel ${channel}`);
      }
    });
    return callbacks;
  }

  static setPusher(pusher) {
    if (window.CheckPusher) {
      return false;
    }
    window.CheckPusher = {
      messagesQueue: [],
      queue: {},
      currentChannels: {},
      subscribedChannels: {},
      callbacksToRun: {},
    };
    const checkPusher = window.CheckPusher;

    window.setInterval(() => {
      Root.pusherLog('Running throttle');
      const callbacks = Object.assign({}, checkPusher.callbacksToRun);
      checkPusher.callbacksToRun = {};
      Object.values(callbacks).forEach((callback) => {
        callback();
      });
    }, 10000);

    ifvisible.on('blur', () => {
      Root.pusherLog('Page is not focused anymore');
    });

    ifvisible.on('focus', () => {
      Root.pusherLog('Page is focused now');
      const messages = checkPusher.messagesQueue.slice(0);
      checkPusher.messagesQueue = [];
      const callbacks = {};
      messages.forEach((rawMessage) => {
        Object.assign(callbacks, Root.processPusherMessage(JSON.parse(rawMessage), false));
      });
      Object.values(callbacks).forEach((callback) => {
        callback();
      });
    });

    pusher.unsubscribe('check-api-global-channel');
    pusher.subscribe('check-api-global-channel').bind('update', (data) => {
      const rawMessage = JSON.stringify(data);
      Root.pusherLog(`Received global event: ${rawMessage}`);
      if (!ifvisible.now('hidden')) {
        Root.processPusherMessage(data, true);
      } else {
        Root.pusherLog(`Page is not focused, so message ${rawMessage} will go to the queue`);
        if (checkPusher.messagesQueue.indexOf(rawMessage) === -1) {
          checkPusher.messagesQueue.push(rawMessage);
          Root.pusherLog(`Adding ${rawMessage} to queue because page is not focused and message is not in the queue yet`);
        } else {
          Root.pusherLog(`Message ${rawMessage} is already in the queue, so just ignore it`);
        }
      }
    });

    return {
      unsubscribe: (channel, eventName, component) => {
        if (checkPusher.currentChannels[channel]) {
          if (eventName && component && checkPusher.currentChannels[channel][eventName] &&
            checkPusher.currentChannels[channel][eventName][component]) {
            delete checkPusher.currentChannels[channel][eventName][component];
            Root.pusherLog(`Channel ${channel} is not a current channel for event ${eventName} and component ${component} anymore`);
          } else if (eventName && checkPusher.currentChannels[channel][eventName]) {
            delete checkPusher.currentChannels[channel][eventName];
            Root.pusherLog(`Channel ${channel} is not a current channel for event ${eventName} anymore`);
          } else {
            checkPusher.currentChannels[channel] = null;
            Root.pusherLog(`Channel ${channel} is not a current channel anymore`);
          }
        }
      },

      subscribe: (channel) => {
        if (!checkPusher.subscribedChannels[channel]) {
          checkPusher.subscribedChannels[channel] = [];
          Root.pusherLog(`Subscribing to channel ${channel}`);
        }
        if (!checkPusher.currentChannels[channel]) {
          checkPusher.currentChannels[channel] = {}; // event: callback
          Root.pusherLog(`Channel ${channel} is now a current channel`);
        }
        return {
          bind: (eventName, component, callback) => {
            if (checkPusher.queue[channel] && checkPusher.queue[channel][eventName]) {
              const updates = {};
              const indexes = [];
              checkPusher.queue[channel][eventName].forEach((data, j) => {
                const callbackMatch = callback(data, false);
                if (callbackMatch && data.component === component) {
                  const { id } = callbackMatch;
                  const update = callbackMatch.callback;
                  updates[id] = update;
                  indexes.push(j);
                }
              });
              indexes.forEach((index) => {
                checkPusher.queue[channel][eventName].splice(index, 1);
                Root.pusherLog('Removing from the queue because it was applicable for the callback');
              });
              Object.values(updates).forEach((update) => {
                update();
              });
            }
            if (!checkPusher.currentChannels[channel][eventName]) {
              checkPusher.currentChannels[channel][eventName] = {};
            }
            if (checkPusher.subscribedChannels[channel].indexOf(component) === -1) {
              checkPusher.subscribedChannels[channel].push(component);
            }
            checkPusher.currentChannels[channel][eventName][component] = callback;
            Root.pusherLog(`Event ${eventName} is now a current event of channel ${channel}`);
          },
        };
      },
    };
  }

  static propTypes = {
    store: PropTypes.object.isRequired,
  };

  componentWillMount() {
    this.setStore();
  }

  // eslint-disable-next-line class-methods-use-this
  componentDidMount() {
    if (config.googleAnalyticsCode) {
      ReactGA.initialize(config.googleAnalyticsCode, { debug: false });
    }
  }

  componentWillUpdate() {
    this.setStore();
  }

  getContext() {
    return new CheckContext(this);
  }

  setStore() {
    const history = syncHistoryWithStore(browserHistory, this.props.store);
    const context = this.getContext();
    const store = context.store || this.props.store;

    const data = { history, locale: this.props.locale };

    if (config.pusherKey) {
      // Pusher is imported at runtime from a <script file> tag.
      // eslint-disable-next-line no-undef
      Pusher.logToConsole = !!config.pusherDebug;
      // eslint-disable-next-line no-undef
      const pusher = new Pusher(config.pusherKey, {
        cluster: config.pusherCluster,
        encrypted: true,
      });
      data.pusher = Root.setPusher(pusher);
    }

    context.setContextStore(data, store);
    this.setState(data);
  }

  render() {
    const { store, translations, locale } = this.props;
    window.Check = { store };

    return (
      <div>
        <RootLocale locale={locale} />
        <IntlProvider locale={locale} messages={translations}>
          <Provider store={store}>
            <Router history={this.state.history} onUpdate={Root.logPageView}>
              <Route path="/" component={App}>
                <IndexRoute component={Team} />
                <Route path="check/user/already-confirmed" component={UserAlreadyConfirmed} public />
                <Route path="check/user/confirmed" component={UserConfirmed} public />
                <Route path="check/user/unconfirmed" component={UserUnconfirmed} public />
                <Route path="check/user/password-reset" component={UserPasswordReset} public />
                <Route path="check/user/password-change" component={UserPasswordChange} public />
                <Route path="check/user/terms-of-service" component={UserTos} public />
                <Route path="check/forbidden" component={AccessDenied} public />
                <Route path="check/not-found" component={NotFound} public />

                <Route path="check/user/:userId(/:tab)" component={User} />
                <Route path="check/me/edit" isEditing component={Me} />
                <Route path="check/me(/:tab)" component={Me} />
                <Route path="check/teams/new" component={AddTeamPage} />
                <Route path="check/teams/find(/:slug)" component={AddTeamPage} />
                <Route path="check/teams" component={Teams} />
                <Route path="check/bot-garden" component={BotGarden} />
                <Route path="check/bot/:botId" component={Bot} />

                <Route path=":team/media/:mediaId" component={ProjectMediaSearch} public />
                <Route path=":team/project/:projectId/media/:mediaId" component={ProjectMediaSearch} public />
                <Route path=":team/media/:mediaId/embed" component={MediaEmbed} public />
                <Route path=":team/project/:projectId/media/:mediaId/embed" component={MediaEmbed} public />
                <Route path=":team/media/:mediaId/memebuster" component={Memebuster} />
                <Route path=":team/project/:projectId/media/:mediaId/memebuster" component={Memebuster} />
                <Route path=":team/project/:projectId/media/:mediaId/tasks" component={MediaTasks} />
                <Route path=":team/project/:projectId/source/:sourceId" component={Source} public />
                <Route path=":team/project/:projectId/source/:sourceId/edit" isEditing component={Source} />
                <Route path=":team/join" component={JoinTeam} />
                <Route path=":team/project/:projectId/edit" component={ProjectEdit} />
                <Route path=":team/project/:projectId/dense(/:query)" view="dense" component={Project} public />
                <Route path=":team/project/:projectId/list(/:query)" view="list" component={Project} public />
                <Route path=":team/project/:projectId(/:query)" component={Project} public />
                <Route path=":team/search/dense(/:query)" view="dense" component={Search} public />
                <Route path=":team/search/list(/:query)" view="list" component={Search} public />
                <Route path=":team/search(/:query)" component={Search} public />
                <Route path=":team/trash(/:query)" component={Trash} />
                <Route path=":team" component={Team} public />
                <Route path=":team/edit" action="edit" component={Team} />
                <Route path=":team/settings" action="settings" component={Team} />
                <Route path=":team/dashboard" component={Dashboard} />
                <Route path=":team/dashboard/project/:projectId(/:query)" component={Dashboard} public />

                <Route path="*" component={NotFound} public />
              </Route>
            </Router>
          </Provider>
        </IntlProvider>
      </div>
    );
  }
}

Root.contextTypes = {
  store: PropTypes.object,
};

export default Root;
