import React from 'react';

/**
 * A unique identifier for a browser session.
 *
 * A session's clientSessionId should be sent alongside every GraphQL mutation.
 * Every Pusher message will reference the clientSessionId that caused the
 * push. So the session can check: "Oh, this Pusher message resulted from my own
 * actions? Then maybe I don't need to run another GraphQL query to fetch
 * database updates."
 *
 * This is an optimization. It should always be okay to run a GraphQL query
 * anyway.
 *
 * If the clientSessionId is not unique for a session, then these optimizations
 * will lead to undefined behavior within that session. (Anybody else with a
 * unique clientSessionId will not have a problem.)
 */
const ClientSessionIdContext = React.createContext(); // must be set and unique to this browser
ClientSessionIdContext.displayName = 'ClientSessionIdContext';

function generateRandomClientSessionId() {
  return `browser-${Date.now()}${parseInt(Math.random() * 1000000, 10)}`;
}

function withClientSessionId(Component) {
  const inner = React.forwardRef((props, ref) => {
    const clientSessionId = React.useContext(ClientSessionIdContext);
    return <Component clientSessionId={clientSessionId} ref={ref} {...props} />;
  });
  inner.displayName = `WithClientSessionId(${Component.displayName || Component.name || 'Component'})`;
  return inner;
}

export { ClientSessionIdContext, generateRandomClientSessionId, withClientSessionId };
