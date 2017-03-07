import React, { Component, PropTypes } from 'react';
import NewRelic from 'new-relic-react';
import config from 'config';

class CheckNewRelic extends Component {
  render() {
    if (config.newRelicLicenseKey && config.newRelicAppId) {
      return (<NewRelic licenseKey={config.newRelicLicenseKey} applicationID={config.newRelicAppId} />);
    }
    return null;
  }
}

export default CheckNewRelic;