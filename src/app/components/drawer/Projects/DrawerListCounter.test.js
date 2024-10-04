import React from 'react';
import DrawerListCounter from './DrawerListCounter';
import { mountWithIntl } from '../../../../../test/unit/helpers/intl-test';

describe('<DrawerListCounter />', () => {
  it('renders nothing if numberOfItems is not a number', () => {
    const counter = mountWithIntl(<DrawerListCounter numberOfItems="test" />);
    expect(counter.find('small').text()).toEqual('');
  });


  it('renders a small number as is', () => {
    const counter = mountWithIntl(<DrawerListCounter numberOfItems={12} />);
    expect(counter.find('small').text()).toEqual('12');
  });

  it('makes long numbers shorter', () => {
    const counter = mountWithIntl(<DrawerListCounter numberOfItems={12345} />);
    expect(counter.find('small').text()).toEqual('12K');
  });
});
