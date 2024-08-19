/* eslint-disable react/sort-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { truncateLength } from '../helpers';

const ExternalLink = ({
  children,
  className,
  maxUrlLength,
  readable,
  style,
  url,
}) => {
  let displayUrl = url;
  if (readable) {
    displayUrl = displayUrl.replace(/^https?:\/\/(www\.)?/, '');
  }
  displayUrl = maxUrlLength ? truncateLength(displayUrl, maxUrlLength) : displayUrl;

  return (
    <a className={className} href={url} style={{ color: 'var(--color-blue-32)', ...style }} target="_blank" rel="noopener noreferrer">
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
