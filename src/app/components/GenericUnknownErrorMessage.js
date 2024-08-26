import React from 'react';
import { FormattedGlobalMessage } from './MappedMessage';
import { stringHelper } from '../customHelpers';

const values = {
  supportEmail: stringHelper('SUPPORT_EMAIL'),
};

export default function GenericUnknownErrorMessage() {
  return <FormattedGlobalMessage messageKey="unknownError" values={values} />;
}
GenericUnknownErrorMessage.propTypes = {};
