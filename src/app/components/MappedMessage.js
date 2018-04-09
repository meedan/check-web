import React from 'react';
import { injectIntl } from 'react-intl';
import config from 'config'; // eslint-disable-line require-path-exists/exists
import globalStrings from '../globalStrings';

function mapMessage(intl, msgObj, msgKey, values) {
  const appPrefix = config.appName === 'bridge' ? 'bridge_' : '';
  const parent = msgObj || globalStrings;
  const string_resource = parent[appPrefix + msgKey];

  return intl.formatHTMLMessage(string_resource, { ...values });
}

function mapGlobalMessage(intl, msgKey, values) {
  return mapMessage(intl, null, msgKey, values);
}

const MappedMessage = props => (
  <span>{mapMessage(props.intl, props.msgObj, props.msgKey, props.values)}</span>
);

export default injectIntl(MappedMessage);
export {
  mapMessage,
  mapGlobalMessage,
};
