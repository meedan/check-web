import React from 'react';
import PropTypes from 'prop-types';
import { truncateLength } from '../helpers';

const ExternalLink = ({
  children,
  className,
  maxUrlLength,
  readable,
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
    <a className={className} href={url} rel="noopener noreferrer" target="_blank">
      {children || displayUrl}
    </a>
  );
};

ExternalLink.propTypes = {
  children: PropTypes.node,
  maxUrlLength: PropTypes.number,
  readable: PropTypes.bool,
  title: PropTypes.string,
  url: PropTypes.string.isRequired,
};

ExternalLink.defaultProps = {
  children: null,
  maxUrlLength: null,
  readable: false,
  title: null,
};

export default ExternalLink;
