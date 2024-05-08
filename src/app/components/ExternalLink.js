import React from 'react';
import PropTypes from 'prop-types';
import { truncateLength } from '../helpers';

const ExternalLink = ({
  className,
  children,
  url,
  maxUrlLength,
  style,
  readable,
}) => {
  let displayUrl = url;
  if (readable) {
    displayUrl = displayUrl.replace(/^https?:\/\/(www\.)?/, '');
  }
  displayUrl = maxUrlLength ? truncateLength(displayUrl, maxUrlLength) : displayUrl;

  return (
    <a className={className} href={url} style={{ color: 'var(--textLink)', ...style }} target="_blank" rel="noopener noreferrer">
      {children || displayUrl}
    </a>
  );
};

ExternalLink.propTypes = {
  children: PropTypes.node,
  url: PropTypes.string.isRequired,
  maxUrlLength: PropTypes.number,
  style: PropTypes.object,
  readable: PropTypes.bool,
};

ExternalLink.defaultProps = {
  style: {},
  children: null,
  maxUrlLength: null,
  readable: false,
};

export default ExternalLink;
