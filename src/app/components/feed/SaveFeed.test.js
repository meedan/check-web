import React from 'react';
import { SaveFeed } from './SaveFeed';
import { shallowWithIntl } from '../../../../test/unit/helpers/intl-test';

describe('<SaveFeed />', () => {
  it('should not render license checkboxes', () => {
    const component = shallowWithIntl(<SaveFeed />);
    expect(component.find('LicenseOption').length).toEqual(0);
  });
});
