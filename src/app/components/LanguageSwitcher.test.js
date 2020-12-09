/* global describe, expect, it */
import React from 'react';
import { mountWithIntlProvider } from '../../../test/unit/helpers/intl-test';
import IconButton from '@material-ui/core/IconButton';

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

  it('should display icon button when onSetDefault is set', () => {
    const wrapper = mountWithIntlProvider(<LanguageSwitcher languages={languages} primaryLanguage="en" onSetDefault={() => {}} />);
    console.log(wrapper);
    console.log(wrapper.html());
    console.log(wrapper.debug());
    expect(wrapper.find(<IconButton/>)).toHaveLength(1);
  });

});
