import React from 'react';
import { mountWithIntl } from '../../../../../test/unit/helpers/intl-test';
import Slideout from './Slideout';

describe('<Slideout />', () => {
  it('should render Slideout component', () => {
    const wrapper = mountWithIntl(<Slideout
      title="Slideout Title"
      content="Slideout content"
      showCancel
      onClose={() => {}}
    />);
    expect(wrapper.find('.slideout')).toHaveLength(1);
    expect(wrapper.html()).toMatch('Slideout Title');
    expect(wrapper.html()).toMatch('Slideout content');
    expect(wrapper.html()).toMatch('Cancel');
  });
});
