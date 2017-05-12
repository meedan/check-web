import React, { Component } from 'react';
import { FormattedMessage, formatMessage, injectIntl } from 'react-intl';
import config from 'config';

class MappedMessage extends Component {
  render() {
    console.log('--- MappedMessage ---');

    console.log('config.appName');
    console.log(config.appName);

    const appPrefix = config.appName === 'bridge' ? 'bridge_' : '';
    const parent = this.props.msgObj;
    const string_resource = parent[appPrefix + this.props.msgKey];

    console.log('string_resource');
    console.log(string_resource);

    return (
      <span>{this.props.intl.formatMessage(string_resource)}</span>
    );
  }
}

export default injectIntl(MappedMessage);
