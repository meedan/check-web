import React, { Component } from 'react';
import { FormattedMessage, formatHTMLMessage, injectIntl } from 'react-intl';
import config from 'config';

class MappedMessage extends Component {
  render() {
    const appPrefix = config.appName === 'bridge' ? 'bridge_' : '';
    const parent = this.props.msgObj;
    const string_resource = parent[appPrefix + this.props.msgKey];

    return (
      <span>{this.props.intl.formatHTMLMessage(string_resource, {...this.props.values})}</span>
    );
  }
}

export default injectIntl(MappedMessage);
