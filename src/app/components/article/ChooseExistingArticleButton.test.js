import React from 'react';
import ChooseExistingArticleButton from './ChooseExistingArticleButton';
import { shallowWithIntl } from '../../../../test/unit/helpers/intl-test';

describe('<ChooseExistingArticleButton />', () => {
  it('should open slideout', () => {
    const wrapper = shallowWithIntl(<ChooseExistingArticleButton projectMediaDbid={1} teamSlug="meedan" onAdd={() => {}} />);
    wrapper.find('ButtonMain').simulate('click');
    expect(wrapper.find('Slideout')).toHaveLength(1);
  });
});
