import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
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
  return <FormattedMessage {...message} {...rest} />; // eslint-disable-line @calm/react-intl/missing-attribute
}
FormattedGlobalMessage.propTypes = {
  messageKey: PropTypes.oneOf(Object.keys(globalStrings)).isRequired,
};

export {
  mapGlobalMessage,
  FormattedGlobalMessage,
};
