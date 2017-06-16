import { SUCCESS, ERROR } from './ActionTypes';
import superagent from 'superagent';
import util from 'util';
import config from 'config';

// REST calls

// Request information from the backend
// failureCallback: function(errorMessage)
// successCallback: function(responseData)
export function request(method, endpoint, failureCallback, successCallback, data, headers) {
  // Default values for parameters

  method = method.toLowerCase();
  if (!headers) {
    headers = {};
  }
  if (!data) {
    data = {};
  }

  let path = config.restBaseUrl + endpoint;

  if (method === 'get' && Object.keys(data).length > 0) {
    path += '?';
    for (var key in data) {
      path += `${key}=${data[key]}&`;
    }
  } else if (method === 'post') {
    const formdata = new FormData();
    for (var key in data) {
      formdata.append(key, data[key]);
    }
    data = formdata;
  }

  const http = superagent[method](path);

  http.timeout(120000);

  for (var key in headers) {
    http.set(key, headers[key]);
  }

  http.withCredentials().send(data);

  http.end((err, response) => {
    if (err) {
      if (err.response) {
        var json = JSON.parse(err.response.text);
        var message = json.data ? json.data.message : json.error;
        failureCallback(message);
      } else {
        failureCallback(util.inspect(err));
      }
    } else {
      var json = JSON.parse(response.text);
      if (response.status === 200) {
        successCallback(json.data);
      } else {
        var message = json.data ? json.data.message : json.error;
        failureCallback(message);
      }
    }
  });
}

export function login(provider, callback) {
  const win = window.open(`${config.restBaseUrl}users/auth/${provider}?destination=/close.html`, provider);
  const timer = window.setInterval(() => {
    if (win.closed) {
      window.clearInterval(timer);
      callback();
    }
  }, 500);
}

export function logout() {
  let failureCallback = function (message) { console.log(message); },
    successCallback = function (data) {
      window.location.assign(window.location.origin);
    };
  request('delete', 'users/sign_out', failureCallback, successCallback);
}

function disableButton(id) {
  const button = document.getElementById(id);
  if (button) {
    button.disabled = 'disabled';
    button.innerHTML = 'Please wait...';
  }
}
