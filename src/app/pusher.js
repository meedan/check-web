import React from 'react';
import PropTypes from 'prop-types';
import config from 'config'; // eslint-disable-line require-path-exists/exists
import deepEqual from 'deep-equal';
import ifvisible from 'ifvisible.js';
import { safelyParseJSON } from './helpers';
import { ClientSessionIdContext } from './ClientSessionId';

function createPusher({
  clientSessionId,
  cluster,
  debug,
  pusherKey,
}) {
  // Pusher is imported at runtime from a <script file> tag.
  // eslint-disable-next-line no-console
  if (!!debug && console && console.debug) {
    // eslint-disable-next-line no-undef, no-console
    Pusher.log = console.debug;
  }
  // eslint-disable-next-line no-undef
  const pusher = new Pusher(pusherKey, {
    cluster,
    encrypted: true,
  });

  // eslint-disable-next-line no-console
  const pusherLog = debug ? message => console.debug(`[Pusher] ${message}`) : () => {};

  const checkPusher = {
    messagesQueue: [],
    queue: {},
    currentChannels: {},
    subscribedChannels: {},
    callbacksToRun: {},
    clientSessionId,
  };
  window.CheckPusher = checkPusher; // to help debug things

  window.setInterval(() => {
    pusherLog('Running throttle');
    const callbacks = Object.assign({}, checkPusher.callbacksToRun);
    checkPusher.callbacksToRun = {};
    Object.values(callbacks).forEach((callback) => {
      callback();
    });
  }, 5000);

  function processPusherMessage(data, run) {
    const message = safelyParseJSON(data.message, {});
    const eventName = message.pusherEvent;
    const callbacks = {};
    message.pusherChannels.forEach((channel) => {
      if (checkPusher.currentChannels[channel] &&
        checkPusher.currentChannels[channel][eventName]) {
        Object.keys(checkPusher.currentChannels[channel][eventName]).forEach((component) => {
          const { callback, id } =
            checkPusher.currentChannels[channel][eventName][component](data, false);
          if (id && callback) {
            if (run) {
              checkPusher.callbacksToRun[id] = callback;
            } else {
              callbacks[id] = callback;
            }
          }
          pusherLog(`Calling callback for channel ${channel} and event ${eventName} for component ${component}, which is currently mounted and focused`);
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
            pusherLog(`Not adding event ${eventName} to the queue of channel ${channel} because it is already there`);
          } else {
            checkPusher.queue[channel][eventName].push(eventData);
            pusherLog(`Adding event ${eventName} to queue of channel ${channel} for component ${component}`);
          }
        });
      } else {
        pusherLog(`Ignoring event ${eventName} for channel ${channel}`);
      }
    });
    return callbacks;
  }

  ifvisible.on('blur', () => {
    pusherLog('Page is not focused anymore');
  });

  ifvisible.on('focus', () => {
    pusherLog('Page is focused now');
    const messages = checkPusher.messagesQueue.slice(0);
    checkPusher.messagesQueue = [];
    const callbacks = {};
    messages.forEach((rawMessage) => {
      Object.assign(callbacks, processPusherMessage(JSON.parse(rawMessage), false));
    });
    Object.values(callbacks).forEach((callback) => {
      callback();
    });
  });

  pusher.unsubscribe('check-api-global-channel');
  pusher.subscribe('check-api-global-channel').bind('update', (data) => {
    const rawMessage = JSON.stringify(data);
    pusherLog(`Received global event: ${rawMessage}`);
    if (!ifvisible.now('hidden')) {
      processPusherMessage(data, true);
    } else {
      pusherLog(`Page is not focused, so message ${rawMessage} will go to the queue`);
      if (checkPusher.messagesQueue.indexOf(rawMessage) === -1) {
        checkPusher.messagesQueue.push(rawMessage);
        pusherLog(`Adding ${rawMessage} to queue because page is not focused and message is not in the queue yet`);
      } else {
        pusherLog(`Message ${rawMessage} is already in the queue, so just ignore it`);
      }
    }
  });

  return {
    unsubscribe: (channel, eventName, component) => {
      if (checkPusher.currentChannels[channel]) {
        if (eventName && component && checkPusher.currentChannels[channel][eventName] &&
          checkPusher.currentChannels[channel][eventName][component]) {
          delete checkPusher.currentChannels[channel][eventName][component];
          pusherLog(`Channel ${channel} is not a current channel for event ${eventName} and component ${component} anymore`);
        } else if (eventName && checkPusher.currentChannels[channel][eventName]) {
          delete checkPusher.currentChannels[channel][eventName];
          pusherLog(`Channel ${channel} is not a current channel for event ${eventName} anymore`);
        } else {
          checkPusher.currentChannels[channel] = null;
          pusherLog(`Channel ${channel} is not a current channel anymore`);
        }
      }
    },

    subscribe: (channel) => {
      if (!checkPusher.subscribedChannels[channel]) {
        checkPusher.subscribedChannels[channel] = [];
        pusherLog(`Subscribing to channel ${channel}`);
      }
      if (!checkPusher.currentChannels[channel]) {
        checkPusher.currentChannels[channel] = {}; // event: callback
        pusherLog(`Channel ${channel} is now a current channel`);
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
              pusherLog('Removing from the queue because it was applicable for the callback');
            });
            Object.values(updates).forEach((update) => {
              if (typeof update === 'function') {
                update();
              } else {
                pusherLog(`update is not a function: ${update}`);
              }
            });
          }
          if (!checkPusher.currentChannels[channel][eventName]) {
            checkPusher.currentChannels[channel][eventName] = {};
          }
          if (checkPusher.subscribedChannels[channel].indexOf(component) === -1) {
            checkPusher.subscribedChannels[channel].push(component);
          }
          checkPusher.currentChannels[channel][eventName][component] = callback;
          pusherLog(`Event ${eventName} is now a current event of channel ${channel}`);
        },
      };
    },
  };
}

const NullPusher = {
  // https://mantis.meedan.com/view.php?id=8278
  subscribe: () => ({
    bind: () => null,
  }),
  unsubscribe: () => null,
};

function getPusherContextValueForClientSessionId(clientSessionId) {
  return config.pusherKey ? createPusher({
    clientSessionId,
    cluster: config.pusherCluster,
    pusherKey: config.pusherKey,
    debug: config.pusherDebug,
  }) : NullPusher;
}

const PusherContext = React.createContext({ subscribe: () => {}, unsubscribe: () => {} });
PusherContext.displayName = 'PusherContext';

function withPusher(Component) {
  const inner = React.forwardRef((props, ref) => {
    const pusher = React.useContext(PusherContext);
    // TODO streamline design, so components don't need to check
    // clientSessionId.
    const clientSessionId = React.useContext(ClientSessionIdContext);
    return <Component clientSessionId={clientSessionId} pusher={pusher} ref={ref} {...props} />;
  });
  inner.displayName = `WithPusher(${Component.displayName || Component.name || 'Component'})`;
  return inner;
}

const pusherShape = PropTypes.shape({
  /**
   * Usage: subscribe(channel)(eventName, component, callback)
   */
  subscribe: PropTypes.func.isRequired,

  /**
   * Usage: unsubscribe(channel, eventName, component)
   */
  unsubscribe: PropTypes.func.isRequired,
});

export { getPusherContextValueForClientSessionId, PusherContext, withPusher, pusherShape };
