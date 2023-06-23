import React from 'react';
import CreateFeed from './CreateFeed';
import { mountWithIntlProvider, shallowWithIntl } from '../../../../test/unit/helpers/intl-test';

describe('<CreateFeed />', () => {
  // it('should render title and description inputs', () => {
  //   const component = mountWithIntlProvider(<CreateFeed />);
  //   expect(component.find('#create-feed__title').hostNodes().length).toEqual(1);
  //   expect(component.find('#create-feed__description').hostNodes().length).toEqual(1);
  // });

  it('should render license checkboxes', () => {
    const component = shallowWithIntl(<CreateFeed />);
    expect(component.find('LicenseOption').length).toEqual(3);
  });
});
