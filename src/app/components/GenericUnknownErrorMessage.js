import React from 'react';
import { stringHelper } from '../customHelpers';
import { FormattedGlobalMessage } from './MappedMessage';

const values = {
  supportEmail: stringHelper('SUPPORT_EMAIL'),
};

export default function GenericUnknownErrorMessage() {
  return <FormattedGlobalMessage messageKey="unknownError" values={values} />;
}
GenericUnknownErrorMessage.propTypes = {};
