import React from 'react';
import { SaveFeed } from './SaveFeed';
import { shallowWithIntl } from '../../../../test/unit/helpers/intl-test';

describe('<SaveFeed />', () => {
  it('should not render license checkboxes', () => {
    const component = shallowWithIntl(<SaveFeed />);
    expect(component.find('LicenseOption').length).toEqual(0);
  });

  it('should render license checkboxes when discoverable', () => {
    const component = shallowWithIntl(<SaveFeed feed={{ discoverable: true }} />);
    expect(component.find('LicenseOption').length).toEqual(3);
    expect(component.find('#save-feed__no-license-error').length).toEqual(1);
  });

  it('should render license checkboxes and no error when discoverable and licenses selected', () => {
    const component = shallowWithIntl(<SaveFeed feed={{ discoverable: true, licenses: [1] }} />);
    expect(component.find('LicenseOption').length).toEqual(3);
    expect(component.find('#save-feed__no-license-error').length).toEqual(0);
  });
});
