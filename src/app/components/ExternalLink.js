import React from 'react';

const ExternalLink = props => (
  <a href={props.url} style={props.style} target="_blank" rel="noopener noreferrer">
    {props.children}
  </a>
);

export default ExternalLink;
