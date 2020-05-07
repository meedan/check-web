import {
  Environment,
  Network,
  RecordSource,
  Store,
} from 'relay-runtime';
import config from 'config'; // eslint-disable-line require-path-exists/exists

function getTeamSlug() {
  const slug = window.location.pathname.match(/^\/([^/]+).*/);
  if (slug) {
    return slug[1];
  }
  return '';
}

let userToken = null;
try {
  userToken = window.Check.store.getState().app.context.currentUser.token;
} catch (e) {
  userToken = null;
}

function getQueryFromOperation(operation) {
  return operation.text || operation.params.text;
}

function fetchQuery(
  operation,
  variables,
) {
  return fetch(config.relayPath, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-Check-Team': encodeURIComponent(getTeamSlug()),
      'X-Check-Token': userToken,
    },
    body: JSON.stringify({
      query: getQueryFromOperation(operation),
      variables,
      team: getTeamSlug(),
    }),
  }).then(response => (
    response.text()
  )).then((text) => {
    try {
      const json = JSON.parse(text);
      return json;
    } catch (e) {
      return text;
    }
  });
}

const environment = new Environment({
  network: Network.create(fetchQuery),
  store: new Store(new RecordSource()),
});

export default environment;
