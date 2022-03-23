import React from 'react';
import { FormattedMessage } from 'react-intl';

const CheckError = {
  codes: {
    UNAUTHORIZED: 1,
    MISSING_PARAMETERS: 2,
    ID_NOT_FOUND: 3,
    INVALID_VALUE: 4,
    UNKNOWN: 5,
    AUTH: 6,
    WARNING: 7,
    MISSING_OBJECT: 8,
    DUPLICATED: 9,
    LOGIN_2FA_REQUIRED: 10,
    CONFLICT: 11,
  },
  messages: {
    UNAUTHORIZED: (<FormattedMessage
      id="check.error.unauthorized"
      defaultMessage="You are not authorized to see this content. Please contact your workspace administrator if you need permission."
      description="This is a message that displays in an error popup if the user tries to access data that they do not have permission to access."
    />),
    MISSING_PARAMETERS: (<FormattedMessage
      id="check.error.missing_parameters"
      defaultMessage="The API call was missing parameters."
      description="This is a message that displays in an error popup if the client sent a request to the server that was missing URL parameters."
    />),
    ID_NOT_FOUND: (<FormattedMessage
      id="check.error.id_not_found"
      defaultMessage="A requested ID was not found."
      description="This is a message that displays in an error popup if the client sent a request to the server with an identifying number that was not found in the database."
    />),
    INVALID_VALUE: (<FormattedMessage
      id="check.error.invalid_value"
      defaultMessage="An invalid value was sent to the server."
      description="This is a message that displays in an error popup if the client sent a request to the server with an invalid value of some kind, such as a malformed email address."
    />),
    UNKNOWN: (<FormattedMessage
      id="check.error.unknown"
      defaultMessage="There was an error we can't identify."
      description="This is a message that displays in an error popup if the server returns an error that we haven't previously classified. This is the default error shown if we can't figure out what sort of error to show the user."
    />),
    AUTH: (<FormattedMessage
      id="check.error.auth"
      defaultMessage="An authentication error occurred."
      description="This is a message that displays in an error popup if the client is unable to authenticate (log in)."
    />),
    WARNING: (<FormattedMessage
      id="check.error.warning"
      defaultMessage="The server returned a warning."
      description="This is a message that displays in an error popup if the server sends it some kind of non-critical warning message (user is approaching their API call limit, for example)."
    />),
    MISSING_OBJECT: (<FormattedMessage
      id="check.error.missing_object"
      defaultMessage="There is an object missing in the database."
      description="This is a message that displays in an error popup if the server cannot find an object that was requested by the client."
    />),
    DUPLICATED: (<FormattedMessage
      id="check.error.duplicated"
      defaultMessage="You're trying to create a record that already exists."
      description="This is a message that displays in an error popup if the client tries to create an item but the database already has a record of it."
    />),
    LOGIN_2FA_REQUIRED: (<FormattedMessage
      id="check.error.two_factor_auth"
      defaultMessage="You need to log in using two factor authentication."
      description="This is a message that displays in an error popup if the client tries to access the application, but they are not yet authenticated by two factor authentication."
    />),
    CONFLICT: (<FormattedMessage
      id="check.error.conflict"
      defaultMessage="There was a database conflict."
      description="This is a message that displays in an error popup if the server returns an error involving some kind of conflicting data."
    />),
  },
  getMessageFromCode(code) {
    const codeName = Object.keys(this.codes).find(key => this.codes[key] === code);
    if (codeName) {
      return this.messages[codeName];
    }
    return this.messages.UNKNOWN;
  },
};

export default CheckError;
