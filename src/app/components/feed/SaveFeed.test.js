import React from 'react';
import { SaveFeed } from './SaveFeed';
import { shallowWithIntl } from '../../../../test/unit/helpers/intl-test';

describe('<SaveFeed />', () => {
  it('should render license checkboxes', () => {
    const component = shallowWithIntl(<SaveFeed feed={{ discoverable: true }} />);
    expect(component.find('LicenseOption').length).toEqual(3);
  });
});
