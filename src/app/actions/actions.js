import { SUCCESS, ERROR } from '../constants/ActionTypes';
import superagent from 'superagent';
import config from '../config/config.js';
import util from 'util';

// REST calls

// Request information from the backend
// failureCallback: function(errorMessage)
// successCallback: function(responseData)
export function request(method, endpoint, failureCallback, successCallback, headers, data) {

  // Default values for parameters

  method = method.toLowerCase();
  if (!headers) {
    headers= {};
  }
  if (!data) {
    data = {};
  }

  var path = config.restBaseUrl + endpoint;

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

  http.withCredentials().send(data);

  http.end(function(err, response) {
    if (err) {
      if (err.response) {
        var json = JSON.parse(err.response.text);
        failureCallback(json.data.message);
      }
      else {
        failureCallback(util.inspect(err));
      }
    }
    else {
      var json = JSON.parse(response.text);
      if (response.status === 200) {
        successCallback(json.data);
      }
      else {
        failureCallback(json.data.message);
      }
    }
  });
};

var login = function(provider, dispatch) {
  var win = window.open(config.restBaseUrl + 'users/auth/' + provider + '?destination=/close.html', provider);
  var timer = window.setInterval(function() {
    if (win.closed) {  
      window.clearInterval(timer);
      dispatch({ type: SUCCESS, error: false });
    }
  }, 500);
};

export function loginFacebook() {
  return (dispatch, getState) => {
    login('facebook', dispatch);
  };
};

export function loginTwitter() {
  return (dispatch, getState) => {
    login('twitter', dispatch);
  };
};

export function logout() {
  return (dispatch, getState) => {
    var failureCallback = function(message) { dispatch({ type: ERROR, message: message }); },
        successCallback = function(data) { dispatch({ type: SUCCESS, loggedOut: true, message: 'Logged out successfully!' }); };
    request('delete', 'users/sign_out', failureCallback, successCallback);
  };
};

function disableButton(id) {
  var button = document.getElementById(id);
  if (button) {
    button.disabled = 'disabled';
    button.innerHTML = 'Please wait...';
  }
}
