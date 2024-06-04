import { defineMessages } from 'react-intl';

const globalStrings = defineMessages({
  appNameHuman: {
    id: 'global.appNameHuman',
    defaultMessage: 'Check',
    description: 'The name of the application',
  },
  edit: {
    id: 'global.edit',
    defaultMessage: 'Edit',
    description: 'Generic label for a button or link for a user to press when they wish to edit content or functionality',
  },
  cancel: {
    id: 'global.cancel',
    defaultMessage: 'Cancel',
    description: 'Generic label for a button or link for a user to press when they wish to abort an in-progress operation',
  },
  close: {
    id: 'global.close',
    defaultMessage: 'Close',
    description: 'Generic label for a button or link for a user to press when they wish to close a view',
  },
  confirm: {
    id: 'global.confirm',
    defaultMessage: 'Confirm',
    description: 'Generic label for a button or link for a user to press when they wish to confirm an action',
  },
  delete: {
    id: 'global.delete',
    defaultMessage: 'Delete',
    description: 'Generic label for a button or link for a user to press when they wish to delete content or remove functionality',
  },
  description: {
    id: 'global.description',
    defaultMessage: 'Description',
    description: 'Generic label for a text field to input a description',
  },
  ok: {
    id: 'global.ok',
    defaultMessage: 'OK',
    description: 'Generic label for a button or link for a user to press when they wish to confirm an action',
  },
  save: {
    id: 'global.save',
    defaultMessage: 'Save',
    description: 'Generic label for a button or link for a user to press when they wish to save an action or setting',
  },
  submit: {
    id: 'global.submit',
    defaultMessage: 'Submit',
    description: 'Generic label for a button or link for a user to press when they wish to submit and form or action',
  },
  submitting: {
    id: 'global.submitting',
    defaultMessage: 'Submitting…',
    description: 'Generic loading message when a form is in process of being submitted',
  },
  unknownError: {
    id: 'global.unknownError',
    defaultMessage: 'Sorry, an error occurred. Please try again and contact {supportEmail} if the condition persists.',
    description: 'Message displayed in error notification when an operation fails unexpectedly',
  },
  update: {
    id: 'global.update',
    defaultMessage: 'Update',
    description: 'Generic label for a button or link for a user to press when they wish to update an action',
  },
  bestViewed: {
    id: 'global.bestViewed',
    defaultMessage: 'Best viewed with <a href="https://www.google.com/chrome/browser/desktop/">Chrome for Desktop</a>.',
    description: 'Message shown to the user when they are using an unsupported browser',
  },
});

export default globalStrings;
