import React from 'react';
import LanguagePickerSelect from './LanguagePickerSelect';
import { mountWithIntl } from '../../../../../test/unit/helpers/intl-test';

describe('<LanguagePickerSelect />', () => {
  const props = {
    selectedLanguage: 'en',
    onSubmit: jest.fn(),
    languages: ['en', 'fr'],
    isDisabled: false,
  };

  it('renders without crashing', () => {
    mountWithIntl(<LanguagePickerSelect {...props} />);
  });

  const nullProps = {
    selectedLanguage: null,
    onSubmit: jest.fn(),
    languages: null,
    isDisabled: false,
  };

  it('renders without crashing if languages is null', () => {
    mountWithIntl(<LanguagePickerSelect {...nullProps} />);
  });
});
