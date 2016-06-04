import { ERROR } from '../constants/ActionTypes';
import superagent from 'superagent';
import config from '../config/config.js';

// Request information from the backend, after logged in

var request = function(method, endpoint, session, data, type, dispatch, view, previousView, callback) {

  // @Change the headers
  var headers = {
    'X-Token': session.token
  };

  // @Change the host
  var path = 'http://localhost/api/' + endpoint;

  if (method === 'get' && Object.keys(data).length > 0) {
    path += '?'
    for (var key in data) {
      path += key + '=' + data[key] + '&'
    }
  }

  var http = superagent[method](path);

  http.timeout(120000);

  for (var key in headers) {
    http.set(key, headers[key]);
  }

  http.send(data);

  http.end(function(err, response) {
    if (err) {
      if (err.response) {
        var json = JSON.parse(err.response.text);
        dispatch({ type: ERROR, message: '<h2>' + json.data.message + '</h2>', view: 'message', session: session, previousView: previousView, image: 'error' })
      }
      else {
        dispatch({ type: ERROR, message: util.inspect(err), view: 'message', session: session, previousView: previousView, image: 'error-invalid-url' })
      }
    }
    else {
      var json = JSON.parse(response.text);
      if (response.status === 200) {
        callback(dispatch, json);
      }
      else {
        dispatch({ type: ERROR, message: '<h2>' + json.data.message + '</h2>', view: 'message', session: session, previousView: previousView, image: 'error' })
      }
    }
  });
};

// Request auth information from backend

var requestAuth = function(provider, type, dispatch) {

  // @Change the URL to the one that tells whether the user is authenticated
  superagent.get('http://localhost/api/users')
  .end(function(err, response) {

    // Error
    if (err) {
      dispatch({ type: ERROR, message: '<h2>Could not connect to server</h2>', view: 'message', session: null, previousView: 'login' })
    }

    // Not logged in
    else if (response.text === 'null') {

      // @Change to the authentication URL
      var win = window.open('http://localhost/api/auth', provider);
      var timer = window.setInterval(function() {   
        if (win.closed) {  
          window.clearInterval(timer);
          requestAuth(provider, type, dispatch);
        }  
      }, 500);
    }
    else {
      dispatch({ session: JSON.parse(response.text), type: type, provider: provider, view: 'menu', previousView: 'login' });
    }
  });
};

export function close() {
  return (dispatch, getState) => {
    getState().extension.runtime.reload();
  };
}

function disableButton(id) {
  var button = document.getElementById(id);
  if (button) {
    button.disabled = 'disabled';
    button.innerHTML = 'Please wait...';
  }
}

// @Change the rest of this file in order to add the remaining functions
