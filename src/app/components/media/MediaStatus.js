import React, { Component, PropTypes } from 'react';
import MediaVerificationStatus from './MediaVerificationStatus';
import MediaTranslationStatus from './MediaTranslationStatus';
import config from 'config';

class MediaStatus extends Component {
  render() {
    if (config.appName === 'check') {
      return (<MediaVerificationStatus {...this.props} />);
    }
    else if (config.appName == 'bridge') {
      return (<MediaTranslationStatus {...this.props} />);
    }
    else {
      return null;
    }
  }
}

export default MediaStatus;
