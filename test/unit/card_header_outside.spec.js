import React from 'react';
import { shallowWithIntl } from './helpers/intl-test';
import { expect } from 'chai';
import CardHeaderOutside from '../../src/app/components/layout/CardHeaderOutside';

describe('<CardHeaderOutside />', function() {
  it('should render action buttons in opposing side to title', function() {
    const wrapper = shallowWithIntl(
      <CardHeaderOutside
        title="Card Title"
        direction={{ from: 'right', to: 'left' }}
      />
    );
    expect(wrapper.html()).to.contain('Card Title');
    expect(wrapper.html()).to.contain('<div style="margin-right:auto">');
    wrapper.setProps({ direction: { from: 'left', to: 'right' } });
    expect(wrapper.html()).to.contain('<div style="margin-left:auto">');
  });
});
