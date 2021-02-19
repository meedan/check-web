import React from 'react';
import { mountWithIntl } from '../../../test/unit/helpers/intl-test';
import LanguageSwitcher from './LanguageSwitcher';

const languages = ['fr', 'en', 'pt', 'es'];
describe('<LanguageSwitcher />', () => {
  it('should display primary language correctly', () => {
    const wrapper = mountWithIntl(<LanguageSwitcher
      languages={languages}
      primaryLanguage="en"
      currentLanguage="fr"
      onChange={() => {}}
    />);
    expect(wrapper.text()).toMatch('English(default)');
  });

  it('should display all language tabs', () => {
    const wrapper = mountWithIntl(<LanguageSwitcher
      languages={languages}
      primaryLanguage="en"
      currentLanguage="en"
      onChange={() => {}}
    />);
    expect(wrapper.find('.MuiTab-wrapper')).toHaveLength(4);
  });
});
