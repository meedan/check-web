import React from 'react';
import { shallowWithIntl } from '../../../../test/unit/helpers/intl-test';
import ChooseExistingArticleButton from './ChooseExistingArticleButton';

describe('<ChooseExistingArticleButton />', () => {
  it('should open slideout', () => {
    const wrapper = shallowWithIntl(<ChooseExistingArticleButton teamSlug="meedan" onAdd={() => {}} />);
    wrapper.find('ButtonMain').simulate('click');
    expect(wrapper.find('Slideout')).toHaveLength(1);
  });
});
