import superagent from 'superagent';
import util from 'util';
import config from 'config'; // eslint-disable-line require-path-exists/exists

// REST calls

// Request information from the backend
// failureCallback: function(errorMessage)
// successCallback: function(responseData)
export function request(method_, endpoint, failureCallback, successCallback, data_, headers_) {
  // Default values for parameters

  const method = method_.toLowerCase();
  const headers = headers_ || {};
  let data = data_ || {};

  let path = config.restBaseUrl + endpoint;

  if (method === 'get' && Object.keys(data).length > 0) {
    path += '?';
    Object.getOwnPropertyNames(data).forEach((key) => {
      path += `${key}=${data[key]}&`;
    });
  } else if (method === 'post') {
    const formdata = new FormData();
    Object.getOwnPropertyNames(data).forEach((key) => {
      formdata.append(key, data[key]);
    });
    data = formdata;
  }

  const http = superagent[method](path);

  http.timeout(120000);

  Object.getOwnPropertyNames(headers).forEach((key) => {
    http.set(key, headers[key]);
  });

  http.withCredentials().send(data);

  http.end((err, response) => {
    if (err) {
      if (err.response) {
        const json = JSON.parse(err.response.text);
        const message = json.data ? json.data.message : json.error;
        failureCallback(message, err.response.status);
      } else {
        failureCallback(util.inspect(err));
      }
    } else {
      const json = JSON.parse(response.text);
      if (response.status === 200) {
        successCallback(json.data);
      } else {
        const message = json.data ? json.data.message : json.error;
        failureCallback(message, response.status);
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
  // eslint-disable-next-line no-console
  const failureCallback = (message) => { console.log(message); };
  const successCallback = () => {
    window.location.assign(window.location.origin);
  };
  request('delete', 'users/sign_out', failureCallback, successCallback);
}
