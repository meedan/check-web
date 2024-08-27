import React from 'react';
import PropTypes from 'prop-types';
import { truncateLength } from '../helpers';

const ExternalLink = ({
  children,
  className,
  maxUrlLength,
  readable,
  style,
  title,
  url,
}) => {
  let displayUrl = url;
  if (title) {
    displayUrl = title;
  } else if (readable) {
    displayUrl = displayUrl.replace(/^https?:\/\/(www\.)?/, '');
  }
  displayUrl = maxUrlLength ? truncateLength(displayUrl, maxUrlLength) : displayUrl;

  return (
    <a className={className} href={url} rel="noopener noreferrer" style={{ color: 'var(--color-blue-32)', ...style }} target="_blank">
      {children || displayUrl}
    </a>
  );
};

ExternalLink.propTypes = {
  children: PropTypes.node,
  maxUrlLength: PropTypes.number,
  readable: PropTypes.bool,
  style: PropTypes.object,
  title: PropTypes.string,
  url: PropTypes.string.isRequired,
};

ExternalLink.defaultProps = {
  children: null,
  maxUrlLength: null,
  readable: false,
  style: {},
  title: null,
};

export default ExternalLink;
