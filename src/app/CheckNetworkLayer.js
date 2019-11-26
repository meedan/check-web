import Relay from 'react-relay/classic';
import { defineMessages } from 'react-intl';
import util from 'util';
import config from 'config'; // eslint-disable-line require-path-exists/exists
import { request as requestFunction } from './redux/actions';
import { mapGlobalMessage } from './components/MappedMessage';

const fetchTimeout = config.timeout || 60000;

const messages = defineMessages({
  stillWorking: {
    id: 'network.stillWorking',
    defaultMessage: 'Still working...',
  },
  offline: {
    id: 'network.offline',
    defaultMessage: 'Can\'t connect to {app}, please make sure you\'re connected to the internet. Trying to reconnect...',
  },
  noResponse: {
    id: 'network.noResponse',
    defaultMessage: 'Couldn\'t connect to {app}, please make sure you\'re connected to the internet',
  },
});

function createRequestError(request, responseStatus, payload) {
  const errorReason: string = `Server response had an error status ${responseStatus} and error ${util.inspect(payload)}`;

  const error = new Error(errorReason);
  (error: any).source = payload;
  (error: any).status = responseStatus;
  (error: any).parsed = true;

  return error;
}

function generateRandomQueryId() {
  return `q${parseInt(Math.random() * 1000000, 10)}`;
}

function parseQueryPayload(request, payload) {
  if (Object.prototype.hasOwnProperty.call(payload, 'errors')) {
    const error = createRequestError(request, '200', payload);
    request.reject(error);
  } else if (!Object.prototype.hasOwnProperty.call(payload, 'data')) {
    request.reject(new Error('Server response was missing for query ' +
          `\`${request.getDebugName()}\`.`));
  } else {
    request.resolve({ response: payload.data });
  }
}

function throwOnServerError(request, response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }
  return response.text().then((payload) => {
    throw createRequestError(request, response.status, payload);
  });
}

let pollStarted = false;

/* eslint-disable no-underscore-dangle */

class CheckNetworkLayer extends Relay.DefaultNetworkLayer {
  constructor(path, options) {
    super(path, options);
    this.caller = options.caller;
    // this.startPoll();
  }

  messageCallback(message) {
    if (this.caller) {
      this.caller.setState({ message: this.l(message) });
    }
  }

  startPoll() {
    if (this.caller && !pollStarted) {
      let online = true;
      let poll = () => {};

      const failureCallback = () => {
        if (online) {
          this.messageCallback(messages.offline);
          online = false;
        }
        poll();
      };

      const successCallback = () => {
        if (!online) {
          this.messageCallback(null);
          online = true;
        }
        poll();
      };

      poll = () => {
        setTimeout(() => {
          requestFunction('get', 'ping', failureCallback, successCallback);
        }, 5000);
      };

      poll();
      pollStarted = true;
    }
  }

  l(message) {
    if (!message) {
      return null;
    }
    if (this.caller) {
      return this.caller.props.intl.formatMessage(message, { app: mapGlobalMessage(this.caller.props.intl, 'appNameHuman') });
    }
    return message.defaultMessage;
  }

  _parseQueryResult(result) {
    if (config.pusherDebug) {
      // eslint-disable-next-line no-console
      console.log('%cSending request to backend ', 'font-weight: bold');
    }
    const { history } = this._init;
    if (result.status === 404 && window.location.pathname !== '/check/not-found') {
      history.push('/check/not-found');
    } else if (result.status === 401 || result.status === 403) {
      const team = this._init.team();
      if (team !== '') {
        history.push(`/${team}/join`);
      } else if (window.location.pathname !== '/check/forbidden') {
        history.push('/check/forbidden');
      }
    }
  }

