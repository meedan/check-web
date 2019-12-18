import React from 'react';

const ExternalLink = props => (
  // TODO Fix a11y issues
  /* eslint jsx-a11y/click-events-have-key-events: 0 */
  <div onClick={() => window.open(props.url, '_blank', ['noopener', 'noreferrer'])}>
    {props.children}
  </div>
);

export default ExternalLink;
