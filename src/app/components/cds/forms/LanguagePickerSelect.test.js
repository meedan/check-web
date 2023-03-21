import React from 'react';
import { defineMessages } from 'react-intl';
import { mountWithIntl } from '../../../../../test/unit/helpers/intl-test';
import LanguagePickerSelect from './LanguagePickerSelect';

describe('<LanguagePickerSelect />', () => {
  const props = {
    selectedlanguage: 'en',
    onSubmit: jest.fn(),
    languages: ['en', 'fr'],
    isDisabled: false,
  };

  it('renders without crashing', () => {
    mountWithIntl(<LanguagePickerSelect {...props} />);
  });
});