  sendQueries(requests) {
    if (requests.length > 1) {
      requests.map((request) => {
        request.randomId = generateRandomQueryId();
        return request;
      });
      return this._sendBatchQuery(requests).then((result) => {
        this._parseQueryResult(result);
        return result.json();
      }).then((response) => {
        response.forEach((payload) => {
          const request = requests.find(r => r.randomId === payload.id);
          if (request) {
            parseQueryPayload(request, payload.payload);
          }
        });
      }).catch((error) => {
        requests.forEach(r => r.reject(error));
      });
    }
    return Promise.all(requests.map(request => (
      this._sendQuery(request).then((result) => {
        this._parseQueryResult(result);
        return result.json();
      }).then((payload) => {
        parseQueryPayload(request, payload);
      }).catch((error) => {
        request.reject(error);
      })
    )));
  }

  _queryHeaders() {
    const headers = {
      ...this._init.headers,
      Accept: '*/*',
      'Content-Type': 'application/json',
      'X-Check-Team': encodeURIComponent(this._init.team()),
      'X-Timezone': Intl.DateTimeFormat().resolvedOptions().timeZone,
    };

    if (window.parent !== window) {
      const token = window.location.search.replace(/^\?token=/, '');
      if (token) {
        headers['X-Check-Token'] = token;
      }
    }

    return headers;
  }

  _sendBatchQuery(requests) {
    return fetch(`${this._uri}/batch`, {
      ...this._init,
      body: JSON.stringify(requests.map(request => ({
        id: request.randomId,
        query: request.getQueryString(),
        variables: request.getVariables(),
        team: encodeURIComponent(this._init.team()),
      }))),
      headers: this._queryHeaders(),
      method: 'POST',
      credentials: 'include',
    });
  }

  _sendQuery(request) {
    return fetch(this._uri, {
      ...this._init,
      body: JSON.stringify({
        query: request.getQueryString(),
        variables: request.getVariables(),
        team: encodeURIComponent(this._init.team()),
      }),
      headers: this._queryHeaders(),
      method: 'POST',
      credentials: 'include',
    });
  }

  _sendMutation(request) {
    const _interopRequireDefault = obj => obj && obj.__esModule ? obj : { default: obj };

    let init;
    const files = request.getFiles();
    // eslint-disable-next-line global-require
    const _extends3 = _interopRequireDefault(require('babel-runtime/helpers/extends'));
    // eslint-disable-next-line global-require
    const _stringify2 = _interopRequireDefault(require('babel-runtime/core-js/json/stringify'));

    if (files) {
      if (!global.FormData) {
        throw new Error('Uploading files without `FormData` not supported.');
      }
      const formData = new FormData();
      formData.append('query', request.getQueryString());
      formData.append('variables', (0, _stringify2.default)(request.getVariables()));
      formData.append('team', encodeURIComponent(this._init.team()));
      Object.getOwnPropertyNames(files).forEach((filename) => {
        formData.append(filename, files[filename]);
      });
      init = (0, _extends3.default)({}, this._init, {
        body: formData,
        method: 'POST',
      });
    } else {
      init = (0, _extends3.default)({}, this._init, {
        body: (0, _stringify2.default)({
          query: request.getQueryString(),
          variables: request.getVariables(),
          team: encodeURIComponent(this._init.team()),
        }),
        headers: (0, _extends3.default)({}, this._init.headers, {
          Accept: '*/*',
          'Content-Type': 'application/json',
          'X-Check-Team': encodeURIComponent(this._init.team()),
          'X-Timezone': Intl.DateTimeFormat().resolvedOptions().timeZone,
        }),
        method: 'POST',
      });
    }

    const timeout = setTimeout(() => {
      this.messageCallback(messages.stillWorking);
    }, fetchTimeout);

    return fetch(this._uri, init).then((response) => {
      this.messageCallback(null);
      clearTimeout(timeout);
      return throwOnServerError(request, response);
    }).catch((error) => {
      if (error.parsed) {
        throw error;
      } else {
        clearTimeout(timeout);

        let { message } = error;
        if (error.name === 'TypeError') {
          message = this.l(messages.noResponse);
        }

        throw createRequestError(request, 0, JSON.stringify({ error: message }));
      }
    });
  }
}

export default CheckNetworkLayer;
