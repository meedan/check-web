import React from 'react';
import PropTypes from 'prop-types'

const ExternalLink = props => (
  <a href={props.url} style={props.style} target="_blank" rel="noopener noreferrer">
    {props.children}
  </a>
);

ExternalLink.propTypes = {
  children: PropTypes.node.isRequired,
  style: PropTypes.object,
  url: PropTypes.string.isRequired
}

ExternalLink.defaultProps = {
  style: {}
}

export default ExternalLink;
