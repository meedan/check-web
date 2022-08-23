import React from 'react';
import PropTypes from 'prop-types';

const ExternalLink = props => (
  <a href={props.url} style={props.style} target="_blank" rel="noopener noreferrer">
    {props.children || props.url}
  </a>
);

ExternalLink.propTypes = {
  children: PropTypes.node,
  style: PropTypes.object,
  url: PropTypes.string.isRequired,
};

ExternalLink.defaultProps = {
  style: {},
  children: null,
};

export default ExternalLink;
