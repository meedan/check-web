import React from 'react';
import { shallowWithIntl } from './helpers/intl-test';
import { expect } from 'chai';
import CardHeaderOutside from '../../src/app/components/layout/CardHeaderOutside';

describe('<CardHeaderOutside />', function() {
  it('should render', function() {
    const wrapper = shallowWithIntl(
      <CardHeaderOutside
        title="Card Title"
        direction={{ to: 'left', from: 'right' }}
      />
    );
    expect(wrapper.html()).to.contain('Card Title');
  });
});
