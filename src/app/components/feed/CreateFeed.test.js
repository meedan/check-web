import React from 'react';
import CreateFeed from './CreateFeed';
import { shallowWithIntl } from '../../../../test/unit/helpers/intl-test';

describe('<CreateFeed />', () => {
  it('should render license checkboxes', () => {
    const component = shallowWithIntl(<CreateFeed />);
    expect(component.find('LicenseOption').length).toEqual(3);
  });
});
