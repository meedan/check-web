/* eslint-disable @calm/react-intl/missing-attribute */
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { getErrorMessage } from './helpers';
import { stringHelper } from './customHelpers';

describe('Helpers', () => {
  const fallbackMessage = (
    <FormattedMessage
      id="addAnnotation.error"
      defaultMessage="Sorry, an error occurred while updating the item. Please try again and contact {supportEmail} if the condition persists."
      values={{ supportEmail: stringHelper('SUPPORT_EMAIL') }}
    />
  );

  it('Should return the transaction error message)', () => {
    const transaction = { source: JSON.stringify({ errors: [{ message: 'This is not a default error message' }] }) };
    const message = getErrorMessage(transaction, fallbackMessage);
    expect(message).toMatch('This is not a default error message');
  });

  it('Should return the default error message)', () => {
    const transaction = { source: 'error' };
    const message = getErrorMessage(transaction, fallbackMessage);
    expect(message.props.defaultMessage).toMatch('Sorry, an error occurred while updating the item. Please try again');
  });
});
