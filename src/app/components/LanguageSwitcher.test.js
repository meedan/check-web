import React from 'react';
import { mountWithIntlProvider } from '../../../test/unit/helpers/intl-test';

import LanguageSwitcher from './LanguageSwitcher';

const languages = ['fr', 'en', 'pt', 'es'];
describe('<LanguageSwitcher />', () => {

  it('should display primary language correctly', () => {
    const wrapper = mountWithIntlProvider(<LanguageSwitcher languages={languages} primaryLanguage="en" />);
    expect(wrapper.html()).toMatch('English (default)');
  });

  it('should display all language tabs', () => {
    const wrapper = mountWithIntlProvider(<LanguageSwitcher languages={languages} primaryLanguage="en" />);
    expect(wrapper.find('.MuiTab-wrapper')).toHaveLength(4);
  });

});
