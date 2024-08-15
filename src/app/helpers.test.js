import { getErrorMessage, safelyParseJSON } from './helpers';

describe('Helpers', () => {
  const fallbackMessage = { defaultMessage: 'Sorry, an error occurred while updating the item. Please try again and contact {supportEmail} if the condition persists.' };

  it('Should return the transaction error message)', () => {
    const transaction = { source: JSON.stringify({ errors: [{ message: 'This is not a default error message' }] }) };
    const message = getErrorMessage(transaction, fallbackMessage);
    expect(message).toMatch('This is not a default error message');
  });

  it('Should return the default error message)', () => {
    const transaction = { source: 'error' };
    const message = getErrorMessage(transaction, fallbackMessage);
    expect(message.defaultMessage).toMatch('Sorry, an error occurred while updating the item. Please try again');
  });

  it('Should safely parse JSON)', () => {
    const parsed = safelyParseJSON('{"key": "value"}', {});
    expect(parsed).toEqual({ key: 'value' });

    const parsedError = safelyParseJSON('error', {});
    expect(parsedError).toEqual({});

    const parsedNull = safelyParseJSON(null, {});
    expect(parsedNull).toEqual({});
  });
});
