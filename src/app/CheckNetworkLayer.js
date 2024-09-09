import React from 'react';
import Relay from 'react-relay/classic';
import { browserHistory } from 'react-router';
import { FormattedMessage } from 'react-intl';
import config from 'config'; // eslint-disable-line require-path-exists/exists
import util from 'util';

const fetchTimeout = config.timeout || 60000;

function createRequestError(request, responseStatus, payload) {
  const errorReason = `Server response had an error status ${responseStatus} and error ${util.inspect(payload)}`;

  const error = new Error(errorReason);
  error.source = payload;
  error.status = responseStatus;
  error.parsed = true;

  return error;
}

function generateRandomQueryId() {
  return `q${parseInt(Math.random() * 1000000, 10)}`;
}

function parseQueryPayload(request, payload) {
  if (Object.prototype.hasOwnProperty.call(payload, 'errors')) {
    if (payload.errors.filter(error => error.code === 3).length
      && window.location.pathname !== '/check/not-found') {
      browserHistory.push('/check/not-found');
    } else {
      const error = createRequestError(request, '200', payload);
      request.reject(error);
    }
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

/* eslint-disable no-underscore-dangle */

class CheckNetworkLayer extends Relay.DefaultNetworkLayer {
  constructor(path, options) {
    const { setFlashMessage, ...otherOptions } = options;
    super(path, otherOptions);
    this.setFlashMessage = setFlashMessage || (() => null);
    this.inFlightMutationRequests = 0;
    window.inFlightMutationRequests = this.inFlightMutationRequests;
  }

  _parseQueryResult(result) {
    if (result.status === 401) {
      const team = this._init.team();
      if (team !== '') {
        browserHistory.push('/');
      } else if (window.location.pathname !== '/check/not-found') {
        browserHistory.push('/check/not-found');
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
      referrerPolicy: 'no-referrer',
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
      referrerPolicy: 'no-referrer',
    });
  }

  _sendMutation(request) {
    this.inFlightMutationRequests += 1;
    window.inFlightMutationRequests = this.inFlightMutationRequests;
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
        referrerPolicy: 'no-referrer',
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
        referrerPolicy: 'no-referrer',
      });
    }

    const timeout = setTimeout(() => {
      this.setFlashMessage(<FormattedMessage defaultMessage="Still working…" description="Status message trying to connect to the network" id="network.stillWorking" />, 'info');
    }, fetchTimeout);

    return fetch(this._uri, init).then((response) => {
      this.inFlightMutationRequests -= 1;
      window.inFlightMutationRequests = this.inFlightMutationRequests;
      clearTimeout(timeout);
      return throwOnServerError(request, response);
    }).catch((error) => {
      if (error.parsed) {
        throw error;
      } else {
        clearTimeout(timeout);

        let { message } = error;
        if (error.name === 'TypeError') {
          message = (
            <FormattedMessage
              defaultMessage="Couldn't connect to {app}, please make sure you're connected to the internet"
              description="Error message when the user cannot connect to the app, possibly being no internet connection detected"
              id="network.noResponse"
              values={{ app: <FormattedMessage defaultMessage="Check" description="The name of the application" id="global.appNameHuman" /> }}
            />
          );
        }

        throw createRequestError(request, 0, JSON.stringify({ error: message.error }));
      }
    });
  }
}

export default CheckNetworkLayer;
