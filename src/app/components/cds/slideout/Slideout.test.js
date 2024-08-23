import React from 'react';
import Slideout from './Slideout';
import { mountWithIntl } from '../../../../../test/unit/helpers/intl-test';

describe('<Slideout />', () => {
  it('should render Slideout component', () => {
    const wrapper = mountWithIntl(<Slideout
      content="Slideout content"
      footer
      showCancel
      title="Slideout Title"
      onClose={() => {}}
    />);
    expect(wrapper.find('.slideout')).toHaveLength(1);
    expect(wrapper.html()).toMatch('Slideout Title');
    expect(wrapper.html()).toMatch('Slideout content');
    expect(wrapper.html()).toMatch('Cancel');
  });
});
