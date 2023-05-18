import { Environment, Network, RecordSource, Store } from 'relay-runtime';
import config from 'config'; // eslint-disable-line require-path-exists/exists

function createFetchQuery(token, teamSlug) {
  return function fetchQuery(operation, variables, cacheConfig, uploadables) {
    let body = JSON.stringify({
      query: operation.text,
      variables,
      team: teamSlug,
    });
    const headers = {
      'X-Check-Token': token,
      'X-Check-Client': 'browser-extension',
      credentials: 'include',
    };
    if (uploadables) {
      const formData = new FormData();
      formData.append('query', operation.text);
      formData.append('variables', JSON.stringify(variables));
      formData.append('team', teamSlug);
      Object.keys(uploadables).forEach((key) => {
        formData.append(key, uploadables[key]);
      });
      body = formData;
    } else {
      headers['Content-Type'] = 'application/json';
    }

    return fetch(config.relayPath, {
      method: 'POST',
      headers,
      body,
    })
      .then(response => response.text())
      .then((text) => {
        let json = {};
        try {
          json = JSON.parse(text);
          if (json.error) {
            return {
              data: null,
              errors: [json],
            };
          }
          return json;
        } catch (e) {
          return {
            data: null,
            errors: [{ error: `Not JSON: ${text}` }],
          };
        }
      })
      .catch(error => ({
        data: null,
        errors: [{ error: error.message }],
      }));
  };
}

const createEnvironment = (token, teamSlug) => {
  const network = Network.create(
    createFetchQuery(token, teamSlug),
  );
  const source = new RecordSource();
  const store = new Store(source);
  const environment = new Environment({ network, store });
  return environment;
};

export default createEnvironment;
