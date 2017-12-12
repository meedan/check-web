import React, { Component } from 'react';
import config from 'config'; // eslint-disable-line require-path-exists/exists
import MediaVerificationStatus from './MediaVerificationStatus';
import MediaTranslationStatus from './MediaTranslationStatus';

class MediaStatus extends Component {
  render() {
    if (config.appName === 'check') {
      return <MediaVerificationStatus {...this.props} />;
    } else if (config.appName === 'bridge') {
      return <MediaTranslationStatus {...this.props} />;
    }
    return null;
  }
}

export default MediaStatus;
