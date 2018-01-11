import React from 'react';
import config from 'config'; // eslint-disable-line require-path-exists/exists
import MediaVerificationStatus from './MediaVerificationStatus';
import MediaTranslationStatus from './MediaTranslationStatus';

const MediaStatus = (props) => {
  if (config.appName === 'check') {
    return <MediaVerificationStatus {...props} />;
  } else if (config.appName === 'bridge') {
    return <MediaTranslationStatus {...props} />;
  }
  return null;
};

export default MediaStatus;
