import React from 'react';
import PropTypes from 'prop-types';
import { truncateLength } from '../helpers';

const ExternalLink = ({
  children,
  url,
  maxUrlLength,
  style,
}) => {
  const displayUrl = maxUrlLength ? truncateLength(url, maxUrlLength) : url;

  return (
    <a href={url} style={style} target="_blank" rel="noopener noreferrer">
      {children || displayUrl}
    </a>
  );
};

ExternalLink.propTypes = {
  children: PropTypes.node,
  url: PropTypes.string.isRequired,
  maxUrlLength: PropTypes.number,
  style: PropTypes.object,
};

ExternalLink.defaultProps = {
  style: {},
  children: null,
  maxUrlLength: null,
};

export default ExternalLink;
