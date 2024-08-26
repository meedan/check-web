import React from 'react';
import NotFound from './NotFound';
import { mountWithIntl } from '../../../test/unit/helpers/intl-test';

describe('<NotFound />', () => {
  it('should set a default title', () => {
    const wrapper = mountWithIntl(<NotFound title="My custom error title" />);
    expect(wrapper.html()).toMatch('My custom error title');
  });

  it('should set a default description', () => {
    const wrapper = mountWithIntl(<NotFound description="My custom error description" />);
    expect(wrapper.html()).toMatch('My custom error description');
  });
});
