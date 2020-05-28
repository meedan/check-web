import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl } from 'react-intl';
import globalStrings from '../globalStrings';

function mapMessage(intl, msgObj, msgKey, values) {
  const parent = msgObj || globalStrings;
  const string_resource = parent[msgKey];

  return intl.formatHTMLMessage(string_resource, { ...values });
}

function mapGlobalMessage(intl, msgKey, values) {
  return mapMessage(intl, null, msgKey, values);
}

function FormattedGlobalMessage({ messageKey, ...rest }) {
  const message = globalStrings[messageKey];
  if (!message) {
    throw new Error(`Message with key ${messageKey} not found`);
  }
  return <FormattedMessage {...message} {...rest} />;
}
FormattedGlobalMessage.propTypes = {
  messageKey: PropTypes.string.isRequired,
};

const MappedMessage = props => (
  <span>{mapMessage(props.intl, props.msgObj, props.msgKey, props.values)}</span>
);

export default injectIntl(MappedMessage);
export {
  mapMessage,
  mapGlobalMessage,
  FormattedGlobalMessage,
};
